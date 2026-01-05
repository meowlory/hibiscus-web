# 🌺 Hibiscus Tracker

A web application to track and organize beautiful hibiscus bloom photos. Built with Next.js, PostgreSQL, and Vercel.

## Features

- 📸 Upload hibiscus bloom photos
- 🌿 Create and manage plants
- 🏷️ Organize blooms by plant
- 🗄️ PostgreSQL database with Prisma ORM
- ☁️ Vercel Blob storage for images

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **Storage**: Vercel Blob
- **Deployment**: Vercel
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone git@github.com:meowlory/hibiscus-web.git
   cd hibiscus-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory. Ask a project maintainer for the credentials.

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Database

The app uses PostgreSQL (hosted on Supabase) with Prisma ORM.

### Database Schema

- **Plants**: Store hibiscus plant information
  - `id`: Auto-incrementing ID
  - `name`: Plant name
  - `description`: Optional description
  - `createdAt`, `updatedAt`: Timestamps

- **Blooms**: Store bloom photo metadata
  - `id`: Auto-incrementing ID
  - `url`: Vercel Blob storage URL
  - `pathname`: File path in blob storage
  - `uploadedAt`: Upload timestamp
  - `plantId`: Foreign key to plants (optional)

### Migrations

Migrations are already applied to the production database. If you need to run them locally:

```bash
npx prisma migrate dev
```

## Development Workflow

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   Edit code, test locally with `npm run dev`

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

4. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

   Go to GitHub and create a PR from your branch to `main`

6. **Deploy**

   Once merged to `main`, Vercel will automatically deploy to production

## Project Structure

```
hibiscus-web/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── blooms/        # Bloom endpoints
│   │   ├── plants/        # Plant endpoints
│   │   └── upload/        # Upload endpoint
│   ├── blooms/            # Bloom gallery page
│   ├── plants/            # Plants page
│   └── page.tsx           # Home page
├── lib/                   # Shared utilities
│   └── prisma.ts          # Prisma client singleton
├── prisma/                # Database
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Migration files
└── public/                # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Run database migrations

## Production

- **Live App**: https://hibiscus-web.vercel.app
- **Vercel Dashboard**: https://vercel.com/brady-ai/hibiscus-web

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Private project - All rights reserved
