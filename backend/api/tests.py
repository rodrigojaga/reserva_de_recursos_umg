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

# ----------------------------------------------
# TESTS DE CONCURRENCIA
# SELECT FOR UPDATE- previene reservas dobles
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


# ──────────────────────────
# TESTS DE PANEL ADMIN Y CSV
# ──────────────────────────
from rest_framework.test import APIClient

class TestAdmin_PanelYCSV(TestCase):
    """
    Pruebas del panel administrativo:
    - Acceso restringido por rol (header X-Admin-Key)
    - Listado paginado de reservas
    - Filtros por fecha, recurso y usuario
    - Descarga del archivo CSV
    """

    def setUp(self):
        self.client = APIClient()

        # Datos base
        self.rol_admin    = Rol.objects.create(nombre="admin")
        self.rol_estudiante = Rol.objects.create(nombre="estudiante")
        tipo      = TipoRecurso.objects.create(nombre="Sala", limite_maximo_reservas=2)
        ubicacion = Ubicacion.objects.create(nombre="Edificio A")
        self.activa    = EstadoReserva.objects.create(nombre="activa")
        self.cancelada = EstadoReserva.objects.create(nombre="cancelada")

        self.recurso = Recurso.objects.create(
            tipo_recurso=tipo, ubicacion=ubicacion,
            nombre="Sala 101", capacidad=30
        )

        # Usuarios
        self.admin = Usuario.objects.create(
            correo="admin@miumg.edu.gt",
            nombre_completo="Administrador",
            rol=self.rol_admin
        )
        self.estudiante = Usuario.objects.create(
            correo="alumno@miumg.edu.gt",
            nombre_completo="Estudiante Test",
            rol=self.rol_estudiante
        )

        # Crear algunas reservas de prueba
        self.fecha1 = date.today() + timedelta(days=1)
        self.fecha2 = date.today() + timedelta(days=2)

        Reserva.objects.create(
            usuario=self.estudiante, recurso=self.recurso,
            estado=self.activa, fecha_reserva=self.fecha1,
            hora_inicio=time(9, 0), hora_fin=time(10, 0)
        )
        Reserva.objects.create(
            usuario=self.estudiante, recurso=self.recurso,
            estado=self.activa, fecha_reserva=self.fecha2,
            hora_inicio=time(10, 0), hora_fin=time(11, 0)
        )

    # ── Acceso restringido ────────────────────

    def test_admin_01_sin_header_retorna_403(self):
        """
        Sin header X-Admin-Key el endpoint retorna 403.
        Nadie sin credenciales puede acceder al panel.
        """
        response = self.client.get('/api/admin/reservas/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.data)

    def test_admin_02_con_correo_estudiante_retorna_403(self):
        """
        Un correo de estudiante no tiene acceso al panel admin.
        El rol debe ser 'admin' para pasar la validación.
        """
        response = self.client.get(
            '/api/admin/reservas/',
            HTTP_X_ADMIN_KEY=self.estudiante.correo
        )
        self.assertEqual(response.status_code, 403)

    def test_admin_03_con_correo_admin_retorna_200(self):
        """
        Un correo de administrador válido retorna 200
        con la estructura paginada correcta.
        """
        response = self.client.get(
            '/api/admin/reservas/',
            HTTP_X_ADMIN_KEY=self.admin.correo
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('count', response.data)
        self.assertIn('results', response.data)
        self.assertIn('page', response.data)
        self.assertIn('total_pages', response.data)

    # ── Filtros ───────────────────────────────

    def test_admin_04_filtro_por_fecha(self):
        """
        El filtro ?fecha= retorna solo reservas de esa fecha.
        """
        response = self.client.get(
            '/api/admin/reservas/',
            {'fecha': self.fecha1.isoformat()},
            HTTP_X_ADMIN_KEY=self.admin.correo
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(
            response.data['results'][0]['fecha_reserva'],
            self.fecha1.isoformat()
        )

    def test_admin_05_filtro_por_usuario(self):
        """
        El filtro ?usuario= retorna solo reservas de ese usuario.
        """
        response = self.client.get(
            '/api/admin/reservas/',
            {'usuario': self.estudiante.id},
            HTTP_X_ADMIN_KEY=self.admin.correo
        )
        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.data['count'], 0)
        for r in response.data['results']:
            self.assertEqual(r['usuario'], self.estudiante.id)

    def test_admin_06_paginacion(self):
        """
        La paginación limita correctamente los resultados.
        Con page_size=1 debe retornar solo 1 resultado.
        """
        response = self.client.get(
            '/api/admin/reservas/',
            {'page': 1, 'page_size': 1},
            HTTP_X_ADMIN_KEY=self.admin.correo
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['page_size'], 1)

    # ── CSV ───────────────────────────────────

    def test_admin_07_csv_sin_header_retorna_403(self):
        """
        El endpoint CSV también requiere X-Admin-Key.
        """
        response = self.client.get('/api/admin/reservas/csv/')
        self.assertEqual(response.status_code, 403)

    def test_admin_08_csv_retorna_content_type_correcto(self):
        """
        El CSV descargado debe tener Content-Type text/csv.
        """
        response = self.client.get(
            '/api/admin/reservas/csv/',
            HTTP_X_ADMIN_KEY=self.admin.correo
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('text/csv', response.get('Content-Type', ''))

    def test_admin_09_csv_contiene_encabezados(self):
        """
        El CSV debe incluir los encabezados correctos en la primera línea.
        """
        response = self.client.get(
            '/api/admin/reservas/csv/',
            HTTP_X_ADMIN_KEY=self.admin.correo
        )
        contenido = response.content.decode('utf-8')
        primera_linea = contenido.split('\r\n')[0]
        self.assertIn('Código', primera_linea)
        self.assertIn('Usuario', primera_linea)
        self.assertIn('Recurso', primera_linea)
        self.assertIn('Fecha', primera_linea)

    def test_admin_10_csv_contiene_datos_reales(self):
        """
        El CSV debe incluir datos de las reservas existentes en BD.
        """
        response = self.client.get(
            '/api/admin/reservas/csv/',
            HTTP_X_ADMIN_KEY=self.admin.correo
        )
        contenido = response.content.decode('utf-8')
        self.assertIn('Sala 101', contenido)
        self.assertIn('Estudiante Test', contenido)

#####################################################################################
#####################################################################################
#####################################################################################
#####################################################################################
#####################################################################################
#####################################################################################
#####################################################################################
#####################################################################################
#####################################################################################

# ----------------------------
# TESTS DE LÓGICA DE RESERVAS
# 8 PRUEBAS UNITARIAS
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
    #Prueba unitaria
    def test_recurso_disponible_sin_reservas(self):
        self.assertTrue(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )
    #Prueba unitaria
    def test_recurso_no_disponible_con_reserva(self):
        self._crear_reserva(time(9, 0), time(10, 0))
        self.assertFalse(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )
    #Prueba unitaria
    def test_tramo_adyacente_es_valido(self):
        self._crear_reserva(time(8, 0), time(9, 0))
        self.assertTrue(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )
    #Prueba unitaria
    def test_cancelar_libera_el_recurso(self):
        r = self._crear_reserva(time(9, 0), time(10, 0))
        r.cancelar(self.usuario)
        self.assertTrue(
            self.recurso.esta_disponible(self.fecha, time(9, 0), time(10, 0))
        )
    #Prueba unitaria
    def test_cancelar_dos_veces_lanza_error(self):
        r = self._crear_reserva(time(10, 0), time(11, 0))
        r.cancelar(self.usuario)
        with self.assertRaises(ValueError):
            r.cancelar(self.usuario)
    #Prueba unitaria
    def test_cancelar_registra_historial(self):
        r = self._crear_reserva(time(14, 0), time(15, 0))
        r.cancelar(self.usuario)
        self.assertEqual(r.historial.count(), 1)
        self.assertEqual(r.historial.first().estado_nuevo.nombre, "cancelada")
    #Prueba unitaria
    def test_duracion_minutos(self):
        r = self._crear_reserva(time(9, 0), time(10, 30))
        self.assertEqual(r.duracion_minutos(), 90)
    #Prueba unitaria
    def test_limite_maximo_por_tipo(self):
        self._crear_reserva(time(10, 0), time(11, 0))
        self.assertFalse(
            self.recurso.esta_disponible(self.fecha, time(10, 0), time(11, 0))
        )


# ---------------------------
# TESTS DE CÓDIGO ÚNICO
# 5 pruebas unitarias
# ---------------------------

class CodigoGeneracionTest(TestCase):

    def setUp(self):
        self.rol, _, _, self.activa, self.cancelada, self.recurso = crear_datos_base()
        self.usuario = crear_usuario("test@uni.edu", self.rol)
    #Prueba unitaria
    def test_formato_correcto(self):
        codigo = _generar_codigo_unico()
        partes = codigo.split("-")
        self.assertEqual(partes[0], "RES")
        self.assertEqual(len(partes[1]), 4)
        self.assertEqual(len(partes[2]), 4)
        self.assertEqual(len(partes[3]), 2)
        self.assertEqual(len(partes[4]), 2)
    #Prueba unitaria
    def test_parte_aleatoria_es_alfanumerica(self):
        import re
        codigo = _generar_codigo_unico()
        parte  = codigo.split("-")[1]
        self.assertTrue(re.match(r"^[A-Z0-9]{4}$", parte))
    #Prueba unitaria
    def test_codigos_unicos_en_volumen(self):
        codigos = {_generar_codigo_unico() for _ in range(1000)}
        self.assertEqual(len(codigos), 1000)
    #Prueba unitaria
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
    #Prueba unitaria
    def test_error_si_todos_los_intentos_fallan(self):
        with patch("api.models.Reserva.objects") as mock_qs:
            mock_qs.filter.return_value.exists.return_value = True
            with self.assertRaises(ValueError):
                _generar_codigo_unico()


# ---------------------
# PRUEBA DE INTEGRACIÓN
# ---------------------
 
from datetime import date, timedelta

class TestIntegracion_FlujoCompletoReserva(TestCase):
    """
    TEST DE INTEGRACIÓN — Flujo completo del sistema
 
    Simula el ciclo completo de un usuario:
    1. Consulta el catálogo de recursos
    2. Crea una reserva via POST
    3. Verifica que el recurso queda no disponible
    4. Lista sus reservas
    5. Cancela la reserva
    6. Verifica que el recurso vuelve a estar disponible

    """
 
    def setUp(self):
        self.client = APIClient()
 
        rol_admin     = Rol.objects.create(nombre="admin")
        rol_estudiante = Rol.objects.create(nombre="estudiante")
        tipo      = TipoRecurso.objects.create(nombre="Sala", limite_maximo_reservas=1)
        ubicacion = Ubicacion.objects.create(nombre="Edificio A")
        self.activa    = EstadoReserva.objects.create(nombre="activa")
        self.cancelada = EstadoReserva.objects.create(nombre="cancelada")
 
        self.recurso = Recurso.objects.create(
            tipo_recurso=tipo, ubicacion=ubicacion,
            nombre="Sala 101", capacidad=30
        )
        self.usuario = Usuario.objects.create(
            correo="estudiante@miumg.edu.gt",
            nombre_completo="Estudiante Test",
            rol=rol_estudiante
        )
        self.admin = Usuario.objects.create(
            correo="estudiante2@miumg.edu.gt",
            nombre_completo="Admin Test",
            rol=rol_admin
        )
        self.fecha = (date.today() + timedelta(days=20)).isoformat()
 
    # ── Paso 1: Catálogo ──────────────────────
 
    def test_integracion_01_catalogo_retorna_recursos(self):
        """
        GET /api/recursos/ retorna 200 con lista de recursos activos.
        """
        response = self.client.get('/api/recursos/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('results', response.data)
        self.assertGreater(response.data['count'], 0)
 
    def test_integracion_02_catalogo_filtro_tipo(self):
        """
        GET /api/recursos/?tipo=X retorna solo recursos de ese tipo.
        """
        tipo_id = self.recurso.tipo_recurso.id
        response = self.client.get('/api/recursos/', {'tipo': tipo_id})
        self.assertEqual(response.status_code, 200)
        for r in response.data['results']:
            self.assertEqual(r['tipo_recurso'], tipo_id)
 
    # ── Paso 2: Crear reserva ─────────────────
 
    def test_integracion_03_crear_reserva_exitosa(self):
        """
        POST /api/reservas/crear/ con datos válidos retorna 201
        y la reserva tiene código en formato RES-XXXX-YYYY-MM-DD.
        """
        response = self.client.post('/api/reservas/crear/', {
            'usuario':       self.usuario.id,
            'recurso':       self.recurso.id,
            'fecha_reserva': self.fecha,
            'hora_inicio':   '09:00',
            'hora_fin':      '10:00',
        }, format='json')
 
        self.assertEqual(response.status_code, 201)
        self.assertIn('reserva', response.data)
        codigo = response.data['reserva']['codigo_reservacion']
        self.assertTrue(codigo.startswith('RES-'))
 
    def test_integracion_04_reserva_duplicada_retorna_error(self):
        """
        Crear dos reservas en el mismo horario retorna error en la segunda.
        El sistema retorna 400 o 409 — ambos indican rechazo correcto.
        """
        datos = {
            'usuario':       self.usuario.id,
            'recurso':       self.recurso.id,
            'fecha_reserva': self.fecha,
            'hora_inicio':   '10:00',
            'hora_fin':      '11:00',
        }
        self.client.post('/api/reservas/crear/', datos, format='json')
        response = self.client.post('/api/reservas/crear/', datos, format='json')
        self.assertIn(response.status_code, [400, 409])
 
    def test_integracion_05_hora_invalida_retorna_400(self):
        """
        hora_fin <= hora_inicio retorna 400 Bad Request.
        """
        response = self.client.post('/api/reservas/crear/', {
            'usuario':       self.usuario.id,
            'recurso':       self.recurso.id,
            'fecha_reserva': self.fecha,
            'hora_inicio':   '11:00',
            'hora_fin':      '09:00',
        }, format='json')
        self.assertEqual(response.status_code, 400)
 
    # ── Paso 3: Listar reservas ───────────────
 
    def test_integracion_06_listar_reservas_usuario(self):
        """
        GET /api/reservas/?usuario=X retorna las reservas del usuario.
        """
        Reserva.objects.create(
            usuario=self.usuario, recurso=self.recurso,
            estado=self.activa,
            fecha_reserva=date.today() + timedelta(days=21),
            hora_inicio=time(14, 0), hora_fin=time(15, 0)
        )
        response = self.client.get('/api/reservas/', {'usuario': self.usuario.id})
        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.data['count'], 0)
 
    # ── Paso 4: Cancelar reserva ──────────────
 
    def test_integracion_07_cancelar_reserva(self):
        """
        POST /api/reservas/{id}/cancelar/ cambia el estado a cancelada.
        """
        reserva = Reserva.objects.create(
            usuario=self.usuario, recurso=self.recurso,
            estado=self.activa,
            fecha_reserva=date.today() + timedelta(days=22),
            hora_inicio=time(15, 0), hora_fin=time(16, 0)
        )
        response = self.client.post(
            f'/api/reservas/{reserva.id}/cancelar/',
            {'usuario': self.usuario.id},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        reserva.refresh_from_db()
        self.assertEqual(reserva.estado.nombre, 'cancelada')
 
    def test_integracion_08_cancelar_libera_recurso(self):
        """
        Después de cancelar, el recurso vuelve a estar disponible.
        """
        fecha = date.today() + timedelta(days=23)
        reserva = Reserva.objects.create(
            usuario=self.usuario, recurso=self.recurso,
            estado=self.activa, fecha_reserva=fecha,
            hora_inicio=time(9, 0), hora_fin=time(10, 0)
        )
        self.assertFalse(
            self.recurso.esta_disponible(fecha, time(9, 0), time(10, 0))
        )
        self.client.post(
            f'/api/reservas/{reserva.id}/cancelar/',
            {'usuario': self.usuario.id},
            format='json'
        )
        self.assertTrue(
            self.recurso.esta_disponible(fecha, time(9, 0), time(10, 0))
        )
 
    # ── Paso 5: Admin ─────────────────────────
 
    def test_integracion_09_admin_sin_header_retorna_403(self):
        """
        GET /api/admin/reservas/ sin header retorna 403.
        """
        response = self.client.get('/api/admin/reservas/')
        self.assertEqual(response.status_code, 403)
 
    def test_integracion_10_flujo_completo_crear_y_ver_en_admin(self):
        """
        Crea una reserva como usuario y la verifica en el panel admin.
        Prueba que el flujo completo entre capas funciona correctamente.
        """
        # Crear reserva
        self.client.post('/api/reservas/crear/', {
            'usuario':       self.usuario.id,
            'recurso':       self.recurso.id,
            'fecha_reserva': self.fecha,
            'hora_inicio':   '08:00',
            'hora_fin':      '09:00',
        }, format='json')
 
        # Verificar en panel admin
        response = self.client.get(
            '/api/admin/reservas/',
            HTTP_X_ADMIN_KEY=self.admin.correo
        )
        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.data['count'], 0)
 
        # Verificar que la reserva aparece con los datos correctos
        codigos = [r['recurso_nombre'] for r in response.data['results']]
        self.assertIn('Sala 101', codigos)