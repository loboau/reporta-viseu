# Quick Setup Guide

Follow these steps to get the backend running:

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Configure Environment

The `.env` file has been created. You need to add your Anthropic API key:

1. Get an API key from: https://console.anthropic.com/
2. Open `.env` and replace `your_anthropic_api_key_here` with your actual key

```env
ANTHROPIC_API_KEY="sk-ant-..."
```

## 3. Start Database

```bash
docker-compose up -d
```

Wait a few seconds for PostgreSQL to start, then verify it's running:

```bash
docker-compose ps
```

## 4. Setup Database

Run the database setup (generates Prisma client, runs migrations, and seeds data):

```bash
npm run db:setup
```

Or run each step individually:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 5. Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3001

## 6. Test the API

Visit http://localhost:3001/api/health to verify the server is running.

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/categories` - List all categories
- `POST /api/reports` - Create a new report
- `GET /api/reports/:reference` - Get report by reference
- `POST /api/upload` - Upload a photo
- `POST /api/letter/generate` - Generate formal letter

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Check if PostgreSQL is running: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Restart the container: `docker-compose restart`

### Port Already in Use

If port 3001 is already in use, change the PORT in `.env`:

```env
PORT=3002
```

### Prisma Client Not Generated

If you get errors about Prisma client not found:

```bash
npm run prisma:generate
```

## Next Steps

Once the backend is running, you can:

1. Test endpoints with Postman or curl
2. View/edit data in Prisma Studio: `npm run prisma:studio`
3. Start building the frontend
