# How to Enable Redis Caching for FreshRoute

This guide will help you set up free Redis caching for your FreshRoute production deployment using Upstash.

## What is Redis?

Redis is a high-speed caching system that stores frequently-used data in memory, making your app load faster. It's completely optional, but recommended for better performance under heavy traffic.

---

## Step 1: Create a Free Upstash Account

1. Go to **[upstash.com](https://upstash.com)**
2. Click **"Sign Up"** and create a free account
3. Verify your email address

---

## Step 2: Create a Redis Database

1. After logging in, click **"Create Database"**
2. Configure your database:
   - **Name**: FreshRoute-Production
   - **Type**: Regional (recommended) or Global
   - **Region**: Choose the closest to Zimbabwe (e.g., EU-West or US-East)
   - **Eviction**: Select "No eviction" (recommended)
3. Click **"Create"**

---

## Step 3: Get Your Redis Connection URL

1. On your database dashboard, look for the **"REST API"** or **"Connect"** section
2. You'll see a connection string that looks like:
   ```
   redis://default:[PASSWORD]@[HOST]:[PORT]
   ```
   **Example:**
   ```
   redis://default:AZaBc123xyz@us1-famous-ant-12345.upstash.io:6379
   ```
3. **Copy this entire URL** - you'll need it in the next step

---

## Step 4: Add Redis URL to Replit Secrets

Now you need to add this URL as a secret environment variable in your Replit project:

1. In your Replit project, open the **Tools** panel (left sidebar)
2. Click **"Secrets"** (lock icon)
3. Add a new secret:
   - **Key**: `REDIS_URL`
   - **Value**: Paste your Redis connection URL from Step 3
4. Click **"Add secret"**

---

## Step 5: Deploy Your App

That's it! Once you add the `REDIS_URL` secret and deploy your app:

✅ Redis caching will be **automatically enabled**
✅ Your app will store frequently-accessed data in Redis
✅ Page loads will be faster, especially for product listings
✅ Database load will be reduced

---

## How to Verify Redis is Working

After deployment, check your application logs. You should see:

✅ **Success Message:**
```
✅ Redis connected successfully
Redis client ready
```

❌ **If Redis fails:**
```
❌ Error during database connection
⚠️  Continuing without Redis - caching will be disabled
```

If you see the error message, double-check:
- Your `REDIS_URL` secret is correctly added
- The URL is complete and properly formatted
- Your Upstash database is active

---

## Free Tier Limits (Upstash)

The free tier includes:
- **256 MB storage** - More than enough for caching
- **500,000 commands per month** - Plenty for small to medium traffic
- **10 GB bandwidth per month**

This is perfect for getting started. You can upgrade later if needed.

---

## What Gets Cached?

Your FreshRoute app caches:
- Product listings and details
- Category information
- User sessions
- Shopping cart data (for faster retrieval)

Cache duration: **1 hour** (automatically refreshes when needed)

---

## Need Help?

If you run into issues:
1. Check your Upstash dashboard to ensure the database is active
2. Verify the `REDIS_URL` secret in Replit is correct
3. Check your deployment logs for error messages
4. Contact Upstash support at support@upstash.com

---

## Alternative: Running Without Redis

Your app works perfectly fine without Redis! If you choose not to set up Redis:
- All functionality remains intact
- Data is fetched directly from PostgreSQL
- Slightly slower under heavy traffic, but still fast for normal use

You can always add Redis later when your app grows.
