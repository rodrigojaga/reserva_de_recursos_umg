from django.db import models
from datetime import date, datetime
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


# ──────────────────────────────────────────────
# CATÁLOGOS
# ──────────────────────────────────────────────

class Rol(models.Model):
    nombre = models.CharField(max_length=50)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = "rol"
        verbose_name = "Rol"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.nombre


class EstadoReserva(models.Model):
    nombre = models.CharField(max_length=50)

    class Meta:
        db_table = "estado_reserva"
        verbose_name = "Estado de Reserva"
        verbose_name_plural = "Estados de Reserva"

    def __str__(self):
        return self.nombre


# ──────────────────────────────────────────────
# UBICACIÓN Y TIPO DE RECURSO
# ──────────────────────────────────────────────

class Ubicacion(models.Model):
    nombre      = models.CharField(max_length=150)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = "ubicacion"
        verbose_name = "Ubicación"
        verbose_name_plural = "Ubicaciones"

    def __str__(self):
        return self.nombre


class TipoRecurso(models.Model):
    nombre                 = models.CharField(max_length=100)
    limite_maximo_reservas = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Máximo de reservas simultáneas permitidas para este tipo."
    )

    class Meta:
        db_table = "tipo_recurso"
        verbose_name = "Tipo de Recurso"
        verbose_name_plural = "Tipos de Recurso"

    def __str__(self):
        return self.nombre





class Usuario(AbstractUser):
    username        = None
    correo          = models.EmailField(max_length=100, unique=True)
    nombre_completo = models.CharField(max_length=150)
    rol             = models.ForeignKey(
        Rol, on_delete=models.RESTRICT,
        related_name="usuarios", db_column="id_rol"
    )
    activo         = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD  = "correo"
    REQUIRED_FIELDS = ["nombre_completo"]
    objects         = UsuarioManager()

    class Meta:
        db_table = "usuario"
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        indexes = [models.Index(fields=["correo"], name="idx_usuario_correo")]

    def __str__(self):
        return f"{self.nombre_completo} <{self.correo}>"

    def reservas_activas_count(self):
        """Número de reservas activas (no canceladas) del usuario."""
        return self.reservas.exclude(estado__nombre__iexact="Cancelada").count()

    def tiene_solapamiento(self, recurso, fecha, hora_inicio, hora_fin, excluir_pk=None):
        """True si el usuario ya tiene reserva en ese tramo para ese recurso."""
        qs = self.reservas.exclude(estado__nombre__iexact="Cancelada").filter(
            recurso=recurso,
            fecha_reserva=fecha,
            hora_inicio__lt=hora_fin,
            hora_fin__gt=hora_inicio,
        )
        if excluir_pk:
            qs = qs.exclude(pk=excluir_pk)
        return qs.exists()


# ──────────────────────────────────────────────
# RECURSO
# ──────────────────────────────────────────────

class Recurso(models.Model):
    tipo_recurso = models.ForeignKey(
        TipoRecurso, on_delete=models.RESTRICT,
        related_name="recursos", db_column="id_tipo_recurso"
    )
    ubicacion = models.ForeignKey(
        Ubicacion, on_delete=models.RESTRICT,
        related_name="recursos", db_column="id_ubicacion"
    )
    nombre    = models.CharField(max_length=100)
    capacidad = models.IntegerField(null=True, blank=True)
    activo    = models.BooleanField(default=True)

    class Meta:
        db_table = "recurso"
        verbose_name = "Recurso"
        verbose_name_plural = "Recursos"
        indexes = [
            models.Index(fields=["tipo_recurso"], name="idx_recurso_tipo"),
            models.Index(fields=["ubicacion"],    name="idx_recurso_ubicacion"),
            models.Index(fields=["activo"],       name="idx_recurso_activo"),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.tipo_recurso})"

    def esta_disponible(self, fecha, hora_inicio, hora_fin, excluir_pk=None):
        """True si el recurso tiene cupo libre en el tramo indicado."""
        qs = self.reservas.exclude(estado__nombre__iexact="Cancelada").filter(
            fecha_reserva=fecha,
            hora_inicio__lt=hora_fin,
            hora_fin__gt=hora_inicio,
        )
        if excluir_pk:
            qs = qs.exclude(pk=excluir_pk)
        return qs.count() < self.tipo_recurso.limite_maximo_reservas


# ──────────────────────────────────────────────
# GENERADOR DE CÓDIGO
# RES-XXXX-YYYY-MM-DD
# ──────────────────────────────────────────────

def _generar_codigo_unico():
    """
    Genera un código único en formato RES-A3F2-YYYY-MM-DD.
    """
    return "XXXXXXX"


# ──────────────────────────────────────────────
# RESERVA
# ──────────────────────────────────────────────

class Reserva(models.Model):
    usuario  = models.ForeignKey(
        Usuario, on_delete=models.RESTRICT,
        related_name="reservas", db_column="id_usuario"
    )
    recurso  = models.ForeignKey(
        Recurso, on_delete=models.RESTRICT,
        related_name="reservas", db_column="id_recurso"
    )
    estado   = models.ForeignKey(
        EstadoReserva, on_delete=models.RESTRICT,
        related_name="reservas", db_column="id_estado_reserva"
    )
    codigo_reservacion = models.CharField(
        max_length=20, unique=True,
        default=_generar_codigo_unico, editable=False
    )
    fecha_reserva  = models.DateField()
    hora_inicio    = models.TimeField()
    hora_fin       = models.TimeField()
    fecha_creacion = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "reserva"
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        constraints = [
            models.UniqueConstraint(
                fields=["recurso", "fecha_reserva", "hora_inicio", "hora_fin"],
                name="uq_reserva_horario"
            ),
            models.CheckConstraint(
                check=models.Q(hora_fin__gt=models.F("hora_inicio")),
                name="chk_horario_valido"
            ),
        ]
        indexes = [
            models.Index(fields=["usuario"],            name="idx_reserva_usuario"),
            models.Index(fields=["recurso"],            name="idx_reserva_recurso"),
            models.Index(fields=["fecha_reserva"],      name="idx_reserva_fecha"),
            models.Index(fields=["estado"],             name="idx_reserva_estado"),
            models.Index(fields=["codigo_reservacion"], name="idx_reserva_codigo"),
        ]

    def __str__(self):
        return f"[{self.codigo_reservacion}] {self.recurso} — {self.fecha_reserva}"

    def duracion_minutos(self):
        inicio = datetime.combine(date.today(), self.hora_inicio)
        fin    = datetime.combine(date.today(), self.hora_fin)
        return int((fin - inicio).total_seconds() / 60)

    def cancelar(self, usuario_que_cancela):
        """Cancela la reserva y registra en historial."""
        if self.estado.nombre.lower() == "cancelada":
            raise ValueError("La reserva ya está cancelada.")
        estado_anterior  = self.estado
        estado_cancelada = EstadoReserva.objects.get(nombre__iexact="Cancelada")
        self.estado = estado_cancelada
        self.save(update_fields=["estado"])
        HistorialReserva.objects.create(
            reserva=self,
            usuario=usuario_que_cancela,
            estado_anterior=estado_anterior,
            estado_nuevo=estado_cancelada,
        )


# ──────────────────────────────────────────────
# HISTORIAL DE RESERVA
# ──────────────────────────────────────────────

class HistorialReserva(models.Model):
    reserva         = models.ForeignKey(
        Reserva, on_delete=models.RESTRICT,
        related_name="historial", db_column="id_reserva"
    )
    usuario         = models.ForeignKey(
        Usuario, on_delete=models.RESTRICT,
        related_name="historial_cambios", db_column="id_usuario"
    )
    estado_anterior = models.ForeignKey(
        EstadoReserva, on_delete=models.RESTRICT,
        related_name="historial_anterior", db_column="id_estado_anterior"
    )
    estado_nuevo    = models.ForeignKey(
        EstadoReserva, on_delete=models.RESTRICT,
        related_name="historial_nuevo", db_column="id_estado_nuevo"
    )
    timestamp_cambio = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "historial_reserva"
        verbose_name = "Historial de Reserva"
        verbose_name_plural = "Historial de Reservas"
        indexes = [
            models.Index(fields=["reserva"],          name="idx_historial_reserva"),
            models.Index(fields=["usuario"],          name="idx_historial_usuario"),
            models.Index(fields=["timestamp_cambio"], name="idx_historial_timestamp"),
        ]

    def __str__(self):
        return (
            f"{self.reserva.codigo_reservacion}: "
            f"{self.estado_anterior} → {self.estado_nuevo}"
        )