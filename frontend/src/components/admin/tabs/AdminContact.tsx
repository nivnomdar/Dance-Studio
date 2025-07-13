import type { UserProfile } from '../../../types/auth';

interface AdminContactProps {
  profile: UserProfile;
}

export default function AdminContact({ profile }: AdminContactProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#4B2E83]">פניות צור קשר</h2>

      {/* Contact Messages Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">סה"כ פניות</h3>
          <p className="text-3xl font-bold text-[#EC4899]">0</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">פניות שהתקבלו</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-6 rounded-2xl border border-[#4B2E83]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">פניות חדשות</h3>
          <p className="text-3xl font-bold text-[#4B2E83]">0</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">טרם נענו</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">נענו</h3>
          <p className="text-3xl font-bold text-[#EC4899]">0</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">פניות שנענו</p>
        </div>
      </div>

      {/* Contact Messages List */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-[#4B2E83]">רשימת פניות</h3>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button className="px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm">
              כל הפניות
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm">
              חדשות
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-[#4B2E83] mb-2">אין פניות כרגע</h4>
          <p className="text-[#4B2E83]/70">כאשר יתקבלו פניות חדשות, הן יופיעו כאן</p>
        </div>
      </div>

      {/* Contact Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10 rounded-xl hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">הגדרות טופס</h4>
          <p className="text-sm text-[#4B2E83]/70">הגדר שדות ושאלות בטופס צור קשר</p>
        </button>
        
        <button className="p-4 bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 border border-[#4B2E83]/10 rounded-xl hover:from-[#4B2E83]/10 hover:to-[#EC4899]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">תבניות תשובה</h4>
          <p className="text-sm text-[#4B2E83]/70">צור תבניות תשובה מהירות</p>
        </button>
      </div>
    </div>
  );
} 