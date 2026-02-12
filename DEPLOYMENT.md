# Deployment Checklist for GreenCommerce

## Pre-Deployment Steps

### 1. Database Migration
Run the following commands to apply schema changes:

```bash
# Create migration for new shipping models and isAdmin field
npx prisma migrate dev --name add_shipping_and_admin

# OR for production (if you already have data)
npx prisma migrate deploy
```

### 2. Seed Shipping Providers
```bash
npx ts-node prisma/seed-shipping-providers.ts
```

### 3. Create Admin Account
```bash
npx ts-node prisma/seed-admin.ts
```

This creates:
- **Email:** braydonreid01@gmail.com
- **Password:** ChangeMe123! (change after first login)
- **Shopify Store:** coolhomedecorandthemes.myshopify.com
- **Subscription:** Premium (full access)
- **Admin Status:** true

## Environment Variables Required

Ensure these are set in Railway (or your hosting platform):

### Required
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://greencommerces.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
SHOPIFY_API_KEY=<from Shopify Partners>
SHOPIFY_API_SECRET=<from Shopify Partners>
SHOPIFY_HOST=https://greencommerces.com
```

### Required for Payments
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...
```

### Optional (Enhanced Features)
```
OPENAI_API_KEY=sk-... (for AI insights)
CLIMATIQ_API_KEY=... (for accurate carbon calculations)
```

## Shopify App Setup

### 1. Create Shopify App
1. Go to https://partners.shopify.com
2. Create a new app
3. Set App URL to: `https://greencommerces.com`
4. Set Redirect URL to: `https://greencommerces.com/api/shopify/callback`

### 2. Required Scopes
- `read_orders`
- `read_products`
- `read_shipping`

### 3. Install on Test Store
1. From Partners dashboard, select your app
2. Click "Select store" and choose: coolhomedecorandthemes.myshopify.com
3. Authorize the app

## Post-Deployment Verification

### 1. Test Authentication
- [ ] Login with admin account works
- [ ] Password change works
- [ ] Session persists correctly

### 2. Test Shopify Integration
- [ ] Shopify OAuth flow completes
- [ ] Order sync works
- [ ] Webhooks are registered

### 3. Test Shipping Optimization
- [ ] Providers endpoint returns data: `GET /api/shipping/providers`
- [ ] Costs endpoint works: `GET /api/shipping/costs?shop=coolhomedecorandthemes.myshopify.com`
- [ ] Dashboard shows shipping section

### 4. Test Security
- [ ] Protected routes redirect to login
- [ ] Admin routes only accessible by admins
- [ ] Security headers present (check with browser dev tools)

## Railway Deployment Commands

```bash
# Push to Railway (if connected to git)
git add .
git commit -m "Add shipping optimization and admin features"
git push origin main

# Railway will auto-deploy from main branch
```

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL uses the correct connection string format
- For Railway: Use the internal connection string for server, public for migrations

### Shopify OAuth Errors
- Verify SHOPIFY_HOST matches your deployed URL exactly
- Check that redirect URLs are correctly configured in Shopify Partners

### Build Failures
- Run `npm run build` locally first
- Check for TypeScript errors: `npx tsc --noEmit`

## Security Notes

1. **Change default admin password immediately** after first login
2. **Never commit .env file** - it's in .gitignore
3. **Rotate NEXTAUTH_SECRET** periodically
4. **Monitor webhook logs** for suspicious activity

## Support Contacts

For issues with:
- Shopify API: https://shopify.dev/docs
- Stripe: https://stripe.com/docs
- Railway: https://docs.railway.app
