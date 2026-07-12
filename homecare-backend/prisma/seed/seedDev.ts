import 'dotenv/config'
import { PrismaClient } from '../../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'
import { MODULES, ACTIONS } from '../../src/shared/constants/modules.js'

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! })
const prisma  = new PrismaClient({ adapter })

async function main(): Promise<void> {
  console.log('🌱 Seeding...')

  const adminEmail = process.env['SEED_ADMIN_EMAIL']
  const adminPassword = process.env['SEED_ADMIN_PASSWORD']

  if (!adminEmail || !adminPassword) {
    throw new Error('❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required to seed.')
  }

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
  await prisma.refreshToken.deleteMany({ where: { user: { email: adminEmail } } })
  await prisma.auditLog.deleteMany({ where: { user: { email: adminEmail } } })
  await prisma.user.deleteMany({ where: { email: adminEmail } })
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

  const passwordHash = await argon2.hash(adminPassword, {
    type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4,
  })

  await prisma.user.upsert({
    where:  { email: adminEmail },
    update: {},
    create: {
      email:     adminEmail,
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

  // Tarifas de IOMA para las prestaciones del catálogo
  const ioma = await prisma.healthInsurer.findFirst({
    where: { companyId: company.id, acronym: 'IOMA' },
  })

  if (ioma) {
    const enf01 = await prisma.serviceItem.findFirst({ where: { code: 'ENF-01' } })
    const kin01 = await prisma.serviceItem.findFirst({ where: { code: 'KIN-01' } })
    const med01 = await prisma.serviceItem.findFirst({ where: { code: 'MED-01' } })

    const iomaTarifas = [
      { serviceItemId: enf01?.id, agreedPrice: 1800, validFrom: new Date('2025-01-01') },
      { serviceItemId: kin01?.id, agreedPrice: 2100, validFrom: new Date('2025-01-01') },
      { serviceItemId: med01?.id, agreedPrice: 3200, validFrom: new Date('2025-01-01') },
    ]

    for (const tarifa of iomaTarifas) {
      if (!tarifa.serviceItemId) continue
      await prisma.insurerServiceRate.upsert({
        where: {
          healthInsurerId_serviceItemId_validFrom: {
            healthInsurerId: ioma.id,
            serviceItemId:   tarifa.serviceItemId,
            validFrom:       tarifa.validFrom,
          },
        },
        update: {},
        create: {
          healthInsurerId: ioma.id,
          serviceItemId:   tarifa.serviceItemId,
          agreedPrice:     tarifa.agreedPrice,
          validFrom:       tarifa.validFrom,
          validTo:         null,
          active:          true,
        },
      })
    }
    console.log('✓ Tarifas IOMA creadas: ENF-01, KIN-01, MED-01')
  }
  // AlertConfigs base para la company del seed
  const alertConfigs = [
    {
      triggerType:   'NO_VISIT' as const,
      thresholdDays: 3,
      active:        true,
      notifyRoles:   ['COORDINATOR', 'ADMIN'],
    },
    {
      triggerType:   'AUTHORIZATION_EXPIRING' as const,
      thresholdDays: 7,
      active:        true,
      notifyRoles:   ['COORDINATOR', 'ADMIN'],
    },
    {
      triggerType:   'NO_CLINICAL_NOTE' as const,
      thresholdDays: 5,
      active:        true,
      notifyRoles:   ['COORDINATOR'],
    },
    {
      triggerType:   'CRITICAL_INCIDENT_UNRESOLVED' as const,
      thresholdDays: 1,
      active:        true,
      notifyRoles:   ['COORDINATOR', 'ADMIN'],
    },
  ]

  for (const config of alertConfigs) {
    const existing = await prisma.alertConfig.findFirst({
      where: { companyId: company.id, triggerType: config.triggerType, deletedAt: null }
    })
    if (!existing) {
      await prisma.alertConfig.create({
        data: { ...config, companyId: company.id }
      })
    }
  }
  console.log(`✓ ${alertConfigs.length} configuraciones de alerta creadas`)

  // Equipos de ejemplo — asignados a Casa Central
  const equipos = [
    {
      provider:     'MedEquip Argentina S.A.',
      name:         'Concentrador de oxígeno 5L',
      model:        'DeVilbiss 525',
      serialNumber: 'DEV-2024-001',
      dailyRate:    850,
      status:       'AVAILABLE' as const,
    },
    {
      provider:     'MedEquip Argentina S.A.',
      name:         'Concentrador de oxígeno 10L',
      model:        'Invacare Platinum 10',
      serialNumber: 'INV-2024-003',
      dailyRate:    1200,
      status:       'AVAILABLE' as const,
    },
    {
      provider:     'Equimed S.R.L.',
      name:         'Cama ortopédica eléctrica',
      model:        'Hill-Rom P500',
      serialNumber: 'HR-2023-047',
      dailyRate:    1500,
      status:       'AVAILABLE' as const,
    },
    {
      provider:     'Equimed S.R.L.',
      name:         'Aspirador de secreciones',
      model:        'Medela Dominant 50',
      serialNumber: 'MED-2024-012',
      dailyRate:    600,
      status:       'AVAILABLE' as const,
    },
  ]

  for (const equipo of equipos) {
    await prisma.equipment.upsert({
      where:  { serialNumber: equipo.serialNumber },
      update: {},
      create: { ...equipo, companyId: company.id, branchId: branch.id, notes: null },
    })
  }
  console.log(`✓ ${equipos.length} equipos de ejemplo creados`)

  // Catálogo base de insumos de la company — extraídos del presupuesto real de Sanity Care
  const supplies = [
    { code: null,  name: 'Agua destilada 10ml',                       unit: 'unidad', purchasePrice: 500 },
    { code: null,  name: 'Alargue para oxígeno 6mts',                 unit: 'unidad', purchasePrice: 6000 },
    { code: null,  name: 'Alcohol al 70% 1lt',                        unit: 'litro',  purchasePrice: 2800 },
    { code: '9',   name: 'Alcohol en gel 250cc',                      unit: 'unidad', purchasePrice: 1700 },
    { code: null,  name: 'Apósito estéril',                           unit: 'unidad', purchasePrice: 380 },
    { code: '20',  name: 'Barbijo recto',                             unit: 'unidad', purchasePrice: 45 },
    { code: null,  name: 'Cánula aurinco Nº6 c/b y a/subglótica',    unit: 'unidad', purchasePrice: 80000 },
    { code: '185', name: 'Cinta hipoalergénica 2,5cm',                unit: 'unidad', purchasePrice: 450 },
    { code: null,  name: 'Clorhexidina 1lt al 4%',                   unit: 'litro',  purchasePrice: 18000 },
    { code: '52',  name: 'Detergente enzimático 1lt',                 unit: 'litro',  purchasePrice: 20000 },
    { code: null,  name: 'Filtro TQT Tracheolife II Covidien',        unit: 'unidad', purchasePrice: 4500 },
    { code: '61',  name: 'Frasco alimentación 500cc',                 unit: 'unidad', purchasePrice: 1900 },
    { code: '65',  name: 'Gasa 10x10cm no tejida',                   unit: 'unidad', purchasePrice: 240 },
    { code: null,  name: 'Gasa fenestrada 5x5cm',                    unit: 'unidad', purchasePrice: 850 },
    { code: '76',  name: 'Guantes de examinación',                    unit: 'unidad', purchasePrice: 50 },
    { code: null,  name: 'Guantes estériles x par',                   unit: 'par',    purchasePrice: 430 },
    { code: null,  name: 'Guía de alimentación',                      unit: 'unidad', purchasePrice: 8500 },
    { code: '88',  name: 'Jeringa 10ml',                              unit: 'unidad', purchasePrice: 110 },
    { code: '90',  name: 'Jeringa 20ml',                              unit: 'unidad', purchasePrice: 190 },
    { code: null,  name: 'Jeringa 60ml pico fino',                    unit: 'unidad', purchasePrice: 430 },
    { code: '95',  name: 'Jeringa 60ml pico Toomey',                  unit: 'unidad', purchasePrice: 450 },
    { code: null,  name: 'Sensor oxímetro neo/adulto descartable',    unit: 'unidad', purchasePrice: 18000 },
    { code: '205', name: 'Solución fisiológica 10ml',                 unit: 'unidad', purchasePrice: 680 },
    { code: '165', name: 'Sonda aspiración K30P Koler',               unit: 'unidad', purchasePrice: 1100 },
    { code: '193', name: 'Tubuladura T63 x metro',                    unit: 'metro',  purchasePrice: 3600 },
    { code: '201', name: 'Zalea',                                     unit: 'unidad', purchasePrice: 600 },
  ]

  for (const supply of supplies) {
    await prisma.supply.upsert({
      where: {
        companyId_name: {
          companyId: company.id,
          name:      supply.name,
        },
      },
      update: {},
      create: { ...supply, companyId: company.id, active: true },
    })
  }
  console.log(`✓ ${supplies.length} insumos creados para la company`)

  // Stock inicial para Casa Central — insumos más comunes
  const stockBranch = await prisma.branch.findFirst({
    where: { companyId: company.id, deletedAt: null },
  })

  const gasas = await prisma.supply.findFirst({
    where: { companyId: company.id, name: { contains: 'Gasa 10x10' } },
  })

  const guantes = await prisma.supply.findFirst({
    where: { companyId: company.id, name: { contains: 'Guantes de examinación' } },
  })

  const jeringas = await prisma.supply.findFirst({
    where: { companyId: company.id, name: { contains: 'Jeringa 10ml' } },
  })

  if (stockBranch && gasas) {
    await prisma.branchStock.upsert({
      where:  { branchId_supplyId: { branchId: stockBranch.id, supplyId: gasas.id } },
      update: {},
      create: { companyId: company.id, branchId: stockBranch.id, supplyId: gasas.id, currentStock: 500 },
    })
  }

  if (stockBranch && guantes) {
    await prisma.branchStock.upsert({
      where:  { branchId_supplyId: { branchId: stockBranch.id, supplyId: guantes.id } },
      update: {},
      create: { companyId: company.id, branchId: stockBranch.id, supplyId: guantes.id, currentStock: 200 },
    })
  }

  if (stockBranch && jeringas) {
    await prisma.branchStock.upsert({
      where:  { branchId_supplyId: { branchId: stockBranch.id, supplyId: jeringas.id } },
      update: {},
      create: { companyId: company.id, branchId: stockBranch.id, supplyId: jeringas.id, currentStock: 150 },
    })
  }

  console.log('✓ Stock inicial creado para Casa Central')

  console.log(`✅ Seed completo — ${adminEmail} / ${adminPassword}`)
}

main()
  .catch((e: unknown) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
