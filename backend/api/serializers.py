from rest_framework import serializers
from .models import (
    Rol, EstadoReserva, Ubicacion, TipoRecurso,
    Usuario, Recurso, Reserva, HistorialReserva
)

"""
Archivo para convertir objetos de Django a json
"""

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Rol
        fields = ["id", "nombre", "activo"]


class EstadoReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EstadoReserva
        fields = ["id", "nombre"]


class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Ubicacion
        fields = ["id", "nombre", "descripcion"]


class TipoRecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = TipoRecurso
        fields = ["id", "nombre", "limite_maximo_reservas"]


class UsuarioSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source="rol.nombre", read_only=True)

    class Meta:
        model  = Usuario
        fields = ["id", "correo", "nombre_completo", "rol", "rol_nombre", "activo", "fecha_registro"]


#Recurso
class RecursoSerializer(serializers.ModelSerializer):
    tipo_recurso_nombre = serializers.CharField(source="tipo_recurso.nombre", read_only=True)
    ubicacion_nombre    = serializers.CharField(source="ubicacion.nombre",    read_only=True)
    disponible          = serializers.SerializerMethodField()

    class Meta:
        model  = Recurso
        fields = [
            "id", "nombre", "capacidad", "activo",
            "tipo_recurso", "tipo_recurso_nombre",
            "ubicacion",    "ubicacion_nombre",
            "disponible",
        ]

    def get_disponible(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        fecha       = request.query_params.get("fecha")
        hora_inicio = request.query_params.get("hora_inicio")
        hora_fin    = request.query_params.get("hora_fin")
        if fecha and hora_inicio and hora_fin:
            return obj.esta_disponible(fecha, hora_inicio, hora_fin)
        return None


#Reserva
class ReservaSerializer(serializers.ModelSerializer):
    usuario_nombre   = serializers.CharField(source="usuario.nombre_completo", read_only=True)
    recurso_nombre   = serializers.CharField(source="recurso.nombre",          read_only=True)
    estado_nombre    = serializers.CharField(source="estado.nombre",           read_only=True)
    duracion_minutos = serializers.SerializerMethodField()

    class Meta:
        model  = Reserva
        fields = [
            "id", "codigo_reservacion",
            "usuario", "usuario_nombre",
            "recurso", "recurso_nombre",
            "estado",  "estado_nombre",
            "fecha_reserva", "hora_inicio", "hora_fin",
            "duracion_minutos", "fecha_creacion",
        ]
        read_only_fields = ["codigo_reservacion", "fecha_creacion"]

    def get_duracion_minutos(self, obj):
        return obj.duracion_minutos()


class ReservaCrearSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Reserva
        fields = ["usuario", "recurso", "fecha_reserva", "hora_inicio", "hora_fin"]

    def validate(self, data):
        hora_inicio = data["hora_inicio"]
        hora_fin    = data["hora_fin"]
        fecha       = data["fecha_reserva"]
        recurso     = data["recurso"]

        if hora_fin <= hora_inicio:
            raise serializers.ValidationError(
                {"hora_fin": "La hora de fin debe ser posterior a la hora de inicio."}
            )

        from datetime import date
        if fecha < date.today():
            raise serializers.ValidationError(
                {"fecha_reserva": "No se pueden hacer reservas en fechas pasadas."}
            )

        if not recurso.activo:
            raise serializers.ValidationError(
                {"recurso": "El recurso no está disponible."}
            )

        return data


#Historial
class HistorialReservaSerializer(serializers.ModelSerializer):
    estado_anterior_nombre = serializers.CharField(source="estado_anterior.nombre", read_only=True)
    estado_nuevo_nombre    = serializers.CharField(source="estado_nuevo.nombre",    read_only=True)
    usuario_nombre         = serializers.CharField(source="usuario.nombre_completo", read_only=True)

    class Meta:
        model  = HistorialReserva
        fields = [
            "id", "reserva", "usuario", "usuario_nombre",
            "estado_anterior", "estado_anterior_nombre",
            "estado_nuevo",    "estado_nuevo_nombre",
            "timestamp_cambio",
        ]