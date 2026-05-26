// ================================================
// api.js — Comunicación central con el backend
// Todos los requests al backend pasan por aquí
// ================================================

import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});


// ── RECURSOS ──────────────────────────────────

export const getRecursos = (filtros = {}) => {
  // filtros: { tipo, capacidad_min, fecha, hora_inicio, hora_fin, disponible, ordering, page, page_size }
  return api.get('/recursos/', { params: filtros });
};


// ── RESERVAS ──────────────────────────────────

export const getReservas = (filtros = {}) => {
  // filtros: { usuario, recurso, estado }
  return api.get('/reservas/', { params: filtros });
};

export const crearReserva = (datos) => {
  // datos: { usuario, recurso, fecha_reserva, hora_inicio, hora_fin }
  return api.post('/reservas/crear/', datos);
};

export const cancelarReserva = (id, usuarioId) => {
  return api.post(`/reservas/${id}/cancelar/`, { usuario: usuarioId });
};


// ── ADMIN ─────────────────────────────────────

export const getReservasAdmin = (adminCorreo, filtros = {}) => {
  // filtros: { fecha, fecha_inicio, fecha_fin, recurso, usuario, estado, page, page_size }
  return api.get('/admin/reservas/', {
    params: filtros,
    headers: { 'X-Admin-Key': adminCorreo },
  });
};

export const getCSVAdmin = (adminCorreo, filtros = {}) => {
  // Descarga el CSV directamente
  return api.get('/admin/reservas/csv/', {
    params: filtros,
    headers: { 'X-Admin-Key': adminCorreo },
    responseType: 'blob', // importante para archivos
  });
};
