export const CLIENT_ROLE = 'client';

export type AssignableRole = { name: string; displayName: string; description: string | null };

export type RegisterClientInput = {
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  roles: string[];
};

export type RegisteredClient = {
  id: string;
  personId: string;
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: string;
  roles: { name: string; displayName: string }[];
  existingPerson: boolean;
  passwordAssigned: boolean;
  credentialsSent: boolean;
};
