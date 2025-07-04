# Backend Types Structure

This directory contains all TypeScript interfaces and types used throughout the backend application.

## File Structure

### `index.ts`
Main entry point that re-exports all types for easy importing.

### `models.ts`
Database model interfaces:
- `Order` - Order entity interface
- `ClassRegistration` - Class registration entity interface
- `Product` - Product entity interface
- `DanceClass` - Dance class entity interface
- `UserProfile` - User profile entity interface

### `api.ts`
API-related interfaces:
- `ApiResponse<T>` - Generic API response wrapper
- `PaginationParams` - Pagination parameters
- `PaginatedResponse<T>` - Paginated response wrapper
- `CreateOrderRequest` - Order creation request interface
- `CreateClassRegistrationRequest` - Class registration request interface
- `UpdateProfileRequest` - Profile update request interface

### `database.ts`
Database and Express-related interfaces:
- `DatabaseConfig` - Database configuration interface
- `DatabaseConnection` - Database connection status interface
- `QueryResult<T>` - Database query result wrapper
- Express Request extension with user property

## Usage

```typescript
// Import specific types
import { Order, Product } from '../types/models';
import { ApiResponse } from '../types/api';

// Or import all types
import * as Types from '../types';
```

## Migration from Old Structure

The old `interfaces.ts` and `types.d.ts` files are now deprecated and re-export from the new structure for backward compatibility. New code should use the new organized structure.

## Best Practices

1. **Separate concerns** - Models, API types, and database types are in separate files
2. **Use generics** - For reusable patterns like API responses and query results
3. **Maintain backward compatibility** - Old imports still work during migration
4. **Document complex types** - Add JSDoc comments for complex interfaces
5. **Consistent naming** - Use consistent naming conventions across all files 