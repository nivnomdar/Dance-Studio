import type { UserProfile } from '../../../types/auth';

interface AdminClassesProps {
  profile: UserProfile;
}

export default function AdminClasses({ profile }: AdminClassesProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול שיעורים</h2>
        <button className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300">
          הוספת שיעור חדש
        </button>
      </div>

      {/* Classes Management Interface */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Classes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#4B2E83]">שיעורים פעילים</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-[#4B2E83]/70 text-center">אין שיעורים פעילים כרגע</p>
            </div>
          </div>

          {/* Class Registrations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#4B2E83]">הרשמות לשיעורים</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-[#4B2E83]/70 text-center">אין הרשמות לשיעורים</p>
            </div>
          </div>
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