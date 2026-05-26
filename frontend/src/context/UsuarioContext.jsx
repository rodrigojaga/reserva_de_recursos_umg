// ================================================
// UsuarioContext.jsx
// Guarda el usuario activo en toda la app.
// En el MVP el usuario se selecciona manualmente.
// ================================================

import { createContext, useContext, useState } from 'react';

const UsuarioContext = createContext(null);

// Usuarios de prueba que coinciden con los de tu BD
// Cambia los IDs si son diferentes en tu base de datos
const USUARIOS_PRUEBA = [
  {
    id: 2,
    nombre: 'Administrador del Sistema',
    correo: 'admin@miumg.edu.gt',
    rol: 'admin',
  },
  {
    id: 5,
    nombre: 'Rodrigo Galindo',
    correo: 'rgalindos@miumg.edu.gt',
    rol: 'estudiante',
  },
];

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const login = (usuarioSeleccionado) => {
    setUsuario(usuarioSeleccionado);
  };

  const logout = () => {
    setUsuario(null);
  };

  const esAdmin = usuario?.rol === 'admin';

  return (
    <UsuarioContext.Provider value={{ usuario, login, logout, esAdmin, USUARIOS_PRUEBA }}>
      {children}
    </UsuarioContext.Provider>
  );
}

// Hook para usar el contexto fácilmente en cualquier componente
export function useUsuario() {
  return useContext(UsuarioContext);
}
