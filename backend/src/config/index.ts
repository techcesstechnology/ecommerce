import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
    },
    ecocash: {
      merchantId: process.env.ECOCASH_MERCHANT_ID || '',
      apiKey: process.env.ECOCASH_API_KEY || '',
      apiUrl: process.env.ECOCASH_API_URL || 'https://api.ecocash.co.zw',
    },
  },
  
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@freshroute.com',
  },
  
  currency: {
    default: process.env.DEFAULT_CURRENCY || 'USD',
    supported: (process.env.SUPPORTED_CURRENCIES || 'USD,ZWL').split(','),
    usdToZwlRate: parseFloat(process.env.USD_TO_ZWL_RATE || '1000'),
  },
  
  websocket: {
    port: parseInt(process.env.WS_PORT || '3001', 10),
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    sessionSecret: process.env.SESSION_SECRET || 'default-session-secret',
  },
  
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  },
};
