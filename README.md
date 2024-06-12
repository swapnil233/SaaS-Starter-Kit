# Boilerplate

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fswapnil233%2Fboilerplate&env=AUTH_SECRET,DATABASE_URL,NEXTAUTH_URL,JWT_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET&project-name=saas-boilerplate&repository-name=saas-boilerplate)

This is a boilerplate to quickly get SaaS projects up and running, without worrying about the initial setup and things like auth and subscriptions. It was built with [Next.js (pages router)](https://nextjs.org/), [Prisma](https://www.prisma.io/), [Stripe](https://stripe.com/), and [Mantine](https://mantine.dev/). It uses a PostgreSQL database and is deployed on Vercel.

The goal is to simply clone this repo, set up your environment variables, and start building the features of your SaaS project, rather than configuring auth, subscriptions, and other boilerplate for days.

### Features:

- **A landing page**: With a hero section, features, testimonials, and pricing.
- **Authentication**: Sign up, sign in, sign out, forgot password, and update user info.
- **Subscriptions**: Create, update, and cancel subscriptions with Stripe.
- **User settings**: Update user info, change password, and delete account.
- **Emails**: Send emails with nodemailer and react-email.
- **SEO**: Meta tags, sitemap, and robots.txt.
- **Analytics**: Google Analytics.
- **Logging**: Sentry for error tracking.

### Getting Started

1. Clone the repo: `git clone`
2. Install dependencies: `npm install`
3. Set up your environment variables: `.env` (see `.env.example`)
4. Spin up a local PostgreSQL database: `docker-compose up -d`
5. Run the migrations: `npx prisma migrate dev`
6. Start the dev server: `npm run dev`
7. Visit `http://localhost:3000`
