import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

/**
 * JWT utilities for Cartmate authentication.
 * Handles token signing, verification, and cookie management.
 * Uses httpOnly cookies for security.
 */

// Token configuration from environment
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production",
);
const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";
const COOKIE_NAME = "cartmate_token";

/**
 * Converts expiry string to seconds.
 * Supports formats like "24h", "7d", "30m".
 * @param {string} expiry - Expiry string
 * @returns {number} Expiry in seconds
 */
function parseExpiry(expiry) {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 24 * 60 * 60; // Default 24 hours

  const [, value, unit] = match;
  const num = Number.parseInt(value, 10);

  const units = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return num * (units[unit] || units.h);
}

/**
 * Signs a JWT token with user payload.
 * @param {Object} payload - User data to encode (id, email, username)
 * @returns {Promise<string>} Signed JWT token
 */
export async function signToken(payload) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + parseExpiry(JWT_EXPIRY);

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies a JWT token and extracts the payload.
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object|null>} Decoded payload or null if invalid
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
}

/**
 * Sets JWT token in httpOnly cookie.
 * @param {string} token - JWT token
 */
export async function setTokenCookie(token) {
  const cookieStore = await cookies();
  const maxAge = parseExpiry(JWT_EXPIRY);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

/**
 * Gets JWT token from httpOnly cookie.
 * @returns {Promise<string|null>} JWT token or null
 */
export async function getTokenCookie() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Removes JWT token cookie (logout).
 */
export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Gets current user from JWT cookie.
 * @returns {Promise<Object|null>} User payload or null
 */
export async function getCurrentUser() {
  const token = await getTokenCookie();
  if (!token) return null;

  return await verifyToken(token);
}
