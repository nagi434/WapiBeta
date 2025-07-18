import { useState, useEffect } from 'react';
import { authService } from '../services/api';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Aquí podrías verificar si hay un token en localStorage o sessionStorage
    // y validar la sesión al cargar la aplicación
    const checkSession = async () => {
      try {
        // Simular una verificación de sesión
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      } catch (err) {
        setError('Error al verificar la sesión');
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        return { success: true };
      } else {
        setError(response.message || 'Error de autenticación');
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError(err.message || 'Error de red al iniciar sesión');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setIsLoggedIn(false);
      localStorage.removeItem('isLoggedIn');
      return { success: true };
    } catch (err) {
      setError(err.message || 'Error al cerrar sesión');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { isLoggedIn, loading, error, login, logout };
}


