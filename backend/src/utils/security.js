import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-default-32-char-secret-key-!!'; // Must be 32 chars
const IV_LENGTH = 16;

/**
 * Encrypts a buffer using AES-256-CBC
 */
export const encryptBuffer = (buffer) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    // Ensure the key is exactly 32 bytes by hashing the secret string
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        data: encrypted.toString('hex')
    };
};

/**
 * Generates a SHA-256 hash of a buffer or string
 */
export const generateHash = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Securely hashes metadata keys to prevent leaking user specifics in logs/db
 */
export const hashMetadata = (metadata) => {
    const stringified = JSON.stringify(metadata);
    return generateHash(stringified);
};
