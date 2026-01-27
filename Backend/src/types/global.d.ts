declare interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

declare namespace Express {
  interface Request {
    user?: AuthUser;
  }
}
