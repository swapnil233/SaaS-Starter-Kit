# Boilerplate SaaS Starter

A comprehensive Next.js SaaS starter template built with modern technologies and best practices.

## Technology Stack

- **Frontend**: Next.js (Pages Router), React 18, TypeScript
- **UI Framework**: Mantine v7 components and utilities
- **Authentication**: Clerk (OAuth, email/password, user management)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + Mantine components
- **State Management**: TanStack Query (React Query)
- **Email**: React Email + Resend/Nodemailer
- **Deployment**: Vercel-optimized
- **Testing**: Jest setup
- **Code Quality**: ESLint, Prettier, Husky hooks

## Key Features

### Authentication & User Management

- Complete authentication system with Clerk
- OAuth providers (Google, GitHub, etc.)
- Email/password authentication
- User profile management
- Account settings and preferences
- Ready for billing integration with Clerk&apos;s billing system

### Developer Experience

- TypeScript for type safety
- ESLint + Prettier for code quality
- Husky for pre-commit hooks
- Hot reloading and fast development
- Comprehensive error handling
- SEO optimization built-in

### Email System

- React Email components for beautiful emails
- Transactional email support
- Email templates for common use cases

### Database & API

- PostgreSQL database with Docker setup
- Prisma ORM with type-safe queries
- API routes structure
- Database migrations and seeding
- Business logic separated into `src/services/`

### Production Ready

- Vercel deployment configuration
- Environment variable management
- Error logging and monitoring setup
- Performance optimization
- Security best practices

## Getting Started

Required environment variables include database URL, Clerk authentication keys, and email service configuration. Run PostgreSQL locally with `docker-compose up -d` and apply migrations with `npx prisma migrate dev`.

## Project Structure

```
src/
├── components/        # Reusable React components
├── pages/            # Next.js pages (Pages Router)
├── lib/              # Utility functions and configurations
├── hooks/            # Custom React hooks
├── services/         # Business logic and API calls
├── styles/           # Global styles and CSS
└── types/            # TypeScript type definitions
```

The application follows modern React patterns with hooks, context, and component composition for maintainable and scalable code.
