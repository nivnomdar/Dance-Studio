import { supabase } from '../database';
import { logger } from './logger';

/**
 * Credit management utilities
 * Provides centralized functions for credit operations
 */

export interface CreditInfo {
  hasCredits: boolean;
  totalCredits: number;
  credits: any[];
}

export interface CreditStatistics {
  totalCredits: number;
  groupCredits: number;
  privateCredits: number;
  totalUsers: number;
  totalCreditRecords: number;
}

/**
 * Deduct one credit from user's subscription
 * @param userId - User ID
 * @param creditType - Credit type ('group' or 'private')
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export const deductCredit = async (userId: string, creditType: string): Promise<boolean> => {
  try {
    logger.info(`Attempting to deduct credit for user ${userId}, credit_type: ${creditType}`);
    
    // Get current credits for the user
    const { data: currentCredits, error: creditsError } = await supabase
      .from('subscription_credits')
      .select('*')
      .eq('user_id', userId)
      .eq('credit_group', creditType)
      .gt('remaining_credits', 0)
      .order('created_at', { ascending: true }) // Use oldest credits first
      .limit(1)
      .single();

    logger.info(`Credit query result - data: ${JSON.stringify(currentCredits)}, error: ${creditsError}`);
    logger.info(`Credit query details - user_id: ${userId}, credit_type: ${creditType}, found: ${!!currentCredits}`);

    if (creditsError && creditsError.code !== 'PGRST116') {
      logger.error('Error fetching current credits:', creditsError);
      return false;
    }

    if (!currentCredits || currentCredits.remaining_credits <= 0) {
      logger.warn(`No credits available for user ${userId}, credit_type: ${creditType}`);
      return false;
    }

    logger.info(`Found credits for user ${userId} - id: ${currentCredits.id}, remaining: ${currentCredits.remaining_credits}`);

    // Update existing credits
    const newRemainingCredits = currentCredits.remaining_credits - 1;
    logger.info(`Updating credits for user ${userId} - from ${currentCredits.remaining_credits} to ${newRemainingCredits}`);
    
    const { error: updateError } = await supabase
      .from('subscription_credits')
      .update({ 
        remaining_credits: newRemainingCredits
      })
      .eq('id', currentCredits.id);

    if (updateError) {
      logger.error('Failed to update credits:', updateError);
      return false;
    }

    logger.info(`Credit deducted successfully for user ${userId}, credit_type: ${creditType}, remaining: ${newRemainingCredits}`);
    return true;
  } catch (error) {
    logger.error('Error in deductCredit:', error);
    return false;
  }
};

/**
 * Add one credit to user's subscription
 * @param userId - User ID
 * @param creditType - Credit type ('group' or 'private')
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export const addCredit = async (userId: string, creditType: string): Promise<boolean> => {
  try {
    logger.info(`Attempting to add credit for user ${userId}, credit_type: ${creditType}`);
    
    // Try to reuse an existing row for this user and credit_group
    const { data: existingList, error: fetchError } = await supabase
      .from('subscription_credits')
      .select('id, remaining_credits')
      .eq('user_id', userId)
      .eq('credit_group', creditType)
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError) {
      logger.error('Error fetching existing credits:', fetchError);
    }

    const existingCredits = existingList && existingList.length > 0 ? existingList[0] : null;

    if (existingCredits) {
      // Update existing row by incrementing remaining_credits
      const { error: updateError } = await supabase
        .from('subscription_credits')
        .update({ 
          remaining_credits: existingCredits.remaining_credits + 1
        })
        .eq('id', existingCredits.id);

      if (updateError) {
        logger.error('Failed to update existing credits:', updateError);
        return false;
      }

      logger.info(`Credit added successfully to existing record for user ${userId}, credit_type: ${creditType}, total: ${existingCredits.remaining_credits + 1}`);
    } else {
      // Create new credit record
      const { data: creditData, error: creditError } = await supabase
        .from('subscription_credits')
        .insert([{
          user_id: userId,
          credit_group: creditType,
          remaining_credits: 1,
          expires_at: null
        }])
        .select()
        .single();

      if (creditError) {
        logger.error('Failed to create new credit record:', creditError);
        return false;
      }

      logger.info(`New credit record created successfully for user ${userId}, credit_type: ${creditType}`);
    }

    return true;
  } catch (error) {
    logger.error('Error in addCredit:', error);
    return false;
  }
};

/**
 * Get user's credits
 * @param userId - User ID
 * @returns Promise<any[]> - Array of user's credits
 */
export const getUserCredits = async (userId: string): Promise<any[]> => {
  try {
    const { data: credits, error } = await supabase
      .from('subscription_credits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Error fetching user credits:', error);
      throw new Error('Failed to fetch user credits');
    }

    return credits || [];
  } catch (error) {
    logger.error('Error in getUserCredits:', error);
    throw error;
  }
};

/**
 * Check if user has credits for a specific type
 * @param userId - User ID
 * @param creditType - Credit type ('group' or 'private')
 * @returns Promise<CreditInfo> - Credit information
 */
export const checkUserCredits = async (userId: string, creditType: string): Promise<CreditInfo> => {
  try {
    const { data: credits, error } = await supabase
      .from('subscription_credits')
      .select('*')
      .eq('user_id', userId)
      .eq('credit_group', creditType)
      .gt('remaining_credits', 0)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Error checking user credits:', error);
      throw new Error('Failed to check user credits');
    }

    const totalCredits = credits?.reduce((sum, credit) => sum + credit.remaining_credits, 0) || 0;
    const hasCredits = totalCredits > 0;

    return {
      hasCredits,
      totalCredits,
      credits: credits || []
    };
  } catch (error) {
    logger.error('Error in checkUserCredits:', error);
    throw error;
  }
};

/**
 * Add credits to user (admin function)
 * @param userId - User ID
 * @param creditGroup - Credit group ('group' or 'private')
 * @param remainingCredits - Number of credits to add
 * @param expiresAt - Expiration date (optional)
 * @returns Promise<any> - Created credit record
 */
export const addCreditsToUser = async (
  userId: string, 
  creditGroup: string, 
  remainingCredits: number, 
  expiresAt?: string
): Promise<any> => {
  try {
    logger.info(`Attempting to add credits for user ${userId}, credit_group: ${creditGroup}, amount: ${remainingCredits}`);
    
    // Validate credit_group
    if (!['group', 'private'].includes(creditGroup)) {
      throw new Error('credit_group must be either "group" or "private"');
    }

    // Try to find an existing row for this user and credit group
    const { data: existingList, error: fetchError } = await supabase
      .from('subscription_credits')
      .select('id, remaining_credits')
      .eq('user_id', userId)
      .eq('credit_group', creditGroup)
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError) {
      logger.error('Error fetching existing credits for addCreditsToUser:', fetchError);
      throw new Error('Failed to add credits to user');
    }

    const existingCredits = existingList && existingList.length > 0 ? existingList[0] : null;

    if (existingCredits) {
      // Update existing record by adding the amount
      const { data: updated, error: updateError } = await supabase
        .from('subscription_credits')
        .update({
          remaining_credits: existingCredits.remaining_credits + remainingCredits,
          expires_at: expiresAt || null
        })
        .eq('id', existingCredits.id)
        .select()
        .single();

      if (updateError) {
        logger.error('Error updating existing credits in addCreditsToUser:', updateError);
        throw new Error('Failed to add credits to user');
      }

      logger.info(`Credits incremented for user ${userId}, credit_group: ${creditGroup}, new total: ${updated?.remaining_credits}`);
      return updated;
    } else {
      // Insert a new record if none exists
      const { data: creditData, error } = await supabase
        .from('subscription_credits')
        .insert([{
          user_id: userId,
          credit_group: creditGroup,
          remaining_credits: remainingCredits,
          expires_at: expiresAt || null
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error adding credits to user:', error);
        throw new Error('Failed to add credits to user');
      }

      logger.info(`Credits added successfully for user ${userId}, credit_group: ${creditGroup}, amount: ${remainingCredits}, data: ${JSON.stringify(creditData)}`);
      return creditData;
    }
  } catch (error) {
    logger.error('Error in addCreditsToUser:', error);
    throw error;
  }
};

/**
 * Update user credits (admin function)
 * @param userId - User ID
 * @param creditId - Credit record ID
 * @param remainingCredits - New remaining credits
 * @param expiresAt - Expiration date (optional)
 * @returns Promise<any> - Updated credit record
 */
export const updateUserCredits = async (
  userId: string, 
  creditId: string, 
  remainingCredits: number, 
  expiresAt?: string
): Promise<any> => {
  try {
    // Update credits
    const { data: creditData, error } = await supabase
      .from('subscription_credits')
      .update({
        remaining_credits: remainingCredits,
        expires_at: expiresAt || null
      })
      .eq('id', creditId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user credits:', error);
      throw new Error('Failed to update user credits');
    }

    logger.info(`Credits updated successfully for user ${userId}, credit_id: ${creditId}, remaining: ${remainingCredits}`);
    return creditData;
  } catch (error) {
    logger.error('Error in updateUserCredits:', error);
    throw error;
  }
};

/**
 * Delete user credits (admin function)
 * @param userId - User ID
 * @param creditId - Credit record ID
 * @returns Promise<void>
 */
export const deleteUserCredits = async (userId: string, creditId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('subscription_credits')
      .delete()
      .eq('id', creditId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting user credits:', error);
      throw new Error('Failed to delete user credits');
    }

    logger.info(`Credits deleted successfully for user ${userId}, credit_id: ${creditId}`);
  } catch (error) {
    logger.error('Error in deleteUserCredits:', error);
    throw error;
  }
};

/**
 * Get credit statistics (admin function)
 * @returns Promise<CreditStatistics> - Credit statistics
 */
export const getCreditStatistics = async (): Promise<CreditStatistics> => {
  try {
    const { data: credits, error } = await supabase
      .from('subscription_credits')
      .select('*');

    if (error) {
      logger.error('Error fetching credit statistics:', error);
      throw new Error('Failed to fetch credit statistics');
    }

    // Calculate statistics
    const totalCredits = credits?.reduce((sum, credit) => sum + credit.remaining_credits, 0) || 0;
    const groupCredits = credits?.filter(c => c.credit_group === 'group').reduce((sum, credit) => sum + credit.remaining_credits, 0) || 0;
    const privateCredits = credits?.filter(c => c.credit_group === 'private').reduce((sum, credit) => sum + credit.remaining_credits, 0) || 0;
    const totalUsers = new Set(credits?.map(c => c.user_id) || []).size;

    return {
      totalCredits,
      groupCredits,
      privateCredits,
      totalUsers,
      totalCreditRecords: credits?.length || 0
    };
  } catch (error) {
    logger.error('Error in getCreditStatistics:', error);
    throw error;
  }
};

/**
 * Get user credit history (admin function)
 * @param userId - User ID
 * @returns Promise<{credits: any[], creditRegistrations: any[]}> - Credit history
 */
export const getUserCreditHistory = async (userId: string): Promise<{credits: any[], creditRegistrations: any[]}> => {
  try {
    // Get user's credit history
    const { data: credits, error } = await supabase
      .from('subscription_credits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user credit history:', error);
      throw new Error('Failed to fetch user credit history');
    }

    // Get registrations that used credits
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('user_id', userId)
      .eq('used_credit', true)
      .order('created_at', { ascending: false });

    if (regError) {
      logger.error('Error fetching user credit registrations:', regError);
      throw new Error('Failed to fetch user credit registrations');
    }

    return {
      credits: credits || [],
      creditRegistrations: registrations || []
    };
  } catch (error) {
    logger.error('Error in getUserCreditHistory:', error);
    throw error;
  }
}; 