# Avigail Dance Studio Backend

Backend server for Avigail Dance Studio built with Express.js and TypeScript.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables:
   ```bash
   cp .env.example .env
   ```

## Development

Start the development server:
```bash
npm run dev
```

## Building

Build the project:
```bash
npm run build
```

## Testing

Run tests:
```bash
npm test
```

## Linting

Run linter:
```bash
npm run lint
```

## Formatting

Format code:
```bash
npm run format
```

## API Routes

### Authentication
- `GET /api/auth/session` - Get current session
- `POST /api/auth/google` - Sign in with Google
- `POST /api/auth/signout` - Sign out

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Shop
- `GET /api/shop/products` - Get all products
- `GET /api/shop/products/:id` - Get product by ID
- `POST /api/shop/products` - Create new product
- `PUT /api/shop/products/:id` - Update product
- `DELETE /api/shop/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Class Registrations
- `GET /api/registrations` - Get user's class registrations
- `GET /api/registrations/:id` - Get registration by ID
- `POST /api/registrations` - Register for a class
- `PUT /api/registrations/:id` - Update registration status 