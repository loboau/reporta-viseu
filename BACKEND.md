# Reporta Viseu - Backend

### Uma aplicação **Say What?** 🇵🇹
*Feita por portugueses, para portugueses*

---

## 📋 Resumo

Este documento especifica o **backend** da aplicação Reporta Viseu - API e serviços para gerir reportes de cidadãos à Câmara Municipal.

**Stack:** Node.js + Fastify + PostgreSQL + Prisma

---

## 🛠️ Stack Tecnológico

```
Runtime:        Node.js 20 LTS
Framework:      Fastify
Linguagem:      TypeScript
Base de Dados:  PostgreSQL 15
ORM:            Prisma
Validação:      Zod
Email:          Nodemailer + SMTP
Storage:        S3 / Cloudflare R2 (para fotos)
IA:             Anthropic Claude API
Deploy:         Docker + Railway / Render / VPS
```

---

## 📁 Estrutura de Pastas

```
reporta-viseu-api/
├── src/
│   ├── index.ts                  # Entry point
│   ├── app.ts                    # Configuração do servidor
│   │
│   ├── config/
│   │   ├── env.ts                # Variáveis de ambiente
│   │   └── database.ts           # Configuração PostgreSQL
│   │
│   ├── routes/
│   │   ├── index.ts              # Router principal
│   │   ├── reports.ts            # Rotas de reportes
│   │   ├── categories.ts         # Rotas de categorias
│   │   ├── letter.ts             # Rota de geração de carta
│   │   └── upload.ts             # Rotas de upload de fotos
│   │
│   ├── services/
│   │   ├── ReportService.ts      # Lógica de reportes
│   │   ├── LetterService.ts      # Geração de cartas com IA
│   │   ├── EmailService.ts       # Envio de emails
│   │   └── StorageService.ts     # Upload de ficheiros
│   │
│   ├── schemas/
│   │   ├── report.schema.ts      # Validação Zod
│   │   └── letter.schema.ts
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   │
│   └── utils/
│       ├── generateReference.ts
│       └── logger.ts
│
├── prisma/
│   ├── schema.prisma             # Schema da base de dados
│   └── seed.ts                   # Seed de categorias
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🗄️ Schema da Base de Dados (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// CATEGORIAS
// ============================================

model Category {
  id            String   @id @default(cuid())
  slug          String   @unique
  icon          String
  label         String
  sublabel      String?
  departamento  String
  email         String
  telefone      String?
  permiteAnonimo Boolean @default(false)
  ativo         Boolean  @default(true)
  ordem         Int      @default(0)
  
  reports       Report[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("categories")
}

// ============================================
// REPORTES
// ============================================

model Report {
  id            String       @id @default(cuid())
  reference     String       @unique // VIS-2026-ABC123
  
  // Localização
  latitude      Float
  longitude     Float
  address       String?
  freguesia     String?
  
  // Conteúdo
  categoryId    String
  category      Category     @relation(fields: [categoryId], references: [id])
  description   String       @db.Text
  urgency       Urgency      @default(BAIXA)
  
  // Identificação
  isAnonymous   Boolean      @default(false)
  name          String?
  email         String?
  phone         String?
  
  // Carta gerada
  letter        String?      @db.Text
  
  // Estado
  status        ReportStatus @default(PENDENTE)
  
  // Fotos
  photos        Photo[]
  
  // Email enviado?
  emailSentAt   DateTime?
  emailSentTo   String?
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  @@index([reference])
  @@index([status])
  @@map("reports")
}

enum Urgency {
  BAIXA
  MEDIA
  ALTA
}

enum ReportStatus {
  PENDENTE
  PROCESSADO
  ENVIADO
  RESOLVIDO
}

// ============================================
// FOTOS
// ============================================

model Photo {
  id            String   @id @default(cuid())
  reportId      String?
  report        Report?  @relation(fields: [reportId], references: [id], onDelete: Cascade)
  
  filename      String
  originalName  String
  mimeType      String
  size          Int
  url           String
  
  createdAt     DateTime @default(now())
  
  @@map("photos")
}
```

---

## 🛣️ API Routes

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/categories` | Listar categorias |
| POST | `/api/reports` | Criar reporte |
| GET | `/api/reports/:reference` | Ver reporte |
| POST | `/api/letter/generate` | Gerar carta |
| POST | `/api/letter/send` | Enviar email |
| POST | `/api/upload` | Upload de foto |

---

## 📝 Schemas de Validação (Zod)

```typescript
// schemas/report.schema.ts

import { z } from 'zod';

export const CreateReportSchema = z.object({
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    freguesia: z.string().optional(),
  }),
  categoryId: z.string(),
  description: z.string().min(10).max(500),
  urgency: z.enum(['BAIXA', 'MEDIA', 'ALTA']).default('BAIXA'),
  isAnonymous: z.boolean().default(false),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  photoIds: z.array(z.string()).max(5).optional(),
}).refine(
  (data) => data.isAnonymous || (data.name && data.email),
  { message: 'Nome e email obrigatórios para reportes identificados' }
);

export type CreateReportInput = z.infer<typeof CreateReportSchema>;
```

---

## ⚙️ Services Principais

### ReportService

```typescript
// services/ReportService.ts

import { prisma } from '../config/database';
import { generateReference } from '../utils/generateReference';

export class ReportService {
  
  async create(data: CreateReportInput) {
    const reference = generateReference();
    
    return prisma.report.create({
      data: {
        reference,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        address: data.location.address,
        freguesia: data.location.freguesia,
        categoryId: data.categoryId,
        description: data.description,
        urgency: data.urgency,
        isAnonymous: data.isAnonymous,
        name: data.isAnonymous ? null : data.name,
        email: data.isAnonymous ? null : data.email,
        phone: data.isAnonymous ? null : data.phone,
        photos: data.photoIds ? {
          connect: data.photoIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        category: true,
        photos: true,
      },
    });
  }
  
  async findByReference(reference: string) {
    return prisma.report.findUnique({
      where: { reference },
      include: { category: true, photos: true },
    });
  }
}
```

### LetterService (Geração com IA)

```typescript
// services/LetterService.ts

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/database';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class LetterService {
  
  async generate(reportId: string): Promise<string> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { category: true, photos: true },
    });
    
    if (!report) throw new Error('Reporte não encontrado');
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: this.buildPrompt(report),
      }],
    });
    
    const letter = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');
    
    // Guardar carta
    await prisma.report.update({
      where: { id: reportId },
      data: { letter, status: 'PROCESSADO' },
    });
    
    return letter;
  }
  
  private buildPrompt(report: any): string {
    return `
Gera uma carta formal para a Câmara Municipal de Viseu.

DADOS:
- Referência: ${report.reference}
- Categoria: ${report.category.label}
- Departamento: ${report.category.departamento}
- Local: ${report.address || 'Não especificado'}, ${report.freguesia || ''}
- Descrição: "${report.description}"
- Urgência: ${report.urgency}
- Fotos: ${report.photos.length > 0 ? 'Sim' : 'Não'}
- Tipo: ${report.isAnonymous ? 'Anónimo' : report.name}

REGRAS:
1. Português de Portugal (PT-PT)
2. Máximo 200 palavras
3. Tom formal mas simples
4. Incluir referência ${report.reference}
${report.isAnonymous ? '5. Denúncia anónima' : '5. Incluir espaço para assinatura'}

Responde SÓ com a carta.
`;
  }
}
```

### EmailService

```typescript
// services/EmailService.ts

import nodemailer from 'nodemailer';
import { prisma } from '../config/database';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  
  async sendReportEmail(reportId: string) {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { category: true, photos: true },
    });
    
    if (!report?.letter) throw new Error('Carta não gerada');
    
    const attachments = report.photos.map(photo => ({
      filename: photo.originalName,
      path: photo.url,
    }));
    
    await transporter.sendMail({
      from: `"Reporta Viseu" <${process.env.SMTP_FROM}>`,
      to: report.category.email,
      subject: `Reporte #${report.reference} - ${report.category.label}`,
      text: report.letter,
      attachments,
    });
    
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'ENVIADO',
        emailSentAt: new Date(),
        emailSentTo: report.category.email,
      },
    });
    
    return { sentTo: report.category.email };
  }
}
```

---

## 📚 Utilitários

```typescript
// utils/generateReference.ts

export function generateReference(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VIS-${year}-${random}`;
}
```

---

## 🔐 Variáveis de Ambiente

```bash
# .env.example

NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/reporta_viseu"

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@saywhat.pt
SMTP_PASS=xxx
SMTP_FROM=noreply@saywhat.pt

# Storage (S3/R2)
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_BUCKET=reporta-viseu
CDN_URL=https://cdn.reportaviseu.pt
```

---

## 🐳 Docker

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/reporta_viseu
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: reporta_viseu
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🌱 Seed de Categorias

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categories = [
  { slug: 'buraco', icon: '🕳️', label: 'Buraco / Estrada', departamento: 'Divisão de Obras Municipais', email: 'obras@cm-viseu.pt', ordem: 1 },
  { slug: 'luz', icon: '💡', label: 'Iluminação', departamento: 'Serviço de Iluminação', email: 'iluminacao@cm-viseu.pt', ordem: 2 },
  { slug: 'lixo', icon: '🗑️', label: 'Lixo / Limpeza', departamento: 'Divisão de Ambiente', email: 'ambiente@cm-viseu.pt', ordem: 3 },
  { slug: 'arvore', icon: '🌳', label: 'Árvores / Jardins', departamento: 'Espaços Verdes', email: 'espacosverdes@cm-viseu.pt', ordem: 4 },
  { slug: 'agua', icon: '💧', label: 'Água / Esgotos', departamento: 'Águas de Viseu', email: 'geral@aguasdeviseu.pt', telefone: '232 480 180', ordem: 5 },
  { slug: 'carro', icon: '🚗', label: 'Estacionamento', departamento: 'Polícia Municipal', email: 'policiamunicipal@cm-viseu.pt', permiteAnonimo: true, ordem: 6 },
  { slug: 'sinal', icon: '🚸', label: 'Sinalização', departamento: 'Divisão de Trânsito', email: 'transito@cm-viseu.pt', ordem: 7 },
  { slug: 'animal', icon: '🐕', label: 'Animais', departamento: 'Centro de Recolha', email: 'croa@cm-viseu.pt', ordem: 8 },
  { slug: 'edificio', icon: '🏚️', label: 'Edifícios', departamento: 'Divisão de Urbanismo', email: 'urbanismo@cm-viseu.pt', ordem: 9 },
  { slug: 'outro', icon: '📝', label: 'Outro', departamento: 'Câmara Municipal', email: 'geral@cm-viseu.pt', ordem: 10 },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log('✅ Categorias criadas!');
}

main().finally(() => prisma.$disconnect());
```

---

## 🚀 Scripts NPM

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## 🚀 Comandos de Setup

```bash
# Criar projeto
mkdir reporta-viseu-api && cd reporta-viseu-api
npm init -y

# Instalar dependências
npm install fastify @fastify/cors @fastify/multipart
npm install @prisma/client zod nodemailer sharp uuid
npm install @aws-sdk/client-s3 @anthropic-ai/sdk dotenv

npm install -D typescript tsx @types/node prisma

# Setup
npx tsc --init
npx prisma init
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

---

## 🚀 Comando para Claude Code

```
Cria o backend da app "Reporta Viseu" seguindo BACKEND.md.

1. Projeto Node.js + TypeScript + Fastify
2. Prisma com PostgreSQL
3. Rotas de reportes e categorias
4. Geração de cartas com Claude API
5. Envio de emails com Nodemailer
6. Upload de fotos
7. Docker compose
8. Seed de categorias
```

---

## 📜 Créditos

```
┌─────────────────────────────────────────────────────────────┐
│                      Say What? 🇵🇹                          │
│                                                             │
│              Tecnologia feita por portugueses               │
│                  para servir portugueses                    │
│                                                             │
│                      saywhat.pt                             │
└─────────────────────────────────────────────────────────────┘
```

---

*Backend Reporta Viseu - Say What? 🇵🇹*
