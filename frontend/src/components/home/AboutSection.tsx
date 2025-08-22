import { HOMEPAGE_FLAGS, HOMEPAGE_ASSETS, HOMEPAGE_ALTS } from '../../config/homepageAssets';
import { assetUrl } from '../../lib/assets';

function AboutSection() {
  if (HOMEPAGE_FLAGS.aboutUseImage) {
    return (
      <section className="relative -mt-4 sm:-mt-0 pt-0 sm:pt-10 lg:pt-12 pb-6 sm:pb-8 lg:pb-10 bg-black overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <img
            src={assetUrl(HOMEPAGE_ASSETS.about.portrait)}
            alt={HOMEPAGE_ALTS.aboutPortrait}
            className="w-full h-auto rounded-xl object-cover"
            loading="lazy"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="relative -mt-4 sm:mt-0 pt-0 sm:pt-10 lg:pt-12 pb-6 sm:pb-8 lg:pb-10 bg-black overflow-hidden">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* קו דקורטיבי עליון */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <span className="inline-block w-16 sm:w-20 h-1 rounded-full bg-gradient-to-r from-[#EC4899] via-[#E6C17C] to-[#4B2E83]" />
        </div>
        {/* כותרת משופרת */}
        <h2 className="mb-6 sm:mb-8 font-agrandir-grand tracking-tight">
          <span className="block text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">נעים להכיר, אני</span>
          <span className="block text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#EC4899] drop-shadow-lg">אביגיל אלינה לדני</span>
        </h2>
        {/* טקסט אישי */}
        <p className="text-base sm:text-lg md:text-xl text-white/90 font-agrandir-regular leading-relaxed mb-4 sm:mb-6 px-2">
          התחלתי את דרכי בעולם הבלט והסלונים בגיל 13, ובהמשך הצטרפתי ללהקת היפ הופ והשתתפתי בתחרויות בתחרויות בישראל. לפני שנתיים גיליתי את ריקוד העקב – ומאז פיתחתי סגנון ייחודי משלי.
        </p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#EC4899] mb-4 sm:mb-6 px-2">
          היום, אני כאן כדי להוביל אותך להגשמה עצמית דרך תנועה.
        </p>
        <p className="text-base sm:text-lg md:text-xl text-white/90 font-agrandir-regular leading-relaxed mb-8 sm:mb-10 px-2">
          שיעורי ריקוד על עקב הם הזדמנות להתחבר לאנרגיה הנשית שלך, לאהוב את עצמך ולהגביר את הביטחון העצמי. כל צעד וריקוד הם דרך לפתח את עצמך, להרגיש חזקה ומחוברת לגוף, ולסיים כל שיעור עם תחושת סיפוק והעצמה.
        </p>
        {/* חתימה */}
        <div className="mt-6 sm:mt-8 flex flex-col items-end">
          <span className="text-lg sm:text-xl text-[#EC4899] font-bold font-agrandir-grand mb-1">אביגיל אלינה לדני</span>
          <span className="text-sm sm:text-base text-white/70 font-agrandir-regular italic">מורה ומדריכה לריקוד על עקבים</span>
        </div>
      </div>
    </section>
  );
}

export default AboutSection; 