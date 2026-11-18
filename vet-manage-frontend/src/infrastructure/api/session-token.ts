const STORAGE_KEY = 'vetmanage.accessToken';

type Listener = () => void;
const expiredListeners = new Set<Listener>();

// Token de acceso de la sesión actual guardado en el navegador.
export const sessionToken = {
  get(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(STORAGE_KEY, token);
    } catch {
      // Sin almacenamiento la sesión dura hasta recargar la página.
    }
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada que limpiar.
    }
  },
  // Avisa cuando la API rechaza el token guardado.
  onExpired(listener: Listener) {
    expiredListeners.add(listener);
    return () => {
      expiredListeners.delete(listener);
    };
  },
  expire() {
    this.clear();
    expiredListeners.forEach((listener) => listener());
  },
};
