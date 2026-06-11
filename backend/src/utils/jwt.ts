import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

interface TokenPayload {
  sub: string;
  role: string;
  jti: string;
}

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ sub: userId, role, jti: uuidv4() }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ sub: userId, jti: uuidv4() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): { sub: string; jti: string } => {
  return jwt.verify(token, config.jwt.refreshSecret) as { sub: string; jti: string };
};
