# 🧪 Testing Guide - See Your App in Action!

You don't need a real Shopify store to see the platform working! Here are your options:

---

## Option 1: Demo Mode (Quickest - 2 minutes)

See the platform with pre-built sample data immediately.

### Steps:

1. **Just visit the demo**:
   ```
   http://localhost:3000/demo
   ```

2. **What you'll see**:
   - ✅ 50+ sample orders from the past 3 months
   - ✅ 5 eco-friendly products
   - ✅ Real-time analytics dashboard
   - ✅ Carbon emissions breakdown charts
   - ✅ Top emitting products analysis
   - ✅ AI-generated insights (Premium tier)

3. **No setup required!** Just run `npm run dev` and visit the demo page.

---

## Option 2: Database with Mock Data (5 minutes)

Load realistic data into your local database to test the full app.

### Steps:

1. **Set up a local PostgreSQL database** (if you haven't):

   **Option A: Using Docker (easiest)**
   ```bash
   docker run --name green-commerce-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=green_ecommerce -p 5432:5432 -d postgres
   ```

   **Option B: Install PostgreSQL locally**
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Create database: `createdb green_ecommerce`

2. **Update your `.env` file**:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/green_ecommerce?schema=public"
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the database with mock data**:
   ```bash
   npm run seed
   ```

5. **View the data** (optional):
   ```bash
   npm run prisma:studio
   ```
   This opens a visual database browser at http://localhost:5555

6. **Start the app**:
   ```bash
   npm run dev
   ```

7. **Visit the demo dashboard**:
   ```
   http://localhost:3000/dashboard?demo=true
   ```

---

## Option 3: Free Shopify Development Store (30 minutes)

Create a real (free) Shopify store for testing.

### Steps:

1. **Create a Shopify Partner Account** (free):
   - Go to [partners.shopify.com](https://partners.shopify.com)
   - Click "Join Now"
   - Fill in your details
   - Verify your email

2. **Create a Development Store**:
   - Dashboard → Stores → Add store
   - Choose "Development store"
   - Store name: "green-commerce-test" (or any name)
   - Store purpose: "Test an app or theme"
   - Click "Create development store"

3. **Create a Shopify App**:
   - Dashboard → Apps → Create app
   - Choose "Public app"
   - App name: "GreenCommerce Dev"
   - App URL: `http://localhost:3000`
   - Allowed redirection URL(s): `http://localhost:3000/api/shopify/callback`

4. **Get Your API Credentials**:
   - Go to your app → API credentials
   - Copy the API key and API secret key

5. **Update Your `.env` File**:
   ```env
   SHOPIFY_API_KEY="your_api_key_here"
   SHOPIFY_API_SECRET="your_api_secret_here"
   SHOPIFY_HOST="http://localhost:3000"
   ```

6. **Install the App on Your Dev Store**:
   ```
   http://localhost:3000/api/shopify/auth?shop=your-store-name.myshopify.com
   ```

7. **Add Sample Products & Orders**:
   - Log into your dev store admin
   - Products → Add product (create 5-10 products)
   - Orders → Create order (create 10-20 test orders)

8. **See Your Real Data**:
   The app will automatically calculate carbon emissions for your orders!

---

## What Each Option Gives You

| Feature | Demo Mode | Mock Database | Real Shopify Store |
|---------|-----------|---------------|-------------------|
| See Dashboard | ✅ | ✅ | ✅ |
| View Charts | ✅ | ✅ | ✅ |
| See Emissions | ✅ | ✅ | ✅ |
| Test Database | ❌ | ✅ | ✅ |
| Real-time Updates | ❌ | ❌ | ✅ |
| Shopify Integration | ❌ | ❌ | ✅ |
| Setup Time | 1 min | 5 min | 30 min |

---

## Quick Commands Reference

```bash
# Start development server
npm run dev

# View demo (no setup needed)
# Visit: http://localhost:3000/demo

# Set up database
npx prisma migrate dev
npm run seed

# View database
npm run prisma:studio

# Test with demo data
# Visit: http://localhost:3000/dashboard?demo=true
```

---

## What You'll See in the Dashboard

### Metrics Cards
- **Total CO₂ Emissions**: Overall carbon footprint
- **Orders Analyzed**: Number of orders tracked
- **Avg per Order**: Average emissions per order
- **Shipping Impact**: Percentage of emissions from shipping

### Charts
- **Daily Emissions Chart**: Line chart showing emissions over time
- **Top Emitting Products**: Bar chart of products with highest impact

### AI Insights (Premium)
- Executive summary of sustainability performance
- 3 actionable recommendations to reduce emissions

---

## Testing Specific Features

### Test Carbon Calculations
The demo includes orders with:
- Different shipping methods (air, sea, road, rail)
- Various distances (100km - 3000km)
- Multiple packaging types (cardboard, plastic, biodegradable)

### Test Chart Interactions
- Hover over chart points to see details
- Charts update with different date ranges
- Responsive design works on mobile

### Test AI Insights
The demo includes pre-generated AI insights showing:
- Summary of emissions trends
- Personalized recommendations
- Month-over-month comparisons

---

## Troubleshooting

### "Cannot read properties of undefined"
**Fix**: Make sure `.env` file exists with all required variables (even if temporary)

### "Database connection failed"
**Fix**:
1. Check PostgreSQL is running: `docker ps` or `pg_isready`
2. Verify DATABASE_URL in `.env`
3. Try: `npx prisma db push`

### "Port 3000 already in use"
**Fix**:
```bash
# Kill the process
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Demo page not loading
**Fix**:
1. Make sure you ran `npm run dev`
2. Check console for errors
3. Try clearing browser cache

---

## Next Steps After Testing

Once you've seen the demo and are satisfied:

1. ✅ **Set up real Shopify integration** (see SETUP_GUIDE.md)
2. ✅ **Configure Stripe billing** for real payments
3. ✅ **Add OpenAI API key** for real AI insights
4. ✅ **Deploy to production** (Vercel/Railway)
5. ✅ **Submit to Shopify App Store**

---

## Need Help?

- 📘 Full documentation: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 🚀 Quick start: [QUICK_START.md](./QUICK_START.md)
- 📖 Project overview: [README.md](./README.md)

---

**Enjoy exploring your sustainability analytics platform!** 🌱
