import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../services/auth.service';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = verifyToken(token);
    if (payload.type === 'refresh') {
      res.status(401).json({ error: 'Access token required, refresh token provided' });
      return;
    }
    req.user = payload;
    next();
  } catch (error) {
    logger.warn({ error }, 'JWT verification failed');
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
