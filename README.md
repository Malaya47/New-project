# laundry.li

This project is now split into:

- `frontend/`: Next.js + Tailwind UI
- `backend/`: JavaScript API server

## Local development

Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Run the backend:

```bash
cd backend && npm run dev
```

Run the frontend:

```bash
cd frontend && npm run dev
```

The frontend proxies `/api/*`, `/invoice/:id`, and `/invoice-text/:id` to the backend.
