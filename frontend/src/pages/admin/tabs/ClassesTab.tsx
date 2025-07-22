import React, { useState } from 'react';
import { ClassEditModal, ClassSessionsModal } from '../modals';

interface ClassesTabProps {
  data: any;
  session: any;
  fetchClasses: (forceRefresh?: boolean) => void;
}

export default function ClassesTab({ data, session, fetchClasses }: ClassesTabProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [classSessionsModalOpen, setClassSessionsModalOpen] = useState(false);
  const [selectedClassForSessions, setSelectedClassForSessions] = useState<any>(null);

  // Define the processed class type
  type ProcessedClass = {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    category?: string;
    is_active: boolean;
    total_registrations: number;
    active_registrations: number;
    registrations: any[];
    created_at: string;
  };

  // Process classes data for reports
  console.log('ClassesTab: Raw classes data:', data.classes);
  const processedClasses: ProcessedClass[] = data.classes.map((cls: any) => {
    const classRegistrations = data.registrations.filter((reg: any) => reg.class_id === cls.id);
    const activeRegistrations = classRegistrations.filter((reg: any) => reg.status === 'active');
    
    return {
      id: cls.id,
      name: cls.name,
      description: cls.description,
      price: cls.price,
      duration: cls.duration,
      category: cls.category,
      is_active: cls.is_active,
      total_registrations: classRegistrations.length,
      active_registrations: activeRegistrations.length,
      registrations: classRegistrations,
      created_at: cls.created_at
    };
  });
  console.log('ClassesTab: Processed classes:', processedClasses);

  // Filter classes
  console.log('ClassesTab: Filter status:', filterStatus);
  const filteredClasses = processedClasses
    .filter(cls => {
      const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && cls.is_active) ||
                           (filterStatus === 'inactive' && !cls.is_active);
      
      console.log(`ClassesTab: Class "${cls.name}" - is_active: ${cls.is_active}, matchesStatus: ${matchesStatus}`);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => b.active_registrations - a.active_registrations);
  console.log('ClassesTab: Filtered classes:', filteredClasses);

  // Key Statistics
  const totalClasses = processedClasses.length;
  const activeClasses = processedClasses.filter(cls => cls.is_active).length;
  const totalRegistrations = processedClasses.reduce((sum, cls) => sum + cls.total_registrations, 0);
  const activeRegistrations = processedClasses.reduce((sum, cls) => sum + cls.active_registrations, 0);
  const totalRevenue = processedClasses.reduce((sum, cls) => sum + (cls.active_registrations * cls.price), 0);

  // Handle class edit
  const handleEditClass = (classData: any) => {
    setEditingClass(classData);
    setEditModalOpen(true);
  };

  // Handle view class sessions
  const handleViewClassSessions = (classData: any) => {
    setSelectedClassForSessions(classData);
    setClassSessionsModalOpen(true);
  };

  // Handle save class
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
      const allowedFields = [
        'name', 'slug', 'description', 'price', 'duration', 
        'level', 'category', 'is_active'
      ];
      
      const cleanData: any = {};
      allowedFields.forEach(field => {
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

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
      {/* Key Statistics */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#EC4899]">{totalClasses}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">סה"כ שיעורים</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#4B2E83]">{activeClasses}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">שיעורים פעילים</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#EC4899]">{activeRegistrations}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#4B2E83]">₪{totalRevenue.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">הכנסות צפויות</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#EC4899]">{totalRegistrations}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">סה"כ הרשמות</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">חיפוש שיעור</label>
            <input
              type="text"
              placeholder="חפש לפי שם, תיאור או קטגוריה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">סטטוס שיעור</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="all">כל השיעורים</option>
              <option value="active">פעילים בלבד</option>
              <option value="inactive">לא פעילים</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-[#4B2E83] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
            >
              נקה פילטרים
            </button>
            <button 
              onClick={() => handleEditClass({})}
              className="px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm"
            >
              הוסף שיעור חדש
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
          <table className="w-full min-w-[600px] sm:min-w-[800px]">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-24 sm:w-28">שם השיעור</th>
                <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-16 sm:w-20">קטגוריה</th>
                <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-12 sm:w-16">מחיר</th>

                <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-16 sm:w-20">הכנסות צפויות</th>
                <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-12 sm:w-16">סטטוס</th>
                <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-16 sm:w-20">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {filteredClasses.map((cls) => (
                <tr 
                  key={cls.id} 
                  className="hover:bg-[#EC4899]/5 transition-colors"
                >
                  <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] truncate">{cls.name}</div>
                      <div className="text-xs sm:text-sm text-[#4B2E83]/70 truncate">{cls.description}</div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83] truncate">
                      {cls.category}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10 text-[#EC4899] font-semibold text-xs sm:text-sm">₪{cls.price}</td>

                  <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10 text-[#EC4899] font-semibold text-xs sm:text-sm">
                    ₪{(cls.active_registrations * cls.price).toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                    <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cls.is_active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {cls.is_active ? (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          פעיל
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          לא פעיל
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClass(cls);
                        }}
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs"
                      >
                        ערוך
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClassSessions(cls);
                        }}
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-xs"
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