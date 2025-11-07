# FreshRoute Admin Guide

## ✅ Admin Account Created!

Your admin account is ready to use:

**Email:** `admin@freshroute.co.zw`  
**Password:** `Admin123!`

⚠️ **Important:** Change this password after your first login!

---

## How to Add Products

### Option 1: Using the Admin API (Recommended for bulk adding)

#### Step 1: Login to Get Your Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@freshroute.co.zw",
    "password": "Admin123!"
  }'
```

Save the `token` from the response - you'll need it for all admin operations.

#### Step 2: Add Products

Use this template to add products:

```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Product Name",
    "description": "Product description",
    "price": 5.99,
    "categoryId": 1,
    "stockQuantity": 100,
    "unit": "kg",
    "imageUrl": "https://example.com/image.jpg",
    "isFeatured": true
  }'
```

### Option 2: Using Browser/JavaScript

You can also add products from your browser's developer console:

```javascript
// 1. Login first
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@freshroute.co.zw',
    password: 'Admin123!'
  })
});
const { data } = await loginResponse.json();
const token = data.token;

// 2. Add a product
const productResponse = await fetch('http://localhost:3000/api/admin/products', {
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
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1546470427-227d2f2d7a1e'
  })
});
const product = await productResponse.json();
console.log('Product created:', product);
```

---

## Available Categories

| ID | Category Name      | Use For                    |
|----|-------------------|----------------------------|
| 1  | Fresh Produce     | Fruits, vegetables         |
| 2  | Dairy & Eggs      | Milk, cheese, eggs         |
| 3  | Meat & Seafood    | Beef, chicken, fish        |
| 4  | Bakery            | Bread, cakes, pastries     |
| 5  | Pantry            | Rice, pasta, canned goods  |

---

## Sample Products to Get Started

Copy and paste these into your browser console (after logging in):

```javascript
const products = [
  {
    name: "Fresh Tomatoes",
    description: "Locally grown ripe tomatoes",
    price: 2.50,
    categoryId: 1,
    stockQuantity: 100,
    unit: "kg",
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1546470427-227d2f2d7a1e"
  },
  {
    name: "Full Cream Milk",
    description: "Fresh farm milk, 1 liter",
    price: 1.80,
    categoryId: 2,
    stockQuantity: 50,
    unit: "liter",
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b"
  },
  {
    name: "Whole Wheat Bread",
    description: "Freshly baked daily",
    price: 1.20,
    categoryId: 4,
    stockQuantity: 30,
    unit: "piece",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff"
  },
  {
    name: "Fresh Chicken Breasts",
    description: "Boneless, skinless chicken breast",
    price: 8.99,
    categoryId: 3,
    stockQuantity: 25,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791"
  },
  {
    name: "White Rice",
    description: "Premium long grain rice, 2kg pack",
    price: 3.50,
    categoryId: 5,
    stockQuantity: 75,
    unit: "pack",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c"
  }
];

// Add all products
for (const product of products) {
  const response = await fetch('http://localhost:3000/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Use the token from login
    },
    body: JSON.stringify(product)
  });
  const result = await response.json();
  console.log('Added:', result.data?.name || result.message);
}
```

---

## Complete Admin API Reference

### Product Management

```bash
# List all products
GET /api/products

# Get single product
GET /api/products/:id

# Create product (admin only)
POST /api/admin/products

# Update product (admin only)
PUT /api/admin/products/:id

# Delete product (admin only)
DELETE /api/admin/products/:id

# Update stock (admin only)
PATCH /api/admin/products/:id/stock
{
  "stockQuantity": 50
}
```

### Category Management

```bash
# List categories
GET /api/categories

# Create category (admin only)
POST /api/admin/categories
{
  "name": "Category Name",
  "slug": "category-slug",
  "description": "Description"
}

# Update category (admin only)
PUT /api/admin/categories/:id

# Delete category (admin only)
DELETE /api/admin/categories/:id
```

### Order Management

```bash
# View all orders (admin only)
GET /api/admin/orders

# Update order status (admin only)
PATCH /api/admin/orders/:id/status
{
  "status": "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
}
```

### User Management

```bash
# View all users (admin only)
GET /api/admin/users

# Update user role (admin only)
PATCH /api/admin/users/:id/role
{
  "role": "customer" | "admin" | "vendor"
}
```

---

## Need a Visual Interface?

If you'd prefer a graphical admin panel instead of using API calls, I can build you a complete admin dashboard with:

✅ Product management (add, edit, delete with forms)  
✅ Stock management  
✅ Order management and status updates  
✅ User management  
✅ Sales analytics and reports  
✅ Category management  

Just ask me to **"build an admin panel"** and I'll create it for you!

---

## Security Tips

1. **Change the default password** immediately after first login
2. **Don't share your admin token** - it gives full access to your system
3. **Keep your admin credentials secure**
4. Consider creating separate admin accounts for different team members
5. Tokens expire - you'll need to login again when they do

---

## Quick Start Checklist

- [x] Admin account created: `admin@freshroute.co.zw`
- [ ] Login to get your auth token
- [ ] Add your first product
- [ ] Test the product appears on your website
- [ ] Change your password
- [ ] Add more products or request an admin panel

Happy selling! 🛒✨
