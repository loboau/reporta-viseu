# Reporta Viseu API Documentation

Base URL: `http://localhost:3001`

## Authentication

Currently, the API does not require authentication. All endpoints are public.

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // Optional validation errors
}
```

---

## Endpoints

### Health Check

Check API and database health status.

**GET** `/api/health`

**Response** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-08T12:00:00.000Z",
  "service": "reporta-viseu-backend",
  "database": "connected"
}
```

---

### Categories

#### List All Categories

Get all active categories ordered by display order.

**GET** `/api/categories`

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "buraco",
      "icon": "Construction",
      "label": "Buraco na via pública",
      "sublabel": "Estrada, passeio ou calçada danificada",
      "departamento": "Departamento de Obras e Infraestruturas",
      "email": "obras@cm-viseu.pt",
      "telefone": "232 427 400",
      "permiteAnonimo": true,
      "ativo": true,
      "ordem": 1,
      "createdAt": "2024-01-08T12:00:00.000Z",
      "updatedAt": "2024-01-08T12:00:00.000Z"
    }
  ]
}
```

#### Get Single Category

Get a category by ID or slug.

**GET** `/api/categories/:identifier`

**Parameters**
- `identifier` (path) - Category ID (UUID) or slug (string)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "buraco",
    "label": "Buraco na via pública",
    ...
  }
}
```

**Response** `404 Not Found`
```json
{
  "success": false,
  "error": "Categoria não encontrada"
}
```

---

### Reports

#### Create Report

Create a new citizen report.

**POST** `/api/reports`

**Request Body**
```json
{
  "latitude": 40.6571,
  "longitude": -7.9139,
  "address": "Rua Formosa, Viseu",
  "freguesia": "Viseu",
  "categoryId": "uuid",
  "description": "Descrição detalhada do problema (mínimo 10 caracteres)",
  "urgency": "MEDIA",
  "isAnonymous": false,
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "912345678",
  "photoIds": ["photo-uuid-1", "photo-uuid-2"]
}
```

**Field Details**
- `latitude` (required) - Latitude between -90 and 90
- `longitude` (required) - Longitude between -180 and 180
- `address` (required) - Street address
- `freguesia` (optional) - Parish/neighborhood
- `categoryId` (required) - UUID of the category
- `description` (required) - 10-2000 characters
- `urgency` (optional) - One of: `BAIXA`, `MEDIA` (default), `ALTA`
- `isAnonymous` (optional) - Boolean, default `false`
- `name` (required if not anonymous) - Citizen's name
- `email` (required if not anonymous) - Valid email
- `phone` (optional) - Phone number (9+ digits)
- `photoIds` (optional) - Array of photo UUIDs from upload endpoint

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reference": "VIS-2024-A3F8K9",
    "latitude": 40.6571,
    "longitude": -7.9139,
    "address": "Rua Formosa, Viseu",
    "freguesia": "Viseu",
    "categoryId": "uuid",
    "description": "Descrição do problema",
    "urgency": "MEDIA",
    "isAnonymous": false,
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "912345678",
    "status": "PENDENTE",
    "letter": null,
    "emailSentAt": null,
    "emailSentTo": null,
    "createdAt": "2024-01-08T12:00:00.000Z",
    "updatedAt": "2024-01-08T12:00:00.000Z",
    "category": { ... },
    "photos": [ ... ]
  },
  "message": "Relatório criado com sucesso"
}
```

**Response** `400 Bad Request` (Validation Error)
```json
{
  "success": false,
  "error": "Dados inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

#### Get Report by Reference

Retrieve a report using its unique reference.

**GET** `/api/reports/:reference`

**Parameters**
- `reference` (path) - Report reference (e.g., VIS-2024-A3F8K9)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reference": "VIS-2024-A3F8K9",
    "category": { ... },
    "photos": [ ... ],
    ...
  }
}
```

**Response** `404 Not Found`
```json
{
  "success": false,
  "error": "Relatório não encontrado"
}
```

#### List Reports

List all reports with optional filters.

**GET** `/api/reports`

**Query Parameters**
- `categoryId` (optional) - Filter by category UUID
- `status` (optional) - Filter by status: `PENDENTE`, `PROCESSADO`, `ENVIADO`, `RESOLVIDO`
- `limit` (optional) - Number of results (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response** `200 OK`
```json
{
  "success": true,
  "data": [ ... ],
  "count": 10
}
```

---

### Letter Generation

#### Generate Letter

Generate a formal letter in Portuguese (PT-PT) for a report using AI.

**POST** `/api/letter/generate`

**Request Body**
```json
{
  "reportId": "uuid"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "reference": "VIS-2024-A3F8K9",
    "letter": "Exmo. Senhor Presidente da Câmara...\n\n[Generated letter content]"
  },
  "message": "Carta gerada com sucesso"
}
```

**Response** `404 Not Found`
```json
{
  "success": false,
  "error": "Relatório não encontrado"
}
```

#### Get Letter by Reference

Retrieve the generated letter for a report.

**GET** `/api/letter/:reference`

**Parameters**
- `reference` (path) - Report reference

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "reference": "VIS-2024-A3F8K9",
    "letter": "[Letter content]",
    "generatedAt": "2024-01-08T12:00:00.000Z"
  }
}
```

**Response** `404 Not Found` (Letter not generated)
```json
{
  "success": false,
  "error": "Carta ainda não foi gerada para este relatório"
}
```

---

### File Upload

#### Upload Single Photo

Upload a single photo for a report. Photos are uploaded before creating the report, then linked using `photoIds`.

**POST** `/api/upload`

**Content-Type**: `multipart/form-data`

**Form Fields**
- `file` (required) - Image file

**Supported Formats**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- HEIC/HEIF (.heic, .heif)

**Size Limit**: 10MB per file

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "unique-filename.jpg",
    "originalName": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 1234567,
    "url": "/uploads/unique-filename.jpg"
  },
  "message": "Ficheiro carregado com sucesso"
}
```

**Response** `400 Bad Request` (Invalid file type)
```json
{
  "success": false,
  "error": "Tipo de ficheiro não permitido. Use JPEG, PNG, WebP ou HEIC."
}
```

**Response** `400 Bad Request` (File too large)
```json
{
  "success": false,
  "error": "Ficheiro demasiado grande. Tamanho máximo: 10MB"
}
```

#### Upload Multiple Photos

Upload multiple photos at once (max 5 files).

**POST** `/api/upload/multiple`

**Content-Type**: `multipart/form-data`

**Form Fields**
- `file` (multiple) - Image files

**Response** `201 Created`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "filename": "unique-filename-1.jpg",
      ...
    },
    {
      "id": "uuid-2",
      "filename": "unique-filename-2.jpg",
      ...
    }
  ],
  "errors": [],
  "message": "2 ficheiro(s) carregado(s) com sucesso"
}
```

#### Delete Photo

Delete an uploaded photo.

**DELETE** `/api/upload/:photoId`

**Parameters**
- `photoId` (path) - Photo UUID

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Foto eliminada com sucesso"
}
```

**Response** `404 Not Found`
```json
{
  "success": false,
  "error": "Foto não encontrada"
}
```

---

## Data Models

### Report Statuses

- `PENDENTE` - New report, not yet processed
- `PROCESSADO` - Report processed, letter generated
- `ENVIADO` - Email sent to department
- `RESOLVIDO` - Issue resolved

### Urgency Levels

- `BAIXA` - Low priority
- `MEDIA` - Medium priority (default)
- `ALTA` - High priority

### Reference Format

Reports are assigned a unique reference in the format: `VIS-YEAR-XXXXXX`

Example: `VIS-2024-A3F8K9`

- `VIS` - Viseu prefix
- `YEAR` - 4-digit year
- `XXXXXX` - 6 random alphanumeric characters

---

## Error Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable (e.g., database down)

---

## Rate Limiting

Currently, there is no rate limiting implemented. This should be added for production use.

---

## CORS

CORS is enabled for all origins in development mode. In production, only whitelisted domains are allowed:
- `https://reporta-viseu.pt`
- `https://www.reporta-viseu.pt`

---

## Examples

### Complete Report Submission Flow

1. **Upload photos**
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@photo1.jpg"
```

Save the `id` from the response.

2. **Create report with photos**
```bash
curl -X POST http://localhost:3001/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.6571,
    "longitude": -7.9139,
    "address": "Praça da República, Viseu",
    "categoryId": "uuid-from-categories",
    "description": "Buraco grande na via pública",
    "urgency": "ALTA",
    "isAnonymous": false,
    "name": "João Silva",
    "email": "joao@example.com",
    "photoIds": ["uuid-from-upload"]
  }'
```

Save the `reference` from the response.

3. **Generate letter**
```bash
curl -X POST http://localhost:3001/api/letter/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "uuid-from-create-report"
  }'
```

4. **Retrieve report**
```bash
curl http://localhost:3001/api/reports/VIS-2024-A3F8K9
```

---

## Support

For API support or to report issues, contact the development team.
