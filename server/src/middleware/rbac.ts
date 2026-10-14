import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRole = (roles: Array<'customer' | 'seller' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires one of [${roles.join(', ')}] permissions. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};

export const authorize = (...roles: Array<'customer' | 'seller' | 'admin'>) => requireRole(roles);
