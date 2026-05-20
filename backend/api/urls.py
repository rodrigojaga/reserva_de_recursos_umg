from django.urls import path
from .views import RecursoListView
 
urlpatterns = [
    path("recursos/", RecursoListView.as_view(), name="recurso-list"),
]