# Payment Integration Setup - Pesepay & EcoCash

This document explains how to configure payment processing for the FreshRoute e-commerce platform using Pesepay payment gateway for EcoCash mobile money and card payments.

## Overview

FreshRoute uses **Pesepay** as the payment gateway to process:
- **EcoCash** mobile money payments (most popular in Zimbabwe)
- **Visa/Mastercard** payments
- **Cash on Delivery** (no gateway needed)

## Environment Variables

Add these variables to your `.env` file in the `backend` directory:

### Required for Pesepay Integration

```env
# Pesepay API Configuration
PESEPAY_INTEGRATION_KEY=your_integration_key_here
PESEPAY_ENCRYPTION_KEY=your_encryption_key_here
PESEPAY_ENVIRONMENT=sandbox  # or 'production' for live payments

# API and Frontend URLs (for callbacks)
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5000
```

### For Development/Testing

If you don't have Pesepay API keys yet, the system will run in **mock mode** for development:
- Payments will be simulated
- No actual money will be processed
- Payment status will automatically change to "paid" after 10 seconds

## Getting Pesepay API Keys

### 1. Register for Pesepay Account

1. Visit [https://pesepay.com](https://pesepay.com)
2. Click "Sign Up" to create a merchant account
3. Complete the registration form
4. Submit KYC documents (typically verified within 30 minutes to 1 hour)

### 2. Get Your API Keys

After approval:
1. Log into your Pesepay merchant dashboard
2. Navigate to **Settings** → **API Keys**
3. Copy your:
   - **Integration Key** (public key)
   - **Encryption Key** (secret key)
4. Add these to your `.env` file

### 3. Configure Webhook URLs

In your Pesepay dashboard, set the callback URLs:
- **Result URL**: `https://your-domain.com/api/payments/pesepay/callback`
- **Return URL**: `https://your-domain.com/payment/complete`

Replace `your-domain.com` with your actual domain or Replit URL.

## Payment Methods Supported

### EcoCash (Payment Method Code: `PZW201`)

- **Currency**: ZWL (Zimbabwe Dollar) or USD
- **Min Amount**: $2.00
- **Max Amount**: $50,000
- **Requirements**: Customer phone number linked to EcoCash account
- **Flow**: Seamless (no redirect)

### Visa/Mastercard (Payment Method Code: `PZW203`)

- **Currency**: ZWL or USD
- **Requirements**: Valid card details
- **Flow**: Seamless payment form

### Cash on Delivery

- **No payment gateway** - customer pays on delivery
- **Order created immediately**
- Payment marked as "pending" until delivery

## Testing

### Sandbox Mode

When `PESEPAY_ENVIRONMENT=sandbox`, use Pesepay's test credentials:

**Test EcoCash Number**: `+263 77 123 4567`  
**Test PIN**: Any 4-digit PIN

### Mock Mode (No API Keys)

If Pesepay keys are not configured:
- Payment transactions are created in database
- Status automatically changes to "paid" after 10 seconds
- Useful for local development and testing

## How It Works

### 1. Checkout Flow

```
User adds items to cart
    ↓
Proceeds to checkout
    ↓
Enters shipping address and selects payment method
    ↓
[If EcoCash] Enters phone number
    ↓
Submits order
    ↓
Order created in database
    ↓
Redirected to payment page
```

### 2. Payment Processing (EcoCash)

```
Payment initiated with Pesepay API
    ↓
Payment transaction recorded in database
    ↓
Pesepay sends USSD prompt to customer's phone
    ↓
Customer enters EcoCash PIN on their phone
    ↓
Payment confirmed by Pesepay
    ↓
Frontend polls payment status every 5 seconds
    ↓
Payment status updated to "paid"
    ↓
Order status updated to "confirmed"
    ↓
User redirected to order success page
```

### 3. Payment Status Polling

The frontend payment page automatically:
- Polls payment status every 5 seconds
- Displays real-time status updates
- Shows transaction reference for tracking
- Redirects to success page when payment is confirmed
- Handles failures with retry option

## Database Schema

### Payment Transactions Table

Stores all payment transaction details:

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| order_id | integer | Foreign key to orders table |
| user_id | integer | Foreign key to users table |
| provider | varchar(50) | Payment provider (pesepay, paynow, stripe) |
| provider_transaction_id | varchar(255) | Pesepay's transaction ID |
| poll_url | varchar(500) | URL to check payment status |
| redirect_url | varchar(500) | URL for redirected payments |
| payment_method | varchar(50) | ecocash, visa, onemoney, cash |
| payment_method_code | varchar(20) | PZW201 (EcoCash), PZW203 (Visa) |
| amount | decimal(10,2) | Payment amount |
| currency | varchar(10) | ZWL or USD |
| status | varchar(20) | pending, processing, paid, failed, cancelled |
| customer_phone | varchar(50) | Customer's phone number |
| transaction_reference | varchar(255) | Unique reference (FR-TIMESTAMP-RANDOM) |
| error_message | text | Error details if payment fails |
| paid_at | timestamp | When payment was confirmed |

## API Endpoints

### Initiate Payment

**POST** `/api/payments/initiate`

```json
{
  "orderId": 123,
  "paymentMethod": "ecocash",
  "customerPhone": "+263771234567",
  "currency": "ZWL"
}
```

### Check Payment Status

**GET** `/api/payments/status/:transactionReference`

Response:
```json
{
  "success": true,
  "data": {
    "transactionId": 456,
    "transactionReference": "FR-1699123456-ABC123",
    "status": "paid",
    "amount": 150.00,
    "currency": "ZWL",
    "paymentMethod": "ecocash",
    "paidAt": "2025-11-07T12:00:00Z"
  }
}
```

### Pesepay Webhook

**POST** `/api/payments/pesepay/callback` (Public endpoint)

Receives payment confirmation from Pesepay.

## Troubleshooting

### Payment stuck on "Processing"

- **Check**: Customer completed EcoCash PIN entry on their phone
- **Check**: Network connectivity between server and Pesepay
- **Solution**: Payment will auto-timeout after 5 minutes; customer can retry

### "Invalid API keys" error

- **Check**: `PESEPAY_INTEGRATION_KEY` and `PESEPAY_ENCRYPTION_KEY` in `.env`
- **Check**: Keys are for correct environment (sandbox vs production)
- **Solution**: Verify keys in Pesepay dashboard

### Payments not updating

- **Check**: Frontend is polling payment status
- **Check**: Browser console for errors
- **Check**: Backend logs for Pesepay API responses
- **Solution**: Ensure API_URL is accessible from frontend

## Security Considerations

1. **Never expose API keys** - Keep encryption keys secret
2. **HTTPS only** - Use SSL for all payment transactions in production
3. **Webhook validation** - Verify Pesepay webhook signatures (future enhancement)
4. **Phone number validation** - Validate format before sending to Pesepay
5. **Amount validation** - Verify payment amount matches order total

## Production Deployment

### 1. Update Environment

```env
PESEPAY_ENVIRONMENT=production
PESEPAY_INTEGRATION_KEY=prod_key_here
PESEPAY_ENCRYPTION_KEY=prod_encryption_key_here
API_URL=https://your-production-domain.com
FRONTEND_URL=https://your-production-domain.com
```

### 2. Test Thoroughly

- Test small EcoCash payment (minimum $2)
- Verify payment confirmation emails
- Check order status updates correctly
- Test payment failures and retries

### 3. Monitor

- Set up alerts for failed payments
- Monitor Pesepay dashboard for transaction status
- Review payment transaction logs regularly

## Support

- **Pesepay Documentation**: https://developers.pesepay.com
- **Pesepay Support**: support@pesepay.com
- **EcoCash Merchant Support**: Via Econet shops

## Future Enhancements

- [ ] Add webhook signature verification
- [ ] Implement refund functionality
- [ ] Add payment receipt generation
- [ ] Support for OneMoney mobile money
- [ ] Multi-currency support (USD/ZWL toggle)
- [ ] Payment analytics dashboard
