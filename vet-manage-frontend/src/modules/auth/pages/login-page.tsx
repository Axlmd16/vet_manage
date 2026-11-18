import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../infrastructure/api/http-client';
import { useAuth } from '../auth-context';

const MISSING_FIELDS = 'Ingrese su correo y contraseña';

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';
  if (status === 'authenticated') return <Navigate to={from} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(MISSING_FIELDS);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (cause) {
      setPassword('');
      setError(cause instanceof ApiError ? cause.message : 'No se pudo conectar con el servidor. Intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand login-brand">
          <div className="brand-mark">V</div>
          <div>
            <strong>Vet Manage</strong>
            <span>Gestión veterinaria</span>
          </div>
        </div>

        <span className="eyebrow">Bienvenido</span>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="login-subtitle">Ingrese con su correo y contraseña.</p>

        <form className="login-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <label className="field">
            <span>Correo electrónico</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@vetmanage.com"
              aria-invalid={error === MISSING_FIELDS && !email.trim()}
            />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={error === MISSING_FIELDS && !password.trim()}
            />
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="button button--primary login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  );
}
