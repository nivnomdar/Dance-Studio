import { Link } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaArrowLeft } from 'react-icons/fa';

function ClassesPage() {
  const classes = [
    {
      title: 'שיעור ניסיון',
      description: 'שיעור ניסיון ראשון במחיר מיוחד. הזדמנות מצוינת להתנסות בריקוד על עקבים ולהכיר את הסטודיו.',
      schedule: 'לפי תיאום מראש',
      level: 'מתחילות',
      price: '60 ש"ח',
      image: '/carousel/image1.png',
      color: 'from-pink-500 to-rose-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600'
    },
    {
      title: 'שיעור בודד',
      description: 'שיעור בודד לקבוצת מתחילות. מתאים למי שרוצה להתנסות או להשתתף באופן חד פעמי.',
      schedule: 'לפי תיאום מראש',
      level: 'מתחילות',
      price: '75 ש"ח',
      image: '/carousel/image2.png',
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'שיעור אישי',
      description: 'שיעור פרטי אחד על אחד עם אביגיל. מתאים למי שרוצה תשומת לב אישית והתקדמות מהירה.',
      schedule: 'לפי תיאום מראש',
      level: 'כל הרמות',
      price: '120 ש"ח',
      image: '/carousel/image4.png',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600'
    },
    {
      title: 'מנוי חודשי',
      description: 'מנוי חודשי הכולל 4 שעות שיעורים. שומר מקום קבוע בקבוצה ומחיר משתלם.',
      schedule: 'שיעור שבועי קבוע',
      level: 'מתחילות',
      price: '350 ש"ח',
      image: '/carousel/image3.png',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDF9F6] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#EC4899] mb-6 font-agrandir-grand">
            שיעורים
          </h1>
          <div className="w-24 h-1 bg-[#EC4899] mx-auto mb-8"></div>
          <p className="text-xl text-[#2B2B2B] max-w-3xl mx-auto font-agrandir-regular leading-relaxed">
            בסטודיו שלי תמצאי שיעורי ריקוד עקב לקבוצת מתחילות. <br/>
            הצטרפי אלי לחוויה מקצועית ומהנה של ריקוד על עקבים.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {classes.map((classItem, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative h-48">
                <img
                  src={classItem.image}
                  alt={classItem.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${classItem.color} opacity-60`}></div>
                <div className="absolute bottom-3 right-3">
                  <span className={`${classItem.bgColor} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                    {classItem.price}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className={`text-xl font-bold ${classItem.textColor} mb-3 font-agrandir-grand`}>
                  {classItem.title}
                </h3>
                <p className="text-[#2B2B2B] mb-4 font-agrandir-regular leading-relaxed text-sm">
                  {classItem.description}
                </p>
                <div className="space-y-2 mb-6">
                  <div className={`flex items-center ${classItem.textColor} text-sm`}>
                    <FaClock className="w-4 h-4 ml-2" />
                    <span className="font-agrandir-regular">{classItem.schedule}</span>
                  </div>
                  <div className={`flex items-center ${classItem.textColor} text-sm`}>
                    <FaUserGraduate className="w-4 h-4 ml-2" />
                    <span className="font-agrandir-regular">רמה: {classItem.level}</span>
                  </div>
                </div>
                <Link
                  to={
                    classItem.title === 'שיעור ניסיון' ? '/trial-class' : 
                    classItem.title === 'שיעור בודד' ? '/single-class' : 
                    classItem.title === 'שיעור אישי' ? '/private-lesson' : 
                    '/contact'
                  }
                  className={`inline-flex items-center justify-center w-full ${classItem.bgColor} ${classItem.hoverColor} text-white px-4 py-2 rounded-xl transition-colors duration-300 font-medium text-sm`}
                >
                  הרשמה
                  <FaArrowLeft className="w-3 h-3 mr-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-[#EC4899] to-[#EC4899] rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6 font-agrandir-grand">
            רוצה להתנסות?
          </h2>
          <p className="text-white/90 text-xl mb-8 font-agrandir-regular max-w-2xl mx-auto">
            הזמיני שיעור ניסיון במחיר מיוחד של 60 ש"ח וקבלי טעימה מחוויה מקצועית
          </p>
          <Link
            to="/trial-class"
            className="inline-flex items-center justify-center bg-white text-[#EC4899] px-8 py-4 rounded-xl hover:bg-white/90 transition-colors duration-300 font-medium text-lg"
          >
            הזמיני שיעור ניסיון
            <FaArrowLeft className="w-5 h-5 mr-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ClassesPage; 