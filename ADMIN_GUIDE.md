# Admin Guide: Adding Products to FreshRoute

## Step 1: Create an Admin User

Since you don't have any users yet, first register an account through your web app:

1. Go to your website: `https://[your-replit-url].replit.dev`
2. Click "Register" and create an account
3. After registration, come back here and we'll upgrade your account to admin

Then run this SQL command in the Replit Database panel (or I can do it for you):

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Step 2: Login to Get Your Auth Token

Use your API to login and get an authentication token:

**Using curl:**
```bash
curl -X POST https://[your-replit-url].replit.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "your-email@example.com",
      "name": "Your Name",
      "role": "admin"
    }
  }
}
```

Save the `token` value - you'll need it for all admin operations.

## Step 3: Add Products

Now you can add products using the admin API:

**Endpoint:** `POST /api/admin/products`

**Required Fields:**
- `name` - Product name
- `price` - Product price (number)
- `categoryId` - Category ID (1-10, see categories below)

**Optional Fields:**
- `description` - Product description
- `stockQuantity` - Stock level (default: 0)
- `imageUrl` - Product image URL
- `unit` - Unit of measurement (kg, liter, piece, etc.)
- `weight` - Weight in kg
- `isOrganic` - Is product organic (true/false)
- `isFeatured` - Should appear on homepage (true/false)

### Available Categories

| ID | Category Name      | Slug           |
|----|-------------------|----------------|
| 1  | Fresh Produce     | fresh-produce  |
| 2  | Dairy & Eggs      | dairy-eggs     |
| 3  | Meat & Seafood    | meat-seafood   |
| 4  | Bakery            | bakery         |
| 5  | Pantry            | pantry         |

### Example: Add a Product

**Using curl:**
```bash
curl -X POST https://[your-replit-url].replit.dev/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Fresh Tomatoes",
    "description": "Locally grown ripe tomatoes",
    "price": 2.50,
    "categoryId": 1,
    "stockQuantity": 100,
    "unit": "kg",
    "weight": 1,
    "isOrganic": true,
    "isFeatured": true,
    "imageUrl": "https://images.unsplash.com/photo-1546470427-227d2f2d7a1e"
  }'
```

**Using JavaScript (in your browser console or Node.js):**
```javascript
const token = 'YOUR_TOKEN_HERE';

fetch('https://[your-replit-url].replit.dev/api/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Fresh Tomatoes',
    description: 'Locally grown ripe tomatoes',
    price: 2.50,
    categoryId: 1,
    stockQuantity: 100,
    unit: 'kg',
    weight: 1,
    isOrganic: true,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1546470427-227d2f2d7a1e'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Step 4: Manage Products

Once you've added products, you can:

### View All Products
```bash
GET /api/products
```

### Update a Product
```bash
PUT /api/admin/products/:id
# Use same fields as create
```

### Delete a Product
```bash
DELETE /api/admin/products/:id
```

### Update Stock
```bash
PATCH /api/admin/products/:id/stock
{
  "stockQuantity": 50
}
```

## Option: Build an Admin Panel

If you'd like a visual interface instead of using curl/API calls, I can build you an admin panel with:
- Product management (add, edit, delete)
- Category management
- Order management
- User management
- Dashboard with analytics

Just ask me to "build an admin panel" and I'll create it for you!

## Quick Reference: Sample Products

Here are some example products you can add:

```json
[
  {
    "name": "Fresh Tomatoes",
    "description": "Locally grown ripe tomatoes",
    "price": 2.50,
    "categoryId": 1,
    "stockQuantity": 100,
    "unit": "kg",
    "isFeatured": true,
    "imageUrl": "https://images.unsplash.com/photo-1546470427-227d2f2d7a1e"
  },
  {
    "name": "Fresh Milk",
    "description": "Full cream fresh milk",
    "price": 1.80,
    "categoryId": 2,
    "stockQuantity": 50,
    "unit": "liter",
    "imageUrl": "https://images.unsplash.com/photo-1563636619-e9143da7973b"
  },
  {
    "name": "Whole Wheat Bread",
    "description": "Freshly baked whole wheat bread",
    "price": 1.20,
    "categoryId": 4,
    "stockQuantity": 30,
    "unit": "piece",
    "imageUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff"
  }
]
```
