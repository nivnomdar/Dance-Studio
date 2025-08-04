# Credit Management System

## Overview
This module provides centralized credit management functionality for the dance studio application. It handles all credit-related operations including deduction, addition, checking, and statistics.

## Files
- `creditManager.ts` - Main credit management utilities
- `README.md` - This documentation

## Functions

### Core Credit Operations

#### `deductCredit(userId: string, creditType: string): Promise<boolean>`
Deducts one credit from a user's subscription.
- **Parameters:**
  - `userId` - The user's ID
  - `creditType` - Credit type ('group' or 'private')
- **Returns:** `true` if successful, `false` otherwise
- **Usage:** Called when a user registers for a class using credits

#### `addCredit(userId: string, creditType: string): Promise<boolean>`
Adds one credit to a user's subscription.
- **Parameters:**
  - `userId` - The user's ID
  - `creditType` - Credit type ('group' or 'private')
- **Returns:** `true` if successful, `false` otherwise
- **Usage:** Called when a registration is cancelled and credit needs to be returned

### Credit Information

#### `getUserCredits(userId: string): Promise<any[]>`
Gets all credits for a specific user.
- **Parameters:**
  - `userId` - The user's ID
- **Returns:** Array of credit records
- **Usage:** Display user's available credits

#### `checkUserCredits(userId: string, creditType: string): Promise<CreditInfo>`
Checks if a user has credits for a specific type.
- **Parameters:**
  - `userId` - The user's ID
  - `creditType` - Credit type ('group' or 'private')
- **Returns:** Credit information object
- **Usage:** Validate credit availability before registration

### Admin Functions

#### `addCreditsToUser(userId: string, creditGroup: string, remainingCredits: number, expiresAt?: string): Promise<any>`
Adds credits to a user (admin only).
- **Parameters:**
  - `userId` - The user's ID
  - `creditGroup` - Credit group ('group' or 'private')
  - `remainingCredits` - Number of credits to add
  - `expiresAt` - Expiration date (optional)
- **Returns:** Created credit record
- **Usage:** Admin adding credits to users

#### `updateUserCredits(userId: string, creditId: string, remainingCredits: number, expiresAt?: string): Promise<any>`
Updates existing user credits (admin only).
- **Parameters:**
  - `userId` - The user's ID
  - `creditId` - Credit record ID
  - `remainingCredits` - New remaining credits
  - `expiresAt` - Expiration date (optional)
- **Returns:** Updated credit record
- **Usage:** Admin modifying existing credits

#### `deleteUserCredits(userId: string, creditId: string): Promise<void>`
Deletes user credits (admin only).
- **Parameters:**
  - `userId` - The user's ID
  - `creditId` - Credit record ID
- **Usage:** Admin removing credits from users

### Statistics and History

#### `getCreditStatistics(): Promise<CreditStatistics>`
Gets overall credit statistics (admin only).
- **Returns:** Credit statistics object
- **Usage:** Admin dashboard statistics

#### `getUserCreditHistory(userId: string): Promise<{credits: any[], creditRegistrations: any[]}>`
Gets credit history for a user (admin only).
- **Parameters:**
  - `userId` - The user's ID
- **Returns:** Credit history and registrations
- **Usage:** Admin viewing user's credit history

## Interfaces

### `CreditInfo`
```typescript
interface CreditInfo {
  hasCredits: boolean;
  totalCredits: number;
  credits: any[];
}
```

### `CreditStatistics`
```typescript
interface CreditStatistics {
  totalCredits: number;
  groupCredits: number;
  privateCredits: number;
  totalUsers: number;
  totalCreditRecords: number;
}
```

## API Endpoints

### Credit Management
- `GET /registrations/user/:userId/credits` - Get user's credits
- `GET /registrations/user/:userId/credits/check/:creditType` - Check credit availability
- `POST /registrations/user/:userId/credits` - Add credits (admin)
- `PUT /registrations/user/:userId/credits/:creditId` - Update credits (admin)
- `DELETE /registrations/user/:userId/credits/:creditId` - Delete credits (admin)

### Statistics
- `GET /registrations/credits/statistics` - Get credit statistics (admin)
- `GET /registrations/user/:userId/credits/history` - Get credit history (admin)

## Error Handling
All functions include comprehensive error handling and logging:
- Database errors are logged and handled gracefully
- Invalid parameters throw descriptive errors
- Failed operations return appropriate error responses
- All operations are logged for debugging

## Security
- Admin-only functions require admin role verification
- User credit access is restricted to own credits or admin access
- All database operations use parameterized queries
- Input validation is performed on all parameters

## Usage Examples

### Deducting Credits
```typescript
// When user registers with credit
const success = await deductCredit(userId, 'group');
if (!success) {
  // Handle failed credit deduction
}
```

### Adding Credits
```typescript
// When registration is cancelled
const success = await addCredit(userId, 'group');
if (!success) {
  // Handle failed credit addition
}
```

### Checking Credits
```typescript
// Before allowing registration
const creditInfo = await checkUserCredits(userId, 'group');
if (creditInfo.hasCredits) {
  // Allow registration
} else {
  // Show insufficient credits message
}
```

## Database Schema
The system works with the `subscription_credits` table:
- `id` - Primary key
- `user_id` - Foreign key to profiles
- `credit_group` - 'group' or 'private'
- `remaining_credits` - Number of available credits
- `expires_at` - Expiration date (optional)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp 