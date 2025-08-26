import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDF9F6]">
      <Navbar />
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#4B2E83] mb-8 text-center font-agrandir-grand">
              תנאי שימוש
            </h1>
            
            <div className="prose prose-lg max-w-none text-right" dir="rtl">
              <p className="text-gray-600 mb-6">
                <strong>תאריך עדכון אחרון:</strong> 26 באוגוסט 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  1. מבוא ומחויבות משפטית
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ברוכות הבאות לאתר "Ladances" (www.ladances.com). שימוש באתר זה מהווה הסכמה לתנאי השימוש המפורטים להלן.
                  תנאים אלה חלים על כל השימוש באתר ובשירותים הניתנים דרכו.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>מחויבות משפטית:</strong> תנאים אלה מהווים חוזה מחייב בין המשתמשת לבין Ladances.
                  המשך השימוש באתר מהווה אישור לתנאים אלה.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>הערה משפטית:</strong> תנאים אלה עומדים בדרישות החוק הישראלי, כולל חוק הגנת הצרכן התשמ"א-1981,
                    חוק הגנת הפרטיות התשמ"א-1981, ותקנות הגנת הפרטיות (אבטחת מידע) התשע"ז-2017.
                  </p>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mt-4">
                  <p className="text-gray-700 text-sm">
                    <strong>הערה חשובה:</strong> האתר והשירותים מיועדים לנשים בלבד. רישום לשיעורים ורכישת מוצרים מותנה באישור 
                    זהות נשית בהתאם למדיניות הסטודיו. תנאי זה מהווה חלק בלתי נפרד מהחוזה בין הצדדים.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  2. הגדרות משפטיות
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"האתר"</strong> - אתר האינטרנט של Ladances בכתובת www.ladances.com
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"השירותים"</strong> - שירותי רישום לשיעורי ריקוד, מידע על שיעורים וכל שירות אחר הניתן באתר
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"המשתמש"</strong> - אישה המשתמשת באתר או בשירותים, כולל מבקרות, רשומות ומנויות
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"הסטודיו"</strong> - Ladances, אלינה לדני
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"שיעור"</strong> - שיעור ריקוד, סדנה או פעילות אחרת המוצעת דרך האתר
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"החנות"</strong> - חנות המוצרים המקוונת באתר, כולל מוצרי ריקוד, ציוד ומוצרים נלווים
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"מוצר"</strong> - כל פריט הניתן לרכישה דרך החנות באתר
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"משתמשת"</strong> - אישה המשתמשת באתר או בשירותים, כולל מבקרות, רשומות ומנויות
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  3. רישום וחשבון משתמש - דרישות חוקיות
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    לרישום לשיעורים נדרש ליצור חשבון משתמש. המשתמשת מתחייבת:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>לספק מידע מדויק, מלא ועדכני בהתאם לדרישות החוק</li>
                    <li>לשמור על סודיות פרטי ההתחברות ולא להעבירם לאחרים</li>
                    <li>להודיע מיד על כל שימוש לא מורשה בחשבון או הפרת אבטחה</li>
                    <li>לא להעביר את החשבון לאחרים או לאפשר שימוש בו על ידי צד שלישי</li>
                    <li>לעדכן מידע אישי בהתאם לשינויים</li>
                    <li>לציית לכללי האבטחה והשימוש באתר</li>
                  </ul>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      <strong>אחריות משפטית:</strong> המשתמשת נושאת באחריות מלאה לכל פעולה המתבצעת מחשבונה.
                      הסטודיו לא יישא באחריות לשימוש לא מורשה בחשבון.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  4. הזמנת שיעורים ותשלומים - תנאים מסחריים
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">הזמנות ותנאים:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>הזמנות מתבצעות דרך האתר בלבד, בהתאם לחוק הגנת הצרכן</li>
                      <li>הזמנה תיחשב כמושלמת רק לאחר אישור התשלום ואישור הסטודיו</li>
                      <li>שמירת מקום בשיעור מותנית בתשלום מלא ובהתאם לתנאי הביטול</li>
                      <li>הסטודיו רשאי להגביל מספר משתתפים בשיעור מסוים</li>
                      <li>הזמנות כפופות לזמינות ולשינויים בלוח השיעורים</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">תשלומים ומע"מ:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>המחירים מוצגים בשקלים חדשים כולל מע"מ, בהתאם לחוק מע"מ</li>
                      <li>תשלום מתבצע באמצעות כרטיסי אשראי מאובטחים או העברה בנקאית</li>
                      <li>אישור התשלום יישלח בדוא"ל עם חשבונית מס מפורטת</li>
                      <li>כל התשלומים מתבצעים דרך מערכות מאובטחות עם הצפנה מתקדמת</li>
                      <li>הסטודיו רשאי לשנות מחירים בהתאם להודעה מוקדמת של 30 ימים</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  5. ביטולים והחזרים - זכויות צרכן
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">ביטול שיעור - זכויות המשתמש:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>ניתן לבטל שיעור עד 48 שעות לפני מועד השיעור עם החזר מלא</li>
                      <li>ביטול 24-48 שעות לפני השיעור - החזר של 50% מהתשלום</li>
                      <li>ביטול מאוחר יותר לא יזכה בהחזר, אלא אם כן מטעמי בריאות</li>
                      <li>במקרה של ביטול מצד הסטודיו, יוצע שיעור חלופי או החזר מלא</li>
                      <li>ביטול בשל נסיבות מיוחדות ייבחן לגופו של עניין</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">החזרים ותנאים:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>החזרים יתבצעו תוך 14 ימי עסקים, בהתאם לחוק הגנת הצרכן</li>
                      <li>החזר יועבר לאותו אמצעי תשלום ששימש להזמנה</li>
                      <li>עמלות בנק או כרטיס אשראי לא יוחזרו</li>
                      <li>החזרים כפופים לאישור הסטודיו ולבדיקת התנאים</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      <strong>הגנה על צרכן:</strong> תנאי הביטול וההחזר עומדים בדרישות חוק הגנת הצרכן 
                      ומספקים הגנה מקסימלית למשתמשים.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  6. כללי התנהגות ובטיחות
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  המשתמש מתחייב:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>להתנהג בכבוד כלפי המדריכים, הצוות והמשתתפים האחרים</li>
                  <li>להגיע לשיעורים בזמן ולציית להוראות המדריכים</li>
                  <li>ללבוש בגדים מתאימים לשיעורי ריקוד ובגדי ספורט נוחים</li>
                  <li>לא להפריע למהלך השיעור או לפעילות משתתפים אחרים</li>
                  <li>לציית להוראות הבטיחות ולכללי הסטודיו</li>
                  <li>לא להביא מזון או משקאות לחדרי השיעורים (למעט מים)</li>
                  <li>לשמור על ניקיון הסטודיו והציוד המשותף</li>
                  <li>להודיע על כל בעיה או פציעה לפני או במהלך השיעור</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>השעיה וסילוק:</strong> הסטודיו רשאי להשעות או לסלק משתמשים המפרים כללי התנהגות 
                    או בטיחות, ללא החזר כספי.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  7. אחריות ובריאות - הגנות משפטיות
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>המשתמש מתחייב:</strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>להודיע על בעיות בריאותיות לפני השיעור או בעיות רפואיות מתמשכות</li>
                    <li>להפסיק פעילות במקרה של כאב, אי נוחות או סחרחורת</li>
                    <li>לקחת אחריות על בריאותו האישית וכושרו הגופני</li>
                    <li>להתייעץ עם רופא לפני השתתפות בשיעורים במקרה של בעיות רפואיות</li>
                    <li>להודיע על הריון או מצבים רפואיים מיוחדים</li>
                  </ul>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      <strong>הגבלת אחריות:</strong> הסטודיו לא יישא באחריות לנזקים הנובעים מהשתתפות בשיעורים, 
                      למעט במקרים של רשלנות מצד הסטודיו או המדריכים. האחריות מוגבלת לסכום התשלום ששולם.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  8. קניין רוחני וזכויות יוצרים
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  כל התוכן באתר, כולל טקסטים, תמונות, סרטונים, לוגו, עיצוב וקוד, הוא קניינה של Ladances 
                  או מוגן בזכויות יוצרים של צדדים שלישיים.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>אסור להעתיק, להפיץ או להשתמש בתוכן ללא אישור בכתב</li>
                  <li>אסור להקליט שיעורים או להפיץ חומרים ללא אישור</li>
                  <li>אסור להשתמש בשם הסטודיו או הלוגו למטרות מסחריות</li>
                  <li>כל הפרה של זכויות יוצרים תיענה בהליכים משפטיים</li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>הגנה משפטית:</strong> הסטודיו שומר על כל הזכויות המשפטיות להגנה על קניינו הרוחני 
                    ויפעל נגד כל הפרה של זכויות אלה.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  9. Cookies וטכנולוגיות אחסון - תנאי שימוש
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    השימוש באתר כרוך בשימוש ב-Cookies וטכנולוגיות אחסון אחרות. המשתמש מסכים לשימוש בטכנולוגיות אלה:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li><strong>Cookies חיוניים:</strong> נדרשים לפעולת האתר הבסיסית ואימות משתמשים</li>
                    <li><strong>Cookies לשיפור ביצועים:</strong> לשמירת העדפות ושיפור חוויית המשתמש</li>
                    <li><strong>localStorage:</strong> לשמירת מידע זמני וניהול התחברות</li>
                    <li><strong>Session Storage:</strong> לניהול פעילות זמנית במהלך השימוש באתר</li>
                  </ul>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      <strong>בקרה על Cookies:</strong> המשתמש יכול לשלוט ב-Cookies דרך הגדרות הדפדפן 
                      או לבקש מחיקה דרך האתר. מחיקת Cookies חיוניים עלולה לפגום בפעולת האתר.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  10. נגישות ושירותים מותאמים
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    הסטודיו מחויב לספק שירותים נגישים בהתאם לתקן הישראלי (ת"י 5568) וחוק שוויון זכויות לאנשים עם מוגבלות:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li><strong>נגישות האתר:</strong> האתר עומד בתקני נגישות WCAG 2.1 רמה AA</li>
                    <li><strong>נגישות דיגיטלית:</strong> תמיכה מלאה בטכנולוגיות נגישות מקוונות</li>
                    <li><strong>שיעורים מקוונים:</strong> שיעורים מקוונים נגישים עם תמיכה טכנית</li>
                    <li><strong>שירותים אלטרנטיביים:</strong> שיעורים פרטיים בבית וסדנאות במקומות נגישים</li>
                    <li><strong>תמיכה טכנית:</strong> תמיכה טכנית מלאה בשיעורים מקוונים</li>
                  </ul>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 text-sm">
                      <strong>הערה חשובה:</strong> הסטודיו אינו נגיש פיזית בגלל מדרגות. אנו מציעים פתרונות אלטרנטיביים 
                      כמו שיעורים מקוונים ושיעורים פרטיים בבית הלקוחה.
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      <strong>פניות נגישות:</strong> כל פנייה לנגישות תטופל תוך 48 שעות עם פתרון מפורט. 
                      לפרטים נוספים ראה "הצהרת נגישות" באתר.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  11. הגבלת אחריות והגנות משפטיות
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    הסטודיו לא יישא באחריות לנזקים עקיפים, תוצאתיים או מיוחדים הנובעים משימוש בשירותים.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>האחריות מוגבלת לסכום התשלום ששולם עבור השירות הספציפי</li>
                    <li>הסטודיו לא יישא באחריות לנזקים הנובעים מכוח עליון או נסיבות חיצוניות</li>
                    <li>האחריות לא תחול על שירותים שניתנו על ידי צדדים שלישיים</li>
                    <li>הגבלות אחריות אלה לא יחולו במקרים של רשלנות או הפרה מכוונת</li>
                  </ul>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      <strong>הגנות משפטיות:</strong> תנאים אלה מספקים הגנה משפטית לסטודיו תוך שמירה על זכויות המשתמשים 
                      לפי החוק הישראלי.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  12. שינויים בתנאים ועדכונים
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    הסטודיו רשאי לעדכן תנאים אלה מעת לעת בהתאם לשינויים בחוק, טכנולוגיה או שירותים.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">תהליך עדכון:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>הודעה מוקדמת:</strong> הודעה על שינויים 30 ימים מראש</li>
                      <li><strong>עדכון באתר:</strong> פרסום השינויים בדף זה עם תאריך עדכון</li>
                      <li><strong>הודעה במייל:</strong> שליחת הודעה לכל המשתמשים הרשומים</li>
                      <li><strong>אישור הסכמה:</strong> דרישה לאישור הסכמה לשינויים משמעותיים</li>
                      <li><strong>המשך שימוש:</strong> המשך השימוש באתר לאחר פרסום השינויים מהווה הסכמה לתנאים החדשים</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  13. דין שיפוט ופתרון מחלוקות
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    תנאים אלה כפופים לדין הישראלי בלבד. כל מחלוקת תיפתר בבית המשפט המוסמך בתל אביב-יפו.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li><strong>פתרון בדרכי שלום:</strong> ייעשה ניסיון לפתור מחלוקות בדרכי שלום לפני פנייה לבית המשפט</li>
                    <li><strong>גישור:</strong> במקרה של מחלוקת, יוצע הליך גישור עם מגשר מוסמך</li>
                    <li><strong>בוררות:</strong> במקרים מסוימים, יוצע הליך בוררות לפי חוק הבוררות</li>
                    <li><strong>בית משפט:</strong> רק אם לא ניתן לפתור בדרכי שלום, תיפתר המחלוקת בבית המשפט</li>
                  </ul>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      <strong>הערה משפטית:</strong> תנאי זה מספק פתרון מחלוקות יעיל תוך שמירה על זכויות המשתמשים 
                      והסטודיו כאחד.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  14. הוראות מעבר ותוקף
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    תנאים אלה נכנסים לתוקף מיום פרסומם באתר ומחליפים כל תנאי קודם.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li><strong>תוקף מיידי:</strong> התנאים חלים על כל שימוש באתר מיום פרסומם</li>
                    <li><strong>תנאים קודמים:</strong> כל תנאי קודם מבוטל עם כניסת תנאים אלה לתוקף</li>
                    <li><strong>הוראות מעבר:</strong> הזמנות קיימות ימשיכו להתנהל לפי התנאים הקודמים</li>
                    <li><strong>עדכונים עתידיים:</strong> כל עדכון עתידי יחול על שימוש עתידי באתר</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  15. יצירת קשר ופניות
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    לשאלות או הבהרות בנוגע לתנאי השימוש, ניתן ליצור קשר:
                  </p>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-[#4B2E83] mb-2">טופס פנייה לנגישות באתר</h3>
                    <p className="text-gray-700 text-sm mb-2">
                      ניתן למלא טופס פנייה לנגישות ישירות באתר תחת "צור קשר" ← ולכתוב בנושא: "פנייה על התנאים"
                    </p>
                    <p className="text-gray-700 text-sm">
                      הטופס כולל שדות נגישים עם תיאורים מפורטים ותמיכה מלאה במקלדת
                    </p>
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600 text-sm text-center">
                  תנאים אלה מתעדכנים מעת לעת בהתאם לשינויים בחוק ובשירותים. 
                  עדכון אחרון: 26 באוגוסט 2025. תנאים אלה מהווים חלק בלתי נפרד מהשימוש באתר.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService; 