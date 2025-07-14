import { useEffect } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { UserProfile } from '../../../types/auth';

interface AdminClassesProps {
  profile: UserProfile;
}

export default function AdminClasses({ profile }: AdminClassesProps) {
  const { data, isLoading, error, fetchClasses, isFetching } = useAdminData();

  // טעינת נתונים רק אם אין נתונים או שהם ישנים
  useEffect(() => {
    if (data.classes.length === 0) {
      fetchClasses();
    }
  }, [data.classes.length, fetchClasses]);

  const activeClasses = data.classes.filter(cls => cls.is_active);
  const confirmedRegistrations = data.registrations.filter(reg => reg.status === 'confirmed');
  
  // Calculate registrations this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const registrationsThisWeek = data.registrations.filter((reg: any) => 
    new Date(reg.created_at) > oneWeekAgo
  ).length;
  
  // Calculate cancellations this week
  const cancellationsThisWeek = data.registrations.filter((reg: any) => 
    reg.status === 'cancelled' && new Date(reg.updated_at || reg.created_at) > oneWeekAgo
  ).length;

  if (isLoading && data.classes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול שיעורים</h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#4B2E83]/70">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (error && data.classes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול שיעורים</h2>
        </div>
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchClasses}
            className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול שיעורים</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchClasses}
            disabled={isFetching}
            className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'מעדכן...' : 'רענן נתונים'}
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300">
            הוספת שיעור חדש
          </button>
        </div>
      </div>

      {/* Classes Management Interface */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Classes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#4B2E83]">שיעורים זמינים להרשמה ({activeClasses.length})</h3>
            {activeClasses.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeClasses.map((cls: any) => (
                  <div key={cls.id} className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-4 rounded-xl border border-[#EC4899]/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-[#4B2E83]">{cls.name}</h4>
                        <p className="text-sm text-[#4B2E83]/70 mt-1">{cls.description}</p>
                        <p className="text-sm text-[#EC4899] font-medium mt-1">₪{cls.price}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        פעיל
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[#4B2E83]/70 text-center">אין שיעורים פעילים כרגע</p>
              </div>
            )}
          </div>

          {/* Class Registrations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#4B2E83]">הרשמות לשיעורים במערכת ({data.registrations.length})</h3>
            {data.registrations.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.registrations.slice(0, 5).map((reg: any) => (
                  <div key={reg.id} className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 p-4 rounded-xl border border-[#4B2E83]/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-[#4B2E83]">{reg.classes?.name || reg.class_name || 'שיעור לא ידוע'}</h4>
                        <p className="text-sm text-[#4B2E83]/70 mt-1">
                          {new Date(reg.selected_date).toLocaleDateString('he-IL')}
                        </p>
                        <p className="text-sm text-[#4B2E83]/70">
                          {reg.profiles ? 
                            `${reg.profiles.first_name || ''} ${reg.profiles.last_name || ''}`.trim() || reg.profiles.email :
                            reg.full_name || 'משתמש לא ידוע'
                          }
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        reg.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : reg.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {reg.status === 'confirmed' ? 'אושר' : 
                         reg.status === 'pending' ? 'ממתין' : 
                         reg.status === 'cancelled' ? 'בוטל' : reg.status}
                      </span>
                    </div>
                  </div>
                ))}
                {data.registrations.length > 5 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-[#4B2E83]/70">
                      ועוד {data.registrations.length - 5} הרשמות...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[#4B2E83]/70 text-center">אין הרשמות לשיעורים</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-4 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-2xl font-bold text-[#EC4899]">{data.classes.length}</div>
          <div className="text-sm text-[#4B2E83]/70">מספר שיעורים במערכת</div>
        </div>
        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-4 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-2xl font-bold text-[#4B2E83]">{activeClasses.length}</div>
          <div className="text-sm text-[#4B2E83]/70">שיעורים זמינים להרשמה</div>
        </div>
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-4 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-2xl font-bold text-[#EC4899]">{registrationsThisWeek}</div>
          <div className="text-sm text-[#4B2E83]/70">הרשמות חדשות השבוע</div>
        </div>
        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-4 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-2xl font-bold text-[#4B2E83]">{cancellationsThisWeek}</div>
          <div className="text-sm text-[#4B2E83]/70">ביטולים השבוע</div>
        </div>
      </div>

      {/* Class Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10 rounded-xl hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">צור שיעור חדש</h4>
          <p className="text-sm text-[#4B2E83]/70">הוסף שיעור חדש למערכת</p>
        </button>
        
        <button className="p-4 bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 border border-[#4B2E83]/10 rounded-xl hover:from-[#4B2E83]/10 hover:to-[#EC4899]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">נהל הרשמות</h4>
          <p className="text-sm text-[#4B2E83]/70">צפה וניהול הרשמות לשיעורים</p>
        </button>
        
        <button className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10 rounded-xl hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">דוחות שיעורים</h4>
          <p className="text-sm text-[#4B2E83]/70">צפה בדוחות וסטטיסטיקות</p>
        </button>
      </div>
    </div>
  );
} 