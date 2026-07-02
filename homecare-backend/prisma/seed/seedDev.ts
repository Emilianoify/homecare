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

  // Health insurers de ejemplo
  const healthInsurers = [
    {
      name:           'Instituto Obra Médico Asistencial',
      acronym:        'IOMA',
      cuit:           '30-52843970-8',
      rnos:           '800001',
      insurerType:    'PROVINCIAL_INSURANCE' as const,
      billingEmail:   'prestaciones@ioma.gba.gov.ar',
      billingMode:    'PER_VISIT' as const,
      cutoffDay:      15,
      paymentDays:    30,
      requiresPaper:  false,
      operativeNotes: `IOMA - Normas operativas:
- Autorización previa obligatoria para toda internación domiciliaria
- Presentar formulario de solicitud de internación con firma del médico auditor
- Renovación de autorización cada 90 días con nueva evaluación médica
- Facturación: presentar entre los días 1 y 15 de cada mes para el período anterior
- Documentación requerida: evoluciones médicas, enfermería y kinesiólogía originales
- Auditoría in situ puede ocurrir sin previo aviso
- Contacto auditoría: auditoria@ioma.gba.gov.ar | Tel: 0800-222-4662
- No acepta fotocopias — toda documentación debe ser original con firma y sello`,
    },
    {
      name:           'Programa de Atención Médica Integral',
      acronym:        'PAMI',
      cuit:           '30-61898226-0',
      rnos:           '800011',
      insurerType:    'NATIONAL_INSURANCE' as const,
      billingEmail:   'prestaciones@pami.org.ar',
      billingMode:    'MIXED' as const,
      cutoffDay:      20,
      paymentDays:    45,
      requiresPaper:  true,
      operativeNotes: `PAMI - Normas operativas:
- Requiere resolución de autorización antes de iniciar la internación
- Módulo diario incluye: enfermería, kinesiología y médico (según plan)
- Presentar remitos firmados por familiar o responsable legal del afiliado
- Facturación en papel obligatoria — no acepta presentación digital
- Corte el día 20 de cada mes — presentar entre días 21 y 25
- Plazo de pago: 45 días hábiles desde la aprobación
- Auditor asignado rota mensualmente — consultar delegación zonal
- Afiliados deben tener credencial vigente al momento de la prestación
- Contacto local: delegacion.laplata@pami.org.ar`,
    },
    {
      name:           'Swiss Medical Group',
      acronym:        'SWISS',
      cuit:           '30-57411040-7',
      rnos:           '110500',
      insurerType:    'PREPAID' as const,
      billingEmail:   'internaciondomiciliaria@swissmedical.com.ar',
      billingMode:    'PER_VISIT' as const,
      cutoffDay:      10,
      paymentDays:    21,
      requiresPaper:  false,
      operativeNotes: `Swiss Medical - Normas operativas:
- Portal de autorizaciones: providers.swissmedical.com.ar
- Autorización online — respuesta en 48hs hábiles
- Facturación electrónica obligatoria a través del portal
- Cada visita debe registrarse en el sistema antes de las 24hs de realizada
- Geolocalización obligatoria para profesionales al momento de la visita
- Corte el día 10 de cada mes — pago a los 21 días hábiles
- Auditoría remota mensual — enviar evoluciones escaneadas vía portal
- Aumentos de arancel se notifican con 30 días de anticipación
- Contacto coordinación: 0810-888-7947 int. 3 (lunes a viernes 8-18hs)`,
    },
  ]

  for (const insurer of healthInsurers) {
    await prisma.healthInsurer.upsert({
      where:  { companyId_cuit: { companyId: company.id, cuit: insurer.cuit } },
      update: {},
      create: { ...insurer, companyId: company.id, active: true },
    })
  }
  console.log('✓ Health insurers creados: IOMA, PAMI, Swiss Medical')

  // Catálogo base de prestaciones (ServiceItems — globales, sin companyId)
  const serviceItems = [
    { specialty: 'NURSING' as const,       code: 'ENF-01', description: 'Visita de enfermería domiciliaria',      billingMode: 'PER_VISIT' as const,    basePrice: 2000 },
    { specialty: 'NURSING' as const,       code: 'ENF-02', description: 'Módulo diario de enfermería',            billingMode: 'DAILY_MODULE' as const, basePrice: 12000 },
    { specialty: 'PHYSIOTHERAPY' as const, code: 'KIN-01', description: 'Sesión de kinesiología domiciliaria',    billingMode: 'PER_VISIT' as const,    basePrice: 2400 },
    { specialty: 'MEDICINE' as const,      code: 'MED-01', description: 'Visita médica domiciliaria',             billingMode: 'PER_VISIT' as const,    basePrice: 3500 },
    { specialty: 'NUTRITION' as const,     code: 'NUT-01', description: 'Consulta nutricional domiciliaria',      billingMode: 'PER_VISIT' as const,    basePrice: 2500 },
    { specialty: 'PSYCHOLOGY' as const,    code: 'PSI-01', description: 'Sesión de psicología domiciliaria',      billingMode: 'PER_VISIT' as const,    basePrice: 2800 },
    { specialty: 'SOCIAL_WORK' as const,   code: 'TS-01',  description: 'Visita de trabajo social',               billingMode: 'PER_VISIT' as const,    basePrice: 2200 },
    { specialty: 'CAREGIVER' as const,     code: 'CUI-01', description: 'Módulo diario de cuidador domiciliario', billingMode: 'DAILY_MODULE' as const, basePrice: 9000 },
  ]

  for (const item of serviceItems) {
    await prisma.serviceItem.upsert({
      where:  { code: item.code },
      update: {},
      create: { ...item, active: true },
    })
  }
  console.log(`✓ ${serviceItems.length} prestaciones del catálogo base creadas`)

  console.log('✅ Seed completo — admin@homecare.com / Admin123!')
}

main()
  .catch((e: unknown) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
