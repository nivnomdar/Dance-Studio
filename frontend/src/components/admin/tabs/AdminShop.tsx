import type { UserProfile } from '../../../types/auth';

interface AdminShopProps {
  profile: UserProfile;
}

export default function AdminShop({ profile }: AdminShopProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול חנות</h2>
        <button className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300">
          הוספת מוצר חדש
        </button>
      </div>

      {/* Shop Management Interface */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#4B2E83]">מוצרים בחנות</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-[#4B2E83]/70 text-center">אין מוצרים בחנות כרגע</p>
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#4B2E83]">הזמנות</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-[#4B2E83]/70 text-center">אין הזמנות כרגע</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10 rounded-xl hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">הוסף מוצר</h4>
          <p className="text-sm text-[#4B2E83]/70">הוסף מוצר חדש לחנות</p>
        </button>
        
        <button className="p-4 bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 border border-[#4B2E83]/10 rounded-xl hover:from-[#4B2E83]/10 hover:to-[#EC4899]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">נהל הזמנות</h4>
          <p className="text-sm text-[#4B2E83]/70">צפה וניהול הזמנות</p>
        </button>
        
        <button className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10 rounded-xl hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">דוחות מכירות</h4>
          <p className="text-sm text-[#4B2E83]/70">צפה בדוחות מכירות</p>
        </button>
      </div>

      {/* Inventory Management */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">ניהול מלאי</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl">
            <h4 className="font-semibold text-[#4B2E83] mb-2">מוצרים במלאי</h4>
            <p className="text-2xl font-bold text-[#EC4899]">0</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl">
            <h4 className="font-semibold text-[#4B2E83] mb-2">מוצרים אזלו</h4>
            <p className="text-2xl font-bold text-[#4B2E83]">0</p>
          </div>
        </div>
      </div>
    </div>
  );
} 