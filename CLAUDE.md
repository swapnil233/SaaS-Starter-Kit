# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build`
- **Linting**: `npm run lint`
- **Testing**: `npm run test` or `npm run test:watch`
- **Database migrations**: `npx prisma migrate dev` (development) or `npm run migrate:prod` (production)
- **Database reset**: `npm run reset` (full reset including node_modules) or `npm run reset:prod` (production)
- **Email development**: `npm run emails` (runs React Email dev server on port 3001)
- **Stripe webhook testing**: `npm run stripe:watch`
- **Code formatting**: `npm run prettier`

## Architecture Overview

This is a full-stack SaaS boilerplate built with:

### Core Stack

- **Framework**: Next.js 15 (Pages Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with custom email/password and Google OAuth
- **Payments**: Stripe integration with webhooks
- **UI**: Mantine components + Tailwind CSS
- **Email**: React Email with Resend
- **Rate Limiting**: Upstash Redis

### Key Architecture Patterns

**Authentication Flow**:

- Middleware (`src/middleware.ts`) handles route protection and rate limiting
- JWT tokens for session management, email verification required
- Custom auth endpoints in `src/pages/api/auth/`

**Database Schema**:

- User management with soft deletes and preferences
- Subscription system with Stripe integration (plans: FREE, PRO)
- Usage tracking and API key management
- Notification system

**Service Layer Pattern**:

- Business logic separated into `src/services/` (auth, stripe, email, etc.)
- Centralized error handling and validation
- Webhook handlers for Stripe events

**Email System**:

- React Email templates in `src/lib/emails/`
- Service-based email sending architecture
- Subscription lifecycle notifications

### Directory Structure

- `src/components/` - Reusable UI components organized by feature
- `src/pages/` - Next.js pages and API routes
- `src/lib/` - Utilities, configurations, schema validation
- `src/services/` - Business logic and external service integrations
- `src/hooks/` - Custom React hooks
- `prisma/` - Database schema and migrations

### Environment Setup

Required environment variables include database URL, authentication secrets, Stripe keys, and email service configuration. Run PostgreSQL locally with `docker-compose up -d` and apply migrations with `npx prisma migrate dev`.

### Testing & Code Quality

The project uses Jest for testing, ESLint for linting, Prettier for formatting, and Husky with lint-staged for pre-commit hooks. All TypeScript files are strictly typed with proper error boundaries.
