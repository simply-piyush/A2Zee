import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'a2zee-cooperative-super-secret-jwt-token-key-2026'
);

export const COOKIE_NAME = 'a2zee_auth_token';

/**
 * Creates and signs a JWT token with 7-day expiration.
 * Compatible with Edge and Node.js runtimes.
 */
export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token. Returns decoded payload or null.
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts session from NextRequest cookies or Authorization header.
 */
export async function getAuthSession(req) {
  let token = null;

  // 1. Check req.cookies.get() if available
  if (req?.cookies && typeof req.cookies.get === 'function') {
    token = req.cookies.get(COOKIE_NAME)?.value;
  }

  // 2. Check raw 'cookie' header string
  if (!token && req?.headers) {
    const rawCookie = req.headers.get('cookie') || '';
    const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // 3. Fallback to Bearer header
  if (!token && req?.headers) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}

/**
 * Predefined demo accounts for instant evaluator testing
 */
export const DEMO_USERS = [
  {
    phone: '+919899011223',
    password: 'password123',
    name: 'Priya Soni',
    role: 'CUSTOMER',
    district: 'North 24 Parganas (Madhyamgram)',
    label: 'Customer Demo',
  },
  {
    phone: '+919876543210',
    password: 'password123',
    name: 'Ramesh Kumar',
    role: 'WORKER',
    trade: 'Electrician',
    society: 'Pragati Labour Cooperative Society',
    label: 'Artisan Demo',
  },
  {
    phone: '+913322891100',
    password: 'password123',
    name: 'West Bengal State Federation Admin',
    role: 'FEDERATION_ADMIN',
    district: 'State Apex',
    label: 'Federation Admin Demo',
  },
];
