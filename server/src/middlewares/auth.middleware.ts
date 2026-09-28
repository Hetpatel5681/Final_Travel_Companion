import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      res.status(401).json({ success: false, message: 'Not authorized to access this route' });
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
      return;
    }
    
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};
