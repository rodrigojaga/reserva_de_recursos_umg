import threading
from datetime import date, time, timedelta

from django.test import TransactionTestCase, TestCase

from .models import (
    EstadoReserva, Recurso, Reserva,
    Rol, TipoRecurso, Ubicacion, Usuario,
)


# ── Helpers ───
def crear_datos_base():
    rol       = Rol.objects.create(nombre="Estudiante")
    tipo      = TipoRecurso.objects.create(nombre="Sala", limite_maximo_reservas=1)
    ubicacion = Ubicacion.objects.create(nombre="Edificio A")
    activa    = EstadoReserva.objects.create(nombre="activa")
    cancelada = EstadoReserva.objects.create(nombre="cancelada")
    recurso   = Recurso.objects.create(
        tipo_recurso=tipo, ubicacion=ubicacion,
        nombre="Sala 101", capacidad=30
    )
    return rol, tipo, ubicacion, activa, cancelada, recurso


def crear_usuario(correo, rol):
    return Usuario.objects.create(
        correo=correo, nombre_completo="Test User", rol=rol
    )


# TESTS DE LÓGICA DE NEGOCIO
class ReservaLogicaTest(TestCase):

    def setUp(self):
        (self.rol, self.tipo, self.ubicacion,
         self.activa, self.cancelada, self.recurso) = crear_datos_base()
        self.usuario = crear_usuario("alumno@uni.edu", self.rol)
        self.fecha   = date.today() + timedelta(days=1)

    def _crear_reserva(self, hora_inicio, hora_fin, usuario=None):
        return Reserva.objects.create(
            usuario=usuario or self.usuario,
            recurso=self.recurso,
            estado=self.activa,
            fecha_reserva=self.fecha,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
        )

    def test_recurso_disponible_sin_reservas(self):
        """Sin reservas el recurso debe estar disponible."""
        self.assertTrue(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )

    def test_recurso_no_disponible_con_reserva(self):
        """Con una reserva activa el recurso no debe estar disponible."""
        self._crear_reserva(time(9, 0), time(10, 0))
        self.assertFalse(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )

    def test_tramo_adyacente_es_valido(self):
        """Un tramo que empieza justo cuando termina otro debe ser válido."""
        self._crear_reserva(time(8, 0), time(9, 0))
        self.assertTrue(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )

    def test_cancelar_libera_el_recurso(self):
        """Cancelar una reserva debe liberar el recurso."""
        r = self._crear_reserva(time(9, 0), time(10, 0))
        self.assertFalse(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )
        r.cancelar(self.usuario)
        self.assertTrue(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )

    def test_cancelar_dos_veces_lanza_error(self):
        """Cancelar una reserva ya cancelada debe lanzar ValueError."""
        r = self._crear_reserva(time(10, 0), time(11, 0))
        r.cancelar(self.usuario)
        with self.assertRaises(ValueError):
            r.cancelar(self.usuario)

    def test_cancelar_registra_historial(self):
        """Cancelar debe crear un registro en HistorialReserva."""
        r = self._crear_reserva(time(14, 0), time(15, 0))
        r.cancelar(self.usuario)
        self.assertEqual(r.historial.count(), 1)
        self.assertEqual(r.historial.first().estado_nuevo.nombre, "cancelada")

    def test_duracion_minutos(self):
        """La duración debe calcularse correctamente."""
        r = self._crear_reserva(time(9, 0), time(10, 30))
        self.assertEqual(r.duracion_minutos(), 90)

    def test_limite_maximo_por_tipo(self):
        """Con límite=1, el segundo usuario no puede reservar el mismo tramo."""
        usuario2 = crear_usuario("otro@uni.edu", self.rol)
        self._crear_reserva(time(10, 0), time(11, 0))
        self.assertFalse(
            self.recurso.esta_disponible(self.fecha, time(10, 0), time(11, 0))
        )



# TEST DE CONCURRENCIA
class ReservaConcurrenciaTest(TransactionTestCase):
    """
    Simula dos usuarios intentando reservar el mismo recurso
    en el mismo horario exactamente al mismo tiempo.
    Solo uno debe ganar, el otro debe recibir conflicto.

    Usa TransactionTestCase (en vez de TestCase) para que
    cada hilo vea los cambios de la BD en tiempo real.
    """

    def setUp(self):
        self.rol      = Rol.objects.create(nombre="Estudiante")
        self.tipo     = TipoRecurso.objects.create(
            nombre="Sala", limite_maximo_reservas=1
        )
        self.ubicacion = Ubicacion.objects.create(nombre="Edificio B")
        self.activa    = EstadoReserva.objects.create(nombre="activa")
        EstadoReserva.objects.create(nombre="cancelada")
        self.recurso   = Recurso.objects.create(
            tipo_recurso=self.tipo, ubicacion=self.ubicacion,
            nombre="Sala 201", capacidad=20
        )
        self.usuario1 = crear_usuario("u1@uni.edu", self.rol)
        self.usuario2 = crear_usuario("u2@uni.edu", self.rol)
        self.fecha    = date.today() + timedelta(days=2)
        self.resultados = []

    def _intentar_reserva(self, usuario):
        """Lógica de reserva con SELECT FOR UPDATE ejecutada en un hilo."""
        from django.db import transaction, connection
        try:
            with transaction.atomic():
                recurso = Recurso.objects.select_for_update().get(pk=self.recurso.pk)
                if recurso.esta_disponible(self.fecha, time(10, 0), time(11, 0)):
                    r = Reserva.objects.create(
                        usuario=usuario,
                        recurso=recurso,
                        estado=self.activa,
                        fecha_reserva=self.fecha,
                        hora_inicio=time(10, 0),
                        hora_fin=time(11, 0),
                    )
                    self.resultados.append(("ok", r.codigo_reservacion))
                else:
                    self.resultados.append(("conflicto", None))
        except Exception as e:
            self.resultados.append(("error", str(e)))
        finally:
            connection.close()

    def test_solo_una_reserva_en_concurrencia(self):
        """Con SELECT FOR UPDATE solo 1 de 2 hilos concurrentes debe ganar."""
        t1 = threading.Thread(target=self._intentar_reserva, args=(self.usuario1,))
        t2 = threading.Thread(target=self._intentar_reserva, args=(self.usuario2,))

        t1.start()
        t2.start()
        t1.join()
        t2.join()

        exitos = [r for r in self.resultados if r[0] == "ok"]

        self.assertEqual(len(exitos), 1, "Exactamente una reserva debe crearse.")
        self.assertEqual(
            Reserva.objects.filter(fecha_reserva=self.fecha).count(), 1
        )


# ──────────────────────────────────────────────
# Tests del generador de código único
# ──────────────────────────────────────────────
 
from unittest.mock import patch
from .models import _generar_codigo_unico
 
 
class CodigoGeneracionTest(TestCase):
 
    def test_formato_correcto(self):
        """El código debe tener el formato RES-XXXX-YYYY-MM-DD."""
        codigo = _generar_codigo_unico()
        partes = codigo.split("-")
        self.assertEqual(partes[0], "RES")
        self.assertEqual(len(partes[1]), 4)   # parte aleatoria
        self.assertEqual(len(partes[2]), 4)   # año
        self.assertEqual(len(partes[3]), 2)   # mes
        self.assertEqual(len(partes[4]), 2)   # día
 
    def test_parte_aleatoria_es_alfanumerica(self):
        """La parte aleatoria solo debe tener letras mayúsculas y dígitos."""
        import re
        codigo = _generar_codigo_unico()
        parte  = codigo.split("-")[1]
        self.assertTrue(re.match(r"^[A-Z0-9]{4}$", parte))
 
    def test_codigos_unicos_en_volumen(self):
        """1000 códigos generados deben ser todos distintos."""
        codigos = {_generar_codigo_unico() for _ in range(1000)}
        self.assertEqual(len(codigos), 1000)
 
    def test_reintenta_si_codigo_ya_existe(self):
        """Si el primer código ya existe en BD, debe generar uno nuevo."""
        # Crear datos necesarios para tener una reserva en BD
        rol       = Rol.objects.create(nombre="Test")
        tipo      = TipoRecurso.objects.create(nombre="Sala", limite_maximo_reservas=1)
        ubicacion = Ubicacion.objects.create(nombre="Edificio Test")
        activa    = EstadoReserva.objects.create(nombre="activa")
        EstadoReserva.objects.create(nombre="cancelada")
        recurso   = Recurso.objects.create(
            tipo_recurso=tipo, ubicacion=ubicacion, nombre="Sala Test"
        )
        usuario = Usuario.objects.create(
            correo="test@uni.edu", nombre_completo="Test", rol=rol
        )
        reserva = Reserva.objects.create(
            usuario=usuario, recurso=recurso, estado=activa,
            fecha_reserva=date.today() + timedelta(days=5),
            hora_inicio=time(9, 0), hora_fin=time(10, 0),
        )
        codigo_existente = reserva.codigo_reservacion
 
        # Forzar que el primer intento devuelva el código que ya existe
        parte_existente = codigo_existente.split("-")[1]  # ej: "A3F2"
        llamadas        = {"n": 0}
        original        = __import__("random").choices
 
        def mock_choices(population, k):
            llamadas["n"] += 1
            if llamadas["n"] == 1:
                return list(parte_existente)  # primer intento = colisión
            return original(population, k=k)  # segundo intento = aleatorio real
 
        with patch("api.models.random.choices", side_effect=mock_choices):
            nuevo_codigo = _generar_codigo_unico()
 
        # El código nuevo debe ser distinto al que ya existía
        self.assertNotEqual(nuevo_codigo, codigo_existente)
        self.assertEqual(llamadas["n"], 2)  # confirmamos que intentó 2 veces
 
    def test_error_si_todos_los_intentos_fallan(self):
        """Debe lanzar ValueError si los 10 intentos producen colisión."""
        with patch("api.models.Reserva.objects") as mock_qs:
            mock_qs.filter.return_value.exists.return_value = True
            with self.assertRaises(ValueError):
                _generar_codigo_unico()