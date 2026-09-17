/**
 * Anti-proxy Dynamic QR Security Engine
 * Generates rolling cryptographic-style tokens tied to session ID and millisecond timestamp.
 */

export interface QRPayload {
  sessionId: string;
  classId: string;
  token: string;
  generatedAt: number;
  expiresAt: number;
}

/**
 * Generate a dynamic token for a session that rotates every 30 seconds.
 */
export function generateDynamicSessionToken(sessionId: string): {
  token: string;
  generatedAt: number;
  expiresAt: number;
} {
  const now = Date.now();
  const validityMs = 30 * 1000; // 30 seconds
  const expiresAt = now + validityMs;

  // Simple pseudo-random hash generator for browser environment
  const salt = Math.random().toString(36).substring(2, 8);
  const raw = `${sessionId}_${now}_${salt}`;
  
  // Create a clean readable hex-like token
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const token = `AP-${Math.abs(hash).toString(16).toUpperCase()}-${salt.toUpperCase()}`;

  return {
    token,
    generatedAt: now,
    expiresAt,
  };
}

/**
 * Serialize QR payload into a secure string
 */
export function encodeQRPayload(payload: QRPayload): string {
  return JSON.stringify(payload);
}

/**
 * Decode and validate raw QR scan content
 */
export function decodeQRPayload(raw: string): QRPayload | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.sessionId && parsed.token && parsed.expiresAt) {
      return parsed as QRPayload;
    }
    return null;
  } catch {
    // Might be raw token string
    return null;
  }
}
