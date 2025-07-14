import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { validateClass } from '../middleware/validation';
import { auth } from '../middleware/auth';

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
        classes:class_id(name, slug, price, duration, level, category),
        profiles:user_id(first_name, last_name, email)
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
          if (!cls.schedule) return false;
          const schedule = typeof cls.schedule === 'string' ? JSON.parse(cls.schedule) : cls.schedule;
          return schedule[dayName]?.available === true && schedule[dayName]?.times?.length > 0;
        }) || [];

        // Find registrations for this date
        const dayRegistrations = registrations?.filter(reg => 
          reg.selected_date === dateKey && reg.status !== 'cancelled'
        ) || [];

        weeklySchedule[weekKey].days[dateKey] = {
          date: dateKey,
          dayName: dayName,
          classes: dayClasses.map(cls => {
            const schedule = typeof cls.schedule === 'string' ? JSON.parse(cls.schedule) : cls.schedule;
            const times = schedule[dayName]?.times || [];
            const classRegistrations = dayRegistrations.filter(reg => reg.class_id === cls.id);
            
            return {
              id: cls.id,
              name: cls.name,
              slug: cls.slug,
              price: cls.price,
              duration: cls.duration,
              level: cls.level,
              category: cls.category,
              times: times,
              registrations: classRegistrations.map(reg => ({
                id: reg.id,
                fullName: reg.full_name,
                userFullName: reg.profiles ? 
                  `${reg.profiles.first_name || ''} ${reg.profiles.last_name || ''}`.trim() || reg.profiles.email :
                  reg.full_name,
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
        classes:class_id(name, slug),
        profiles:user_id(first_name, last_name, email)
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
    
    // Classes happening today (based on weekly schedule)
    const classesToday = classes.filter(cls => {
      if (!cls.is_active || !cls.schedule) return false;
      const schedule = typeof cls.schedule === 'string' ? JSON.parse(cls.schedule) : cls.schedule;
      return schedule[todayName]?.available === true && schedule[todayName]?.times?.length > 0;
    }).length;
    
    // Classes happening tomorrow (based on weekly schedule)
    const classesTomorrow = classes.filter(cls => {
      if (!cls.is_active || !cls.schedule) return false;
      const schedule = typeof cls.schedule === 'string' ? JSON.parse(cls.schedule) : cls.schedule;
      return schedule[tomorrowName]?.available === true && schedule[tomorrowName]?.times?.length > 0;
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
    
    // Low capacity classes (less than 50% full) - show all active classes with low registration
    const lowCapacityClasses = classes
      .filter(cls => cls.is_active)
      .map(cls => {
        const classRegistrations = registrations.filter(reg => 
          reg.class_id === cls.id && reg.status !== 'cancelled'
        );
        const capacity = cls.max_participants || 10; // Use max_participants from database
        const fillRate = capacity > 0 ? (classRegistrations.length / capacity) * 100 : 0;
        return {
          id: cls.id,
          name: cls.name,
          schedule: cls.schedule,
          registrations_count: classRegistrations.length,
          max_capacity: capacity,
          fill_rate: fillRate
        };
      })
      .filter(cls => cls.fill_rate < 50)
      .sort((a, b) => a.fill_rate - b.fill_rate) // Sort by lowest fill rate first
      .slice(0, 3); // Top 3 low capacity classes

    // Process registrations to include class and user names
    const processedRegistrations = registrations.map(reg => ({
      ...reg,
      class_name: reg.classes?.name || 'שיעור לא ידוע',
      user_name: reg.profiles ? 
        `${reg.profiles.first_name || ''} ${reg.profiles.last_name || ''}`.trim() || reg.profiles.email :
        reg.full_name || 'משתמש לא ידוע'
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
      lowCapacityClasses,
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