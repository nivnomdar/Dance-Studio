import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaArrowLeft } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { Class } from '../types/class';
import { getSimpleColorScheme } from '../utils/colorUtils';

function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await classesService.getAllClasses();
        setClasses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);



  // Helper function to get route based on slug
  const getClassRoute = (slug: string) => {
    return `/class/${slug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#2B2B2B] font-agrandir-regular">טוען שיעורים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-agrandir-regular mb-4">שגיאה בטעינת השיעורים</p>
          <p className="text-[#2B2B2B] font-agrandir-regular">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-[#EC4899] text-white px-4 py-2 rounded-lg hover:bg-[#EC4899]/90 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

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

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#2B2B2B] font-agrandir-regular text-lg">אין שיעורים זמינים כרגע</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...classes].reverse().map((classItem) => {
              const colorScheme = getSimpleColorScheme(classItem);
              const route = getClassRoute(classItem.slug);
              
              return (
                <div 
                  key={classItem.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300 h-full lg:flex lg:flex-col"
                >
                  <div className="relative h-40 lg:h-48 hidden lg:block">
                    <img
                      src={classItem.image_url || '/carousel/image1.png'}
                      alt={classItem.name}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-3 right-3">
                      <span className={`${colorScheme.bgColor} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                        {classItem.price} ש"ח
                      </span>
                    </div>
                  </div>
                  <div className="p-4 lg:p-6 lg:flex lg:flex-col lg:h-full lg:pt-6 pt-4">
                    <h3 className={`text-lg lg:text-xl font-bold ${colorScheme.textColor} mb-3 font-agrandir-grand`}>
                      {classItem.name}
                    </h3>
                    <div className="h-16 lg:h-20 mb-4">
                      <p className="text-[#2B2B2B] font-agrandir-regular leading-relaxed text-xs lg:text-sm line-clamp-3">
                        {classItem.description}
                      </p>
                    </div>
                    <div className="space-y-2 mb-6 h-12 lg:h-14">
                      {classItem.duration && (
                        <div className={`flex items-center ${colorScheme.textColor} text-xs lg:text-sm`}>
                          <FaClock className="w-4 h-4 ml-2" />
                          <span className="font-agrandir-regular">{classItem.duration} דקות</span>
                        </div>
                      )}
                      {classItem.level && (
                        <div className={`flex items-center ${colorScheme.textColor} text-xs lg:text-sm`}>
                          <FaUserGraduate className="w-4 h-4 ml-2" />
                          <span className="font-agrandir-regular">רמה: {classItem.level}</span>
                        </div>
                      )}
                    </div>
                    <div className="lg:mt-auto">
                      <Link
                        to={route}
                        className={`inline-flex items-center justify-center w-full ${colorScheme.bgColor} ${colorScheme.hoverColor} text-white px-3 lg:px-4 py-2 rounded-xl transition-colors duration-300 font-medium text-xs lg:text-sm`}
                      >
                        הרשמה
                        <FaArrowLeft className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-20 bg-gradient-to-r from-[#EC4899] to-[#EC4899] rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6 font-agrandir-grand">
            רוצה להתנסות?
          </h2>
          <p className="text-white/90 text-xl mb-8 font-agrandir-regular max-w-2xl mx-auto">
            הזמיני שיעור ניסיון במחיר מיוחד של 60 ש"ח וקבלי טעימה מחוויה מקצועית
          </p>
          <Link
            to="/class/trial-class"
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