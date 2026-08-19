import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Role } from '@/generated/prisma/client.ts';
import prisma from '@/db/prisma.ts';
import { env } from '@/config/env.ts';
import { AppError } from '@/middleware/error.middleware.ts';
import { RegisterInput, LoginInput } from './auth.validation.ts';

interface TokenPayload {
  sub: string;
  tenantId: string;
  role: Role;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function issueTokens(userId: string, tenantId: string, role: Role): Promise<AuthTokens> {
  const payload: TokenPayload = { sub: userId, tenantId, role };

  const accessToken = jwt.sign(payload, env.jwtAccessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: '7d' });

  const tokenHash = await bcrypt.hash(refreshToken, 10);
  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const baseSlug = slugify(input.tenantName);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: input.tenantName, slug },
    });

    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: Role.OWNER,
        tenantId: tenant.id,
      },
    });

    return { tenant, user };
  });

  const tokens = await issueTokens(result.user.id, result.tenant.id, result.user.role);
  return { tenant: { slug: result.tenant.slug, name: result.tenant.name }, ...tokens };
}

export async function login(input: LoginInput) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: input.tenantSlug } });
  if (!tenant) throw new AppError('Sai thông tin đăng nhập', 401);

  const user = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: input.email } },
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError('Sai thông tin đăng nhập', 401);
  }

  return issueTokens(user.id, user.tenantId, user.role);
}

export async function refresh(refreshToken: string) {
  let payload: TokenPayload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as TokenPayload;
  } catch {
    throw new AppError('Refresh token không hợp lệ', 401);
  }

  const storedTokens = await prisma.refreshToken.findMany({
    where: { userId: payload.sub, revoked: false, expiresAt: { gt: new Date() } },
  });

  let matchedTokenId: string | null = null;
  for (const t of storedTokens) {
    if (await bcrypt.compare(refreshToken, t.tokenHash)) {
      matchedTokenId = t.id;
      break;
    }
  }

  if (!matchedTokenId) throw new AppError('Refresh token không hợp lệ', 401);

  await prisma.refreshToken.update({
    where: { id: matchedTokenId },
    data: { revoked: true },
  });

  return issueTokens(payload.sub, payload.tenantId, payload.role);
}

export async function logout(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}