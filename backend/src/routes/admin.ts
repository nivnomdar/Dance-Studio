import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { admin } from '../middleware/auth';
import { logger } from '../utils/logger';
import { supabase } from '../database';

const router = express.Router();

// Get admin dashboard overview
router.get('/overview', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin overview endpoint called by user:', req.user?.sub);
    logger.info('Fetching admin dashboard overview');
    
    // Fetch all required data in parallel
    const [
      classesResult,
      registrationsResult,
      profilesResult
    ] = await Promise.all([
      // Get all classes (active and inactive)
      supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false }),
      
      // Get all registrations with class and user details
      supabase
        .from('registrations')
        .select(`
          *,
          class:classes(id, name, price, duration, level, category),
          user:profiles(id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false }),
      
      // Get all profiles for user count
      supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: false })
    ]);

    if (classesResult.error) {
      throw new Error('Failed to fetch classes');
    }
    if (registrationsResult.error) {
      throw new Error('Failed to fetch registrations');
    }
    if (profilesResult.error) {
      throw new Error('Failed to fetch profiles');
    }

    const classes = classesResult.data || [];
    const registrations = registrationsResult.data || [];
    const profiles = profilesResult.data || [];

    // Calculate time-based statistics
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Calculate statistics
    const totalClasses = classes.length;
    const activeClasses = classes.filter(cls => cls.is_active).length;
    const totalRegistrations = registrations.length;
    const totalUsers = profiles.length;

    // Get new users in last 30 days
    const newUsers = profiles.filter(profile => 
      new Date(profile.created_at) > oneMonthAgo
    ).length;

    // Get cancellations this week
    const cancellationsThisWeek = registrations.filter(reg => 
      reg.status === 'cancelled' && new Date(reg.updated_at || reg.created_at) > oneWeekAgo
    ).length;

    // Get day names in Hebrew
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];
    const tomorrowName = dayNames[tomorrow.getDay()];
    
    // Classes happening today (based on sessions)
    const classesToday = classes.filter(cls => {
      if (!cls.is_active) return false;
      
      // Check if class has active sessions for today
      return cls.session_classes?.some((sc: any) => {
        const session = Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
        if (!session || !session.is_active) return false;
        
        const sessionWeekdays = session.weekdays || [];
        return sessionWeekdays.includes(today.getDay());
      });
    }).length;

    // Classes happening tomorrow
    const classesTomorrow = classes.filter(cls => {
      if (!cls.is_active) return false;
      
      return cls.session_classes?.some((sc: any) => {
        const session = Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
        if (!session || !session.is_active) return false;
        
        const sessionWeekdays = session.weekdays || [];
        return sessionWeekdays.includes(tomorrow.getDay());
      });
    }).length;

    // Upcoming registrations (next 7 days)
    const upcomingRegistrations = registrations.filter(reg => {
      const regDate = new Date(reg.created_at);
      return regDate >= today && regDate <= sevenDaysFromNow && reg.status === 'active';
    }).length;

    // Revenue this month
    const revenueThisMonth = registrations
      .filter(reg => {
        const regDate = new Date(reg.created_at);
        return regDate > oneMonthAgo && reg.status === 'active';
      })
      .reduce((sum, reg) => sum + (reg.purchase_price || 0), 0);

    const overview = {
      totalClasses,
      activeClasses,
      totalRegistrations,
      totalUsers,
      newUsers,
      cancellationsThisWeek,
      classesToday,
      classesTomorrow,
      upcomingRegistrations,
      revenueThisMonth,
      todayName,
      tomorrowName
    };

    logger.info('Admin overview data fetched successfully');
    res.json(overview);
  } catch (error) {
    next(error);
  }
});

// Get all classes (admin)
router.get('/classes', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin classes endpoint called by user:', req.user?.sub);
    
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching classes:', error);
      throw new Error('Failed to fetch classes');
    }

    logger.info('Classes fetched successfully:', { count: classes?.length || 0 });
    res.json(classes || []);
  } catch (error) {
    next(error);
  }
});

// Get all registrations (admin)
router.get('/registrations', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin registrations endpoint called by user:', req.user?.sub);
    
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        *,
        class:classes(id, name, price, duration, level, category),
        user:profiles(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching registrations:', error);
      throw new Error('Failed to fetch registrations');
    }

    logger.info('Registrations fetched successfully:', { count: registrations?.length || 0 });
    res.json(registrations || []);
  } catch (error) {
    next(error);
  }
});

// Get all sessions (admin)
router.get('/sessions', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin sessions endpoint called by user:', req.user?.sub);
    
    const { data: sessions, error } = await supabase
      .from('schedule_sessions')
      .select('*')
      .order('start_time');

    if (error) {
      logger.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch sessions');
    }

    logger.info('Sessions fetched successfully:', { count: sessions?.length || 0 });
    res.json(sessions || []);
  } catch (error) {
    next(error);
  }
});

// Get admin calendar data
router.get('/calendar', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin calendar endpoint called by user:', req.user?.sub);
    
    // Get all sessions with their classes
    const { data: sessionClasses, error: scError } = await supabase
      .from('session_classes')
      .select(`
        *,
        schedule_sessions (
          id,
          name,
          max_capacity,
          weekdays,
          start_time,
          end_time,
          is_active
        ),
        classes (
          id,
          name,
          price,
          duration,
          level,
          category,
          is_active
        )
      `)
      .eq('is_active', true);

    if (scError) {
      logger.error('Error fetching session classes:', scError);
      throw new Error('Failed to fetch session classes');
    }

    // Get all registrations
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('status', 'active');

    if (regError) {
      logger.error('Error fetching registrations:', regError);
      throw new Error('Failed to fetch registrations');
    }

    // Process calendar data
    const calendarData = {
      sessions: sessionClasses || [],
      registrations: registrations || [],
      weeklySchedule: {}
    };

    // Generate weekly schedule for the next 4 weeks
    const weeklySchedule: any = {};
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    for (let week = 1; week <= 4; week++) {
      const weekKey = `week_${week}`;
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
      
      const days: any = {};
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + dayIndex);
        
        const dateKey = currentDate.toISOString().split('T')[0];
        const dayName = weekdays[currentDate.getDay()];
        const hebrewDayName = hebrewDays[currentDate.getDay()];
        
        days[dateKey] = {
          date: dateKey,
          dayName: dayName,
          classes: sessionClasses?.filter((sc: any) => {
            const session = Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
            if (!session || !session.is_active) return false;
            
            const sessionWeekdays = session.weekdays || [];
            return sessionWeekdays.includes(currentDate.getDay());
          }).map((sc: any) => {
            const session = Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
            const classData = Array.isArray(sc.classes) ? sc.classes[0] : sc.classes;
            
            return {
              id: sc.id,
              name: classData?.name || 'שיעור לא ידוע',
              price: classData?.price || 0,
              duration: classData?.duration || 60,
              level: classData?.level || 'כל הרמות',
              category: classData?.category || 'כללי',
              is_active: classData?.is_active || false,
              session_id: session?.id,
              session_name: session?.name,
              start_time: session?.start_time,
              end_time: session?.end_time,
              max_capacity: session?.max_capacity || 10,
              registrations: registrations?.filter((reg: any) => {
                const regDate = new Date(reg.selected_date);
                return regDate.toDateString() === currentDate.toDateString() &&
                       reg.selected_time === session?.start_time?.substring(0, 5);
              }) || []
            };
          }) || []
        };
      }
      
      weeklySchedule[weekKey] = {
        startDate: weekStart.toISOString().split('T')[0],
        days: days
      };
    }

    calendarData.weeklySchedule = weeklySchedule;

    logger.info('Admin calendar data fetched successfully');
    res.json(calendarData);
  } catch (error) {
    next(error);
  }
});

// Get all orders (admin)
router.get('/orders', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin orders endpoint called by user:', req.user?.sub);
    // Fetch orders first (without attempting an embedded join to profiles)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (ordersError) {
      logger.error('Error fetching orders:', ordersError);
      throw new Error('Failed to fetch orders');
    }

    const orderList = orders || [];
    const userIds = Array.from(new Set(orderList.map((o: any) => o.user_id).filter(Boolean)));

    // Fetch profiles for those users
    let profilesById: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      if (profilesError) {
        logger.error('Error fetching profiles for orders:', profilesError);
      } else {
        profilesById = (profiles || []).reduce((acc: Record<string, any>, p: any) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }
    }

    const enriched = orderList.map((o: any) => {
      const p = profilesById[o.user_id];
      const user_name = p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : null;
      return {
        ...o,
        user_name
      };
    });

    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

// Get contact messages (admin)
router.get('/contact/messages', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching contact messages:', error);
      throw new Error('Failed to fetch contact messages');
    }

    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Update contact message status (admin)
router.put('/contact/messages/:id/status', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatePayload: any = { status };
    if (status === 'replied') {
      updatePayload.replied_by = req.user?.sub || null;
      updatePayload.replied_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      logger.error('Error updating contact message status:', error);
      throw new Error('Failed to update contact message');
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;