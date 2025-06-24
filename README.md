# Boilerplate

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fswapnil233%2Fboilerplate&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,DATABASE_URL&project-name=saas-boilerplate&repository-name=saas-boilerplate)

This is a boilerplate to quickly get SaaS projects up and running, without worrying about the initial setup and authentication. It was built with [Next.js (pages router)](https://nextjs.org/), [Clerk](https://clerk.com/), [Prisma](https://www.prisma.io/), and [Mantine](https://mantine.dev/). It uses a PostgreSQL database and is deployed on Vercel.

The goal is to simply clone this repo, set up your environment variables, and start building the features of your SaaS project, rather than configuring authentication and other boilerplate for days.

### Features:

- **A landing page**: With a hero section, features, and testimonials.
- **Authentication**: Complete authentication system with Clerk (OAuth, email/password, user management).
- **User management**: Clerk handles user profiles, settings, and account management.
- **Billing ready**: Ready for monetization with Clerk&apos;s billing system.
- **Emails**: Send emails with nodemailer and react-email.
- **SEO**: Meta tags, sitemap, and robots.txt.
- **Analytics**: Google Analytics.
- **Logging**: Sentry for error tracking.

### Getting Started

1. Clone the repo: `git clone`
2. Install dependencies: `npm install`
3. Set up your environment variables: `.env` (see environment variables section below)
4. Spin up a local PostgreSQL database: `docker-compose up -d`
5. Run the migrations: `npx prisma migrate dev`
6. Start the dev server: `npm run dev`
7. Visit `http://localhost:3000`

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
DIRECT_URL=postgresql://username:password@localhost:5432/database_name

# Optional: Email service (for notifications)
RESEND_API_KEY=your_resend_api_key
```
