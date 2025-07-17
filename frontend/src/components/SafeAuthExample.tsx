import React from 'react';
import { useSafeAuth, useConditionalAuth } from '../hooks/useSafeAuth';
import { getSafeUserMetadata, getSafeFullName } from '../utils/authUtils';

/**
 * Example component demonstrating safe Supabase auth usage
 * This shows how to use the new safe auth patterns
 */
export const SafeAuthExample: React.FC = () => {
  // console.log('SafeAuthExample render at:', new Date().toISOString()); // Debug log
  const { 
    safeUser, 
    safeSession, 
    userInfo, 
    sessionInfo, 
    isAuthenticated, 
    loading, 
    profile,
    isAdmin,
    hasUsedTrialClass,
    isUserValid,
    isSessionValid,
    signOut 
  } = useSafeAuth();

  const { withValidUser, withValidSession } = useConditionalAuth();

  // Example of safe operation that only runs if user is valid
  const safeUserOperation = withValidUser((userId: string) => {
    // console.log('Performing operation with user:', userId);
    return `Operation completed for user: ${userId}`;
  }, 'No valid user');

  // Example of safe session operation
  const safeSessionOperation = withValidSession((token: string) => {
    // console.log('Performing operation with session token');
    return 'Session operation completed';
  }, 'No valid session');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h2>Not Authenticated</h2>
        <p>Please sign in to continue</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2>Safe Auth Example</h2>
      
      {/* User Information */}
      <div className="mb-4">
        <h3>User Information</h3>
        <p><strong>ID:</strong> {userInfo.id || 'N/A'}</p>
        <p><strong>Email:</strong> {userInfo.email || 'N/A'}</p>
        <p><strong>Full Name:</strong> {userInfo.fullName || 'N/A'}</p>
        <p><strong>Avatar:</strong> {userInfo.avatarUrl || 'No avatar'}</p>
      </div>

      {/* Session Information */}
      <div className="mb-4">
        <h3>Session Information</h3>
        <p><strong>Access Token:</strong> {sessionInfo.accessToken ? 'Present' : 'Missing'}</p>
        <p><strong>Token Type:</strong> {sessionInfo.tokenType || 'N/A'}</p>
        <p><strong>Expires In:</strong> {sessionInfo.expiresIn} seconds</p>
      </div>

      {/* Profile Information */}
      <div className="mb-4">
        <h3>Profile Information</h3>
        <p><strong>Role:</strong> {profile?.role || 'N/A'}</p>
        <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Has Used Trial Class:</strong> {hasUsedTrialClass ? 'Yes' : 'No'}</p>
        <p><strong>First Name:</strong> {profile?.first_name || 'N/A'}</p>
        <p><strong>Last Name:</strong> {profile?.last_name || 'N/A'}</p>
      </div>

      {/* Validation Status */}
      <div className="mb-4">
        <h3>Validation Status</h3>
        <p><strong>User Valid:</strong> {isUserValid() ? 'Yes' : 'No'}</p>
        <p><strong>Session Valid:</strong> {isSessionValid() ? 'Yes' : 'No'}</p>
      </div>

      {/* Safe Operations */}
      <div className="mb-4">
        <h3>Safe Operations</h3>
        <button 
          onClick={() => {
            const result = safeUserOperation(safeUser?.id || '');
            // console.log('Safe user operation result:', result);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Safe User Operation
        </button>
        
        <button 
          onClick={() => {
            const result = safeSessionOperation(safeSession?.access_token || '');
            // console.log('Safe session operation result:', result);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Safe Session Operation
        </button>
      </div>

      {/* Sign Out */}
      <div>
        <button 
          onClick={signOut}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

/**
 * Example of how to use safe auth in other components
 */
export const SafeAuthUsageExample: React.FC = () => {
  // console.log('SafeAuthUsageExample render at:', new Date().toISOString()); // Debug log
  const { safeUser, isUserValid, userInfo } = useSafeAuth();

  // Example: Safe access to user metadata
  const handleUserAction = () => {
    // Always check if user is valid before accessing data
    if (!isUserValid('user action')) {
      console.error('Cannot perform user action: user is not valid');
      return;
    }

    // Safe access to user metadata
    const metadata = getSafeUserMetadata(safeUser);
    const fullName = getSafeFullName(safeUser);
    
    // console.log('User metadata:', metadata);
    // console.log('Full name:', fullName);
    
    // Perform the actual operation
    // console.log('Performing user action...');
  };

  return (
    <div className="p-4">
      <h3>Safe Auth Usage Example</h3>
      <button 
        onClick={handleUserAction}
        className="bg-purple-500 text-white px-4 py-2 rounded"
      >
        Perform Safe User Action
      </button>
    </div>
  );
}; 