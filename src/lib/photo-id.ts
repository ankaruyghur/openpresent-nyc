import crypto from 'crypto'
import { buffer } from 'stream/consumers';


const ALGORITHM = 'aes-128-ctr';

function getKey(): Buffer {

    const SECRET_KEY = process.env.PHOTO_ENCODE_KEY!;
    return crypto.createHash('md5').update(SECRET_KEY).digest();
}

export function encodePhotoId(brand: string, session: string, timestamp: string): string {
    try {
        // Combine brand, session, and datetime to single string
        const data = `${brand}|${session}|${timestamp}`;
        
        // Create cipher with random IV 
        const iv = crypto.randomBytes(16); // 16 bytes for AES
        const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

        // Encrypt the data
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Combine IV + encrypted data
        const combined = iv.toString('hex') + encrypted;

        // URL safe with base64 encoding
        return Buffer.from(combined, 'hex').toString('base64url');
    } catch (error) {
        throw new Error('Failed to encode photo ID')
    }
}

export function decodePhotoId(encryptedId: string): { brand: string; session: string; timestampDir: string; filename: string} {
    try {
        // Extract IV and encrypted data
        const encryptedHex = Buffer.from(encryptedId, 'base64url').toString('hex');
        const iv = Buffer.from(encryptedHex.slice(0,32), 'hex');
        const encrypted = encryptedHex.slice(32);

        // Create decipher 
        const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

        // Decrypt
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Split into fields
        const [brand, session, timestamp] = decrypted.split('|');
        const filename = timestamp;
        const timestampDir = `${timestamp.slice(0,4)}-${timestamp.slice(4,6)}-${timestamp.slice(6,8)}`;



        return { brand, session, timestampDir, filename};

    } catch (error) {
        throw new Error('Failed to decode photo ID - invalid or corrupted data');
    }
}