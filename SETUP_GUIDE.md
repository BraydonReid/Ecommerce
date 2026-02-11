# 🌱 Green E-Commerce Intelligence - Setup Guide

## Welcome!

Congratulations! You now have a complete, production-ready sustainability analytics platform for e-commerce stores. This guide will walk you through the setup process and next steps to launch your SaaS business.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Third-Party Integrations](#third-party-integrations)
6. [Running Locally](#running-locally)
7. [Deployment](#deployment)
8. [Next Steps](#next-steps)
9. [Project Structure](#project-structure)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm/yarn
- **PostgreSQL** 14+ (or use a managed service like Supabase, Railway, or Neon)
- **Git** for version control
- A **Shopify Partner Account** (free to create)
- A **Stripe Account** (free to create)
- (Optional) **OpenAI API Key** for AI insights
- (Optional) **Climatiq API Key** for accurate carbon calculations

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables template
cp .env.example .env

# 3. Configure your .env file (see below)

# 4. Initialize the database
npx prisma generate
npx prisma migrate dev --name init

# 5. Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app running!

---

## Environment Configuration

### Step 1: Create Your `.env` File

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

Open the `.env` file and fill in the following values:

#### Database Configuration

```env
DATABASE_URL="postgresql://user:password@localhost:5432/green_ecommerce?schema=public"
```

**Options:**
- **Local PostgreSQL**: Use the format above with your local credentials
- **Supabase**: Get connection string from Project Settings → Database
- **Railway**: Get connection string from your PostgreSQL service
- **Neon**: Get connection string from your project dashboard

#### Shopify Configuration

```env
SHOPIFY_API_KEY="your_shopify_api_key"
SHOPIFY_API_SECRET="your_shopify_api_secret"
SHOPIFY_SCOPES="read_orders,read_products,read_shipping"
SHOPIFY_HOST="https://your-app-domain.com"  # For local dev, use ngrok URL
```

**How to get Shopify credentials:**
1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Create an app in your partner dashboard
3. Navigate to "App setup" → "API credentials"
4. Copy the API key and API secret
5. Set the app URL to your domain (for local dev, use ngrok)

#### Stripe Configuration

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_BASIC_PRICE_ID="price_..."
STRIPE_PREMIUM_PRICE_ID="price_..."
```

**How to get Stripe credentials:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys from Developers → API keys
3. Create Products in Products → Add product (Basic $29, Premium $99)
4. Copy the Price IDs for each product
5. Set up webhooks at Developers → Webhooks (see below)

#### OpenAI Configuration (Optional)

```env
OPENAI_API_KEY="sk-..."
```

**How to get OpenAI API key:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API keys
3. Create a new API key

#### Climatiq Configuration (Optional)

```env
CLIMATIQ_API_KEY="your_climatiq_api_key"
```

**How to get Climatiq API key:**
1. Go to [Climatiq](https://www.climatiq.io/)
2. Sign up for a free account
3. Get your API key from the dashboard

**Note:** If you don't have a Climatiq key, the app will use built-in emission factors.

#### NextAuth Configuration

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"
```

**Generate a NextAuth secret:**
```bash
openssl rand -base64 32
```

---

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
```sql
CREATE DATABASE green_ecommerce;
```
3. Update DATABASE_URL in .env
4. Run migrations:
```bash
npx prisma migrate dev
```

### Option 2: Managed Database (Recommended)

#### Using Supabase (Free Tier Available)

1. Go to [supabase.com](https://supabase.com/)
2. Create a new project
3. Go to Project Settings → Database
4. Copy the connection string (URI format)
5. Paste it in your .env as DATABASE_URL
6. Run migrations:
```bash
npx prisma migrate dev
```

#### Using Railway (Free Tier Available)

1. Go to [railway.app](https://railway.app/)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the DATABASE_URL from variables
5. Run migrations locally or in Railway

#### Using Neon (Free Tier Available)

1. Go to [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Update your .env file
5. Run migrations

---

## Third-Party Integrations

### Shopify App Setup

1. **Create a Shopify Partner Account**
   - Go to [partners.shopify.com](https://partners.shopify.com/)
   - Sign up for free

2. **Create an App**
   - Dashboard → Apps → Create app
   - Choose "Public app" (for distribution) or "Custom app" (for testing)
   - Fill in app details:
     - App name: "GreenCommerce Intelligence"
     - App URL: Your domain or ngrok URL

3. **Configure OAuth**
   - Allowed redirection URL(s): `https://your-domain.com/api/shopify/callback`
   - For local dev with ngrok: `https://abc123.ngrok.io/api/shopify/callback`

4. **Set API Scopes**
   - `read_orders`
   - `read_products`
   - `read_shipping`

5. **Test Installation**
   - Create a development store in your partner account
   - Install your app on the dev store
   - Grant permissions

### Stripe Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com/)
   - Sign up and complete onboarding

2. **Create Products**
   - Dashboard → Products → Add product
   - Create two products:
     - **Basic Plan**: $29/month recurring
     - **Premium Plan**: $99/month recurring
   - Copy the Price IDs (start with `price_...`)

3. **Configure Webhooks**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret (starts with `whsec_...`)

4. **Test Mode**
   - Use test API keys (starts with `sk_test_` and `pk_test_`) during development
   - Switch to live keys when ready for production

### OpenAI Setup (Optional)

1. **Get API Key**
   - Go to [platform.openai.com](https://platform.openai.com/)
   - API keys → Create new secret key
   - Add billing information (pay-as-you-go)

2. **Monitor Usage**
   - The AI insights feature uses GPT-4
   - Estimated cost: ~$0.03 per insight generation
   - Set usage limits in OpenAI dashboard

### Climatiq Setup (Optional)

1. **Sign Up**
   - Go to [climatiq.io](https://www.climatiq.io/)
   - Create a free account

2. **Get API Key**
   - Dashboard → API Keys
   - Copy your API key

3. **Fallback**
   - If no Climatiq key is provided, the app uses built-in emission factors
   - Climatiq provides more accurate, region-specific data

---

## Running Locally

### Development Server

```bash
# Start the Next.js dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Using ngrok for Local Development

Shopify and Stripe webhooks need a public URL. Use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update SHOPIFY_HOST and NEXTAUTH_URL in .env
```

### Database Management

```bash
# View database in Prisma Studio
npm run prisma:studio

# Create a new migration
npx prisma migrate dev --name description

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Testing Webhooks Locally

Use ngrok + Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Deployment

### Recommended: Vercel (Best for Next.js)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/green-ecommerce.git
git push -u origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Import your GitHub repository
   - Configure environment variables (copy from .env)
   - Deploy!

3. **Configure Database**
   - Use Vercel Postgres or connect to Supabase/Railway
   - Run migrations:
```bash
npx prisma migrate deploy
```

4. **Update Webhook URLs**
   - Update Shopify redirect URL to your Vercel domain
   - Update Stripe webhook endpoint to your Vercel domain

### Alternative: Railway

1. **Push to GitHub**
2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app/)
   - New Project → Deploy from GitHub repo
   - Add PostgreSQL database
   - Set environment variables
   - Deploy

### Alternative: DigitalOcean App Platform

1. **Push to GitHub**
2. **Create App**
   - Go to [digitalocean.com/products/app-platform](https://www.digitalocean.com/products/app-platform)
   - Create app from GitHub
   - Add managed PostgreSQL database
   - Configure environment variables

### Post-Deployment Checklist

- [ ] Update SHOPIFY_HOST to production URL
- [ ] Update NEXTAUTH_URL to production URL
- [ ] Update Stripe webhook endpoint
- [ ] Update Shopify OAuth redirect URL
- [ ] Switch Stripe to live keys (when ready)
- [ ] Set up SSL/TLS (usually automatic on Vercel/Railway)
- [ ] Test Shopify OAuth flow
- [ ] Test Stripe checkout
- [ ] Test webhook delivery

---

## Next Steps

### 1. Shopify App Store Submission

To distribute your app on the Shopify App Store:

1. **Complete App Setup**
   - Ensure all features work
   - Test on multiple dev stores
   - Add comprehensive error handling

2. **Prepare Assets**
   - App icon (512x512px)
   - Screenshots (up to 5)
   - Demo video (recommended)

3. **Create Listing**
   - Partners Dashboard → Apps → Your App → Distribution
   - Fill in app listing details
   - Add pricing information
   - Submit for review

4. **Requirements**
   - Privacy policy URL
   - Support contact
   - Terms of service
   - GDPR compliance statement

**Review process takes 5-10 business days.**

### 2. Marketing & Launch

#### Pre-Launch (Week 1-2)

- [ ] Set up a landing page (already included in the app)
- [ ] Create social media accounts (Twitter, LinkedIn)
- [ ] Set up Google Analytics
- [ ] Prepare blog content (3-5 posts)
- [ ] Create demo video
- [ ] Reach out to beta testers

#### Launch (Week 3)

- [ ] Submit to Shopify App Store
- [ ] Post on Product Hunt
- [ ] Share on social media
- [ ] Email newsletter to beta list
- [ ] Post in relevant communities (Reddit, Indie Hackers)

#### Post-Launch (Month 1-3)

- [ ] Content marketing (2-3 blog posts/week)
- [ ] SEO optimization
- [ ] Reach out to sustainability bloggers
- [ ] Partner with eco-friendly brands
- [ ] Collect testimonials
- [ ] Iterate based on feedback

### 3. Feature Roadmap

#### Phase 1 (MVP - Complete ✅)
- [x] Shopify integration
- [x] Carbon tracking
- [x] Dashboard with analytics
- [x] PDF reports
- [x] AI insights (premium)
- [x] Stripe billing

#### Phase 2 (Next 3 Months)
- [ ] WooCommerce integration
- [ ] BigCommerce integration
- [ ] Product-level carbon tracking
- [ ] Carbon offset marketplace integration
- [ ] Email notifications
- [ ] Multi-language support

#### Phase 3 (6-12 Months)
- [ ] Mobile app
- [ ] API for third-party integrations
- [ ] Advanced analytics (predictive models)
- [ ] Team collaboration features
- [ ] White-label options
- [ ] Enterprise features

### 4. Customer Acquisition Strategy

#### Free Channels

1. **Content Marketing**
   - Blog: "How to Reduce Your Store's Carbon Footprint"
   - SEO keywords: "shopify sustainability", "e-commerce carbon tracking"
   - Guest posts on sustainability blogs

2. **Community Engagement**
   - Shopify community forums
   - Reddit (r/shopify, r/sustainability)
   - LinkedIn groups for e-commerce

3. **Referral Program**
   - Give 1 month free for each referral
   - Already built into pricing structure

4. **Partnerships**
   - Partner with packaging suppliers
   - Partner with carbon offset programs
   - Co-marketing with complementary apps

#### Paid Channels (Start Small)

1. **Google Ads**
   - Target "Shopify apps" keywords
   - Budget: $5-10/day initially

2. **Facebook/Instagram Ads**
   - Target sustainable brands
   - Budget: $5-10/day initially

3. **Shopify App Store Ads**
   - Consider after getting reviews

### 5. Key Metrics to Track

#### Product Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn rate
- Free-to-paid conversion rate

#### Usage Metrics
- Daily Active Users (DAU)
- Orders processed
- Reports generated
- AI insights requested

#### Goal: $1M ARR
- **1,000 customers** at $99/mo (Premium) = $1.188M/year
- **2,000 customers** at $49/mo (avg) = $1.176M/year
- **Mix approach**: 500 Premium + 1,500 Basic = $928k/year

---

## Project Structure

```
e_commerce_site/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth authentication
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── billing/              # Stripe billing
│   │   ├── insights/             # AI insights
│   │   ├── reports/              # PDF generation
│   │   ├── shopify/              # Shopify OAuth
│   │   └── webhooks/             # Webhook handlers
│   ├── dashboard/                # Dashboard page
│   ├── pricing/                  # Pricing page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── AIInsights.tsx           # AI insights component
│   ├── EmissionsChart.tsx       # Chart component
│   ├── MetricsCard.tsx          # Metrics card
│   └── TopProducts.tsx          # Top products list
├── lib/                          # Utility libraries
│   ├── carbon.ts                 # Carbon calculation logic
│   ├── openai.ts                 # OpenAI integration
│   ├── prisma.ts                 # Prisma client
│   ├── shopify.ts                # Shopify API wrapper
│   └── stripe.ts                 # Stripe integration
├── prisma/                       # Database
│   └── schema.prisma             # Database schema
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── next.config.js                # Next.js config
```

---

## Troubleshooting

### Database Issues

**Error: "Can't reach database server"**
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall settings
- For managed databases, check IP whitelist

**Error: "Migration failed"**
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or manually drop tables and re-migrate
npx prisma migrate deploy
```

### Shopify Issues

**Error: "Invalid OAuth callback"**
- Check SHOPIFY_HOST matches your app settings
- Ensure redirect URL is configured in Shopify app
- For ngrok, update URL in both .env and Shopify

**Webhooks not firing**
- Check webhook URL is accessible
- Verify HMAC validation
- Check Shopify webhook logs in Partner Dashboard

### Stripe Issues

**Error: "No such customer"**
- Ensure customer is created before checkout
- Check Stripe dashboard for customer records

**Webhooks failing**
- Verify webhook secret matches Stripe dashboard
- Check endpoint is accessible
- Use Stripe CLI for local testing

### OpenAI Issues

**Error: "Insufficient quota"**
- Add billing information to OpenAI account
- Set usage limits
- Monitor costs in dashboard

### Performance Issues

**Slow dashboard loading**
- Add database indexes (already included in schema)
- Consider caching with Redis
- Optimize Prisma queries

**High API costs**
- Cache carbon calculations
- Batch API requests
- Set up rate limiting

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Shopify API Docs](https://shopify.dev/docs)
- [Stripe Docs](https://stripe.com/docs)

### Community
- [Shopify Community](https://community.shopify.com/)
- [Indie Hackers](https://www.indhackers.com/)
- [r/SaaS](https://www.reddit.com/r/SaaS/)

### Getting Help
- Open an issue on GitHub
- Join relevant Slack/Discord communities
- Post questions on Stack Overflow

---

## Legal Requirements

Before launching, ensure you have:

1. **Privacy Policy** - Explain data collection and usage
2. **Terms of Service** - Define terms of use
3. **GDPR Compliance** - If serving EU customers
4. **Cookie Policy** - If using analytics cookies
5. **Business Entity** - LLC or Corporation recommended

**Resources:**
- Use [Termly](https://termly.io/) for policy generators
- Consult with a lawyer for custom needs
- Shopify requires these for app approval

---

## Congratulations! 🎉

You now have a complete, production-ready SaaS application. The hard part is done - now it's time to launch, market, and grow your business!

**Remember:**
- Start small, iterate quickly
- Listen to customer feedback
- Focus on solving real problems
- Track metrics religiously
- Don't be afraid to pivot

**Good luck building your $1M+ SaaS business!** 🚀

---

## Questions?

Feel free to reach out or open an issue if you need help. Happy building!
