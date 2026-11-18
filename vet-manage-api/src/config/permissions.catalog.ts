export type PermissionDefinition = {
  key: PermissionKey;
  displayName: string;
  description: string;
  visible?: boolean;
};

// Una entrada por función del sistema: [clave `modulo:accion`, nombre visible].
const PERMISSION_ENTRIES = [
  // Usuarios, roles y auditoría
  ['users:create', 'Registrar usuarios'],
  ['users:read', 'Consultar usuarios'],
  ['users:update', 'Actualizar datos de usuario'],
  ['users:assign-roles', 'Asignar y quitar roles'],
  ['users:change-status', 'Activar e inactivar cuentas'],
  ['users:deactivate', 'Dar de baja usuarios'],
  ['roles:manage-permissions', 'Gestionar permisos por rol'],
  ['audit:read', 'Consultar auditoría'],
  ['audit:export', 'Exportar auditoría'],

  // Clientes
  ['clients:create', 'Registrar clientes'],
  ['clients:read', 'Consultar clientes'],
  ['clients:update', 'Actualizar clientes'],
  ['clients:deactivate', 'Dar de baja clientes'],
  ['clients:inactivate', 'Inactivar clientes'],
  ['clients:activate', 'Activar clientes'],

  // Pacientes
  ['pets:create', 'Registrar pacientes'],
  ['pets:read', 'Consultar pacientes'],
  ['pets:update', 'Actualizar pacientes'],
  ['pets:deactivate', 'Dar de baja pacientes'],
  ['pets:inactivate', 'Inactivar pacientes'],
  ['pets:activate', 'Activar pacientes'],

  // Especies y razas
  ['species:create', 'Registrar especies'],
  ['species:read', 'Consultar especies'],
  ['species:update', 'Actualizar especies'],
  ['species:change-status', 'Activar e inactivar especies'],
  ['breeds:create', 'Registrar razas'],
  ['breeds:read', 'Consultar razas'],
  ['breeds:update', 'Actualizar razas'],
  ['breeds:change-status', 'Activar e inactivar razas'],

  // Historia y atención clínica
  ['medical-history:create', 'Registrar historia clínica'],
  ['medical-history:read', 'Ver historial clínico'],
  ['consultations:create', 'Registrar atención clínica'],
  ['consultations:correct', 'Corregir atención clínica'],
  ['diagnoses:create', 'Registrar diagnóstico'],

  // Recetas médicas
  ['prescriptions:manage', 'Registrar y editar recetas'],
  ['prescriptions:read', 'Consultar recetas'],
  ['prescriptions:export', 'Generar receta en PDF'],

  // Vacunación y desparasitación
  ['vaccinations:create', 'Registrar vacunaciones'],
  ['vaccinations:update', 'Editar vacunaciones'],
  ['vaccinations:read', 'Consultar vacunaciones'],
  ['vaccinations:void', 'Anular vacunaciones'],
  ['deworming:create', 'Registrar desparasitaciones'],
  ['deworming:update', 'Editar desparasitaciones'],
  ['deworming:read', 'Consultar desparasitaciones'],
  ['deworming:void', 'Anular desparasitaciones'],

  // Procedimientos clínicos
  ['procedure-types:create', 'Registrar tipos de procedimiento'],
  ['procedure-types:read', 'Consultar tipos de procedimiento'],
  ['procedure-types:inactivate', 'Inactivar tipos de procedimiento'],
  ['procedures:create', 'Registrar procedimientos del catálogo'],
  ['procedures:read', 'Consultar procedimientos del catálogo'],
  ['procedures:deactivate', 'Dar de baja procedimientos del catálogo'],
  ['procedure-reports:create', 'Registrar informes de procedimiento'],
  ['procedure-reports:correct', 'Corregir informes de procedimiento'],

  // Insumos utilizados y archivos clínicos
  ['supplies-used:create', 'Registrar insumos utilizados'],
  ['supplies-used:remove', 'Retirar insumos del listado'],
  ['clinical-files:create', 'Adjuntar archivos clínicos'],
  ['clinical-files:read', 'Consultar y visualizar archivos clínicos'],
  ['clinical-files:update', 'Actualizar información de archivos clínicos'],
  ['clinical-files:remove', 'Retirar archivos clínicos'],
] as const;

export type PermissionKey = (typeof PERMISSION_ENTRIES)[number][0];

export const PERMISSIONS: readonly PermissionDefinition[] = PERMISSION_ENTRIES.map(
  ([key, displayName]) => ({
    key,
    displayName,
    description: `Permite: ${displayName.toLowerCase()}`,
    visible: true,
  }),
);
