"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassport = exports.sharePassport = exports.generatePDF = exports.getPassport = void 0;
const passportService = __importStar(require("../services/passport.service"));
const response_1 = require("../utils/response");
const BusinessPassport_1 = __importDefault(require("../models/BusinessPassport"));
const getPassport = async (req, res) => {
    const passport = await passportService.getOrCreatePassport(String(req.user._id));
    (0, response_1.sendSuccess)(res, passport, 'Business passport');
};
exports.getPassport = getPassport;
const generatePDF = async (req, res) => {
    const passport = await passportService.generatePassport(String(req.user._id));
    (0, response_1.sendSuccess)(res, passport, 'Passport generated');
};
exports.generatePDF = generatePDF;
const sharePassport = async (req, res) => {
    const result = await passportService.generateShareableLink(String(req.user._id));
    (0, response_1.sendSuccess)(res, result, 'Shareable link generated');
};
exports.sharePassport = sharePassport;
const verifyPassport = async (req, res) => {
    const passport = await BusinessPassport_1.default.findOne({ passportId: req.params.passportId });
    if (!passport || !passport.isPublic) {
        res.status(404).json({ success: false, message: 'Passport not found or not public' });
        return;
    }
    await BusinessPassport_1.default.findByIdAndUpdate(passport._id, {
        $push: { accessLog: { accessedBy: req.ip, accessedAt: new Date(), purpose: 'public_verification' } },
    });
    (0, response_1.sendSuccess)(res, {
        passportId: passport.passportId,
        businessName: passport.businessName,
        verificationLevel: passport.verificationLevel,
        healthScore: passport.healthScore,
        creditScore: passport.creditScore,
    }, 'Passport verified');
};
exports.verifyPassport = verifyPassport;
//# sourceMappingURL=passport.controller.js.map