import { NextFunction, Request, Response } from 'express';
import { getFirebaseAuth } from '../config/firebase';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token missing' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const firebaseAuth = getFirebaseAuth();
    const decoded = await firebaseAuth.verifyIdToken(token);

    req.user = {
      id: decoded.uid,
      name: decoded.name ?? decoded.email ?? 'Anonymous',
      email: decoded.email ?? 'unknown@example.com',
      avatar: decoded.picture ?? null,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
