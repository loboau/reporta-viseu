# Reporta Viseu - Backend API

Backend API for Reporta Viseu, a citizen reporting application for the Municipality of Viseu, Portugal.

## Features

- RESTful API built with Fastify
- PostgreSQL database with Prisma ORM
- File upload support with multipart/form-data
- AI-powered letter generation using Claude (Anthropic)
- TypeScript for type safety
- Docker support for local development
- Input validation with Zod
- Structured logging

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 4
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5
- **AI**: Anthropic Claude API
- **Language**: TypeScript
- **Validation**: Zod

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local database)
- Anthropic API key

## Getting Started

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reporta_viseu?schema=public"
ANTHROPIC_API_KEY="your_anthropic_api_key_here"
PORT=3001
NODE_ENV=development
```

### 3. Start Database

```bash
docker-compose up -d
```

This will start a PostgreSQL 15 database on `localhost:5432`.

### 4. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with categories
npm run prisma:seed
```

Or run all setup steps at once:

```bash
npm run db:setup
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`.

## API Endpoints

### Health Check

- `GET /api/health` - Check API and database health

### Categories

- `GET /api/categories` - List all active categories
- `GET /api/categories/:identifier` - Get category by ID or slug

### Reports

- `POST /api/reports` - Create a new report
- `GET /api/reports/:reference` - Get report by reference
- `GET /api/reports` - List all reports (with filters)

### Letter Generation

- `POST /api/letter/generate` - Generate formal letter for a report
- `GET /api/letter/:reference` - Get generated letter by report reference

### File Upload

- `POST /api/upload` - Upload a single photo
- `POST /api/upload/multiple` - Upload multiple photos
- `DELETE /api/upload/:photoId` - Delete a photo

## API Examples

### Create a Report

```bash
curl -X POST http://localhost:3001/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.6571,
    "longitude": -7.9139,
    "address": "Rua Formosa, Viseu",
    "freguesia": "Viseu",
    "categoryId": "uuid-of-category",
    "description": "Existe um buraco grande na via pública que necessita de reparação urgente.",
    "urgency": "ALTA",
    "isAnonymous": false,
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "912345678"
  }'
```

### Upload a Photo

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/photo.jpg"
```

### Generate a Letter

```bash
curl -X POST http://localhost:3001/api/letter/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "uuid-of-report"
  }'
```

## Database Schema

### Category
- Stores report categories (e.g., potholes, lighting, garbage)
- Each category has a department, email, and contact info

### Report
- Main entity for citizen reports
- Contains location, description, urgency, and status
- Links to category and photos
- Supports anonymous and identified reporting

### Photo
- Stores uploaded photo metadata
- Links to parent report
- Files stored in `/uploads` directory

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with initial data
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run db:setup` - Complete database setup (generate + migrate + seed)

### Database Management

View and edit data using Prisma Studio:

```bash
npm run prisma:studio
```

Create a new migration:

```bash
npx prisma migrate dev --name description_of_changes
```

## Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Ensure all required environment variables are set:

- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Anthropic API key
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Set to `production`
- `BASE_URL` - Public URL of the API
- `UPLOAD_DIR` - Directory for uploaded files

### Start

```bash
npm start
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start dist/index.js --name reporta-viseu-api
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed data
├── src/
│   ├── config/
│   │   ├── database.ts    # Prisma client instance
│   │   └── env.ts         # Environment configuration
│   ├── routes/
│   │   ├── categories.ts  # Category routes
│   │   ├── health.ts      # Health check
│   │   ├── index.ts       # Route registry
│   │   ├── letter.ts      # Letter generation
│   │   ├── reports.ts     # Report routes
│   │   └── upload.ts      # File upload
│   ├── schemas/
│   │   └── report.schema.ts # Zod validation schemas
│   ├── services/
│   │   ├── LetterService.ts # AI letter generation
│   │   └── ReportService.ts # Report business logic
│   ├── utils/
│   │   ├── generateReference.ts # Reference generator
│   │   └── logger.ts      # Logging utility
│   ├── app.ts             # Fastify app configuration
│   └── index.ts           # Server entry point
├── uploads/               # Uploaded files (gitignored)
├── .env                   # Environment variables (gitignored)
├── .env.example           # Environment template
├── docker-compose.yml     # PostgreSQL container
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation details
}
```

## Logging

All requests and errors are logged in JSON format for easy parsing and monitoring.

## License

MIT

## Support

For issues or questions, please contact the development team.
