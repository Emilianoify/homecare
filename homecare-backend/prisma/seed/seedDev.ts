import 'dotenv/config'
import { PrismaClient } from '../../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'
import { MODULES, ACTIONS } from '../../src/shared/constants/modules.js'

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! })
const prisma  = new PrismaClient({ adapter })

async function main(): Promise<void> {
  console.log('🌱 Seeding...')

  const company = await prisma.company.upsert({
    where:  { cuit: '30-12345678-9' },
    update: {},
    create: {
      legalName:    'HomeCare SA',
      cuit:         '30-12345678-9',
      vatCondition: 'REGISTERED_TAXPAYER',
      address:      'Av. Corrientes 1234',
      city:         'Buenos Aires',
      province:     'CABA',
    },
  })

  // Clean up old version 0 UUID records if present
  await prisma.refreshToken.deleteMany({ where: { user: { email: 'admin@homecare.com' } } })
  await prisma.auditLog.deleteMany({ where: { user: { email: 'admin@homecare.com' } } })
  await prisma.user.deleteMany({ where: { email: 'admin@homecare.com' } })
  await prisma.branch.deleteMany({ where: { id: 'aaaaaaaa-0000-0000-0000-000000000001' } })

  const branch = await prisma.branch.upsert({
    where:  { id: 'aaaaaaaa-0000-4000-a000-000000000001' },
    update: {},
    create: {
      id:        'aaaaaaaa-0000-4000-a000-000000000001',
      companyId: company.id,
      name:      'Casa Central',
      address:   'Av. Corrientes 1234',
      city:      'Buenos Aires',
    },
  })

  const pairs = Object.values(MODULES).flatMap(m =>
    Object.values(ACTIONS).map(a => ({ module: m, action: a }))
  )
  for (const { module, action } of pairs) {
    await prisma.permission.upsert({
      where:  { module_action: { module, action } },
      update: {},
      create: { module, action },
    })
  }

  const allPermissions = await prisma.permission.findMany()

  const adminRole = await prisma.role.upsert({
    where:  { companyId_name: { companyId: company.id, name: 'ADMIN' } },
    update: {},
    create: { companyId: company.id, name: 'ADMIN', description: 'Acceso total', isSystem: true },
  })

  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where:  { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id },
    })
  }

  const passwordHash = await argon2.hash('Admin123!', {
    type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4,
  })

  await prisma.user.upsert({
    where:  { email: 'admin@homecare.com' },
    update: {},
    create: {
      email:     'admin@homecare.com',
      passwordHash,
      firstName: 'Admin',
      lastName:  'HomeCare',
      roleId:    adminRole.id,
      companyId: company.id,
      branchId:  branch.id,
    },
  })

  console.log('✅ Seed completo — admin@homecare.com / Admin123!')
}

main()
  .catch((e: unknown) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
