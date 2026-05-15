# Proyecto - Reservas de Recursos UMG

## Descripción

El proyecto tiene como objetivo la gestión de reservas de recursos de la Universidad Mariano Gálvez de Guatemala, permitiendo administrar y controlar el préstamo y disponibilidad de distintos recursos institucionales.

---

# Tecnologías Utilizadas

## Backend
- Django
- Python

## Frontend
- React

## Base de Datos
- PostgreSQL

## Control de Versiones
- Git
- GitHub

---

# Dependencias Instaladas

## Backend

### Framework principal
- Django

### Entorno virtual
- venv

---

## Frontend

### Framework frontend
- React

---

# Estructura del Proyecto

```text
proyecto/
│
├── .github/
│   └── pull_request_template.md
│
├── backend/
│   ├── api/
│   ├── config/
│   ├── venv/
│   ├── manage.py
│   └── requirements.txt
|
|── database/
│   ├── README.md
|
├── frontend/
│   └── README.md
|   └── tempo.txt
│
├── .gitignore
└── README.md
```

---

# Configuración del Backend

## 1. Ingresar a la carpeta backend

```bash
cd backend
```

---

## 2. Crear entorno virtual

```bash
python -m venv venv
```

---

## 3. Activar entorno virtual

### CMD

```cmd
venv\Scripts\activate
```

---

## 4. Instalar dependencias backend

```bash
pip install django djangorestframework django-cors-headers
```

---

## 5. Guardar dependencias

```bash
pip freeze > requirements.txt
```

---

## 6. Instalar dependencias desde requirements.txt

```bash
pip install -r requirements.txt
```

---

## 7. Ejecutar servidor Django

```bash
python manage.py runserver
```

---

# Configuración del Frontend

## 1. Ingresar a la carpeta frontend

```bash
cd frontend
```

---


# Configuración de Base de Datos

## PostgreSQL

El sistema utilizará PostgreSQL como sistema gestor de base de datos principal para el almacenamiento y administración de la información.

---

# Branches del Proyecto

- main -> Rama principal protegida
- V_0 -> Rama de desarrollo
- backend-rodrigo -> Desarrollo backend
- frontend-milton -> Desarrollo frontend
- database-mario -> Scripts de la base de datos

---