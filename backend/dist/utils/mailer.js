"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const USE_SMTP = !!(SMTP_USER && SMTP_PASS);
const transporter = USE_SMTP
    ? nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
    : null;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.SMTP_FROM || 'Notion Clone <noreply@example.com>';
const sendVerificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === 'test' || !USE_SMTP)
        return;
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
    const mailOptions = {
        from: FROM_EMAIL,
        to: email,
        subject: 'Verify your email for Notion Clone',
        html: `
      <h1>Email Verification</h1>
      <p>Thank you for signing up! Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === 'test' || !USE_SMTP)
        return;
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
        from: FROM_EMAIL,
        to: email,
        subject: 'Reset your password for Notion Clone',
        html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
