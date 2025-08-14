
import * as cryptoService from '../services/cryptoService';

/**
 * Hashes a password with a new salt.
 * @returns A string in the format "salt:hash".
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = cryptoService.generateSalt();
    // We use PBKDF2 to derive a key, then hash the key itself for verification.
    // This is a common pattern to create a verifiable hash from a password.
    const keyMaterial = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
    const bits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, keyMaterial, 256);
    const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${saltHex}:${hash}`;
}

/**
 * Verifies a password against a salted hash.
 * @param password The password to verify.
 * @param saltAndHash The "salt:hash" string from storage.
 */
export async function verifyPassword(password: string, saltAndHash: string): Promise<boolean> {
    try {
        const [saltHex, originalHash] = saltAndHash.split(':');
        if (!saltHex || !originalHash) return false;
        
        const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const keyMaterial = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
        const bits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, keyMaterial, 256);
        const hashToVerify = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashToVerify === originalHash;
    } catch (e) {
        console.error("Verification failed", e);
        return false;
    }
}

export function generateUserCode(): string {
  const parts = Array.from({ length: 4 }, () => 
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
  return parts.join('-');
}