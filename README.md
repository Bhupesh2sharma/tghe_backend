# tghe-backend

Node.js + Express backend with MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy env example and configure (required: set `JWT_SECRET` for admin auth):
   ```bash
   cp .env.example .env
   ```
   Edit `.env`: set `MONGODB_URI` (optional; defaults to `mongodb://localhost:27017/tghe`), **`JWT_SECRET`** (required for admin auth), and **Cloudinary** (required for image upload): `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`; optional `CLOUDINARY_FOLDER` (default `tghe`).

3. Ensure MongoDB is running locally, or set `MONGODB_URI` in `.env` (e.g. Atlas connection string).

## Run

- **Development** (with file watch): `npm run dev`
- **Production**: `npm start`

## Routes

- **GET /api/test** — Test route; returns JSON with success and timestamp.
- **GET /health** — Health check.

### Admin auth (`/api/admin`)

- **POST /api/admin/register** — Register admin. Body: `{ "email": "...", "password": "..." }`. Password: min 8 chars, at least one letter and one number. Returns `{ data: { admin, token } }`.
- **POST /api/admin/login** — Login. Body: `{ "email": "...", "password": "..." }`. Returns `{ data: { admin, token } }`.

Use the token in protected routes: `Authorization: Bearer <token>`. Auth routes are rate-limited (10 requests per 15 minutes per IP).

### Analytics (`/api/analytics`)

- **GET /api/analytics** — Simple counts (admin). Returns: `categories`, `destinations`, `packages`, `enquiries`, `contacts`, `newsletter`.

### Notifications (`/api/notifications`)

Persistent admin notifications for new enquiries, contact form submissions, and newsletter signups.

- **GET /api/notifications** — List (admin). Query: `?read=true|false` (optional), `?limit=50` (default, max 100). Newest first.
- **GET /api/notifications/unread-count** — Unread count (admin). Returns `{ data: { count } }` for badge.
- **PATCH /api/notifications/:id/read** — Mark one as read (admin).
- **PATCH /api/notifications/read-all** — Mark all as read (admin).

### Upload – Cloudinary (`/api/upload`)

Images are stored in Cloudinary. You can either:

1. **Direct on create/update** — POST or PATCH for **categories**, **destinations**, or **packages** accept **multipart/form-data** with an optional `image` file (same limits). Other fields as form fields. No need to call upload first.
2. **Separate upload** — POST /api/upload/image (admin), then use the returned `url` in category/destination/package JSON body.

- **POST /api/upload/image** — Upload image only (admin). Multipart form-data, field name `image`. Returns `{ data: { url, publicId } }`.

### Categories (`/api/categories`)

- **GET /api/categories** — List all (public).
- **GET /api/categories/:id** — Get one (public).
- **POST /api/categories** — Create (admin). JSON body or multipart with optional `image` file.
- **PATCH /api/categories/:id** — Update (admin). JSON or multipart with optional `image` file.
- **DELETE /api/categories/:id** — Delete (admin).

### Destinations (`/api/destinations`)

- **GET /api/destinations** — List all (public).
- **GET /api/destinations/:id** — Get one (public).
- **POST /api/destinations** — Create (admin). JSON body or multipart with optional `image` file.
- **PATCH /api/destinations/:id** — Update (admin). JSON or multipart with optional `image` file.
- **DELETE /api/destinations/:id** — Delete (admin).

### Packages (`/api/packages`)

Same as PHP: **Step 1** create package, **Step 2** assign categories & destinations.

- **POST /api/packages** — Create package (admin, step 1). JSON body or multipart with optional `image` file. No categories/destinations yet.
- **PATCH /api/packages/:id** — Update package fields (admin). JSON or multipart with optional `image` file.
- **PATCH /api/packages/:id/categories-destinations** — Assign categories and/or destinations (admin, step 2). Body: `{ "categoryIds": ["id1", "id2"], "destinationIds": ["id1"] }`. Both arrays optional; use `[]` to clear.
- **DELETE /api/packages/:id** — Delete package (admin).
- **GET /api/packages** — List all. Query: `?categoryId=...` and/or `?destinationId=...` to filter.
- **GET /api/packages/:id** — Get one with populated categories and destinations (public).

### Newsletter (`/api/newsletter`)

- **POST /api/newsletter** — Subscribe (public). Body: `{ "email" }`. Valid email required; duplicate returns "Already subscribed".
- **GET /api/newsletter** — List all subscribers (admin). Returns `{ data: [ { email, createdAt }, ... ] }`.

### Enquiries (`/api/enquiries`)

- **POST /api/enquiries** — Submit enquiry (public). Body: `name`, `email` (required); `pax`, `phone`, `packageId`, `packageName`, `tourDate` (ISO date), `message` (optional).
- **GET /api/enquiries** — Get all enquiries (admin). Returns list with Name, PAX, Phone, Email, Package ID (ref), Package Name, Tour Date, Message, Created At (ENQ DATE).

### Contacts (`/api/contacts`)

- **POST /api/contacts** — Submit contact form (public). Body: `name`, `phone`, `email` (required); `message`, `noOfAdults`, `noOfChildren` (optional, numbers default 0).
- **GET /api/contacts** — Get all contact form submissions (admin). Returns: Name, Phone Number, Email, Message, No of Adults, No of Children, ENQ date (createdAt).
