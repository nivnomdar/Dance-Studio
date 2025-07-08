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
- `GET /api/classes/slug/:slug` - Get class by slug
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Registrations
- `GET /api/registrations` - Get all registrations (admin only)
- `GET /api/registrations/my` - Get user's own registrations
- `GET /api/registrations/:id` - Get registration by ID
- `POST /api/registrations` - Create new registration
- `PUT /api/registrations/:id/status` - Update registration status (admin only)
- `DELETE /api/registrations/:id` - Delete registration

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

### Profiles
- `GET /api/profiles/me` - Get current user profile
- `PUT /api/profiles/me` - Update current user profile
- `GET /api/profiles` - Get all profiles (admin only)
- `GET /api/profiles/:id` - Get profile by ID (admin only)
- `PUT /api/profiles/:id` - Update profile (admin only)

## Data Models

### Registration
```typescript
interface Registration {
  id: string;
  class_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  experience?: string;
  selected_date: string;
  selected_time: string;
  notes?: string;
  status: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}
```

### Registration with Details
```typescript
interface RegistrationWithDetails extends Registration {
  class: {
    id: string;
    name: string;
    price: number;
    duration?: number;
    level?: string;
    category?: string;
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}
```

## Security

- ✅ **Authentication** required for all registration operations
- ✅ **Authorization** - users can only access their own registrations
- ✅ **Admin access** - admins can view and manage all registrations
- ✅ **Input validation** for all registration data
- ✅ **SQL injection protection** via Supabase client
- ✅ **CORS** configured for frontend access 