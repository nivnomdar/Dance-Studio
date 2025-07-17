import React, { useState } from 'react';
import { ClassEditModal, ClassSessionsModal } from '../modals';

interface ClassesTabProps {
  data: any;
  session: any;
  fetchClasses: () => void;
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

  // Filter classes
  const filteredClasses = processedClasses
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

      await fetchClasses();
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
    <div className="space-y-6">
      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-3xl font-bold text-[#EC4899]">{totalClasses}</div>
          <div className="text-sm text-[#4B2E83]/70">סה"כ שיעורים</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-3xl font-bold text-[#4B2E83]">{activeClasses}</div>
          <div className="text-sm text-[#4B2E83]/70">שיעורים פעילים</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-3xl font-bold text-[#EC4899]">{activeRegistrations}</div>
          <div className="text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-3xl font-bold text-[#4B2E83]">₪{totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-[#4B2E83]/70">הכנסות צפויות</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-3xl font-bold text-[#EC4899]">{totalRegistrations}</div>
          <div className="text-sm text-[#4B2E83]/70">סה"כ הרשמות</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="p-6 border-b border-[#EC4899]/10">
          <h2 className="text-2xl font-bold text-[#4B2E83] mb-2">שיעורים במערכת</h2>
          <p className="text-[#4B2E83]/70">סקירה כללית של כל השיעורים הקיימים במערכת</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">שם השיעור</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">קטגוריה</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">מחיר</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">הרשמות פעילות</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">הכנסות צפויות</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">סטטוס</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {filteredClasses.map((cls) => (
                <tr 
                  key={cls.id} 
                  className="hover:bg-[#EC4899]/5 transition-colors"
                >
                  <td className="px-6 py-4 border-l border-[#EC4899]/10">
                    <div>
                      <div className="font-semibold text-[#4B2E83]">{cls.name}</div>
                      <div className="text-sm text-[#4B2E83]/70">{cls.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-l border-[#EC4899]/10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83]">
                      {cls.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-l border-[#EC4899]/10 text-[#EC4899] font-semibold">₪{cls.price}</td>
                  <td className="px-6 py-4 border-l border-[#EC4899]/10">
                    <div className="text-center">
                      <div className="font-semibold text-[#4B2E83]">{cls.active_registrations}</div>
                      <div className="text-xs text-[#4B2E83]/70">מתוך {cls.total_registrations}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-l border-[#EC4899]/10 text-[#EC4899] font-semibold">
                    ₪{(cls.active_registrations * cls.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 border-l border-[#EC4899]/10">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cls.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cls.is_active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-l border-[#EC4899]/10">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClass(cls);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs"
                      >
                        ערוך
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClassSessions(cls);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-xs"
                      >
                        סשנים
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