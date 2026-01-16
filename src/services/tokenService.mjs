import crypto from "crypto";

export function createTokenService({ secret }) {
  if (!secret) {
    throw new Error("Token service requires a non-empty secret");
  }

  const MAX_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 day (tune as you like)

  function issueGuestToken(timeToLiveInSeconds) {
    const ttlSeconds = Number.parseInt(String(timeToLiveInSeconds), 10);
    if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error("timeToLiveInSeconds must be a positive integer.");
    }
    if (ttlSeconds > MAX_TTL_SECONDS) {
      throw new Error(`timeToLiveInSeconds must be <= ${MAX_TTL_SECONDS}.`);
    }

    const id = crypto.randomUUID();
    const expiresAtMs = Date.now() + ttlSeconds * 1000;

    const payload = `${id}.${expiresAtMs}`;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    return `${payload}.${signature}`;
  }

  function verifyGuestToken(token) {
    if (!token || typeof token !== "string") return { ok: false, reason: "missing_token" };

    const parts = token.split(".");
    if (parts.length !== 3) return { ok: false, reason: "bad_format" };

    const [id, expiresAtRaw, signature] = parts;
    const expiresAtMs = Number.parseInt(expiresAtRaw, 10);

    if (!id || !Number.isFinite(expiresAtMs) || !signature) {
      return { ok: false, reason: "bad_format" };
    }

    if (Date.now() > expiresAtMs) return { ok: false, reason: "expired" };

    const payload = `${id}.${expiresAtMs}`;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const expectedBuf = Buffer.from(expectedSig);
    const givenBuf = Buffer.from(signature);

    const sigOk =
      expectedBuf.length === givenBuf.length &&
      crypto.timingSafeEqual(expectedBuf, givenBuf);

    if (!sigOk) return { ok: false, reason: "bad_signature" };

    return { ok: true, id };
  }

  return { issueGuestToken, verifyGuestToken };
}
