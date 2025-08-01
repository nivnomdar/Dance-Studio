import express from 'express';
import { supabase } from '../database';
import { logger } from '../utils/logger';

interface SubscriptionCredit {
  id: string;
  user_id: string;
  credit_group: string;
  remaining_credits: number;
  created_at: string;
  updated_at: string;
}

const router = express.Router();

// Get user's subscription credits
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    logger.info(`Fetching subscription credits for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('subscription_credits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching subscription credits:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription credits' });
    }

    const credits = (data || []) as SubscriptionCredit[];
    
    // Calculate totals
    const total_group_credits = credits
      .filter((c: SubscriptionCredit) => c.credit_group === 'group')
      .reduce((sum: number, c: SubscriptionCredit) => sum + c.remaining_credits, 0);
    
    const total_private_credits = credits
      .filter((c: SubscriptionCredit) => c.credit_group === 'private')
      .reduce((sum: number, c: SubscriptionCredit) => sum + c.remaining_credits, 0);
    
    const total_zoom_credits = credits
      .filter((c: SubscriptionCredit) => c.credit_group === 'zoom')
      .reduce((sum: number, c: SubscriptionCredit) => sum + c.remaining_credits, 0);

    const result = {
      user_id: userId,
      credits,
      total_group_credits,
      total_private_credits,
      total_zoom_credits
    };

    logger.info(`Subscription credits fetched successfully for user ${userId}: ${credits.length} credit records`);
    
    res.json(result);
  } catch (error) {
    logger.error('Error in subscription credits route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 