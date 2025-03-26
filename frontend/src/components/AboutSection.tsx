import PhotosCarousel from "./PhotosCarousel";

function AboutSection() {
  return (
    <div className="rtl text-white text-center p-3">
      <div className="max-w-3xl">
        {/* <h5 className="text-xl mt-2">אביגיל אלינה לדני</h5> */}
        <p className="font-agrandir-grand leading-relaxed text-right justify-hebrew pb-5 pt-5">
          בגיל 13 נחשפתי לעולם ה-״היפ הופ״ ועם השנים הצטרפתי ללהקה והתחרתי
          בתחרויות היפ הופ בישראל. לפני שנתיים, נחשפתי לסגנון ריקוד על עקב
          ופיתחתי את הסגנון הייחודי שלי בעולם התנועה. היום, אני כאן להוביל אותך
          להגשמה עצמית דרך תנועה.
        </p>
        {/* דיפדוף תמונות  */}
        <PhotosCarousel />

        <p className="font-agrandir-grand leading-relaxed text-right justify-hebrew mt-5 mb-5">
          שיעורי ריקוד על עקב הם הזדמנות להתחבר לאנרגיה הנקבית שלך, לאהוב את
          עצמך ולהגביר את הביטחון העצמי שלך. כל צעד וריקוד הם דרך לפתח את עצמך,
          להרגיש יותר חזקה ומחוברת לגוף שלך, ולסיים כל שיעור עם תחושת סיפוק
          והעצמה.
        </p>
      </div>
    </div>
  );

  // <img src="/AboutMe(2).png" />;
}

export default AboutSection;
