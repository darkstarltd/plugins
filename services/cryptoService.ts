const enc = new TextEncoder();
const dec = new TextDecoder();

function base64ToBytes(base64: string) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

function bytesToBase64(bytes: Uint8Array) {
    const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
}

export function generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(16));
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function encrypt(data: object, key: CryptoKey): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const dataToEncrypt = enc.encode(JSON.stringify(data));
    
    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        dataToEncrypt
    );

    const encryptedContentArr = new Uint8Array(encryptedContent);
    const buffer = new Uint8Array(iv.byteLength + encryptedContentArr.byteLength);
    buffer.set(iv, 0);
    buffer.set(encryptedContentArr, iv.byteLength);

    return bytesToBase64(buffer);
}

export async function decrypt(encryptedData: string, key: CryptoKey): Promise<object> {
    const buffer = base64ToBytes(encryptedData);
    const iv = buffer.slice(0, 12);
    const data = buffer.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        data
    );

    return JSON.parse(dec.decode(decrypted));
}