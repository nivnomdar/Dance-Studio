import type { UserProfile } from '../../../types/auth';

interface AdminOverviewProps {
  profile: UserProfile;
}

export default function AdminOverview({ profile }: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">סקירה כללית</h2>
      
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">
          ברוכה הבאה, {profile.first_name}!
        </h3>
        <p className="text-[#4B2E83]/70">
          כאן תוכלי לנהל את כל ההיבטים של סטודיו אביגיל
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">סה"כ שיעורים</h3>
          <p className="text-3xl font-bold text-[#EC4899]">0</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">שיעורים פעילים במערכת</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-6 rounded-2xl border border-[#4B2E83]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">סה"כ נרשמים</h3>
          <p className="text-3xl font-bold text-[#4B2E83]">0</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">תלמידות רשומות</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">סה"כ הזמנות</h3>
          <p className="text-3xl font-bold text-[#EC4899]">0</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">הזמנות בחנות</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">פעולות מהירות</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300">
            הוספת שיעור חדש
          </button>
          <button className="p-4 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-xl font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300">
            הוספת מוצר חדש
          </button>
        </div>
      </div>
    </div>
  );
} 