import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarIcon, CheckIcon, IdCardIcon, InfoIcon, MailIcon, PackageIcon, PawIcon, PhoneIcon, ShieldIcon, UserIcon, UsersIcon, WalletIcon,
} from '../../../common/components/icons';
import { useToast } from '../../../common/components/toast-context';
import { ApiError } from '../../../infrastructure/api/http-client';
import { isValidIdentification } from '../../../common/validation/identification';
import { usersApi } from '../services/users-api';
import type { AssignableRole } from '../types';
import './user-register-page.css';

const MISSING_FIELDS = 'Complete los campos obligatorios';
const INVALID_IDENTIFICATION = 'La cédula debe tener 10 dígitos válidos';
const INVALID_EMAIL = 'Ingrese un correo electrónico válido';
const INVALID_PHONE = 'Ingrese un teléfono válido';
const MAIL_FAILED = 'Usuario registrado, pero no se pudo enviar el correo. Verifique la dirección y reenvíe las credenciales';
const REGISTERED = 'Usuario registrado correctamente';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;

type Field = 'identification' | 'firstName' | 'lastName' | 'email' | 'phone' | 'roles';
type FieldErrors = Partial<Record<Field, string>>;
type Form = { identification: string; firstName: string; lastName: string; email: string; phone: string; roles: string[] };

const ROLE_ICONS: Record<string, typeof ShieldIcon> = {
  administrator: ShieldIcon,
  manager: UsersIcon,
  veterinarian: PawIcon,
  veterinary_technician: PawIcon,
  receptionist: CalendarIcon,
  cashier: WalletIcon,
  warehouse_keeper: PackageIcon,
};

const emptyForm: Form = { identification: '', firstName: '', lastName: '', email: '', phone: '', roles: [] };

// Errores por campo antes de llamar a la API; vacío significa que el formulario puede enviarse.
function validate(form: Form): { errors: FieldErrors; missing: boolean } {
  const errors: FieldErrors = {};
  let missing = false;
  const required: [Field, string][] = [
    ['identification', form.identification.trim()],
    ['firstName', form.firstName.trim()],
    ['lastName', form.lastName.trim()],
    ['email', form.email.trim()],
    ['roles', form.roles.length > 0 ? 'x' : ''],
  ];
  for (const [field, value] of required) {
    if (!value) {
      errors[field] = MISSING_FIELDS;
      missing = true;
    }
  }
  if (!errors.identification && !isValidIdentification(form.identification.trim())) errors.identification = INVALID_IDENTIFICATION;
  if (!errors.email && !EMAIL_PATTERN.test(form.email.trim())) errors.email = INVALID_EMAIL;
  if (form.phone.trim() && !PHONE_PATTERN.test(form.phone.trim())) errors.phone = INVALID_PHONE;
  return { errors, missing };
}

// Traduce el rechazo de la API a un aviso y a los campos que se resaltan.
function fromApiError(cause: unknown): { message: string; errors: FieldErrors } {
  if (!(cause instanceof ApiError)) {
    return { message: 'No se pudo conectar con el servidor. Intente nuevamente.', errors: {} };
  }
  const errors: FieldErrors = {};
  if (cause.code === 'USER_IDENTIFICATION_TAKEN') errors.identification = cause.message;
  else if (cause.code === 'USER_EMAIL_TAKEN') errors.email = cause.message;
  else if (cause.code === 'USER_INVALID_ROLES') errors.roles = cause.message;
  else {
    const fields: Field[] = ['identification', 'firstName', 'lastName', 'email', 'phone', 'roles'];
    for (const field of cause.errors) {
      if ((fields as string[]).includes(field)) errors[field as Field] = cause.message;
    }
  }
  return { message: cause.message, errors };
}

export function UserRegisterPage() {
  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [roles, setRoles] = useState<AssignableRole[]>([]);
  const [rolesState, setRolesState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    usersApi.assignableRoles()
      .then((loaded) => { if (active) { setRoles(loaded); setRolesState('ready'); } })
      .catch(() => { if (active) setRolesState('error'); });
    return () => { active = false; };
  }, []);

  function update(field: Exclude<Field, 'roles'>, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleRole(name: string) {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(name) ? current.roles.filter((role) => role !== name) : [...current.roles, name],
    }));
    setErrors((current) => ({ ...current, roles: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;

    const { errors: found, missing } = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      showToast(missing ? MISSING_FIELDS : 'Revise los datos ingresados.', 'error');
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const user = await usersApi.register({
        identification: form.identification.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        roles: form.roles,
      });
      const reused = user.existingPerson ? ' La persona ya existía: se agregaron los roles a su cuenta.' : '';
      if (user.passwordAssigned && !user.credentialsSent) showToast(MAIL_FAILED, 'warning');
      else showToast(`${REGISTERED}.${reused}`, 'success');
      navigate('/users');
    } catch (cause) {
      const failure = fromApiError(cause);
      setErrors(failure.errors);
      showToast(failure.message, 'error');
      setSaving(false);
    }
  }

  const selected = form.roles.length;

  return (
    <section className="users-page">
      <Link className="back-link" to="/users">← Volver a usuarios</Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Administración · Usuarios</span>
          <h2>Registrar usuario</h2>
          <p>Cree la cuenta del personal con sus roles; las credenciales se envían al correo registrado.</p>
        </div>
      </div>

      <form className="register-form" onSubmit={submit} noValidate>
        <div className="register-form__grid">
          <div className="register-card">
            <header className="register-card__header">
              <span className="register-card__icon"><UserIcon size={18} /></span>
              <div><h3>Datos personales</h3><p>La cédula identifica a la persona en todo el sistema.</p></div>
            </header>

            <div className="register-card__fields">
              <Field label="Cédula" required error={errors.identification} icon={<IdCardIcon size={16} />}>
                <input value={form.identification} inputMode="numeric" maxLength={10} placeholder="10 dígitos" autoComplete="off"
                  aria-invalid={Boolean(errors.identification)} onChange={(event) => update('identification', event.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label="Teléfono" hint="Opcional" error={errors.phone} icon={<PhoneIcon size={16} />}>
                <input type="tel" value={form.phone} maxLength={16} placeholder="0991234567" autoComplete="off"
                  aria-invalid={Boolean(errors.phone)} onChange={(event) => update('phone', event.target.value)} />
              </Field>
              <Field label="Nombres" required error={errors.firstName} icon={<UserIcon size={16} />}>
                <input value={form.firstName} maxLength={100} placeholder="Nombres completos" aria-invalid={Boolean(errors.firstName)}
                  onChange={(event) => update('firstName', event.target.value)} />
              </Field>
              <Field label="Apellidos" required error={errors.lastName} icon={<UserIcon size={16} />}>
                <input value={form.lastName} maxLength={100} placeholder="Apellidos completos" aria-invalid={Boolean(errors.lastName)}
                  onChange={(event) => update('lastName', event.target.value)} />
              </Field>
              <Field className="register-card__full" label="Correo electrónico" required error={errors.email} icon={<MailIcon size={16} />}>
                <input type="email" value={form.email} maxLength={255} placeholder="usuario@clinica.com" autoComplete="off"
                  aria-invalid={Boolean(errors.email)} onChange={(event) => update('email', event.target.value)} />
              </Field>
            </div>

            <div className="register-card__note">
              <InfoIcon size={18} />
              <p><strong>Acceso al sistema.</strong> Al guardar se genera una contraseña temporal y se envía a este correo. La persona deberá cambiarla en su primer ingreso.</p>
            </div>
          </div>

          <div className="register-card">
            <header className="register-card__header">
              <span className="register-card__icon"><ShieldIcon size={18} /></span>
              <div><h3>Roles</h3><p>Seleccione uno o más; se suman los permisos de todos.</p></div>
              <span className={`register-card__count${selected > 0 ? ' register-card__count--active' : ''}`}>
                {selected === 1 ? '1 seleccionado' : `${selected} seleccionados`}
              </span>
            </header>

            <fieldset className={`role-list${errors.roles ? ' role-list--invalid' : ''}`} aria-invalid={Boolean(errors.roles)}>
              <legend className="sr-only">Roles del usuario</legend>
              {rolesState === 'loading' && <p className="role-list__status">Cargando roles…</p>}
              {rolesState === 'error' && <p className="role-list__status field-error">No se pudieron cargar los roles. Recargue la página.</p>}
              {roles.map((role) => {
                const RoleIcon = ROLE_ICONS[role.name] ?? ShieldIcon;
                const checked = form.roles.includes(role.name);
                return (
                  <label key={role.name} className={`role-card${checked ? ' role-card--selected' : ''}`}>
                    <input className="sr-only" type="checkbox" checked={checked} onChange={() => toggleRole(role.name)} />
                    <span className="role-card__icon"><RoleIcon size={18} /></span>
                    <span className="role-card__text"><b>{role.displayName}</b>{role.description && <small>{role.description}</small>}</span>
                    <span className="role-card__check" aria-hidden="true"><CheckIcon size={13} /></span>
                  </label>
                );
              })}
            </fieldset>
            {errors.roles && <small className="field-error register-card__error">{errors.roles}</small>}
          </div>
        </div>

        <div className="register-form__actions">
          <Link className="button button--ghost" to="/users">Cancelar</Link>
          <button className="button button--primary" type="submit" disabled={saving || rolesState !== 'ready'}>{saving ? 'Guardando…' : 'Guardar usuario'}</button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, required, hint, error, icon, className = '', children }: {
  label: string; required?: boolean; hint?: string; error?: string; icon: ReactNode; className?: string; children: ReactNode;
}) {
  return (
    <label className={`field ${className}`}>
      <span>{label}{required && <b> *</b>}</span>
      <span className="input-icon">{icon}{children}</span>
      {hint && !error && <small>{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
