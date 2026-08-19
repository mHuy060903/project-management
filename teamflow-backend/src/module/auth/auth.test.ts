import request from 'supertest';
import app from '../../app.ts';
import prisma from '../../db/prisma.ts';

describe('Tenant isolation', () => {
  let tenantAToken: string;
  let tenantBProjectId: string;

  beforeAll(async () => {
    await request(app).post('/auth/register').send({
      tenantName: 'Tenant A',
      email: 'a@test.com',
      password: 'Passw0rd123',
    });
    const loginA = await request(app).post('/auth/login').send({
      tenantSlug: 'tenant-a',
      email: 'a@test.com',
      password: 'Passw0rd123',
    });
    tenantAToken = loginA.body.accessToken;

    const registerB = await request(app).post('/auth/register').send({
      tenantName: 'Tenant B',
      email: 'b@test.com',
      password: 'Passw0rd123',
    });
    const tenantB = await prisma.tenant.findUnique({ where: { slug: 'tenant-b' } });
    const project = await prisma.project.create({
      data: { name: 'Secret project', tenantId: tenantB!.id },
    });
    tenantBProjectId = project.id;
  });

  it('không cho phép tenant A truy cập project của tenant B bằng ID trực tiếp', async () => {
    const res = await request(app)
      .get(`/projects/${tenantBProjectId}`)
      .set('Authorization', `Bearer ${tenantAToken}`);

   
    expect(res.status).toBe(404);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});