import jwt from 'jsonwebtoken';

// TODO: Helper functions for signing JWT tokens and verifying JWT tokens

export const signJwtToken = (payload: object, expiresIn: string = '24h'): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret || 'default-secret', { expiresIn: expiresIn as any } as any);
};

export const verifyJwtToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
};