import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import Joi from 'joi';
import nodemailer from 'nodemailer';

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
}).unknown(true);

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Digital Dignity Safety" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Your Secure OTP - Digital Dignity",
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #1E293B;">Verify Your Identity</h2>
                <p>Hello,</p>
                <p>You requested a secure verification code to access the Digital Dignity platform. Please use the following OTP:</p>
                <div style="background: #F1F5F9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0F172A;">${otp}</span>
                </div>
                <p style="color: #64748B; font-size: 12px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 10px; color: #94A3B8;">Private • Secure • End-to-End Encrypted</p>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};

export const register = async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({ error: 'User already exists' });
            }
            // Update OTP and Password for existing unverified user
            const salt = await bcrypt.genSalt(10);
            const newPasswordHash = await bcrypt.hash(password, salt);
            await prisma.user.update({
                where: { email },
                data: {
                    otp,
                    otpExpires,
                    passwordHash: newPasswordHash
                }
            });
            console.log(`[OTP DEBUG] RESENT OTP and UPDATED PASSWORD for ${email} is ${otp}`);

            try {
                await sendOtpEmail(email, otp);
            } catch (mailError) {
                console.error("Email Sending Failed:", mailError);
            }

            return res.status(200).json({ message: "Account exists but not verified. New OTP sent to your email." });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                otp,
                otpExpires,
                isVerified: false
            },
        });

        console.log(`[OTP DEBUG] OTP for ${email} is ${otp}`);

        try {
            await sendOtpEmail(email, otp);
        } catch (mailError) {
            console.error("Email Sending Failed:", mailError);
        }

        res.status(201).json({ message: "OTP sent to email. Please verify to complete registration." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        await prisma.user.update({
            where: { email },
            data: { isVerified: true, otp: null, otpExpires: null }
        });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Verification failed" });
    }
};

export const login = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email first. Try registering again to get a new OTP.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Token required" });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture } = ticket.getPayload();

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create new user.
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);

            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash: dummyPassword,
                }
            });
        }

        const jwtToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, picture } });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(401).json({ error: "Invalid Google Token" });
    }
};
