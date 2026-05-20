from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Recurso
from .serializers import RecursoSerializer


class RecursoListView(APIView):
    """
    GET /api/recursos

    Devuelve el catálogo de recursos activos con soporte de filtros,
    paginación y ordenamiento.

    Filtros disponibles (query params):
      ?tipo=1              → id del TipoRecurso
      ?capacidad_min=20    → capacidad mínima
      ?fecha=2025-08-01    → fecha (YYYY-MM-DD)
      ?hora_inicio=09:00   → hora inicio (HH:MM) — requiere fecha y hora_fin
      ?hora_fin=10:00      → hora fin   (HH:MM) — requiere fecha y hora_inicio
      ?disponible=true     → true | false (requiere fecha + horas)
      ?ordering=nombre     → nombre | -nombre | capacidad | -capacidad
      ?page=1              → número de página (default: 1)
      ?page_size=10        → resultados por página (default: 10, máx: 50)

    Respuesta exitosa (200):
    {
        "count": 8,
        "page": 1,
        "page_size": 10,
        "total_pages": 1,
        "results":
        "results": [ { ... } ]
    }
    """

    def get(self, request):
        #Obtiene recursos activos unicamente
        qs = Recurso.objects.filter(activo=True).select_related(
            "tipo_recurso", "ubicacion"
        )

        #Filtro por tipo de recurso
        tipo = request.query_params.get("tipo") #la parte de la url que dice ?tipo=X
        if tipo:
            qs = qs.filter(tipo_recurso_id=tipo) #Filtra por el id de tipo ingresado

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
        #Ordenamiento
        ordering_map = {
            "nombre":     "nombre",
            "-nombre":    "-nombre",
            "capacidad":  "capacidad",
            "-capacidad": "-capacidad",
        }
        ordering = request.query_params.get("ordering", "nombre") #hace que se ordene por nombre
        qs = qs.order_by(ordering_map.get(ordering, "nombre"))

        #Filtro por disponibilidad
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

        #Paginación
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