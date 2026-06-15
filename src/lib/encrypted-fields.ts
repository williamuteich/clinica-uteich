import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

const SECRET_KEY = Buffer.from(
    process.env.ENCRYPTION_KEY!,
    "hex"
);

export async function encrypt(data: string): Promise<string> {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        SECRET_KEY,
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(data, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

export async function decrypt(data: string): Promise<string> {
    const [ivHex, authTagHex, encryptedHex] =
        data.split(":");

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        SECRET_KEY,
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(
        Buffer.from(authTagHex, "hex")
    );

    const decrypted = Buffer.concat([
        decipher.update(
            Buffer.from(encryptedHex, "hex")
        ),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}

export async function encryptDeterministic(data: string): Promise<string> {
    const clean = data.replace(/\D/g, "");
    const iv = crypto.createHmac("sha256", SECRET_KEY).update(clean).digest().slice(0, 12);

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        SECRET_KEY,
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(clean, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

export function isEncrypted(data: string | null | undefined): boolean {
    if (!data) return false;
    const parts = data.split(":");
    if (parts.length !== 3) return false;
    const [iv, tag, cipher] = parts;
    const isValidIv = (iv.length === 24 || iv.length === 32) && /^[0-9a-fA-F]+$/.test(iv);
    const isValidTag = tag.length === 32 && /^[0-9a-fA-F]+$/.test(tag);
    return isValidIv && isValidTag;
}