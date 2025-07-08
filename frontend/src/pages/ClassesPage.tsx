import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaArrowLeft } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { Class, AvailableColorScheme } from '../types/class';

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

  // Helper function to get color scheme from class data or fallback
  const getColorScheme = (classItem: Class) => {
    // אם יש color_scheme מה-backend, השתמש בו
    if (classItem.color_scheme) {
      const schemes = {
        pink: {
          color: 'from-pink-500 to-rose-500',
          textColor: 'text-pink-600',
          bgColor: 'bg-pink-500',
          hoverColor: 'hover:bg-pink-600'
        },
        purple: {
          color: 'from-purple-500 to-indigo-500',
          textColor: 'text-purple-600',
          bgColor: 'bg-purple-500',
          hoverColor: 'hover:bg-purple-600'
        },
        emerald: {
          color: 'from-emerald-500 to-teal-500',
          textColor: 'text-emerald-600',
          bgColor: 'bg-emerald-500',
          hoverColor: 'hover:bg-emerald-600'
        },
        blue: {
          color: 'from-blue-500 to-cyan-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-500',
          hoverColor: 'hover:bg-blue-600'
        }
      };
      
      return schemes[classItem.color_scheme as keyof typeof schemes] || schemes.pink;
    }
    
    // fallback לפי שם השיעור
    const name = classItem.name.toLowerCase();
    const cat = classItem.category?.toLowerCase() || '';
    
    if (name.includes('ניסיון') || cat.includes('trial')) {
      return {
        color: 'from-pink-500 to-rose-500',
        textColor: 'text-pink-600',
        bgColor: 'bg-pink-500',
        hoverColor: 'hover:bg-pink-600'
      };
    }
    if (name.includes('בודד') || cat.includes('single')) {
      return {
        color: 'from-purple-500 to-indigo-500',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600'
      };
    }
    if (name.includes('אישי') || cat.includes('private')) {
      return {
        color: 'from-emerald-500 to-teal-500',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
        hoverColor: 'hover:bg-emerald-600'
      };
    }
    if (name.includes('מנוי') || name.includes('חודשי') || cat.includes('subscription')) {
      return {
        color: 'from-blue-500 to-cyan-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600'
      };
    }
    
    // Default color scheme
    return {
      color: 'from-gray-500 to-gray-600',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600'
    };
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...classes].reverse().map((classItem) => {
              const colorScheme = getColorScheme(classItem);
              const route = getClassRoute(classItem.slug);
              
              return (
                <div 
                  key={classItem.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <div className="relative h-48">
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
                  <div className="p-6">
                    <h3 className={`text-xl font-bold ${colorScheme.textColor} mb-3 font-agrandir-grand`}>
                      {classItem.name}
                    </h3>
                    <p className="text-[#2B2B2B] mb-4 font-agrandir-regular leading-relaxed text-sm">
                      {classItem.description}
                    </p>
                    <div className="space-y-2 mb-6">
                      {classItem.duration && (
                        <div className={`flex items-center ${colorScheme.textColor} text-sm`}>
                          <FaClock className="w-4 h-4 ml-2" />
                          <span className="font-agrandir-regular">{classItem.duration} דקות</span>
                        </div>
                      )}
                      {classItem.level && (
                        <div className={`flex items-center ${colorScheme.textColor} text-sm`}>
                          <FaUserGraduate className="w-4 h-4 ml-2" />
                          <span className="font-agrandir-regular">רמה: {classItem.level}</span>
                        </div>
                      )}
                    </div>
                    <Link
                      to={route}
                      className={`inline-flex items-center justify-center w-full ${colorScheme.bgColor} ${colorScheme.hoverColor} text-white px-4 py-2 rounded-xl transition-colors duration-300 font-medium text-sm`}
                    >
                      הרשמה
                      <FaArrowLeft className="w-3 h-3 mr-2" />
                    </Link>
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