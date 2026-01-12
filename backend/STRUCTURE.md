# Backend Structure Overview

Complete backend implementation for Reporta Viseu - Citizen Reporting Application.

## File Tree

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema with Category, Report, Photo models
│   └── seed.ts                # Seeds 10 categories (buraco, luz, lixo, etc.)
│
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client instance with connection handling
│   │   └── env.ts             # Environment validation and configuration
│   │
│   ├── routes/
│   │   ├── categories.ts      # GET /api/categories, GET /api/categories/:id
│   │   ├── health.ts          # GET /api/health
│   │   ├── index.ts           # Route registry
│   │   ├── letter.ts          # POST /api/letter/generate, GET /api/letter/:ref
│   │   ├── reports.ts         # POST /api/reports, GET /api/reports/:ref
│   │   └── upload.ts          # POST /api/upload, POST /api/upload/multiple, DELETE
│   │
│   ├── schemas/
│   │   └── report.schema.ts   # Zod validation schemas for reports
│   │
│   ├── services/
│   │   ├── LetterService.ts   # Claude AI integration for letter generation
│   │   └── ReportService.ts   # Business logic for report CRUD operations
│   │
│   ├── utils/
│   │   ├── generateReference.ts  # VIS-YEAR-RANDOM6 reference generator
│   │   └── logger.ts          # Structured JSON logging utility
│   │
│   ├── app.ts                 # Fastify app configuration with CORS & middleware
│   └── index.ts               # Server entry point with graceful shutdown
│
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── API.md                     # Complete API documentation
├── docker-compose.yml         # PostgreSQL 15 container setup
├── Makefile                   # Convenience commands
├── package.json               # Dependencies and scripts
├── README.md                  # Project documentation
├── SETUP.md                   # Quick setup guide
├── test-api.sh                # API testing script
└── tsconfig.json              # TypeScript configuration
```

## Key Features

### Database (PostgreSQL + Prisma)
- **Category Model**: 10 seeded categories with department info
- **Report Model**: Full report with location, photos, status tracking
- **Photo Model**: File metadata with optional report linking
- **Enums**: Urgency (BAIXA, MEDIA, ALTA), ReportStatus (PENDENTE, PROCESSADO, ENVIADO, RESOLVIDO)

### API Endpoints (Fastify)
- Health check with database connectivity test
- Category listing and retrieval
- Report creation, retrieval, and listing
- AI-powered letter generation (Claude)
- Photo upload (single and multiple)
- Static file serving from /uploads

### Services
- **ReportService**: CRUD operations with transaction safety
- **LetterService**: Claude AI integration for formal Portuguese letters

### Validation & Security
- Zod schema validation on all inputs
- File type and size validation (10MB limit)
- CORS configuration (development + production whitelist)
- Structured error responses
- Request/response logging

### Developer Tools
- TypeScript with strict mode
- Hot reload with tsx watch
- Prisma Studio for database GUI
- Docker Compose for local PostgreSQL
- Make commands for common tasks
- Test script for API verification

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| Framework | Fastify 4 |
| Database | PostgreSQL 15 |
| ORM | Prisma 5 |
| AI | Anthropic Claude 3.5 Sonnet |
| Language | TypeScript 5 |
| Validation | Zod 3 |
| File Upload | @fastify/multipart |

## Database Schema

### Category
```typescript
{
  id: UUID
  slug: String (unique)
  icon: String (Lucide icon name)
  label: String
  sublabel: String
  departamento: String
  email: String
  telefone: String?
  permiteAnonimo: Boolean
  ativo: Boolean
  ordem: Int
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Report
```typescript
{
  id: UUID
  reference: String (unique) // VIS-YEAR-XXXXXX
  latitude: Float
  longitude: Float
  address: String
  freguesia: String?
  categoryId: UUID -> Category
  description: Text
  urgency: Enum (BAIXA, MEDIA, ALTA)
  isAnonymous: Boolean
  name: String?
  email: String?
  phone: String?
  letter: Text?
  status: Enum (PENDENTE, PROCESSADO, ENVIADO, RESOLVIDO)
  emailSentAt: DateTime?
  emailSentTo: String?
  photos: Photo[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Photo
```typescript
{
  id: UUID
  reportId: UUID? -> Report
  filename: String
  originalName: String
  mimeType: String
  size: Int
  url: String
  createdAt: DateTime
}
```

## API Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // Optional validation details
}
```

## Environment Variables

```env
DATABASE_URL          # PostgreSQL connection string
ANTHROPIC_API_KEY     # Claude AI API key
PORT                  # Server port (default: 3001)
NODE_ENV              # development | production
UPLOAD_DIR            # Directory for uploaded files
BASE_URL              # Public API URL
```

## NPM Scripts

```bash
npm run dev           # Start development server with hot reload
npm run build         # Build TypeScript to dist/
npm start             # Start production server
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:seed        # Seed database with categories
npm run prisma:studio      # Open Prisma Studio GUI
npm run db:setup           # Complete setup (generate + migrate + seed)
```

## Make Commands

```bash
make setup            # Complete setup (install + db + migrate + seed)
make dev              # Start development server
make db-start         # Start PostgreSQL container
make db-stop          # Stop PostgreSQL container
make db-reset         # Reset database completely
make test             # Run API tests
make clean            # Clean everything
```

## Quick Start

1. Install dependencies: `npm install`
2. Add Anthropic API key to `.env`
3. Start database: `make db-start` or `docker-compose up -d`
4. Setup database: `npm run db:setup`
5. Start server: `npm run dev`
6. Test API: `./test-api.sh`

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL` for production database
- [ ] Set secure `ANTHROPIC_API_KEY`
- [ ] Update CORS whitelist in `src/app.ts`
- [ ] Configure `BASE_URL` for public API
- [ ] Set up persistent volume for `/uploads`
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging and monitoring
- [ ] Set up automated backups
- [ ] Configure rate limiting
- [ ] Add API authentication (if needed)

## API Documentation

See `API.md` for complete endpoint documentation with examples.

## Testing

Run the test script to verify all endpoints:
```bash
./test-api.sh
```

## License

MIT
