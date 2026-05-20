import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'secret';

  if (!token) return res.sendStatus(401);

  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user as { userId: string };
    next();
  });
};
