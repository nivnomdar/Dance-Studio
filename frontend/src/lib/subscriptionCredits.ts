import { supabase } from './supabase';
import type { 
  SubscriptionCredit, 
  CreateSubscriptionCreditRequest, 
  UpdateSubscriptionCreditRequest,
  UserSubscriptionCredits,
  CreditGroup 
} from '../types/subscription';

class SubscriptionCreditsService {
  // Get user's subscription credits
  async getUserCredits(userId: string): Promise<UserSubscriptionCredits> {
    const { data, error } = await supabase
      .from('subscription_credits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch subscription credits: ${error.message}`);
    }

    const credits = data || [];
    
    // Calculate totals
    const total_group_credits = credits
      .filter(c => c.credit_group === 'group')
      .reduce((sum, c) => sum + c.remaining_credits, 0);
    
    const total_private_credits = credits
      .filter(c => c.credit_group === 'private')
      .reduce((sum, c) => sum + c.remaining_credits, 0);
    
    const total_zoom_credits = credits
      .filter(c => c.credit_group === 'zoom')
      .reduce((sum, c) => sum + c.remaining_credits, 0);

    return {
      user_id: userId,
      credits,
      total_group_credits,
      total_private_credits,
      total_zoom_credits
    };
  }

  // Get credits for specific group
  async getCreditsForGroup(userId: string, creditGroup: CreditGroup): Promise<SubscriptionCredit[]> {
    const { data, error } = await supabase
      .from('subscription_credits')
      .select('*')
      .eq('user_id', userId)
      .eq('credit_group', creditGroup)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch credits for group ${creditGroup}: ${error.message}`);
    }

    return data || [];
  }

  // Check if user has enough credits for a specific group
  async hasEnoughCredits(userId: string, creditGroup: CreditGroup, requiredCredits: number = 1): Promise<boolean> {
    const credits = await this.getCreditsForGroup(userId, creditGroup);
    const totalCredits = credits.reduce((sum, credit) => sum + credit.remaining_credits, 0);
    return totalCredits >= requiredCredits;
  }

  // Use a credit (decrease remaining credits)
  async useCredit(userId: string, creditGroup: CreditGroup): Promise<SubscriptionCredit> {
    try {
      // Get available credits for this group
      const credits = await this.getCreditsForGroup(userId, creditGroup);
      
      if (credits.length === 0) {
        throw new Error(`No credits available for group ${creditGroup}`);
      }

      // Find the first credit with remaining credits
      const availableCredit = credits.find(c => c.remaining_credits > 0);
      
      if (!availableCredit) {
        throw new Error(`No remaining credits for group ${creditGroup}`);
      }

      // Update the credit
      const { data, error } = await supabase
        .from('subscription_credits')
        .update({ 
          remaining_credits: availableCredit.remaining_credits - 1 
        })
        .eq('id', availableCredit.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to use credit: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error(`Error using credit for user ${userId}, group ${creditGroup}:`, error);
      throw error;
    }
  }

  // Add credits to user
  async addCredits(request: CreateSubscriptionCreditRequest): Promise<SubscriptionCredit> {
    try {
      const { data, error } = await supabase
        .from('subscription_credits')
        .insert([request])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add credits: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error(`Error adding credits for user ${request.user_id}, group ${request.credit_group}:`, error);
      throw error;
    }
  }

  // Update existing credits
  async updateCredits(creditId: string, updates: UpdateSubscriptionCreditRequest): Promise<SubscriptionCredit> {
    const { data, error } = await supabase
      .from('subscription_credits')
      .update(updates)
      .eq('id', creditId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update credits: ${error.message}`);
    }

    return data;
  }

  // Delete credits
  async deleteCredits(creditId: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_credits')
      .delete()
      .eq('id', creditId);

    if (error) {
      throw new Error(`Failed to delete credits: ${error.message}`);
    }
  }

  // Get total credits for all groups
  async getTotalCredits(userId: string): Promise<Record<CreditGroup, number>> {
    const { data, error } = await supabase
      .from('subscription_credits')
      .select('credit_group, remaining_credits')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch total credits: ${error.message}`);
    }

    const totals: Record<CreditGroup, number> = {
      group: 0,
      private: 0,
      zoom: 0,
      workshop: 0,
      intensive: 0
    };

    data?.forEach(credit => {
      if (credit.credit_group in totals) {
        totals[credit.credit_group as CreditGroup] += credit.remaining_credits;
      }
    });

    return totals;
  }
}

export const subscriptionCreditsService = new SubscriptionCreditsService(); 