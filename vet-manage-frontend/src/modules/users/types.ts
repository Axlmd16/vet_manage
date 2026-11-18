export type AssignableRole = { name: string; displayName: string; description: string | null };

export type RegisterUserInput = {
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
};

export type RegisteredUser = {
  id: string;
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: { name: string; displayName: string }[];
  existingPerson: boolean;
  passwordAssigned: boolean;
  credentialsSent: boolean;
};
