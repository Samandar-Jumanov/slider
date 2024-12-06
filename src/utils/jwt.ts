import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


const SECRET_KEY: string = process.env.JWT_SECRET_KEY!

interface JWTPayload {
  userId: string;
  phoneNumber : string;
  role : string 
}

const generateToken = (payload: JWTPayload, expiresIn: string = '1h'): string => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as JWTPayload;
  } catch (error) {
    return null;
  }
};

const extractTokenFromHeader = (req: Request): string | null => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractTokenFromHeader(req);
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = decoded;
  next();
};

export {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  authenticateToken,
  JWTPayload
};