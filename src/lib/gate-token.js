// this verifies gate token 
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.GATE_SECRET || "");
const ALG = "HS256";

export async function signGateToken() {
  return await new SignJWT({ scope: "prototype-gate" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("48h")
    .sign(secret);
}

export async function verifyGateToken(token) {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}