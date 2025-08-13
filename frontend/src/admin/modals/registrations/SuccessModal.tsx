import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNewRegistration: boolean;
  formData: any;
  searchResults: any[];
  classes: any[];
  sessions: any[];
}

export default function SuccessModal({
  isOpen,
  onClose,
  isNewRegistration,
  formData,
  searchResults,
  classes,
  sessions
}: SuccessModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('closeRegistrationModal'));
      if (isNewRegistration) {
        window.dispatchEvent(new CustomEvent('refreshAdminData'));
      }
    }
  };

  const handleRefresh = () => {
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-lg 2xl:max-w-md w-full mx-auto overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-3 sm:p-4 md:p-4 lg:p-3 xl:p-2 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10 mb-2 sm:mb-3 md:mb-4 lg:mb-2 xl:mb-1">
            <img 
              src="/images/LOGOladance.png" 
              alt="Ladance Avigail" 
              className="h-10 sm:h-12 md:h-14 lg:h-12 xl:h-10 w-auto mx-auto drop-shadow-lg"
              loading="eager"
            />
          </div>
          <div className="relative z-10 mb-2 sm:mb-3 md:mb-2 lg:mb-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-12 lg:h-12 xl:w-10 xl:h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-6 lg:h-6 xl:w-5 xl:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-base font-bold mb-1 font-agrandir-grand leading-tight">
              {isNewRegistration ? 'הרשמה נוצרה בהצלחה! 🎉' : 'הרשמה עודכנה בהצלחה! ✅'}
            </h2>
            <p className="text-xs sm:text-sm md:text-sm lg:text-xs text-white/90">הפרטים נשמרו במערכת</p>
          </div>
        </div>

        <div className="p-2 sm:p-3 md:p-4 lg:p-3 xl:p-2">
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-3 xl:p-2 mb-2 sm:mb-3 md:mb-3 lg:mb-2">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-base xl:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3 md:mb-3 lg:mb-2 text-center">פרטי ההרשמה</h3>
            <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-1.5 xl:space-y-1 text-xs sm:text-sm md:text-sm lg:text-xs text-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">משתמש:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {searchResults.find(p => p.id === formData.user_id)?.first_name} {searchResults.find(p => p.id === formData.user_id)?.last_name}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">שיעור:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {classes.find(c => c.id === formData.class_id)?.name}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">תאריך:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {formData.selected_date ? new Date(formData.selected_date).toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'לא נבחר'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">שעה:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {formData.selected_time ? formData.selected_time.split(' עד ')[0] : 'לא נבחרה'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">מחיר:</span>
                <span className="font-bold text-[#EC4899] text-right sm:text-left">{formData.purchase_price} ש"ח</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">תשלום:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {formData.used_credit ? `קרדיט ${formData.credit_type === 'group' ? 'קבוצתי' : 'פרטי'}` : `${formData.purchase_price} ש"ח`}
                </span>
              </div>
              {(() => {
                const selectedClass = classes.find(c => c.id === formData.class_id);
                const isSubscription = selectedClass?.category === 'subscription';
                const isPrivate = selectedClass?.category === 'private';
                const isPurchase = !formData.used_credit && Number(formData.purchase_price) > 0;
                const didDeduct = formData.used_credit || (isPurchase && (isSubscription || isPrivate));
                return (
                  <>
                    {isPurchase && (isSubscription || isPrivate) && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                        <span className="font-medium text-right sm:text-left">הוספת מנוי:</span>
                        <span className="font-bold text-blue-600 text-right sm:text-left">
                          ✓ נוספו {(isSubscription ? selectedClass?.group_credits : selectedClass?.private_credits) || 0} קרדיטים למשתמש
                        </span>
                      </div>
                    )}
                    {didDeduct && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                        <span className="font-medium text-right sm:text-left">סטטוס קרדיט:</span>
                        <span className="font-bold text-green-600 text-right sm:text-left">✓ הורד קרדיט אחד למשתמש</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-3 lg:p-2 xl:p-1.5 mb-2 sm:mb-3 md:mb-3 lg:mb-2">
            <div className="flex items-start gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-1.5 xl:gap-1">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-4 lg:h-4 xl:w-3 xl:h-3 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3 md:h-3 lg:w-2.5 lg:h-2.5 xl:w-2 xl:h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right flex-1">
                <h4 className="font-semibold text-blue-900 mb-1 text-xs sm:text-sm md:text-sm lg:text-xs">מה הלאה?</h4>
                <ul className="text-xs sm:text-xs md:text-xs lg:text-xs text-blue-800 space-y-0.5">
                  <li>• ההרשמה נשמרה במערכת</li>
                  <li>• אפשר לערוך או לבטל מהפאנל הניהול</li>
                  {(() => {
                    const selectedClass = classes.find(c => c.id === formData.class_id);
                    const isSubscription = selectedClass?.category === 'subscription';
                    const isPrivate = selectedClass?.category === 'private';
                    const isPurchase = !formData.used_credit && Number(formData.purchase_price) > 0;
                    if (isPurchase && (isSubscription || isPrivate)) {
                      const added = ((isSubscription ? selectedClass?.group_credits : selectedClass?.private_credits) || 0) - 1;
                      return <li>• המשתמש קיבל {added} קרדיטים זמינים לשימוש עתידי</li>;
                    }
                    return null;
                  })()}
                </ul>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-1.5 xl:space-y-1">
            <button onClick={handleClose} className="w-full bg-gradient-to-r from-[#EC4899] to-[#4B2E83] hover:from-[#4B2E83] hover:to-[#EC4899] text-white py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-1.5 px-3 sm:px-4 md:px-5 lg:px-3 xl:px-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-sm lg:text-xs transition-all duration-300 shadow-lg hover:shadow-xl">סגור</button>
            <button onClick={handleRefresh} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-1.5 px-3 sm:px-4 md:px-5 lg:px-3 xl:px-2 rounded-lg sm:rounded-xl font-medium transition-colors duration-200 text-xs sm:text-sm md:text-sm lg:text-xs">רענן דף</button>
          </div>
        </div>
        <div className="p-1.5 sm:p-2 md:p-3 lg:p-2 xl:p-1 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleClose} className="w-full py-1.5 sm:py-2 md:py-2.5 lg:py-1.5 xl:py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm md:text-sm lg:text-xs">חזרה</button>
        </div>
      </div>
    </div>
  );
}


