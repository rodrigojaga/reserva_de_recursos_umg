-- ================================================
-- SCRIPT: DATOS INICIALES (SEEDS)
-- Sistema: Gestor de Reservas Universidad
-- Autor: Mario Israel Macario - DBA
-- ================================================

-- SEEDS ROL
INSERT INTO ROL (nombre, activo) VALUES
    ('estudiante', TRUE),
    ('docente',    TRUE),
    ('admin',      TRUE);

-- SEEDS ESTADO_RESERVA
INSERT INTO ESTADO_RESERVA (nombre) VALUES
    ('activa'),
    ('cancelada');

-- SEEDS TIPO_RECURSO
INSERT INTO TIPO_RECURSO (nombre, limite_maximo_reservas) VALUES
    ('Salón',        2),
    ('Laboratorio',  2),
    ('Equipo',       3);

-- SEEDS UBICACION
INSERT INTO UBICACION (nombre, descripcion) VALUES
    ('Edificio A, Nivel 1', 'Primer nivel del edificio A'),
    ('Edificio A, Nivel 2', 'Segundo nivel del edificio A'),
    ('Edificio B, Nivel 1', 'Primer nivel del edificio B'),
    ('Edificio B, Nivel 2', 'Segundo nivel del edificio B'),
    ('Bodega Central',      'Bodega principal de equipos');

-- SEEDS USUARIO ADMINISTRADOR
INSERT INTO USUARIO (
    id_rol,
    correo,
    nombre_completo,
    activo,
    fecha_registro
) VALUES (
    (SELECT id_rol FROM ROL WHERE nombre = 'admin'),
    'admin@miumg.edu.gt',
    'Administrador del Sistema',
    TRUE,
    NOW()
);

-- SEEDS RECURSOS DE EJEMPLO
INSERT INTO RECURSO (id_tipo_recurso, id_ubicacion, nombre, capacidad, activo) VALUES
    (1, 1, 'Salón A-101',              30,   TRUE),
    (1, 1, 'Salón A-102',              25,   TRUE),
    (1, 3, 'Salón B-101',              40,   TRUE),
    (2, 2, 'Laboratorio de Cómputo 1', 25,   TRUE),
    (2, 4, 'Laboratorio de Redes',     20,   TRUE),
    (3, 5, 'Proyector HD-01',          NULL, TRUE),
    (3, 5, 'Proyector HD-02',          NULL, TRUE),
    (3, 5, 'Proyector HD-03',          NULL, TRUE);
