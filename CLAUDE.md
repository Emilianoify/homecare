# CLAUDE.md — HomeCare Suite Backend

Lee este archivo completo antes de escribir cualquier línea de código.
Este archivo tiene prioridad sobre cualquier otra fuente.

---

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Runtime | Node.js | 22 LTS |
| Framework | Express | 5+ |
| Lenguaje | TypeScript | 6 (ESM strict) |
| ORM | Prisma | 7+ |
| Base de datos | PostgreSQL | 16 |
| Validación | Zod | 4+ |
| Auth | argon2 + JWT | httpOnly cookie |
| Package manager | pnpm | exclusivo |
| Seguridad | helmet, cors, express-rate-limit | — |
| Logging | morgan + winston | — |
| Testing | vitest + supertest | — |
| Deploy | PM2 + nginx | VPS |

---

## Reglas absolutas — nunca violar

```
❌ NO usar any ni unknown
❌ NO usar console.log — solo logger (winston)
❌ NO lógica de negocio en controllers — solo en use-cases
❌ NO queries Prisma fuera de infrastructure/database/repositories
❌ NO tocar req ni res fuera de la capa interfaces/http
❌ NO hardcodear mensajes — solo ERROR_MESSAGES y SUCCESS_MESSAGES
❌ NO Bearer token — solo cookies httpOnly
❌ NO commits — el desarrollador revisa y commitea
❌ NO instalar dependencias sin consultar
❌ NO archivos kebab-case — solo camelCase
❌ NO usar npm ni yarn — solo pnpm
```

---

## Arquitectura — Clean Architecture

Las dependencias apuntan siempre hacia adentro. Nunca hacia afuera.

```
Infrastructure → Application → Domain
     ↑                ↑
  HTTP layer      Use Cases
```

### Capas y responsabilidades

| Capa | Responsabilidad | Puede importar de |
|---|---|---|
| `domain/` | Tipos e interfaces puras del negocio | Nadie |
| `application/` | Casos de uso — orquesta el dominio | `domain/`, `shared/` |
| `infrastructure/` | Implementaciones concretas (Prisma, config) | `domain/`, `shared/` |
| `interfaces/http/` | Adaptador HTTP — controllers, routes, middlewares | `application/`, `shared/` |
| `shared/` | Helpers, errores, constantes | Nadie |

### Lo que nunca ocurre

- `domain/` no importa Prisma, Express ni ninguna librería externa
- `application/` no importa Prisma ni Express — nunca toca `req` o `res`
- `infrastructure/repositories/` no contiene lógica de negocio
- `interfaces/http/controllers/` no contiene lógica de negocio

---

## Estructura de carpetas

```
src/
│
├── domain/
│   ├── entities/                        tipos puros del negocio
│   │   ├── patientEntity.ts
│   │   ├── professionalEntity.ts
│   │   ├── internmentEntity.ts
│   │   └── userEntity.ts
│   └── repositories/                    interfaces (contratos)
│       ├── iPatientRepository.ts
│       ├── iProfessionalRepository.ts
│       ├── iInternmentRepository.ts
│       └── iUserRepository.ts
│
├── application/
│   └── useCases/
│       ├── auth/
│       │   ├── loginUseCase.ts
│       │   ├── registerUseCase.ts
│       │   ├── logoutUseCase.ts
│       │   └── refreshTokenUseCase.ts
│       ├── patient/
│       │   ├── createPatientUseCase.ts
│       │   ├── getPatientUseCase.ts
│       │   ├── listPatientsUseCase.ts
│       │   ├── updatePatientUseCase.ts
│       │   └── deletePatientUseCase.ts
│       └── internment/
│           ├── createInternmentUseCase.ts
│           ├── getInternmentUseCase.ts
│           └── dischargeInternmentUseCase.ts
│
├── infrastructure/
│   ├── database/
│   │   ├── prismaClient.ts
│   │   └── repositories/
│   │       ├── patientRepository.ts
│   │       ├── professionalRepository.ts
│   │       ├── internmentRepository.ts
│   │       └── userRepository.ts
│   └── config/
│       └── env.ts
│
├── interfaces/
│   └── http/
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── patientController.ts
│       │   └── internmentController.ts
│       ├── routes/
│       │   ├── index.ts
│       │   ├── authRoutes.ts
│       │   └── patientRoutes.ts
│       ├── middlewares/
│       │   ├── authMiddleware.ts
│       │   ├── rbacMiddleware.ts
│       │   ├── validateMiddleware.ts
│       │   └── auditMiddleware.ts
│       ├── schemas/
│       │   ├── authSchema.ts
│       │   └── patientSchema.ts
│       ├── dtos/
│       │   ├── authDto.ts
│       │   └── patientDto.ts
│       └── mappers/
│           ├── userMapper.ts
│           └── patientMapper.ts
│
├── shared/
│   ├── errors/
│   │   └── AppError.ts
│   ├── helpers/
│   │   ├── responseHelper.ts
│   │   └── logger.ts
│   └── constants/
│       ├── messages.ts
│       └── modules.ts
│
├── generated/
│   └── prisma/
│
└── main.ts
```

---

## Flujo de una request

```
Request HTTP
  → route
  → middleware(s): auth → rbac → validate
  → controller: extrae DTO, instancia use-case, llama execute(), send*()
  → use-case: lógica de negocio, usa interfaz del repositorio
  → repository (impl): query Prisma
  → PostgreSQL

Response
  ← controller: send*(res, MESSAGE, data)
  ← use-case: retorna DTO
  ← repository: retorna entity
```

---

## Naming conventions

```
Archivos:             camelCase          patientRepository.ts
                                         createPatientUseCase.ts
                                         authMiddleware.ts

Clases:               PascalCase         CreatePatientUseCase
                                         PatientRepository

Interfaces:           PascalCase + I     IPatientRepository

Variables/funciones:  camelCase          createPatient()
                                         getPatientById()

Constantes globales:  UPPER_SNAKE_CASE   ERROR_MESSAGES
                                         MAX_PAGE_SIZE

DTOs:                 PascalCase + Dto   CreatePatientDto
                                         PatientResponseDto

Tablas DB:            snake_case plural  patients, health_insurers
Campos DB:            camelCase          firstName, createdAt, deletedAt
```

Todo en inglés — tablas, campos, variables, tipos, archivos.
Mensajes de respuesta al cliente en español — centralizados en messages.ts.

---

## Mensajes centralizados — shared/constants/messages.ts

Ningún string de mensaje se escribe inline. Todo viene de estas constantes.

```typescript
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    UNAUTHORIZED:        'No autenticado',
    TOKEN_EXPIRED:       'Token inválido o expirado',
    EMAIL_EXISTS:        'El email ya está registrado',
    INVALID_REFRESH:     'Refresh token inválido',
  },
  PATIENT: {
    NOT_FOUND:  'Paciente no encontrado',
    DNI_EXISTS: 'El DNI ya está registrado',
  },
  PROFESSIONAL: {
    NOT_FOUND:   'Profesional no encontrado',
    CUIT_EXISTS: 'El CUIT ya está registrado',
  },
  INTERNMENT: {
    NOT_FOUND:      'Internación no encontrada',
    ALREADY_ACTIVE: 'El paciente ya tiene una internación activa',
  },
  HEALTH_INSURER: {
    NOT_FOUND:   'Obra social no encontrada',
    CUIT_EXISTS: 'El CUIT ya está registrado',
  },
  GENERAL: {
    VALIDATION_ERROR: 'Datos inválidos',
    FORBIDDEN:        'Acceso denegado',
    INTERNAL_ERROR:   'Error interno del servidor',
    NOT_FOUND:        'Recurso no encontrado',
  },
} as const

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN:    'Sesión iniciada correctamente',
    LOGOUT:   'Sesión cerrada correctamente',
    REFRESH:  'Token renovado correctamente',
    REGISTER: 'Usuario creado exitosamente',
    ME:       'Usuario autenticado',
  },
  PATIENT: {
    CREATED: 'Paciente creado exitosamente',
    FOUND:   'Paciente obtenido exitosamente',
    LIST:    'Pacientes obtenidos exitosamente',
    UPDATED: 'Paciente actualizado exitosamente',
    DELETED: 'Paciente eliminado exitosamente',
  },
  PROFESSIONAL: {
    CREATED: 'Profesional creado exitosamente',
    FOUND:   'Profesional obtenido exitosamente',
    LIST:    'Profesionales obtenidos exitosamente',
    UPDATED: 'Profesional actualizado exitosamente',
    DELETED: 'Profesional eliminado exitosamente',
  },
  INTERNMENT: {
    CREATED:    'Internación creada exitosamente',
    FOUND:      'Internación obtenida exitosamente',
    LIST:       'Internaciones obtenidas exitosamente',
    UPDATED:    'Internación actualizada exitosamente',
    DISCHARGED: 'Egreso registrado exitosamente',
  },
  HEALTH_INSURER: {
    CREATED: 'Obra social creada exitosamente',
    FOUND:   'Obra social obtenida exitosamente',
    LIST:    'Obras sociales obtenidas exitosamente',
    UPDATED: 'Obra social actualizada exitosamente',
    DELETED: 'Obra social eliminada exitosamente',
  },
} as const
```

---

## Response helpers — shared/helpers/responseHelper.ts

El código HTTP vive dentro del helper. El controller solo elige cuál usar.

```typescript
// 2xx
sendOk(res, SUCCESS_MESSAGES.PATIENT.FOUND, data)        // 200
sendCreated(res, SUCCESS_MESSAGES.PATIENT.CREATED, data)  // 201
sendNoContent(res)                                         // 204
sendPaginated(res, SUCCESS_MESSAGES.PATIENT.LIST, items, meta)

// 4xx / 5xx
sendBadRequest(res, ERROR_MESSAGES.GENERAL.VALIDATION_ERROR)   // 400
sendUnauthorized(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED)         // 401
sendForbidden(res, ERROR_MESSAGES.GENERAL.FORBIDDEN)            // 403
sendNotFound(res, ERROR_MESSAGES.PATIENT.NOT_FOUND)             // 404
sendConflict(res, ERROR_MESSAGES.PATIENT.DNI_EXISTS)            // 409
sendInternalError(res, ERROR_MESSAGES.GENERAL.INTERNAL_ERROR)   // 500
```

Implementación:

```typescript
import type { Response } from 'express'

interface Meta { page: number; limit: number; total: number; totalPages: number }

function respond(res: Response, status: number, success: boolean, message: string, data?: unknown): void {
  res.status(status).json({ success, message, ...(data !== undefined && { data }) })
}

export const sendOk           = (res: Response, message: string, data?: unknown) => respond(res, 200, true,  message, data)
export const sendCreated      = (res: Response, message: string, data?: unknown) => respond(res, 201, true,  message, data)
export const sendNoContent    = (res: Response)                                  => res.status(204).send()
export const sendBadRequest   = (res: Response, message: string)                 => respond(res, 400, false, message)
export const sendUnauthorized = (res: Response, message: string)                 => respond(res, 401, false, message)
export const sendForbidden    = (res: Response, message: string)                 => respond(res, 403, false, message)
export const sendNotFound     = (res: Response, message: string)                 => respond(res, 404, false, message)
export const sendConflict     = (res: Response, message: string)                 => respond(res, 409, false, message)
export const sendInternalError= (res: Response, message: string)                 => respond(res, 500, false, message)

export function sendPaginated<T>(res: Response, message: string, data: T[], meta: Meta): void {
  res.status(200).json({ success: true, message, data, meta })
}
```

---

## AppError — shared/errors/AppError.ts

Lo lanza el use-case. Lo captura el global error handler en main.ts.

```typescript
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public override readonly message: string
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

// En el use-case:
if (!patient) throw new AppError(404, ERROR_MESSAGES.PATIENT.NOT_FOUND)
if (existing) throw new AppError(409, ERROR_MESSAGES.PATIENT.DNI_EXISTS)

// Nunca en el controller ni en el repository
```

---

## Ejemplo completo — módulo Patient

### domain/repositories/iPatientRepository.ts
```typescript
import type { Patient } from '../entities/patientEntity.js'

export interface IPatientRepository {
  findById(id: string, companyId: string): Promise<Patient | null>
  findByDni(dni: string, companyId: string): Promise<Patient | null>
  create(data: Omit<Patient, 'id' | 'createdAt' | 'deletedAt'>): Promise<Patient>
  update(id: string, data: Partial<Patient>): Promise<Patient>
  softDelete(id: string): Promise<void>
}
```

### application/useCases/patient/createPatientUseCase.ts
```typescript
import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreatePatientDto } from '../../../interfaces/http/schemas/patientSchema.js'
import type { PatientResponseDto } from '../../../interfaces/http/dtos/patientDto.js'
import { PatientMapper } from '../../../interfaces/http/mappers/patientMapper.js'

export class CreatePatientUseCase {
  constructor(private readonly patientRepository: IPatientRepository) {}

  async execute(dto: CreatePatientDto, companyId: string): Promise<PatientResponseDto> {
    const existing = await this.patientRepository.findByDni(dto.dni, companyId)
    if (existing) throw new AppError(409, ERROR_MESSAGES.PATIENT.DNI_EXISTS)

    const patient = await this.patientRepository.create({ ...dto, companyId })
    return PatientMapper.toDto(patient)
  }
}
```

### infrastructure/database/repositories/patientRepository.ts
```typescript
import { prisma } from '../prismaClient.js'
import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import type { Patient } from '../../../domain/entities/patientEntity.js'

export class PatientRepository implements IPatientRepository {
  async findById(id: string, companyId: string): Promise<Patient | null> {
    return prisma.patient.findFirst({ where: { id, companyId, deletedAt: null } })
  }

  async findByDni(dni: string, companyId: string): Promise<Patient | null> {
    return prisma.patient.findFirst({ where: { dni, companyId, deletedAt: null } })
  }

  async create(data: Omit<Patient, 'id' | 'createdAt' | 'deletedAt'>): Promise<Patient> {
    return prisma.patient.create({ data })
  }

  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    return prisma.patient.update({ where: { id }, data })
  }

  async softDelete(id: string): Promise<void> {
    await prisma.patient.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
```

### interfaces/http/controllers/patientController.ts
```typescript
import type { Request, Response } from 'express'
import { CreatePatientUseCase } from '../../../application/useCases/patient/createPatientUseCase.js'
import { PatientRepository } from '../../../infrastructure/database/repositories/patientRepository.js'
import { sendCreated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreatePatientDto } from '../schemas/patientSchema.js'

export class PatientController {
  create = async (req: Request, res: Response): Promise<void> => {
    const dto    = req.body as CreatePatientDto
    const result = await new CreatePatientUseCase(new PatientRepository()).execute(dto, req.user!.companyId)
    sendCreated(res, SUCCESS_MESSAGES.PATIENT.CREATED, result)
  }
}
```

---

## Prisma v7 — reglas críticas

```typescript
// prisma.config.ts — raíz del proyecto
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed/seedDev.ts' },
  datasource: { url: env('DATABASE_URL') },
})
```

```prisma
// schema.prisma — sin url en datasource
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
datasource db { provider = "postgresql" }
```

```typescript
// prismaClient.ts — adapter obligatorio en v7
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! })
export const prisma = new PrismaClient({ adapter })
```

```bash
pnpm dlx prisma migrate dev --name <nombre>
pnpm dlx prisma generate    # no automático en v7
pnpm dlx prisma db seed     # no automático en v7
```

---

## Zod v4 — sintaxis correcta

```typescript
z.email()        // antes: z.string().email()
z.uuid()         // antes: z.string().uuid()
z.url()          // antes: z.string().url()
z.iso.date()     // antes: z.string().date()
z.iso.datetime() // antes: z.string().datetime()
result.error.issues  // antes: result.error.errors
```

---

## Seguridad

```typescript
// Access token — 15 minutos, httpOnly
res.cookie('access_token', token, {
  httpOnly: true,
  secure:   process.env['NODE_ENV'] === 'production',
  sameSite: 'strict',
  maxAge:   15 * 60 * 1000,
})

// Refresh token — 7 días, path restringido
res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure:   process.env['NODE_ENV'] === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
  path:     '/api/auth/refresh',
})
```

- argon2id: `memoryCost: 65536, timeCost: 3, parallelism: 4`
- RBAC verificado en middleware (`requirePermission`) — nunca dentro del use-case
- Auditoría en toda operación mutante (POST, PUT, PATCH, DELETE)
- `companyId` siempre de `req.user` — nunca del body

### Checklist de seguridad obligatorio — verificado en auditoría 2026-07

Reglas salidas de una auditoría real. Código nuevo que las viole reintroduce
una vulnerabilidad ya corregida. Se cumplen SIEMPRE:

**Aislamiento multi-tenant (lo más crítico de esta app)**
- `companyId` se deriva SIEMPRE de `req.user` (el token), jamás del body ni de
  la query. Todo repo de lectura/escritura filtra por `companyId`.
- **Cualquier foreign key que venga del body (roleId, branchId, etc.) se valida
  contra la company del caller antes de usarse.** No alcanza con derivar
  `companyId` del token: si el body trae un `roleId`, hay que confirmar que ese
  rol pertenece a esa company. Sin esto se asignan entidades de otra
  organización (cross-tenant + escalada de privilegios). Ver
  `roleBelongsToCompany` en `createUserUseCase`/`updateUserUseCase`.
- **No existen endpoints de auth que dupliquen el alta de usuarios por fuera de
  `requirePermission`.** El alta vive SOLO en `POST /api/users`. No recrear un
  `/register` que tome `companyId`/`roleId` del body sin control de permiso.

**Auth**
- Rate limiting cableado en tres niveles: global (`globalRateLimiter` en
  `main.ts`), login (5/15min) y refresh (30/15min). `express-rate-limit` estaba
  instalado pero sin usar — nunca dejarlo desconectado.
- `app.set('trust proxy', 1)` obligatorio: detrás de nginx, sin esto los rate
  limiters agrupan a todos por la IP del proxy y son evadibles con
  `X-Forwarded-For`.
- Login timing-safe: cuando el email no existe / usuario inactivo se verifica
  contra un hash dummy de argon2 (anti-enumeración). Ver `loginUseCase.ts`.
- Refresh tokens rotan en cada uso (ya lo hacía) y se persisten/revocan en DB.
  El `nonce` del token usa `randomUUID()`, nunca `Math.random()`.
- `res.clearCookie()` repite los atributos con los que se creó la cookie.
- `JWT_SECRET` con mínimo 32 caracteres, validado en `env.ts`.

**Validación Zod — regla dura**
- TODO campo `z.string()` lleva `.max()` explícito. String sin tope = hallazgo
  (DoS/bloat de DB). Vale también para los `search` de query (llegan a un
  `contains`/ILIKE) y para las contraseñas (`.max(128)`; argon2 sobre MB es DoS).
- TODO `z.array()` lleva `.max()`. Body JSON/urlencoded limitado a 1mb en `main.ts`.
- Toda query/param se valida con su schema — nunca leer `req.query` crudo.

**Seeds y dependencias**
- El seed exige `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` y aborta si faltan —
  ninguna credencial default hardcodeada. `.env` fuera de git.
- `pnpm audit --prod` antes de cada deploy; ningún CVE high/critical de runtime.

**Deploy**
- Cookies `sameSite: 'strict'`: frontend y API bajo el mismo dominio registrable
  en producción, o el login se rompe.

---

## Checklist por endpoint nuevo

- [ ] Interface en `domain/repositories/`
- [ ] Use-case en `application/useCases/<módulo>/`
- [ ] Implementación en `infrastructure/database/repositories/`
- [ ] Schema Zod en `interfaces/http/schemas/`
- [ ] DTO en `interfaces/http/dtos/`
- [ ] Mapper en `interfaces/http/mappers/`
- [ ] Controller en `interfaces/http/controllers/`
- [ ] Ruta en `interfaces/http/routes/`
- [ ] Soft delete filtrado en todas las queries de lectura
- [ ] Mensajes desde `ERROR_MESSAGES` / `SUCCESS_MESSAGES`

---

## Comandos

```bash
pnpm dev          # desarrollo con hot reload
pnpm build        # compilar TypeScript
pnpm test         # vitest run
pnpm test:watch   # vitest watch
pnpm lint         # eslint
pnpm db:migrate   # prisma migrate dev
pnpm db:generate  # prisma generate
pnpm db:seed      # prisma db seed
pnpm db:studio    # prisma studio
```

---

## Lo que NO existe en este proyecto

```
Redis · WebSockets · GraphQL · Docker · AFIP (Etapa 4+)
npm / yarn · kebab-case en archivos · Bearer tokens
mensajes hardcodeados · lógica en controllers · Prisma fuera de infrastructure
```