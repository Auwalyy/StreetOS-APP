import { Request, Response } from 'express';
import * as passportService from '../services/passport.service';
import { sendSuccess } from '../utils/response';
import BusinessPassport from '../models/BusinessPassport';

export const getPassport = async (req: Request, res: Response) => {
  const passport = await passportService.getOrCreatePassport(String(req.user!._id));
  sendSuccess(res, passport, 'Business passport');
};

export const generatePDF = async (req: Request, res: Response) => {
  const passport = await passportService.generatePassport(String(req.user!._id));
  sendSuccess(res, passport, 'Passport generated');
};

export const sharePassport = async (req: Request, res: Response) => {
  const result = await passportService.generateShareableLink(String(req.user!._id));
  sendSuccess(res, result, 'Shareable link generated');
};

export const verifyPassport = async (req: Request, res: Response) => {
  const passport = await BusinessPassport.findOne({ passportId: req.params.passportId });
  if (!passport || !passport.isPublic) {
    res.status(404).json({ success: false, message: 'Passport not found or not public' });
    return;
  }
  await BusinessPassport.findByIdAndUpdate(passport._id, {
    $push: { accessLog: { accessedBy: req.ip, accessedAt: new Date(), purpose: 'public_verification' } },
  });
  sendSuccess(res, {
    passportId: passport.passportId,
    businessName: passport.businessName,
    verificationLevel: passport.verificationLevel,
    healthScore: passport.healthScore,
    creditScore: passport.creditScore,
  }, 'Passport verified');
};
