import { WEEKDAY_NAMES, DAYS_IN_WEEK, MILLISECONDS_IN_DAY, SessionData, SummaryStats, RegistrationByTime, AdminData } from '../types/admin';

// Helper functions
export const getDayOfWeekName = (dayNumber: number): string => {
  return WEEKDAY_NAMES[dayNumber] || 'לא ידוע';
};

export const getOccupancyColor = (rate: number): string => {
  if (rate >= 80) return 'text-green-600 bg-green-100';
  if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export const convertWeekdayToNumber = (day: any): number | undefined => {
  if (typeof day === 'number') return day;
  if (typeof day === 'string') {
    const dayMap: { [key: string]: number } = {
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 
      'friday': 5, 'saturday': 6, 'sunday': 0
    };
    return dayMap[day.toLowerCase()];
  }
  return undefined;
};

// Generate upcoming dates for a session
export const generateUpcomingDates = (weekdays: number[]): string[] => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + DAYS_IN_WEEK * MILLISECONDS_IN_DAY);
  const upcomingDates: string[] = [];
  
  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    if (weekdays.includes(date.getDay())) {
      const dateString = date.toISOString().split('T')[0];
      upcomingDates.push(dateString);
    }
  }
  
  return [...new Set(upcomingDates)]; // Remove duplicates
};

// Process sessions with additional data
export const processSessions = (
  sessions: SessionData[],
  sessionClasses: any[],
  registrations: any[],
  classes: any[]
): SessionData[] => {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const allSessionEntries: SessionData[] = [];

  sessions.forEach((session: SessionData) => {
    const linkedClasses = sessionClasses?.filter(
      (sc: any) => sc.session_id === session.id
    ) || [];

    const sessionRegistrations = registrations?.filter(
      (reg: any) => reg.session_id === session.id
    ) || [];

    // Generate upcoming dates for this session
    const upcomingDates = generateUpcomingDates(session.weekdays);

    // Create a session entry for each upcoming date
    const sessionEntries = upcomingDates.map((date: string) => {
      // Filter registrations for this specific date
      const dateRegistrations = sessionRegistrations.filter((reg: any) => {
        return reg.selected_date === date;
      });
      
      const dateActiveRegistrations = dateRegistrations.filter(
        (reg: any) => reg.status === 'active'
      );

      const dateTotalRevenue = dateRegistrations.reduce(
        (sum: number, reg: any) => sum + (reg.purchase_price || 0), 0
      );

      const dateOccupancyRate = session.max_capacity > 0 
        ? (dateActiveRegistrations.length / session.max_capacity) * 100 
        : 0;

      return {
        ...session,
        specificDate: date,
        linkedClassesCount: linkedClasses.length,
        registrationsCount: dateRegistrations.length,
        activeRegistrationsCount: dateActiveRegistrations.length,
        totalRevenue: dateTotalRevenue,
        occupancyRate: dateOccupancyRate,
        sessionClasses: linkedClasses,
        registrations: dateRegistrations,
        linkedClasses: linkedClasses.map((sc: any) => {
          const classData = classes?.find((c: any) => c.id === sc.class_id);
          return classData ? classData.name : 'שיעור לא ידוע';
        }),
        upcomingActiveRegistrations: dateActiveRegistrations
      };
    });

    allSessionEntries.push(...sessionEntries);
  });

  return allSessionEntries;
};

// Filter and sort sessions
export const filterAndSortSessions = (
  sessions: SessionData[],
  searchTerm: string,
  filterStatus: string
): SessionData[] => {
  let filtered = sessions;

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter((session: SessionData) =>
      session.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter by status
  if (filterStatus !== 'all') {
    filtered = filtered.filter((session: SessionData) => {
      if (filterStatus === 'active') return session.is_active;
      if (filterStatus === 'inactive') return !session.is_active;
      return true;
    });
  }

  // Sort by date (closest to farthest) when "all" is selected, otherwise by occupancy rate
  if (filterStatus === 'all') {
    return filtered.sort((a: SessionData, b: SessionData) => {
      if (!a.specificDate || !b.specificDate) return 0;
      return new Date(a.specificDate).getTime() - new Date(b.specificDate).getTime();
    });
  } else {
    // Sort by occupancy rate (descending) for other filters
    return filtered.sort((a: SessionData, b: SessionData) => 
      (b.occupancyRate || 0) - (a.occupancyRate || 0)
    );
  }
};

// Calculate summary statistics
export const calculateSummaryStats = (sessions: SessionData[]): SummaryStats => {
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s: SessionData) => s.is_active).length;
  const totalRegistrations = sessions.reduce((sum: number, s: SessionData) => sum + (s.registrationsCount || 0), 0);
  const totalRevenue = sessions.reduce((sum: number, s: SessionData) => sum + (s.totalRevenue || 0), 0);
  const avgOccupancy = totalSessions > 0 
    ? sessions.reduce((sum: number, s: SessionData) => sum + (s.occupancyRate || 0), 0) / totalSessions 
    : 0;

  return {
    totalSessions,
    activeSessions,
    totalRegistrations,
    totalRevenue,
    avgOccupancy: Math.round(avgOccupancy * 100) / 100
  };
};

// Group registrations by time
export const groupRegistrationsByTime = (registrations: any[]): RegistrationByTime => {
  return registrations.reduce((acc: RegistrationByTime, registration: any) => {
    const timeKey = registration.selected_time || 'no-time';
    if (!acc[timeKey]) {
      acc[timeKey] = {
        time: registration.selected_time || 'לא מוגדר',
        registrations: []
      };
    }
    acc[timeKey].registrations.push(registration);
    return acc;
  }, {});
};

// Check if data is complete
export const hasCompleteData = (data: any): boolean => {
  return data.classes && data.classes.length > 0 && 
         data.sessions && data.sessions.length > 0 && 
         data.registrations && data.registrations.length >= 0;
};

// Create fallback data
export const createFallbackData = (data: any): AdminData => ({
  classes: data.classes || [],
  sessions: data.sessions || [],
  registrations: data.registrations || [],
  session_classes: data.session_classes || [],
  profiles: data.profiles || [],
  overview: data.overview || { totalClasses: 0, totalRegistrations: 0, totalSessions: 0 }
}); 