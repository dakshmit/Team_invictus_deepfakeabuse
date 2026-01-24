import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import Joi from 'joi';
import nodemailer from 'nodemailer';

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email", // Placeholder: In production use Real SMTP
    port: 587,
    auth: {
        user: 'placeholder@ethereal.email',
        pass: 'placeholder_pass',
    },
});

export const register = async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // OTP Generation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

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

        // In a real app, send email. For hackathon, we log it and send via Mock.
        console.log(`[OTP DEBUG] OTP for ${email} is ${otp}`);

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
