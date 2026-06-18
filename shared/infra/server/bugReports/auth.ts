import { createHmac, timingSafeEqual } from 'node:crypto';

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function verifyBearerToken(
  authorizationHeader: string | null,
  expectedToken: string | undefined,
): boolean {
  if (!expectedToken || !authorizationHeader) {
    return false;
  }

  return safeCompare(authorizationHeader, `Bearer ${expectedToken}`);
}

export function verifyTallySignature({
  payload,
  signature,
  secret,
}: {
  payload: unknown;
  signature: string | null;
  secret: string | undefined;
}): boolean {
  if (!secret || !signature) {
    return false;
  }

  const calculatedSignature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('base64');

  return safeCompare(signature, calculatedSignature);
}
