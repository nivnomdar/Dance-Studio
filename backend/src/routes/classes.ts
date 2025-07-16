import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { validateClass } from '../middleware/validation';
import { auth } from '../middleware/auth';

/**
 * פונקציה משותפת לקבלת session מתוך session class
 */
const getSessionFromSessionClass = (sc: any) => {
  return Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
};

const router = Router();

// Get admin calendar data (admin only)
router.get('/admin/calendar', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Fetching admin calendar data');
    
    // Get all classes with their schedules
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (classesError) {
      throw new AppError('Failed to fetch classes', 500);
    }

    // Get all registrations with user and class details
    const { data: registrations, error: registrationsError } = await supabase
      .from('registrations')
      .select(`
        *,
        class:classes(id, name, price, duration, level, category),
        user:profiles(id, first_name, last_name, email)
      `)
      .order('selected_date', { ascending: true });

    if (registrationsError) {
      throw new AppError('Failed to fetch registrations', 500);
    }

    // Process calendar data
    const calendarData = {
      classes: classes || [],
      registrations: registrations || [],
      weeklySchedule: {} as any
    };

    // Generate weekly schedule for next 4 weeks
    const today = new Date();
    const weeklySchedule: { [key: string]: any } = {};
    
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (week * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = `week_${week + 1}`;
      weeklySchedule[weekKey] = {
        startDate: weekStart.toISOString().split('T')[0],
        days: {}
      };

      // Generate each day of the week
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + day);
        
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[currentDate.getDay()];
        const dateKey = currentDate.toISOString().split('T')[0];
        
        // Find classes scheduled for this day
        const dayClasses = classes?.filter(cls => {
          // Check if class has active sessions for this day
          const hasActiveSessions = cls.session_classes?.some((sc: any) => {
            const session = Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
            if (!session || !session.is_active) return false;
            
            // Check if session is active on this day
            const sessionWeekdays = session.weekdays || [];
            return sessionWeekdays.includes(currentDate.getDay());
          });
          
          return cls.is_active && hasActiveSessions;
        }) || [];

        // Find registrations for this date
        const dayRegistrations = registrations?.filter(reg => 
          reg.selected_date === dateKey && reg.status !== 'cancelled'
        ) || [];

        weeklySchedule[weekKey].days[dateKey] = {
          date: dateKey,
          dayName: dayName,
          classes: dayClasses.map(cls => {
            // Get times from sessions for this day
            const sessionTimes = cls.session_classes
              ?.filter((sc: any) => {
                const session = Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
                if (!session || !session.is_active) return false;
                const sessionWeekdays = session.weekdays || [];
                return sessionWeekdays.includes(currentDate.getDay());
              })
              ?.map((sc: any) => {
                const session = Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
                return session.start_time.substring(0, 5); // Format as HH:MM
              })
              ?.filter((time: string, index: number, arr: string[]) => arr.indexOf(time) === index) || []; // Remove duplicates
            
            const classRegistrations = dayRegistrations.filter(reg => reg.class_id === cls.id);
            
            return {
              id: cls.id,
              name: cls.name,
              slug: cls.slug,
              price: cls.price,
              duration: cls.duration,
              level: cls.level,
              category: cls.category,
              times: sessionTimes,
              registrations: classRegistrations.map(reg => ({
                id: reg.id,
                fullName: reg.full_name,
                userFullName: reg.user ? 
                  `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
                  `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email,
                email: reg.email,
                phone: reg.phone,
                experience: reg.experience,
                selectedTime: reg.selected_time,
                notes: reg.notes,
                status: reg.status
              }))
            };
          })
        };
      }
    }

    calendarData.weeklySchedule = weeklySchedule;

    logger.info('Admin calendar data fetched successfully');
    res.json(calendarData);
  } catch (error) {
    next(error);
  }
});

// Get admin dashboard overview (admin only)
router.get('/admin/overview', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
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
      throw new AppError('Failed to fetch classes', 500);
    }
    if (registrationsResult.error) {
      throw new AppError('Failed to fetch registrations', 500);
    }
    if (profilesResult.error) {
      throw new AppError('Failed to fetch profiles', 500);
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
      }) || false;
    }).length;
    
    // Classes happening tomorrow (based on sessions)
    const classesTomorrow = classes.filter(cls => {
      if (!cls.is_active) return false;
      
      // Check if class has active sessions for tomorrow
      return cls.session_classes?.some((sc: any) => {
        const session = Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
        if (!session || !session.is_active) return false;
        
        const sessionWeekdays = session.weekdays || [];
        return sessionWeekdays.includes(tomorrow.getDay());
      }) || false;
    }).length;
    
    // Calculate registrations by time period
    const registrationsToday = registrations.filter(reg => {
      const regDate = new Date(reg.created_at);
      return regDate > oneDayAgo;
    }).length;
    
    const registrationsThisWeek = registrations.filter(reg => {
      const regDate = new Date(reg.created_at);
      return regDate > oneWeekAgo;
    }).length;
    
    // Low capacity classes - show all active classes with their session capacity information
    const lowCapacityClasses = await Promise.all(
      classes
        .filter(cls => cls.is_active)
        .map(async (cls) => {
          // Get all session classes for this class
          const { data: sessionClasses, error: scError } = await supabase
            .from('session_classes')
            .select(`
              id,
              session_id,
              schedule_sessions (
                id,
                name,
                max_capacity,
                weekdays,
                start_time,
                is_active
              )
            `)
            .eq('class_id', cls.id)
            .eq('is_active', true);

          if (scError) {
            logger.error(`Error fetching session classes for class ${cls.id}:`, scError);
            return null;
          }

          // Calculate total capacity and registrations across all sessions
          let totalCapacity = 0;
          let totalRegistrations = 0;
          let sessionInfo = [];

          for (const sessionClass of sessionClasses || []) {
            const session = Array.isArray(sessionClass.schedule_sessions) 
              ? sessionClass.schedule_sessions[0] 
              : sessionClass.schedule_sessions;

            if (session && session.is_active) {
              totalCapacity += session.max_capacity || 0;

              // Count registrations for this session
              const { count: regCount, error: countError } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', session.id)
                .eq('status', 'active');

              if (!countError) {
                const sessionRegistrations = regCount || 0;
                totalRegistrations += sessionRegistrations;

                sessionInfo.push({
                  session_name: session.name,
                  max_capacity: session.max_capacity,
                  registrations: sessionRegistrations,
                  weekdays: session.weekdays,
                  start_time: session.start_time
                });
              }
            }
          }

          const fillRate = totalCapacity > 0 ? (totalRegistrations / totalCapacity) * 100 : 0;

          return {
            id: cls.id,
            name: cls.name,
            total_capacity: totalCapacity,
            total_registrations: totalRegistrations,
            fill_rate: fillRate,
            sessions: sessionInfo,
            needs_attention: fillRate < 50 || totalCapacity === 0
          };
        })
    );

    // Filter out null results and sort by fill rate
    const validLowCapacityClasses = lowCapacityClasses
      .filter(cls => cls !== null)
      .sort((a, b) => (a?.fill_rate || 0) - (b?.fill_rate || 0))
      .slice(0, 5); // Top 5 classes that need attention

    // Get all classes with capacity information for complete overview
    const allClassesWithCapacity = await Promise.all(
      classes
        .filter(cls => cls.is_active)
        .map(async (cls) => {
          // Get all session classes for this class
          const { data: sessionClasses, error: scError } = await supabase
            .from('session_classes')
            .select(`
              id,
              session_id,
              schedule_sessions (
                id,
                name,
                max_capacity,
                weekdays,
                start_time,
                is_active
              )
            `)
            .eq('class_id', cls.id)
            .eq('is_active', true);

          if (scError) {
            logger.error(`Error fetching session classes for class ${cls.id}:`, scError);
            return {
              id: cls.id,
              name: cls.name,
              total_capacity: 0,
              total_registrations: 0,
              fill_rate: 0,
              sessions: [],
              needs_attention: true
            };
          }

          // Calculate total capacity and registrations across all sessions
          let totalCapacity = 0;
          let totalRegistrations = 0;
          let sessionInfo = [];

          for (const sessionClass of sessionClasses || []) {
            const session = Array.isArray(sessionClass.schedule_sessions) 
              ? sessionClass.schedule_sessions[0] 
              : sessionClass.schedule_sessions;

            if (session && session.is_active) {
              totalCapacity += session.max_capacity || 0;

              // Count registrations for this session
              const { count: regCount, error: countError } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', session.id)
                .eq('status', 'active');

              if (!countError) {
                const sessionRegistrations = regCount || 0;
                totalRegistrations += sessionRegistrations;

                sessionInfo.push({
                  session_name: session.name,
                  max_capacity: session.max_capacity,
                  registrations: sessionRegistrations,
                  weekdays: session.weekdays,
                  start_time: session.start_time
                });
              }
            }
          }

          const fillRate = totalCapacity > 0 ? (totalRegistrations / totalCapacity) * 100 : 0;

          return {
            id: cls.id,
            name: cls.name,
            total_capacity: totalCapacity,
            total_registrations: totalRegistrations,
            fill_rate: fillRate,
            sessions: sessionInfo,
            needs_attention: fillRate < 50 || totalCapacity === 0
          };
        })
    );

    // Process registrations to include class and user names
    const processedRegistrations = registrations.map(reg => ({
      ...reg,
      class_name: reg.class?.name || 'שיעור לא ידוע',
      user_name: reg.user ? 
        `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
        `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'משתמש לא ידוע'
    }));

    const overview = {
      statistics: {
        totalClasses,
        activeClasses,
        totalRegistrations,
        totalUsers,
        newUsers,
        cancellationsThisWeek,
        classesToday,
        classesTomorrow,
        registrationsToday,
        registrationsThisWeek
      },
      lowCapacityClasses: validLowCapacityClasses,
      allClasses: allClassesWithCapacity,
      recentRegistrations: processedRegistrations.slice(0, 10) // Last 10 registrations
    };

    logger.info('Admin dashboard overview fetched successfully', { 
      totalClasses, 
      totalRegistrations, 
      totalUsers,
      cancellationsThisWeek,
      classesToday,
      classesTomorrow,
      registrationsThisWeek
    });

    res.json(overview);
  } catch (error) {
    next(error);
  }
});

// Get all classes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch classes', 500);
    }

    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get class by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      throw new AppError('Failed to fetch class', 500);
    }

    if (!data) {
      throw new AppError('Class not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get class by slug
router.get('/slug/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      throw new AppError('Failed to fetch class', 500);
    }

    if (!data) {
      throw new AppError('Class not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create new class (admin only)
router.post('/', auth, validateClass, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert([req.body])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create class', 500);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update class (admin only)
router.put('/:id', auth, validateClass, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('classes')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update class', 500);
    }

    if (!data) {
      throw new AppError('Class not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete class (admin only)
router.delete('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('Failed to delete class', 500);
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 