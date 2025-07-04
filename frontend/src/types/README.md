# Types Structure

This directory contains all TypeScript interfaces and types used throughout the frontend application.

## File Structure

### `index.ts`
Main entry point that re-exports all types for easy importing.

### `product.ts`
Product-related interfaces:
- `Product` - Main product interface with all product details

### `auth.ts`
Authentication and user-related interfaces:
- `AuthContextType` - Authentication context interface
- `UserProfile` - User profile data interface

### `cart.ts`
Shopping cart-related interfaces:
- `CartItem` - Individual cart item interface
- `CartContextType` - Cart context interface
- `CartProviderProps` - Cart provider props interface

### `popup.ts`
Popup notification interfaces:
- `PopupContent` - Popup content structure
- `PopupContextType` - Popup context interface

### `common.ts`
Common/shared interfaces:
- `ProviderProps` - Generic provider props
- `ApiResponse<T>` - Generic API response wrapper
- `PaginationParams` - Pagination parameters
- `PaginatedResponse<T>` - Paginated response wrapper

## Usage

```typescript
// Import specific types
import { Product } from '../types/product';
import { AuthContextType } from '../types/auth';

// Or import all types
import * as Types from '../types';
```

## Best Practices

1. **Keep interfaces focused** - Each file should contain related interfaces
2. **Use descriptive names** - Interface names should clearly indicate their purpose
3. **Export everything** - All interfaces should be exported for reusability
4. **Document complex types** - Add JSDoc comments for complex interfaces
5. **Use generics** - For reusable patterns like API responses and pagination 