import React, { useState } from 'react';
import { ClassEditModal, ClassSessionsModal } from '../modals';
import { Class } from '../../../types';
import { getCategoryColorScheme } from '../../../utils/colorUtils';

interface ClassesTabProps {
  data: any;
  session: any;
  fetchClasses: (forceRefresh?: boolean) => void;
}

// Extended class type with additional computed fields
interface ProcessedClass extends Class {
  total_registrations: number;
  active_registrations: number;
  registrations: any[];
}

// Constants
const ALLOWED_FIELDS = [
  'name', 'slug', 'description', 'long_description', 'price', 'duration', 
  'level', 'age_group', 'max_participants', 'location', 'included',
  'image_url', 'video_url', 'category', 'color_scheme', 'registration_type',
  'group_credits', 'private_credits', 'is_active'
];

const STYLES = {
  input: "w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none",
  button: "px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300",
  buttonSecondary: "flex-1 px-4 py-2 bg-gray-100 text-[#4B2E83] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300",
  actionButton: "px-2 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs",
  actionButtonAlt: "px-2 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-xs"
};

export default function ClassesTab({ data, session, fetchClasses }: ClassesTabProps) {
  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [classSessionsModalOpen, setClassSessionsModalOpen] = useState(false);
  const [selectedClassForSessions, setSelectedClassForSessions] = useState<any>(null);

  // Helper functions
  const processClassesData = (): ProcessedClass[] => {
    return data.classes.map((cls: any) => {
      const classRegistrations = data.registrations.filter((reg: any) => reg.class_id === cls.id);
      const activeRegistrations = classRegistrations.filter((reg: any) => reg.status === 'active');
      
      return {
        id: cls.id,
        name: cls.name,
        description: cls.description,
        long_description: cls.long_description,
        price: cls.price,
        duration: cls.duration,
        level: cls.level,
        age_group: cls.age_group,
        max_participants: cls.max_participants,
        location: cls.location,
        included: cls.included,
        image_url: cls.image_url,
        video_url: cls.video_url,
        category: cls.category,
        color_scheme: cls.color_scheme,
        registration_type: cls.registration_type,
        group_credits: cls.group_credits,
        private_credits: cls.private_credits,
        is_active: cls.is_active,
        total_registrations: classRegistrations.length,
        active_registrations: activeRegistrations.length,
        registrations: classRegistrations,
        created_at: cls.created_at
      };
    });
  };

  const filterClasses = (classes: ProcessedClass[]): ProcessedClass[] => {
    return classes
      .filter(cls => {
        const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             cls.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             cls.category?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'active' && cls.is_active) ||
                             (filterStatus === 'inactive' && !cls.is_active);
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.active_registrations - a.active_registrations);
  };

  const calculateStatistics = (classes: ProcessedClass[]) => {
    return {
      totalClasses: classes.length,
      activeClasses: classes.filter(cls => cls.is_active).length,
      totalRegistrations: classes.reduce((sum, cls) => sum + cls.total_registrations, 0),
      activeRegistrations: classes.reduce((sum, cls) => sum + cls.active_registrations, 0),
      totalRevenue: classes.reduce((sum, cls) => sum + (cls.active_registrations * cls.price), 0)
    };
  };

  // Process data
  const processedClasses = processClassesData();
  const filteredClasses = filterClasses(processedClasses);
  const stats = calculateStatistics(processedClasses);

  // Event handlers
  const handleEditClass = (classData: any) => {
    setEditingClass(classData);
    setEditModalOpen(true);
  };

  const handleViewClassSessions = (classData: any) => {
    setSelectedClassForSessions(classData);
    setClassSessionsModalOpen(true);
  };

  const handleSaveClass = async (updatedClass: any) => {
    if (!session) return;
    
    const isNewClass = !updatedClass.id;
    setIsSaving(true);
    
    try {
      const url = isNewClass 
        ? `${import.meta.env.VITE_API_BASE_URL}/classes`
        : `${import.meta.env.VITE_API_BASE_URL}/classes/${updatedClass.id}`;
      const method = isNewClass ? 'POST' : 'PATCH';

      // Filter out computed fields
      const cleanData: any = {};
      ALLOWED_FIELDS.forEach(field => {
        if (updatedClass[field] !== undefined) {
          cleanData[field] = updatedClass[field];
        }
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(cleanData)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isNewClass ? 'create' : 'update'} class`);
      }

      await fetchClasses(true); // Force refresh to update the table
      setEditModalOpen(false);
      setEditingClass(null);
    } catch (error) {
      console.error(`Error ${isNewClass ? 'creating' : 'updating'} class:`, error);
      alert(`שגיאה ב${isNewClass ? 'יצירת' : 'עדכון'} השיעור`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  const handleAddNewClass = () => {
    handleEditClass({});
  };

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">


      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">חיפוש שיעור</label>
            <input
              type="text"
              placeholder="חפש לפי שם, תיאור או קטגוריה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">סטטוס שיעור</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="all">כל השיעורים</option>
              <option value="active">פעילים בלבד</option>
              <option value="inactive">לא פעילים</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleClearFilters}
              className="w-full sm:flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-[#4B2E83] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 text-xs sm:text-sm"
            >
              נקה פילטרים
            </button>
            <button 
              onClick={handleAddNewClass}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-xs sm:text-sm"
            >
              הוסיפי שיעור חדש
            </button>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">שיעורים במערכת</h2>
          <p className="text-sm sm:text-base text-[#4B2E83]/70">סקירה כללית של כל השיעורים הקיימים במערכת</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-2/5">שם השיעור</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/12">קטגוריה</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/12">מחיר</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/12">הכנסות</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/12">סטטוס</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/6">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {filteredClasses.map((cls) => (
                <tr 
                  key={cls.id} 
                  className={`transition-colors ${(() => {
                    const colorScheme = getCategoryColorScheme(cls.color_scheme);
                    return `${colorScheme.bg} hover:bg-opacity-90 hover:${colorScheme.bg.replace('100', '200')}`;
                  })()}`}
                >
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] truncate">{cls.name}</div>
                      <div className="text-xs text-[#4B2E83]/70 truncate" title={cls.description}>{cls.description}</div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                    <div className="flex justify-center">
                      {(() => {
                        const colorScheme = getCategoryColorScheme(cls.color_scheme);
                        return (
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium bg-white ${colorScheme.text} border ${colorScheme.border} shadow-sm hover:shadow-md transition-all duration-200 cursor-default min-w-[60px] sm:min-w-[80px] justify-center`}>
                            <span className="truncate" title={cls.category}>
                              {cls.category || 'כללי'}
                            </span>
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center text-[#EC4899] font-semibold text-xs sm:text-sm">₪{cls.price}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center text-[#EC4899] font-semibold text-xs sm:text-sm">
                    ₪{(cls.active_registrations * cls.price).toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                    <span className={`inline-flex items-center gap-1 px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${
                      cls.is_active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {cls.is_active ? (
                        <>
                          <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">פעיל</span>
                          <span className="sm:hidden">✓</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">לא פעיל</span>
                          <span className="sm:hidden">✗</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClass(cls);
                        }}
                        className={`${STYLES.actionButton} text-xs px-1 sm:px-2 py-1`}
                      >
                        ערוך
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClassSessions(cls);
                        }}
                        className={`${STYLES.actionButtonAlt} text-xs px-1 sm:px-2 py-1`}
                      >
                        קבוצות
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results */}
      {filteredClasses.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">לא נמצאו שיעורים</h3>
          <p className="text-[#4B2E83]/70">נסה לשנות את פרמטרי החיפוש או הסינון</p>
        </div>
      )}

      {/* Modals */}
      {editModalOpen && editingClass && (
        <ClassEditModal
          classData={editingClass}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingClass(null);
          }}
          onSave={handleSaveClass}
          isLoading={isSaving}
        />
      )}

      {classSessionsModalOpen && selectedClassForSessions && (
        <ClassSessionsModal
          classData={selectedClassForSessions}
          isOpen={classSessionsModalOpen}
          onClose={() => {
            setClassSessionsModalOpen(false);
            setSelectedClassForSessions(null);
          }}
          sessions={data.sessions || []}
          sessionClasses={data.session_classes || []}
          registrations={data.registrations || []}
        />
      )}
    </div>
  );
} 