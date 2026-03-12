# tghe-backend API

**Base URL:** `http://localhost:3000` (or set `baseUrl` in Postman).

**Auth:** Admin-only routes need `Authorization: Bearer <token>`. Get the token from **Admin → Login**; the collection saves it automatically.

**Images:** Categories, destinations, and packages support a single `image` (URL) and an `images` array (up to 20 URLs). You can upload via multipart (fields `image` and/or `images`) or use **Upload → Upload Image** and pass the returned `url`(s) in the body. Minimum 6 images can be uploaded for each entity (e.g. for gallery).

---

## Health & Test

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/test` | Test route; returns success and timestamp |

---

## Admin

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/admin/register` | No | `{ "email", "password" }` | Register admin. Password: min 8 chars, one letter, one number. |
| POST | `/api/admin/login` | No | `{ "email", "password" }` | Login; response includes `token`. |

---

## Analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/analytics` | Yes | Dashboard counts (admin). Returns `{ data: { categories, destinations, packages, enquiries, contacts, newsletter } }` (numbers). |

---

## Notifications

Admin notifications for new enquiries, contact form submissions, and newsletter signups. Stored in DB; admin can list, mark read, and get unread count.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Yes | List. Query: `?read=true` or `?read=false`, `?limit=50` (max 100). Each item: type, title, message, link, relatedId, read, createdAt. |
| GET | `/api/notifications/unread-count` | Yes | Returns `{ data: { count } }` for badge. |
| PATCH | `/api/notifications/read-all` | Yes | Mark all as read. Returns `modifiedCount`. |
| PATCH | `/api/notifications/:id/read` | Yes | Mark one as read. |

---

## Upload (Cloudinary)

**Two ways to set images:**

1. **Direct:** POST/PATCH for categories, destinations, or packages accept **multipart/form-data** with optional `image` (one file) and/or `images` (up to 20 files). Other fields as form fields. Files are uploaded to Cloudinary and URLs are stored.
2. **Separate:** POST `/api/upload/image` returns `{ data: { url, publicId } }`; then send that `url` in `image` or `images` array when creating/updating via JSON.

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/upload/image` | Yes | Multipart: field `image` (file) | Upload image only. Returns `{ data: { url, publicId } }`. |

---

## Newsletter

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/newsletter` | No | `{ "email" }` | Subscribe to newsletter. Valid email required. Returns `{ data: { email } }`. Duplicate returns "Already subscribed". |
| GET | `/api/newsletter` | Yes | — | List all newsletter emails (admin). Returns `{ data: [ { email, createdAt }, ... ] }`. |

---

## Enquiries

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/enquiries` | No | `{ "name", "email", "pax?", "phone?", "packageId?", "packageName?", "tourDate?", "message?" }` | Submit enquiry (client). Required: name, email. tourDate: ISO date string. |
| GET | `/api/enquiries` | Yes | — | Get all enquiries (admin). Returns list: name, pax, phone, email, packageId (populated), packageName, tourDate, message, createdAt (ENQ DATE). |

---

## Contacts

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/contacts` | No | `{ "name", "phone", "email", "message?", "noOfAdults?", "noOfChildren?" }` | Submit contact form (client). Required: name, phone, email. Optional: message, noOfAdults, noOfChildren (default 0). |
| GET | `/api/contacts` | Yes | — | Get all contact submissions (admin). Returns: name, phone, email, message, noOfAdults, noOfChildren, createdAt (ENQ date). |

---

## Categories

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| GET | `/api/categories` | No | — | List all categories |
| GET | `/api/categories/:id` | No | — | Get one category |
| POST | `/api/categories` | Yes | JSON or multipart with optional `image` and/or `images` (array, up to 20) | Create category |
| PATCH | `/api/categories/:id` | Yes | JSON or multipart with optional `image` and/or `images` | Update category (partial) |
| DELETE | `/api/categories/:id` | Yes | — | Delete category |

---

## Destinations

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| GET | `/api/destinations` | No | — | List all destinations |
| GET | `/api/destinations/:id` | No | — | Get one destination |
| POST | `/api/destinations` | Yes | JSON or multipart with optional `image` and/or `images` (array, up to 20) | Create destination |
| PATCH | `/api/destinations/:id` | Yes | JSON or multipart with optional `image` and/or `images` | Update destination (partial) |
| DELETE | `/api/destinations/:id` | Yes | — | Delete destination |

---

## Packages

| Method | Path | Auth | Body / Query | Description |
|--------|------|------|--------------|-------------|
| GET | `/api/packages` | No | Query: `?categoryId=`, `?destinationId=` (optional) | List packages; filter by category and/or destination |
| GET | `/api/packages/:id` | No | — | Get one package with categories, destinations, **itinerary**, **paymentRefundPolicy**, **inclusions**, **exclusions**, **termsCondition** |
| POST | `/api/packages` | Yes | JSON or multipart with optional `image` and/or `images` (array, up to 20) | **Step 1:** Create package (no categories/destinations) |
| PATCH | `/api/packages/:id` | Yes | JSON or multipart with optional `image` and/or `images` | Update package fields (partial); not categories/destinations |
| PATCH | `/api/packages/:id/categories-destinations` | Yes | `{ "categoryIds": ["id", ...], "destinationIds": ["id", ...] }` | **Step 2:** Assign categories and destinations; both arrays optional |
| DELETE | `/api/packages/:id` | Yes | — | Delete package (and linked itinerary, payment-refund, inclusion-exclusion, terms) |

### Package-linked resources (nested under `/api/packages/:id/`)

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| GET | `/api/packages/:id/itinerary` | No | — | List itinerary items (sorted by dayNumber) |
| POST | `/api/packages/:id/itinerary` | Yes | `{ "dayNumber", "title", "description?" }` | Add itinerary item |
| PATCH | `/api/packages/:id/itinerary/:itineraryId` | Yes | `{ "dayNumber?", "title?", "description?" }` | Update itinerary item |
| DELETE | `/api/packages/:id/itinerary/:itineraryId` | Yes | — | Delete itinerary item |
| GET | `/api/packages/:id/payment-refund` | No | — | Get Cancellation & Refund Policy for package |
| PUT | `/api/packages/:id/payment-refund` | Yes | `{ "content" }` | Create or update Payment & Refund Policy (upsert) |
| GET | `/api/packages/:id/inclusion-exclusion` | No | — | Get inclusions and exclusions (`{ data: { inclusions, exclusions } }`) |
| POST | `/api/packages/:id/inclusion-exclusion` | Yes | `{ "type": "inclusion" \| "exclusion", "text", "order?" }` | Add inclusion or exclusion item |
| PATCH | `/api/packages/:id/inclusion-exclusion/:itemId` | Yes | `{ "type?", "text?", "order?" }` | Update item |
| DELETE | `/api/packages/:id/inclusion-exclusion/:itemId` | Yes | — | Delete item |
| GET | `/api/packages/:id/terms` | No | — | Get Terms & Conditions for package |
| PUT | `/api/packages/:id/terms` | Yes | `{ "content" }` | Create or update Terms & Conditions (upsert) |

---

## Collection variables

| Variable | Purpose |
|----------|---------|
| `baseUrl` | Server URL (default `http://localhost:3000`) |
| `token` | JWT; set automatically by **Login** |
| `categoryId` | Use in Categories Get One / Packages filter |
| `destinationId` | Use in Destinations Get One / Packages filter |
| `packageId` | Use in Packages Get One / Assign (Step 2) |

Import **tghe-backend.postman_collection.json** in Postman to use these requests.
