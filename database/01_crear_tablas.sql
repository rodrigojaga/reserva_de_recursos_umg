-- ================================================
-- SCRIPT: CREACIÓN DE TABLAS
-- Sistema: Gestor de Reservas Universidad
-- Autor: Mario Israel Macario - DBA
-- ================================================

-- TABLA ROL
CREATE TABLE ROL (
    id_rol      SERIAL PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL,
    activo      BOOLEAN DEFAULT TRUE
);

-- TABLA ESTADO_RESERVA
CREATE TABLE ESTADO_RESERVA (
    id_estado_reserva   SERIAL PRIMARY KEY,
    nombre              VARCHAR(50) NOT NULL
);

-- TABLA UBICACION
CREATE TABLE UBICACION (
    id_ubicacion    SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    descripcion     VARCHAR(255)
);

-- TABLA TIPO_RECURSO
CREATE TABLE TIPO_RECURSO (
    id_tipo_recurso         SERIAL PRIMARY KEY,
    nombre                  VARCHAR(100) NOT NULL,
    limite_maximo_reservas  INTEGER NOT NULL CHECK (limite_maximo_reservas > 0)
);

-- TABLA USUARIO
CREATE TABLE USUARIO (
    id_usuario      SERIAL PRIMARY KEY,
    id_rol          INTEGER NOT NULL,
    correo          VARCHAR(100) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    fecha_registro  TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol)
        REFERENCES ROL (id_rol)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_usuario_correo ON USUARIO (correo);

-- TABLA RECURSO
CREATE TABLE RECURSO (
    id_recurso      SERIAL PRIMARY KEY,
    id_tipo_recurso INTEGER NOT NULL,
    id_ubicacion    INTEGER NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    capacidad       INTEGER,
    activo          BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_recurso_tipo
        FOREIGN KEY (id_tipo_recurso)
        REFERENCES TIPO_RECURSO (id_tipo_recurso)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_recurso_ubicacion
        FOREIGN KEY (id_ubicacion)
        REFERENCES UBICACION (id_ubicacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_recurso_tipo ON RECURSO (id_tipo_recurso);
CREATE INDEX idx_recurso_ubicacion ON RECURSO (id_ubicacion);
CREATE INDEX idx_recurso_activo ON RECURSO (activo);

-- TABLA RESERVA
CREATE TABLE RESERVA (
    id_reserva          SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL,
    id_recurso          INTEGER NOT NULL,
    id_estado_reserva   INTEGER NOT NULL,
    codigo_reservacion  VARCHAR(20) NOT NULL UNIQUE,
    fecha_reserva       DATE NOT NULL,
    hora_inicio         TIME NOT NULL,
    hora_fin            TIME NOT NULL,
    fecha_creacion      TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_horario_valido
        CHECK (hora_fin > hora_inicio),
    CONSTRAINT fk_reserva_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES USUARIO (id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_reserva_recurso
        FOREIGN KEY (id_recurso)
        REFERENCES RECURSO (id_recurso)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_reserva_estado
        FOREIGN KEY (id_estado_reserva)
        REFERENCES ESTADO_RESERVA (id_estado_reserva)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_reserva_horario
        UNIQUE (id_recurso, fecha_reserva, hora_inicio, hora_fin)
);

CREATE INDEX idx_reserva_usuario ON RESERVA (id_usuario);
CREATE INDEX idx_reserva_recurso ON RESERVA (id_recurso);
CREATE INDEX idx_reserva_fecha ON RESERVA (fecha_reserva);
CREATE INDEX idx_reserva_estado ON RESERVA (id_estado_reserva);
CREATE INDEX idx_reserva_codigo ON RESERVA (codigo_reservacion);

-- TABLA HISTORIAL_RESERVA
CREATE TABLE HISTORIAL_RESERVA (
    id_historial        SERIAL PRIMARY KEY,
    id_reserva          INTEGER NOT NULL,
    id_usuario          INTEGER NOT NULL,
    id_estado_anterior  INTEGER NOT NULL,
    id_estado_nuevo     INTEGER NOT NULL,
    timestamp_cambio    TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_historial_reserva
        FOREIGN KEY (id_reserva)
        REFERENCES RESERVA (id_reserva)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_historial_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES USUARIO (id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_historial_estado_anterior
        FOREIGN KEY (id_estado_anterior)
        REFERENCES ESTADO_RESERVA (id_estado_reserva)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_historial_estado_nuevo
        FOREIGN KEY (id_estado_nuevo)
        REFERENCES ESTADO_RESERVA (id_estado_reserva)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_historial_reserva ON HISTORIAL_RESERVA (id_reserva);
CREATE INDEX idx_historial_usuario ON HISTORIAL_RESERVA (id_usuario);
CREATE INDEX idx_historial_timestamp ON HISTORIAL_RESERVA (timestamp_cambio);
