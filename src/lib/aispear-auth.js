// AISpear — JWT imzala/doğrula (jose; edge-safe: middleware'de de çalışır).
// Bu dosya next/headers İÇERMEZ (edge runtime'da güvenli kalsın).
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'aispear_session';

const secret = new TextEncoder().encode(
  process.env.AISPEAR_SECRET || 'dev-secret-degistir-beni'
);

export async function signSession(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
