import { HOMEPAGE_FLAGS, HOMEPAGE_ASSETS, HOMEPAGE_ALTS } from '../../config/homepageAssets';
import { assetUrl } from '../../lib/assets';

function AboutSection() {
  if (HOMEPAGE_FLAGS.aboutUseImage) {
    return (
      <section className="relative -mt-4 sm:-mt-0 pt-0 sm:pt-4 lg:pt-0 pb-2 sm:pb-4 lg:pb-5 bg-black overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <img
            src={assetUrl(HOMEPAGE_ASSETS.about.portrait)}
            alt={HOMEPAGE_ALTS.aboutPortrait}
            className="w-full h-auto rounded-xl object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center text-center p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg mb-2">
              שיעורי עקבים והעצמה נשית
            </h1>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#EC4899] drop-shadow-lg mb-4">
              הצעד הראשון שלך לעוצמה, ביטחון וחיבור לגוף!
            </h2>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-6 max-w-xl">
              ברוכה הבאה לסטודיו Ladances - מרחב לנשים שרוצות להרגיש חזקות, משוחררות ומלאות אנרגיה.
              בשיעורי העקבים שלי כל צעד מקרב אותך לנשיות שלך, לתחושת כוח, ביטחון וסיפוק אמיתי.
            </p>
            <p className="text-lg sm:text-xl text-white/90 font-semibold mb-4">
              רוצה לגלות איך זה מרגיש?
            </p>
            <button className="px-6 py-3 bg-[#EC4899] hover:bg-[#D43483] text-white font-bold rounded-full text-lg transition-colors duration-300 shadow-lg">
              הצטרפי לשיעור ניסיון!
            </button>
          </div>
        </div>
      </section>
    );
  }


}

export default AboutSection; 