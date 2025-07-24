import React from 'react';

function AboutSection() {
  return (
    <section className="relative py-20 bg-black overflow-hidden">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* קו דקורטיבי עליון */}
        <div className="flex justify-center mb-6">
          <span className="inline-block w-20 h-1 rounded-full bg-gradient-to-r from-[#EC4899] via-[#E6C17C] to-[#4B2E83]" />
        </div>
        {/* כותרת משופרת */}
        <h2 className="mb-8 font-agrandir-grand tracking-tight">
          <span className="block text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">נעים להכיר, אני</span>
          <span className="block text-4xl md:text-5xl font-extrabold text-[#EC4899] drop-shadow-lg">אביגיל אלינה לדני</span>
        </h2>
        {/* טקסט אישי */}
        <p className="text-lg md:text-xl text-white/90 font-agrandir-regular leading-relaxed mb-6">
          התחלתי את דרכי בעולם הבלט והסלונים בגיל 13, ובהמשך הצטרפתי ללהקת היפ הופ והשתתפתי בתחרויות בתחרויות בישראל. לפני שנתיים גיליתי את ריקוד העקב – ומאז פיתחתי סגנון ייחודי משלי.
        </p>
        <p className="text-xl md:text-2xl font-bold text-[#EC4899] mb-6">
          היום, אני כאן כדי להוביל אותך להגשמה עצמית דרך תנועה.
        </p>
        <p className="text-lg md:text-xl text-white/90 font-agrandir-regular leading-relaxed mb-10">
          שיעורי ריקוד על עקב הם הזדמנות להתחבר לאנרגיה הנשית שלך, לאהוב את עצמך ולהגביר את הביטחון העצמי. כל צעד וריקוד הם דרך לפתח את עצמך, להרגיש חזקה ומחוברת לגוף, ולסיים כל שיעור עם תחושת סיפוק והעצמה.
        </p>
        {/* חתימה */}
        <div className="mt-8 flex flex-col items-end">
          <span className="text-xl text-[#EC4899] font-bold font-agrandir-grand mb-1">אביגיל אלינה לדני</span>
          <span className="text-base text-white/70 font-agrandir-regular italic">מורה ומדריכה לריקוד על עקבים</span>
        </div>
      </div>
    </section>
  );
}

export default AboutSection; 