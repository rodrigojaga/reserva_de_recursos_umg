import csv

from django.db import transaction
from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EstadoReserva, Recurso, Reserva, Usuario
from .serializers import RecursoSerializer, ReservaSerializer, ReservaCrearSerializer

LIMITE_RESERVAS_ACTIVAS = 5  # máximo de reservas activas por usuario

class RecursoListView(APIView):
    """
    GET /api/recursos

    Filtros:
      ?tipo=1              → id del TipoRecurso
      ?capacidad_min=20    → capacidad mínima
      ?fecha=2025-08-01    → fecha (YYYY-MM-DD)
      ?hora_inicio=09:00   → hora inicio (HH:MM)
      ?hora_fin=10:00      → hora fin   (HH:MM)
      ?disponible=true     → true | false
      ?ordering=nombre     → nombre | -nombre | capacidad | -capacidad
      ?page=1
      ?page_size=10        → máx 50
    """

    def get(self, request):
        #Obtiene recursos activos unicamente
        qs = Recurso.objects.filter(activo=True).select_related(
            "tipo_recurso", "ubicacion"
        )
        #Filtro por tipo de recurso
        tipo = request.query_params.get("tipo")#la parte de la url que dice ?tipo=X
        if tipo:
            qs = qs.filter(tipo_recurso_id=tipo)#Filtra por el id de tipo ingresado

        #Filtro por capacidad mínima
        capacidad_min = request.query_params.get("capacidad_min")
        if capacidad_min:
            try:
                qs = qs.filter(capacidad__gte=int(capacidad_min))
            except ValueError:
                return Response(
                    {"error": "capacidad_min debe ser un número entero."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        ordering_map = {
            "nombre": "nombre", "-nombre": "-nombre",
            "capacidad": "capacidad", "-capacidad": "-capacidad",
        }
        ordering = request.query_params.get("ordering", "nombre")
        qs = qs.order_by(ordering_map.get(ordering, "nombre"))

        fecha       = request.query_params.get("fecha")
        hora_inicio = request.query_params.get("hora_inicio")
        hora_fin    = request.query_params.get("hora_fin")
        disponible  = request.query_params.get("disponible")


        if disponible is not None:
            #para disponibilidad fecha, hora ini, hora fin y disponible son obligatorios
            if not (fecha and hora_inicio and hora_fin):
                return Response(
                    {"error": "Para filtrar por disponibilidad debes enviar también fecha, hora_inicio y hora_fin."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            filtrar_disponible = disponible.lower() == "true"
            ids_filtrados = [
                r.id for r in qs
                if r.esta_disponible(fecha, hora_inicio, hora_fin) == filtrar_disponible
            ]
            qs = qs.filter(id__in=ids_filtrados)
        #PAginacion
        try:
            page      = max(1, int(request.query_params.get("page", 1)))
            page_size = min(50, max(1, int(request.query_params.get("page_size", 10))))
        except ValueError:
            page, page_size = 1, 10

        total   = qs.count()
        start   = (page - 1) * page_size
        results = qs[start: start + page_size]

        serializer = RecursoSerializer(results, many=True, context={"request": request})
        return Response({
            "count":       total,
            "page":        page,
            "page_size":   page_size,
            "total_pages": max(1, -(-total // page_size)),
            "results":     serializer.data,
        })

class ReservaCreateView(APIView):
    """
    POST /api/reservas/crear/

    Body JSON:
    {
        "usuario": 1,
        "recurso": 1,
        "fecha_reserva": "2025-08-01",
        "hora_inicio": "09:00",
        "hora_fin": "10:00"
    }

    Respuesta exitosa (201):
    {
        "mensaje": "Reserva creada exitosamente.",
        "reserva": { ... }
    }

    Errores posibles (409):
    {
        "error": "El recurso no está disponible en el horario solicitado."
    }
    """

    def post(self, request):
        serializer = ReservaCrearSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data        = serializer.validated_data
        usuario     = data["usuario"]
        recurso     = data["recurso"]
        fecha       = data["fecha_reserva"]
        hora_inicio = data["hora_inicio"]
        hora_fin    = data["hora_fin"]

        try:
            with transaction.atomic():
                # Bloquea la fila del recurso mientras dura esta transacción.
                # Si dos requests llegan al mismo tiempo, el segundo esperará
                # hasta que el primero termine.
                recurso_bloqueado = (
                    Recurso.objects.select_for_update().get(pk=recurso.pk)
                )

                # Validación límite de reservas activas por usuario
                reservas_activas = Reserva.objects.exclude(
                    estado__nombre__iexact="cancelada"
                ).filter(usuario=usuario).count()

                if reservas_activas >= LIMITE_RESERVAS_ACTIVAS:
                    return Response(
                        {
                            "error": (
                                f"Límite alcanzado: no puedes tener más de "
                                f"{LIMITE_RESERVAS_ACTIVAS} reservas activas."
                            )
                        },
                        status=status.HTTP_409_CONFLICT,
                    )

                # Validación disponibilidad del recurso
                if not recurso_bloqueado.esta_disponible(fecha, hora_inicio, hora_fin):
                    return Response(
                        {"error": "El recurso no está disponible en el horario solicitado."},
                        status=status.HTTP_409_CONFLICT,
                    )

                # Validació el usuario no tiene ya reserva en ese tramo
                solapamiento = Reserva.objects.exclude(
                    estado__nombre__iexact="cancelada"
                ).filter(
                    usuario=usuario,
                    recurso=recurso_bloqueado,
                    fecha_reserva=fecha,
                    hora_inicio__lt=hora_fin,
                    hora_fin__gt=hora_inicio,
                ).exists()

                if solapamiento:
                    return Response(
                        {"error": "Ya tienes una reserva para ese recurso en ese horario."},
                        status=status.HTTP_409_CONFLICT,
                    )

                # Obtener estado inicial
                try:
                    estado_inicial = EstadoReserva.objects.get(nombre__iexact="activa")
                except EstadoReserva.DoesNotExist:
                    return Response(
                        {"error": "Estado 'activa' no configurado en la BD."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

                # Crear la reserva, el código se genera automáticamente
                reserva = Reserva.objects.create(
                    usuario=usuario,
                    recurso=recurso_bloqueado,
                    estado=estado_inicial,
                    fecha_reserva=fecha,
                    hora_inicio=hora_inicio,
                    hora_fin=hora_fin,
                )

        except Exception as e:
            return Response(
                {"error": f"Error al crear la reserva: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "mensaje": "Reserva creada exitosamente.",
                "reserva": ReservaSerializer(reserva).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ReservaListView(APIView):
    """
    GET /api/reservas/

    Lista todas las reservas. Filtros opcionales:
      ?usuario=1
      ?recurso=1
      ?estado=1
    """

    def get(self, request):
        qs = Reserva.objects.select_related(
            "usuario", "recurso", "estado"
        ).order_by("-fecha_creacion")

        usuario = request.query_params.get("usuario")
        if usuario:
            qs = qs.filter(usuario_id=usuario)

        recurso = request.query_params.get("recurso")
        if recurso:
            qs = qs.filter(recurso_id=recurso)

        estado = request.query_params.get("estado")
        if estado:
            qs = qs.filter(estado_id=estado)

        serializer = ReservaSerializer(qs, many=True)
        return Response({"count": qs.count(), "results": serializer.data})


class ReservaCancelarView(APIView):
    """
    POST /api/reservas/{id}/cancelar/

    Cancela una reserva por su ID.
    Body JSON: { "usuario": 1 }
    """

    def post(self, request, pk):
        try:
            reserva = Reserva.objects.get(pk=pk)
        except Reserva.DoesNotExist:
            return Response(
                {"error": "Reserva no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Obtener el usuario que cancela desde el body
        usuario_id = request.data.get("usuario")
        if not usuario_id:
            return Response(
                {"error": "Debes enviar el campo 'usuario'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from .models import Usuario
        try:
            usuario = Usuario.objects.get(pk=usuario_id)
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            reserva.cancelar(usuario_que_cancela=usuario)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"mensaje": "Reserva cancelada correctamente."})
    
 
def _verificar_admin(request):
    """
    Verificación de admin.
    El cliente debe enviar el header: X-Admin-Key: admin@miumg.edu.gt
    """
    admin_key = request.headers.get("X-Admin-Key")
    if not admin_key:
        return False
    return Usuario.objects.filter(
        correo=admin_key,
        rol__nombre__iexact="admin",
        activo=True
    ).exists()
 
 
def _get_reservas_filtradas(request):
    """
    Aplica los filtros comunes para los endpoints de admin.
    Filtros: fecha, fecha_inicio, fecha_fin, recurso, usuario, estado
    """
    qs = Reserva.objects.select_related(
        "usuario", "recurso", "estado"
    ).order_by("-fecha_reserva", "-hora_inicio")
 
    fecha = request.query_params.get("fecha")
    if fecha:
        qs = qs.filter(fecha_reserva=fecha)
 
    fecha_inicio = request.query_params.get("fecha_inicio")
    if fecha_inicio:
        qs = qs.filter(fecha_reserva__gte=fecha_inicio)
 
    fecha_fin = request.query_params.get("fecha_fin")
    if fecha_fin:
        qs = qs.filter(fecha_reserva__lte=fecha_fin)
 
    recurso = request.query_params.get("recurso")
    if recurso:
        qs = qs.filter(recurso_id=recurso)
 
    usuario = request.query_params.get("usuario")
    if usuario:
        qs = qs.filter(usuario_id=usuario)
 
    estado = request.query_params.get("estado")
    if estado:
        qs = qs.filter(estado_id=estado)
 
    return qs
 
 
class AdminReservaListView(APIView):
    """
    GET /api/admin/reservas/
 
    Lista paginada de TODAS las reservas.
    Requiere header: X-Admin-Key: admin@miumg.edu.gt
 
    Filtros:
      ?fecha=2025-08-01
      ?fecha_inicio=2025-08-01
      ?fecha_fin=2025-08-31
      ?recurso=1
      ?usuario=1
      ?estado=1
      ?page=1
      ?page_size=20      
 
    Respuesta JSON:
    {
        "count": 100,
        "page": 1,
        "page_size": 20,
        "total_pages": 5,
        "results": [ { ... } ]
    }
    """
 
    def get(self, request):
        if not _verificar_admin(request):
            return Response(
                {"error": "Acceso denegado. Se requiere header X-Admin-Key válido."},
                status=status.HTTP_403_FORBIDDEN,
            )
 
        qs = _get_reservas_filtradas(request)
 
        try:
            page      = max(1, int(request.query_params.get("page", 1)))
            page_size = min(100, max(1, int(request.query_params.get("page_size", 20))))
        except ValueError:
            page, page_size = 1, 20
 
        total   = qs.count()
        start   = (page - 1) * page_size
        results = qs[start: start + page_size]
 
        serializer = ReservaSerializer(results, many=True)
        return Response({
            "count":       total,
            "page":        page,
            "page_size":   page_size,
            "total_pages": max(1, -(-total // page_size)),
            "results":     serializer.data,
        })
 
 
class AdminReservaCSVView(APIView):
    """
    GET /api/admin/reservas/csv/
 
    Exporta a CSV las reservas filtradas.
    Requiere header: X-Admin-Key: admin@miumg.edu.gt
    Acepta los mismos filtros que /api/admin/reservas/
 
    Descarga el archivo: reservas.csv
    """
 
    def get(self, request):
        if not _verificar_admin(request):
            return Response(
                {"error": "Acceso denegado. Se requiere header X-Admin-Key válido."},
                status=status.HTTP_403_FORBIDDEN,
            )
 
        qs = _get_reservas_filtradas(request)
 
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="reservas.csv"'
 
        writer = csv.writer(response)
 
        # Encabezados
        writer.writerow([
            "ID",
            "Código",
            "Usuario",
            "Correo",
            "Recurso",
            "Estado",
            "Fecha",
            "Hora Inicio",
            "Hora Fin",
            "Duración (min)",
            "Fecha Creación",
        ])
 
        # Filas
        for r in qs:
            writer.writerow([
                r.id,
                r.codigo_reservacion,
                r.usuario.nombre_completo,
                r.usuario.correo,
                r.recurso.nombre,
                r.estado.nombre,
                r.fecha_reserva,
                r.hora_inicio.strftime("%H:%M"),
                r.hora_fin.strftime("%H:%M"),
                r.duracion_minutos(),
                r.fecha_creacion.strftime("%Y-%m-%d %H:%M"),
            ])
 
        return response