# ==================
# TESTS
# ==================

import threading
from datetime import date, time, timedelta
from unittest.mock import patch

from django.test import TestCase, TransactionTestCase
from .models import (
    EstadoReserva, Recurso, Reserva,
    Rol, TipoRecurso, Ubicacion, Usuario,
    _generar_codigo_unico,
)


# ── Helpers ───────────────────────────────────

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


# ----------------------------
# TESTS DE LÓGICA DE RESERVAS
# ----------------------------

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
        self.assertTrue(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )

    def test_recurso_no_disponible_con_reserva(self):
        self._crear_reserva(time(9, 0), time(10, 0))
        self.assertFalse(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )

    def test_tramo_adyacente_es_valido(self):
        self._crear_reserva(time(8, 0), time(9, 0))
        self.assertTrue(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )

    def test_cancelar_libera_el_recurso(self):
        r = self._crear_reserva(time(9, 0), time(10, 0))
        r.cancelar(self.usuario)
        self.assertTrue(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )

    def test_cancelar_dos_veces_lanza_error(self):
        r = self._crear_reserva(time(10, 0), time(11, 0))
        r.cancelar(self.usuario)
        with self.assertRaises(ValueError):
            r.cancelar(self.usuario)

    def test_cancelar_registra_historial(self):
        r = self._crear_reserva(time(14, 0), time(15, 0))
        r.cancelar(self.usuario)
        self.assertEqual(r.historial.count(), 1)
        self.assertEqual(r.historial.first().estado_nuevo.nombre, "cancelada")

    def test_duracion_minutos(self):
        r = self._crear_reserva(time(9, 0), time(10, 30))
        self.assertEqual(r.duracion_minutos(), 90)

    def test_limite_maximo_por_tipo(self):
        self._crear_reserva(time(10, 0), time(11, 0))
        self.assertFalse(
            self.recurso.esta_disponible(self.fecha, time(10, 0), time(11, 0))
        )


# ---------------------------
# TESTS DE CÓDIGO ÚNICO
# ---------------------------

class CodigoGeneracionTest(TestCase):

    def setUp(self):
        self.rol, _, _, self.activa, self.cancelada, self.recurso = crear_datos_base()
        self.usuario = crear_usuario("test@uni.edu", self.rol)

    def test_formato_correcto(self):
        codigo = _generar_codigo_unico()
        partes = codigo.split("-")
        self.assertEqual(partes[0], "RES")
        self.assertEqual(len(partes[1]), 4)
        self.assertEqual(len(partes[2]), 4)
        self.assertEqual(len(partes[3]), 2)
        self.assertEqual(len(partes[4]), 2)

    def test_parte_aleatoria_es_alfanumerica(self):
        import re
        codigo = _generar_codigo_unico()
        parte  = codigo.split("-")[1]
        self.assertTrue(re.match(r"^[A-Z0-9]{4}$", parte))

    def test_codigos_unicos_en_volumen(self):
        codigos = {_generar_codigo_unico() for _ in range(1000)}
        self.assertEqual(len(codigos), 1000)

    def test_reintenta_si_codigo_ya_existe(self):
        reserva = Reserva.objects.create(
            usuario=self.usuario, recurso=self.recurso, estado=self.activa,
            fecha_reserva=date.today() + timedelta(days=5),
            hora_inicio=time(9, 0), hora_fin=time(10, 0),
        )
        codigo_existente = reserva.codigo_reservacion
        parte_existente  = codigo_existente.split("-")[1]
        llamadas = {"n": 0}
        original = __import__("random").choices

        def mock_choices(population, k):
            llamadas["n"] += 1
            if llamadas["n"] == 1:
                return list(parte_existente)
            return original(population, k=k)

        with patch("api.models.random.choices", side_effect=mock_choices):
            nuevo_codigo = _generar_codigo_unico()

        self.assertNotEqual(nuevo_codigo, codigo_existente)
        self.assertEqual(llamadas["n"], 2)

    def test_error_si_todos_los_intentos_fallan(self):
        with patch("api.models.Reserva.objects") as mock_qs:
            mock_qs.filter.return_value.exists.return_value = True
            with self.assertRaises(ValueError):
                _generar_codigo_unico()


# ----------------------------------------------
# TESTS DE CONCURRENCIA
# SELECT FOR UPDATE — previene reservas dobles
# ----------------------------------------------

class TestConcurrencia_ReservaSimultanea(TransactionTestCase):
    """
    Simula dos usuarios intentando reservar el mismo recurso
    en el mismo horario exactamente al mismo tiempo.

    Verifica que SELECT FOR UPDATE garantice que solo
    una reserva sea creada, sin importar la concurrencia.
    """

    def setUp(self):
        self.rol       = Rol.objects.create(nombre="Estudiante")
        self.tipo      = TipoRecurso.objects.create(
            nombre="Sala", limite_maximo_reservas=1
        )
        self.ubicacion = Ubicacion.objects.create(nombre="Edificio B")
        self.activa    = EstadoReserva.objects.create(nombre="activa")
        EstadoReserva.objects.create(nombre="cancelada")
        self.recurso   = Recurso.objects.create(
            tipo_recurso=self.tipo, ubicacion=self.ubicacion,
            nombre="Sala 201", capacidad=20
        )
        self.usuario1  = Usuario.objects.create(
            correo="u1@miumg.edu", nombre_completo="Usuario 1", rol=self.rol
        )
        self.usuario2  = Usuario.objects.create(
            correo="u2@miumg.edu", nombre_completo="Usuario 2", rol=self.rol
        )
        self.fecha     = date.today() + timedelta(days=10)
        self.resultados = []

    def _intentar_reserva(self, usuario):
        """Lógica de reserva con SELECT FOR UPDATE en hilo separado."""
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

    def test_concurrencia_01_solo_una_reserva_creada(self):
        """
        Dos hilos simultáneos,  1 reserva en BD.
        """
        t1 = threading.Thread(target=self._intentar_reserva, args=(self.usuario1,))
        t2 = threading.Thread(target=self._intentar_reserva, args=(self.usuario2,))
        t1.start(); t2.start()
        t1.join();  t2.join()

        exitos     = [r for r in self.resultados if r[0] == "ok"]
        total_en_bd = Reserva.objects.filter(fecha_reserva=self.fecha).count()

        self.assertEqual(len(exitos), 1, " 1 hilo debe ganar la reserva.")
        self.assertEqual(total_en_bd, 1, " 1 reserva debe existir en BD.")

    def test_concurrencia_02_el_perdedor_recibe_conflicto(self):
        """
        El hilo que pierde debe recibir 'conflicto', no un error inesperado.
        """
        t1 = threading.Thread(target=self._intentar_reserva, args=(self.usuario1,))
        t2 = threading.Thread(target=self._intentar_reserva, args=(self.usuario2,))
        t1.start(); t2.start()
        t1.join();  t2.join()

        conflictos = [r for r in self.resultados if r[0] == "conflicto"]
        errores    = [r for r in self.resultados if r[0] == "error"]

        self.assertEqual(len(conflictos), 1, " 1 hilo debe recibir conflicto.")
        self.assertEqual(len(errores), 0, "No debe haber errores inesperados.")
