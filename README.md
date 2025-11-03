# FreshRoute Delivery Management System

A comprehensive delivery management system for FreshRoute e-commerce platform with real-time tracking, route optimization, and SMS notifications for Zimbabwe.

## Features

### Core Features
- **Driver Management**: Complete driver profile and availability management
- **Real-time Delivery Tracking**: Live location updates and WebSocket-based tracking
- **Route Optimization**: Intelligent route planning for Zimbabwe's road network
- **Delivery Status Updates**: Comprehensive status tracking from assignment to completion
- **SMS Notifications**: Automated customer notifications via SMS gateway

### Driver Management
- Driver profiles with vehicle information
- Availability status tracking
- Order assignment and management
- Route planning and optimization
- Delivery performance metrics

### Real-time Tracking
- Live location updates via WebSocket
- Estimated arrival times calculation
- Status change notifications
- Customer tracking interface
- Historical tracking data

## Technology Stack

- **Backend**: Node.js with TypeScript
- **Web Framework**: Express.js
- **Real-time Communication**: Socket.IO
- **Validation**: Joi
- **Testing**: Jest
- **Code Quality**: ESLint, TypeScript

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Zimbabwe phone format support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/edmundtafadzwa-commits/freshroute.git
cd freshroute
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
SMS_GATEWAY_URL=https://api.sms-gateway.zw/send
SMS_GATEWAY_API_KEY=your_api_key_here
SMS_SENDER_ID=FreshRoute
BASE_URL=http://localhost:3000
```

5. Build the project:
```bash
npm run build
```

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Quick Deploy to Replit

This repository is ready for one-click deployment to Replit:

1. **Import to Replit**:
   - Go to [Replit](https://replit.com)
   - Click "Create Repl"
   - Select "Import from GitHub"
   - Paste: `https://github.com/edmundtafadzwa-commits/freshroute`

2. **Configure Environment**:
   - The project will auto-detect Node.js
   - Environment variables are pre-configured for development
   - Optionally, add your SMS gateway credentials in the Secrets tab:
     - `SMS_GATEWAY_API_KEY`
     - `SMS_GATEWAY_URL`

3. **Run**:
   - Click the "Run" button
   - Server will start on port 3000
   - Access API at: `https://your-repl-name.your-username.repl.co`

4. **Test the API**:
   ```bash
   # Health check
   curl https://your-repl-name.your-username.repl.co/health
   
   # List drivers
   curl https://your-repl-name.your-username.repl.co/api/drivers
   ```

**Note**: Replit provides a publicly accessible URL automatically. The WebSocket connection will work with the same URL.

## Running Tests

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check
```http
GET /health
```

Returns server health status.

---

## Driver Endpoints

### List All Drivers
```http
GET /api/drivers
```

Query Parameters:
- `available` (optional): Filter by availability (`true`/`false`)

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "+263771234567",
      "email": "john@example.com",
      "vehicleType": "car",
      "vehicleNumber": "ABC1234",
      "status": "available",
      "isAvailable": true,
      "completedDeliveries": 15,
      "currentLocation": {
        "latitude": -17.8252,
        "longitude": 31.0335,
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Driver by ID
```http
GET /api/drivers/:id
```

### Create Driver
```http
POST /api/drivers
```

Request Body:
```json
{
  "name": "John Doe",
  "phone": "+263771234567",
  "email": "john@example.com",
  "vehicleType": "car",
  "vehicleNumber": "ABC1234"
}
```

Vehicle Types: `motorcycle`, `car`, `van`, `truck`

Phone Format: Zimbabwe format (`+263XXXXXXXXX` or `0XXXXXXXXX`)

Vehicle Number Format: `ABC1234` (3 letters + 4 digits)

### Update Driver
```http
PUT /api/drivers/:id
```

Request Body (all fields optional):
```json
{
  "name": "John Doe",
  "phone": "+263771234567",
  "status": "available",
  "isAvailable": true
}
```

### Update Driver Location
```http
PUT /api/drivers/location
```

Request Body:
```json
{
  "driverId": "uuid",
  "location": {
    "latitude": -17.8252,
    "longitude": 31.0335
  }
}
```

### Assign Driver to Delivery
```http
POST /api/drivers/assign
```

Request Body:
```json
{
  "driverId": "uuid",
  "deliveryId": "uuid"
}
```

### Get Optimized Routes
```http
GET /api/drivers/routes
```

Query Parameters:
- `driverId` (optional): Specific driver ID
- `deliveryIds` (optional): Comma-separated delivery IDs

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "driverId": "uuid",
    "deliveries": ["delivery-id-1", "delivery-id-2"],
    "waypoints": [
      {
        "latitude": -17.8252,
        "longitude": 31.0335,
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalDistance": 15.5,
    "estimatedDuration": 23.25,
    "optimized": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Driver's Deliveries
```http
GET /api/drivers/:id/deliveries
```

---

## Delivery Endpoints

### List All Deliveries
```http
GET /api/deliveries
```

Query Parameters:
- `status` (optional): Filter by status
- `driverId` (optional): Filter by driver

Status values: `pending`, `assigned`, `picked_up`, `in_transit`, `delivered`, `failed`, `cancelled`

### Get Delivery by ID
```http
GET /api/deliveries/:id
```

Response includes tracking information and current location.

### Create Delivery
```http
POST /api/deliveries
```

Request Body:
```json
{
  "orderId": "uuid",
  "customerName": "John Customer",
  "customerPhone": "+263771234567",
  "pickupLocation": {
    "street": "123 Main Street",
    "city": "Harare",
    "province": "Harare",
    "coordinates": {
      "latitude": -17.8252,
      "longitude": 31.0335
    }
  },
  "deliveryLocation": {
    "street": "456 Delivery Street",
    "city": "Harare",
    "province": "Harare",
    "coordinates": {
      "latitude": -17.8300,
      "longitude": 31.0400
    }
  },
  "notes": "Please call on arrival"
}
```

Zimbabwe Provinces: `Harare`, `Bulawayo`, `Manicaland`, `Mashonaland Central`, `Mashonaland East`, `Mashonaland West`, `Masvingo`, `Matabeleland North`, `Matabeleland South`, `Midlands`

### Update Delivery Status
```http
PUT /api/deliveries/:id/status
```

Request Body:
```json
{
  "status": "in_transit",
  "notes": "Optional notes"
}
```

Automatically sends SMS notifications to customers based on status changes.

### Initialize Tracking
```http
POST /api/deliveries/track
```

Request Body:
```json
{
  "deliveryId": "uuid"
}
```

### Get Tracking Information
```http
GET /api/deliveries/:id/tracking
```

Response:
```json
{
  "success": true,
  "data": {
    "delivery": { /* delivery object */ },
    "currentLocation": {
      "latitude": -17.8252,
      "longitude": 31.0335,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "latestUpdate": { /* tracking update object */ },
    "trackingHistory": [ /* array of tracking updates */ ]
  }
}
```

### Get Pending Deliveries
```http
GET /api/deliveries/pending
```

### Get Active Deliveries
```http
GET /api/deliveries/active
```

Returns deliveries with status: `assigned`, `picked_up`, or `in_transit`

---

## WebSocket Events

Connect to WebSocket server:
```javascript
const socket = io('http://localhost:3000');
```

### Client → Server Events

#### Update Driver Location
```javascript
socket.emit('driver:location:update', {
  driverId: 'uuid',
  location: {
    latitude: -17.8252,
    longitude: 31.0335
  },
  deliveryId: 'uuid' // optional
});
```

#### Subscribe to Delivery Tracking
```javascript
socket.emit('delivery:track', {
  deliveryId: 'uuid'
});
```

#### Update Driver Status
```javascript
socket.emit('driver:status:update', {
  driverId: 'uuid',
  status: 'available',
  isAvailable: true
});
```

#### Update Delivery Status
```javascript
socket.emit('delivery:status:update', {
  deliveryId: 'uuid',
  status: 'in_transit',
  notes: 'Optional notes'
});
```

### Server → Client Events

#### Location Update
```javascript
socket.on('location:update', (data) => {
  console.log(data);
  // {
  //   deliveryId: 'uuid',
  //   location: { latitude, longitude },
  //   timestamp: '2024-01-15T10:30:00.000Z'
  // }
});
```

#### Status Update
```javascript
socket.on('status:update', (data) => {
  console.log(data);
  // {
  //   deliveryId: 'uuid',
  //   status: 'in_transit',
  //   timestamp: '2024-01-15T10:30:00.000Z'
  // }
});
```

#### Tracking Data
```javascript
socket.on('delivery:tracking:data', (data) => {
  console.log(data);
  // {
  //   delivery: { /* delivery object */ },
  //   currentLocation: { /* location */ },
  //   trackingHistory: [ /* updates */ ]
  // }
});
```

#### Error Handling
```javascript
socket.on('error', (error) => {
  console.error(error);
  // { message: 'Error description' }
});
```

---

## SMS Notifications

The system automatically sends SMS notifications for:

1. **Delivery Assigned**: When a driver is assigned
2. **Delivery Picked Up**: When order is picked up
3. **Delivery In Transit**: When delivery is nearby
4. **Delivery Completed**: When delivery is successful
5. **Delivery Failed**: When delivery cannot be completed

### SMS Configuration

Configure SMS gateway in `.env`:
```env
SMS_GATEWAY_URL=https://api.sms-gateway.zw/send
SMS_GATEWAY_API_KEY=your_api_key_here
SMS_SENDER_ID=FreshRoute
```

Popular Zimbabwe SMS providers:
- Econet SMS Gateway
- NetOne SMS Gateway
- Telecel SMS Gateway

---

## Route Optimization

The system uses a nearest neighbor algorithm for route optimization:

1. **Input**: Driver location and list of deliveries
2. **Algorithm**: Greedy nearest neighbor selection
3. **Output**: Optimized sequence of waypoints
4. **Metrics**: Total distance and estimated duration

Average speed assumption: 40 km/h (Zimbabwe urban areas)

---

## Error Handling

All API responses follow this format:

Success:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Error:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error details"] // optional
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `404`: Not Found
- `500`: Internal Server Error

---

## Development

### Project Structure
```
backend/src/
├── delivery/
│   ├── controllers/
│   │   ├── delivery.controller.ts
│   │   └── driver.controller.ts
│   ├── services/
│   │   ├── delivery.service.ts
│   │   ├── driver.service.ts
│   │   ├── route.service.ts
│   │   └── tracking.service.ts
│   └── validators/
│       ├── delivery.validator.ts
│       └── driver.validator.ts
├── websocket/
│   └── location.handler.ts
├── notifications/
│   └── sms.service.ts
├── routes/
│   ├── delivery.routes.ts
│   └── driver.routes.ts
├── types/
│   └── index.ts
└── index.ts
```

### Code Quality

Linting:
```bash
npm run lint
```

Building:
```bash
npm run build
```

---

## Mobile App Integration

### Driver Mobile App

The driver app should:
1. Connect to WebSocket for real-time updates
2. Send location updates every 30 seconds
3. Update delivery status at each stage
4. Display optimized route navigation

Example implementation:
```javascript
// Connect to WebSocket
const socket = io('http://api.freshroute.zw');

// Send location updates
setInterval(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('driver:location:update', {
      driverId: currentDriverId,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      deliveryId: currentDeliveryId
    });
  });
}, 30000); // every 30 seconds
```

### Customer Tracking App

The customer app should:
1. Subscribe to delivery tracking
2. Display real-time driver location
3. Show delivery status updates
4. Display estimated arrival time

---

## Production Deployment

### Environment Configuration

Set production environment variables:
```env
NODE_ENV=production
PORT=3000
SMS_GATEWAY_URL=https://api.sms-gateway.zw/send
SMS_GATEWAY_API_KEY=production_key
SMS_SENDER_ID=FreshRoute
BASE_URL=https://api.freshroute.zw
```

### Security Considerations

1. **API Rate Limiting**: Implement rate limiting for API endpoints
2. **Authentication**: Add JWT authentication for driver/admin endpoints
3. **HTTPS**: Use HTTPS in production
4. **Input Validation**: All inputs are validated using Joi schemas
5. **CORS**: Configure CORS for specific origins
6. **Environment Variables**: Never commit `.env` file

### Database Integration

Current implementation uses in-memory storage. For production:
1. Integrate with MongoDB or PostgreSQL
2. Implement proper data persistence
3. Add database migrations
4. Implement connection pooling

### Monitoring

Recommended monitoring tools:
1. **Application Monitoring**: New Relic, DataDog
2. **Error Tracking**: Sentry
3. **Logging**: Winston, Bunyan
4. **Metrics**: Prometheus + Grafana

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

## License

ISC

---

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@freshroute.zw

---

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial release
- Driver management system
- Delivery tracking
- Route optimization
- SMS notifications
- WebSocket real-time updates

