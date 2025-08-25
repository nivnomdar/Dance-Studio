// Accessibility Statement page

function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-[#FDF9F6] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#4B2E83] mb-4 font-agrandir-grand">הצהרת נגישות</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-[#2B2B2B] text-sm">
            <strong>תאריך הצהרה ראשונה:</strong> 1 בינואר 2025<br />
            <strong>תאריך עדכון אחרון:</strong> 23 ביולי 2025
          </p>
        </div>

        <p className="text-[#2B2B2B] mb-6">אנחנו מחויבים להנגשת האתר בהתאם לתקן הישראלי (ת"י 5568) והנחיות WCAG 2.0 רמה AA.</p>

        <h2 className="text-xl sm:text-2xl font-bold text-[#4B2E83] mb-2">פרטי הארגון</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-[#2B2B2B] mb-2"><strong>שם הארגון:</strong> Ladances</p>
          <p className="text-[#2B2B2B] mb-2"><strong>כתובת:</strong> יוסף לישנסקי 6, ראשון לציון</p>
          <p className="text-[#2B2B2B] mb-2"><strong>אימייל:</strong> info@avigaildance.com</p>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#4B2E83] mb-2">תכונות נגישות באתר</h2>
        <ul className="list-disc pr-6 space-y-1 text-[#2B2B2B] mb-6">
          <li><strong>ניווט מקלדת:</strong> תמיכה מלאה בניווט באמצעות מקלדת (Tab, Enter, Space, Escape)</li>
          <li><strong>תמיכה בקוראי מסך:</strong> ARIA מלא, היררכיית כותרות נכונה, תיאורים מתאימים</li>
          <li><strong>תמונות נגישות:</strong> טקסט חלופי לתמונות משמעותיות, סימון תמונות דקורטיביות</li>
          <li><strong>טפסים נגישים:</strong> תוויות ברורות, הודעות שגיאה מקושרות, שדות חובה מסומנים</li>
          <li><strong>מודלים נגישים:</strong> focus trap, סגירה במקלדת, תיאורים מתאימים</li>
          <li><strong>ניגודיות צבעים:</strong> עומד בתקן AA (4.5:1) ללא תלות בצבע בלבד</li>
          <li><strong>התאמות תנועה:</strong> תמיכה ב-prefers-reduced-motion, כפתורי pause/play</li>
          <li><strong>הגדלת טקסט:</strong> תמיכה בהגדלת טקסט עד 200% ללא אובדן פונקציונליות</li>
          <li><strong>ניווט עקבי:</strong> מבנה אחיד בכל הדפים, ניווט ברור ועקבי</li>
        </ul>

        <h2 className="text-xl sm:text-2xl font-bold text-[#4B2E83] mb-2">התחייבויות לנגישות</h2>
        <ul className="list-disc pr-6 space-y-1 text-[#2B2B2B] mb-6">
          <li>המשך שיפור הנגישות בהתאם לטכנולוגיות חדשות</li>
          <li>הכשרת צוות למודעות לנגישות ושימוש בכלי נגישות</li>
          <li>בדיקות נגישות תקופתיות וטיפול בבעיות שזוהו</li>
          <li>התאמת האתר לצרכי משתמשים עם מוגבלויות שונות</li>
          <li>שמירה על תקני נגישות בעדכונים עתידיים</li>
        </ul>

        <h2 className="text-xl sm:text-2xl font-bold text-[#4B2E83] mb-2">מגבלות ידועות</h2>
        <ul className="list-disc pr-6 space-y-1 text-[#2B2B2B] mb-6">
          <li>חלק מהתמונות היסטוריות עשויות להיות ללא תיאור מלא</li>
          <li>סרטוני וידאו ישנים עשויים להיות ללא כתוביות</li>
          <li>במקרים נדירים, ייתכן עיכוב קצר בתגובה לפעולות מקלדת מורכבות</li>
        </ul>
        <p className="text-[#2B2B2B] mb-6">אם נתקלת בבעיה כלשהי בנגישות, נשמח שתדווחי לנו כדי שנוכל לתקן במהירות.</p>

        <h2 className="text-xl sm:text-2xl font-bold text-[#4B2E83] mb-2">הליך פנייה לנגישות</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-[#2B2B2B] mb-2"><strong>זמן תגובה מובטח:</strong> עד 48 שעות</p>
          <p className="text-[#2B2B2B] mb-2"><strong>זמן טיפול:</strong> עד שבוע ימים</p>
          <p className="text-[#2B2B2B] mb-2"><strong>מעקב:</strong> עדכון שוטף על התקדמות הטיפול</p>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#4B2E83] mb-2">יצירת קשר בנושא נגישות</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-[#4B2E83] mb-2">אימייל</h3>
            <a className="underline text-[#4B2E83] hover:text-[#EC4899]" href="mailto:accessibility@avigaildance.com">accessibility@avigaildance.com</a>
            <p className="text-sm text-gray-600 mt-1">לפניות נגישות ייעודיות</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-[#4B2E83] mb-2">טלפון</h3>
            <a className="underline text-[#4B2E83] hover:text-[#EC4899]" href="tel:+972-3-1234567">03-1234567</a>
            <p className="text-sm text-gray-600 mt-1">ימים א'-ה' 9:00-18:00</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-[#4B2E83] mb-2">נגישות שירותים פיזיים</h3>
          <p className="text-[#2B2B2B] text-sm mb-2">הסטודיו שלנו נגיש לבעלי מוגבלויות:</p>
          <ul className="list-disc pr-6 space-y-1 text-[#2B2B2B] text-sm">
            <li>כניסה נגישה עם רמפה</li>
            <li>שירותים נגישים</li>
            <li>מקומות חניה נגישים</li>
            <li>התאמות לשיעורים לפי צרכים מיוחדים</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-gray-600 text-sm text-center">
            הצהרה זו מתעדכנת מעת לעת בהתאם לשיפורים בנגישות האתר והשירותים.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccessibilityStatement;
