import { NextFunction, Request, Response } from 'express';

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
