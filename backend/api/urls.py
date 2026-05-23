from django.urls import path
from .views import (
    RecursoListView,
    ReservaCreateView,
    ReservaListView,
    ReservaCancelarView,
    AdminReservaListView,
    AdminReservaCSVView,
)
 
urlpatterns = [
    # Tarea 2
    path("recursos/", RecursoListView.as_view(), name="recurso-list"),
 
    # Tarea 3
    path("reservas/",                    ReservaListView.as_view(),    name="reserva-list"),
    path("reservas/crear/",              ReservaCreateView.as_view(),  name="reserva-crear"),
    path("reservas/<int:pk>/cancelar/",  ReservaCancelarView.as_view(), name="reserva-cancelar"),

    #Tarea 5
    path("admin/reservas/",              AdminReservaListView.as_view(), name="admin-reserva-list"),
    path("admin/reservas/csv/",          AdminReservaCSVView.as_view(),  name="admin-reserva-csv"),
]