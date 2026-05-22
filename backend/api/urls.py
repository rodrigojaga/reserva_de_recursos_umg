from django.urls import path
from .views import (
    RecursoListView,
    ReservaCreateView,
    ReservaListView,
    ReservaCancelarView,
)
 
urlpatterns = [
    # Tarea 2
    path("recursos/", RecursoListView.as_view(), name="recurso-list"),
 
    # Tarea 3
    path("reservas/",                    ReservaListView.as_view(),    name="reserva-list"),
    path("reservas/crear/",              ReservaCreateView.as_view(),  name="reserva-crear"),
    path("reservas/<int:pk>/cancelar/",  ReservaCancelarView.as_view(), name="reserva-cancelar"),
]