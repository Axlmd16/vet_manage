import type { Request } from 'express';

export type AuthenticatedUser = { id: string; personId: string };

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };
