import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import type { UserProfile } from '../../types/auth';

interface ClassEditModalProps {
  classData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClass: any) => void;
  isLoading: boolean;
}

interface RegistrationEditModalProps {
  registrationData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRegistration: any) => void;
  isLoading: boolean;
}

interface ClassesReportsProps {
  profile: UserProfile;
}

interface ClassReport {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  level: string;
  category: string;
  is_active: boolean;
  total_registrations: number;
  active_registrations: number;
  upcoming_sessions: any[];
  registrations: any[];
  created_at: string;
  updated_at: string;
}

export default function ClassesReports({ profile }: ClassesReportsProps) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data, isLoading, error, fetchClasses, isFetching } = useAdminData();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'detailed'>('list');
  const [dateRange, setDateRange] = useState<string>('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [registrationEditModalOpen, setRegistrationEditModalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<any>(null);
  const [isSavingRegistration, setIsSavingRegistration] = useState(false);

  // Load data on component mount
  useEffect(() => {
    if (data.classes.length === 0) {
      fetchClasses();
    }
  }, [data.classes.length, fetchClasses]);

  // Process classes data for reports
  const processedClasses: ClassReport[] = data.classes.map((cls: any) => {
    const classRegistrations = data.registrations.filter((reg: any) => reg.class_id === cls.id);
    const activeRegistrations = classRegistrations.filter((reg: any) => reg.status === 'active');
    
    return {
      id: cls.id,
      name: cls.name,
      slug: cls.slug,
      description: cls.description,
      price: cls.price,
      duration: cls.duration,
      level: cls.level,
      category: cls.category,
      is_active: cls.is_active,
      total_registrations: classRegistrations.length,
      active_registrations: activeRegistrations.length,
      upcoming_sessions: [], // Will be populated from sessions data
      registrations: classRegistrations,
      created_at: cls.created_at,
      updated_at: cls.updated_at
    };
  });

  // Filter and sort classes
  const filteredClasses = processedClasses
    .filter(cls => {
      const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && cls.is_active) ||
                           (filterStatus === 'inactive' && !cls.is_active);
      
      // Date range filtering
      let matchesDateRange = true;
      if (dateRange !== 'all') {
        const now = new Date();
        const classCreatedDate = new Date(cls.created_at);
        
        switch (dateRange) {
          case 'week':
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDateRange = classCreatedDate > oneWeekAgo;
            break;
          case 'month':
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDateRange = classCreatedDate > oneMonthAgo;
            break;
          case 'year':
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            matchesDateRange = classCreatedDate > oneYearAgo;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'registrations':
          comparison = a.total_registrations - b.total_registrations;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Statistics
  const totalClasses = processedClasses.length;
  const activeClasses = processedClasses.filter(cls => cls.is_active).length;
  const totalRegistrations = processedClasses.reduce((sum, cls) => sum + cls.total_registrations, 0);
  const activeRegistrations = processedClasses.reduce((sum, cls) => sum + cls.active_registrations, 0);

  // Handle class edit
  const handleEditClass = (classData: any) => {
    setEditingClass(classData);
    setEditModalOpen(true);
  };

  // Handle save class (create or update)
  const handleSaveClass = async (updatedClass: any) => {
    if (!session) return;
    const isNewClass = !updatedClass.id;
    setIsSaving(true);
    try {
      const url = isNewClass 
        ? `${import.meta.env.VITE_API_BASE_URL}/classes`
        : `${import.meta.env.VITE_API_BASE_URL}/classes/${updatedClass.id}`;
      const method = isNewClass ? 'POST' : 'PATCH';

      // Filter out computed fields and only send actual database fields
      const allowedFields = [
        'name', 'slug', 'description', 'long_description', 'price', 'duration', 
        'level', 'age_group', 'max_participants', 'location', 'included', 
        'image_url', 'video_url', 'category', 'color_scheme', 'is_active', 
        'start_time', 'end_time', 'available_dates', 'available_times'
      ];
      
      const cleanData: any = {};
      allowedFields.forEach(field => {
        if (updatedClass[field] !== undefined) {
          cleanData[field] = updatedClass[field];
        }
      });

      // Always include required fields for PATCH
      if (!isNewClass) {
        const requiredFields = ['name', 'price', 'slug', 'description'];
        requiredFields.forEach((field) => {
          if (cleanData[field] === undefined && editingClass && editingClass[field] !== undefined) {
            cleanData[field] = editingClass[field];
          }
        });
      }

      console.log('Sending to API:', { url, method, data: cleanData });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(cleanData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to ${isNewClass ? 'create' : 'update'} class: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Success response:', result);

      // Refresh data
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



  // Handle registration edit
  const handleEditRegistration = (registrationData: any) => {
    setEditingRegistration(registrationData);
    setRegistrationEditModalOpen(true);
  };

  // Handle save registration
  const handleSaveRegistration = async (updatedRegistration: any) => {
    if (!session) return;
    
    setIsSavingRegistration(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/${updatedRegistration.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: updatedRegistration.status })
      });

      if (!response.ok) {
        throw new Error('Failed to update registration');
      }

      // Refresh data
      await fetchClasses();
      setRegistrationEditModalOpen(false);
      setEditingRegistration(null);
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('שגיאה בעדכון ההרשמה');
    } finally {
      setIsSavingRegistration(false);
    }
  };

  if (isLoading && data.classes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
            <p className="text-[#4B2E83]/70">טוען דוחות שיעורים...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && data.classes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchClasses}
              className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EC4899]/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#4B2E83]">דוחות שיעורים</h1>
              <p className="text-[#4B2E83]/70 mt-2">ניהול וניתוח מקיף של כל השיעורים והרשמות</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm"
              >
                חזור לפאנל
              </button>
              <button
                onClick={fetchClasses}
                disabled={isFetching}
                className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? 'מעדכן...' : 'רענן נתונים'}
              </button>
              <button 
                onClick={() => handleEditClass({})}
                className="px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm"
              >
                הוסף שיעור חדש
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm">
                ייצא לאקסל
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
            <div className="text-3xl font-bold text-[#EC4899]">{totalClasses}</div>
            <div className="text-sm text-[#4B2E83]/70">סה"כ שיעורים</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#4B2E83]/10 text-center">
            <div className="text-3xl font-bold text-[#4B2E83]">{activeClasses}</div>
            <div className="text-sm text-[#4B2E83]/70">שיעורים פעילים</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
            <div className="text-3xl font-bold text-[#EC4899]">{totalRegistrations}</div>
            <div className="text-sm text-[#4B2E83]/70">סה"כ הרשמות</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#4B2E83]/10 text-center">
            <div className="text-3xl font-bold text-[#4B2E83]">{activeRegistrations}</div>
            <div className="text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EC4899]/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">חיפוש</label>
              <input
                type="text"
                placeholder="חפש שיעור..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">סטטוס</label>
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

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">טווח תאריכים</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              >
                <option value="all">כל התאריכים</option>
                <option value="week">שבוע אחרון</option>
                <option value="month">חודש אחרון</option>
                <option value="year">שנה אחרונה</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">מיון לפי</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              >
                <option value="name">שם השיעור</option>
                <option value="registrations">מספר הרשמות</option>
                <option value="price">מחיר</option>
                <option value="created">תאריך יצירה</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">סדר</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              >
                <option value="asc">עולה</option>
                <option value="desc">יורד</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mt-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-[#4B2E83] shadow-sm' 
                    : 'text-[#4B2E83]/70 hover:text-[#4B2E83]'
                }`}
              >
                רשימה
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-[#4B2E83] shadow-sm' 
                    : 'text-[#4B2E83]/70 hover:text-[#4B2E83]'
                }`}
              >
                רשת
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'detailed' 
                    ? 'bg-white text-[#4B2E83] shadow-sm' 
                    : 'text-[#4B2E83]/70 hover:text-[#4B2E83]'
                }`}
              >
                מפורט
              </button>
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">שם השיעור</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">קטגוריה</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">מחיר</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">הרשמות</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">סטטוס</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EC4899]/10">
                  {filteredClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-[#EC4899]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-[#4B2E83]">{cls.name}</div>
                          <div className="text-sm text-[#4B2E83]/70">{cls.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83]">
                          {cls.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#EC4899] font-semibold">₪{cls.price}</td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className="font-semibold text-[#4B2E83]">{cls.active_registrations}</div>
                          <div className="text-xs text-[#4B2E83]/70">מתוך {cls.total_registrations}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cls.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cls.is_active ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                            className="text-[#EC4899] hover:text-[#4B2E83] font-medium text-sm transition-colors"
                          >
                            {selectedClass === cls.id ? 'הסתר פרטים' : 'הצג פרטים'}
                          </button>
                          <button
                            onClick={() => handleEditClass(cls)}
                            className="text-[#4B2E83] hover:text-[#EC4899] font-medium text-sm transition-colors"
                          >
                            ערוך
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
                  <div key={cls.id} className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-xl border border-[#EC4899]/10 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-[#4B2E83]">{cls.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cls.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cls.is_active ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-[#4B2E83]/70 mb-4">{cls.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#4B2E83]/70">קטגוריה:</span>
                        <span className="font-medium text-[#4B2E83]">{cls.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#4B2E83]/70">מחיר:</span>
                        <span className="font-semibold text-[#EC4899]">₪{cls.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#4B2E83]/70">הרשמות:</span>
                        <span className="font-medium text-[#4B2E83]">{cls.active_registrations}/{cls.total_registrations}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm"
                      >
                        {selectedClass === cls.id ? 'הסתר פרטים' : 'הצג פרטים'}
                      </button>
                      <button
                        onClick={() => handleEditClass(cls)}
                        className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm"
                      >
                        ערוך
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'detailed' && (
            <div className="p-6 space-y-6">
              {filteredClasses.map((cls) => (
                <div key={cls.id} className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-xl border border-[#EC4899]/10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-[#4B2E83]">{cls.name}</h3>
                          <p className="text-[#4B2E83]/70 mt-2">{cls.description}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          cls.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cls.is_active ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#EC4899]">₪{cls.price}</div>
                          <div className="text-sm text-[#4B2E83]/70">מחיר</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#4B2E83]">{cls.duration}</div>
                          <div className="text-sm text-[#4B2E83]/70">דקות</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#EC4899]">{cls.active_registrations}</div>
                          <div className="text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#4B2E83]">{cls.total_registrations}</div>
                          <div className="text-sm text-[#4B2E83]/70">סה"כ הרשמות</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registrations List */}
                  {cls.registrations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-[#4B2E83] mb-4">הרשמות לשיעור</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-white/50">
                            <tr>
                              <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">שם מלא</th>
                              <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">אימייל</th>
                              <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">טלפון</th>
                              <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">תאריך הרשמה</th>
                              <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">סטטוס</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/20">
                            {cls.registrations.map((reg: any) => (
                              <tr key={reg.id} className="hover:bg-white/20">
                                <td className="px-4 py-2">
                                  {reg.user ? 
                                    `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
                                    `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'לא ידוע'
                                  }
                                </td>
                                <td className="px-4 py-2">{reg.email}</td>
                                <td className="px-4 py-2">{reg.phone}</td>
                                <td className="px-4 py-2">
                                  {new Date(reg.created_at).toLocaleDateString('he-IL')}
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      reg.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : reg.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {reg.status === 'active' ? 'פעיל' : 
                                       reg.status === 'pending' ? 'ממתין' : 
                                       reg.status === 'cancelled' ? 'בוטל' : reg.status}
                                    </span>
                                    <button
                                      onClick={() => handleEditRegistration(reg)}
                                      className="text-[#EC4899] hover:text-[#4B2E83] text-xs transition-colors"
                                    >
                                      ערוך
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {cls.registrations.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-[#4B2E83]/70">אין הרשמות לשיעור זה</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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

        {/* Edit Class Modal */}
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

        {/* Edit Registration Modal */}
        {registrationEditModalOpen && editingRegistration && (
          <RegistrationEditModal
            registrationData={editingRegistration}
            isOpen={registrationEditModalOpen}
            onClose={() => {
              setRegistrationEditModalOpen(false);
              setEditingRegistration(null);
            }}
            onSave={handleSaveRegistration}
            isLoading={isSavingRegistration}
          />
        )}
      </div>
    </div>
  );
}

// Registration Edit Modal Component
function RegistrationEditModal({ registrationData, isOpen, onClose, onSave, isLoading }: RegistrationEditModalProps) {
  const [formData, setFormData] = useState({
    status: registrationData.status || 'active'
  });

  useEffect(() => {
    setFormData({
      status: registrationData.status || 'active'
    });
  }, [registrationData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...registrationData, ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#4B2E83]">עריכת הרשמה</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">
              פרטי המשתמש
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-[#4B2E83]/70">
                {registrationData.user ? 
                  `${registrationData.user.first_name || ''} ${registrationData.user.last_name || ''}`.trim() || registrationData.user.email :
                  `${registrationData.first_name || ''} ${registrationData.last_name || ''}`.trim() || registrationData.email || 'לא ידוע'
                }
              </p>
              <p className="text-sm text-[#4B2E83]/70 mt-1">{registrationData.email}</p>
              <p className="text-sm text-[#4B2E83]/70 mt-1">{registrationData.phone}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">
              פרטי השיעור
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-[#4B2E83]/70">
                {registrationData.class?.name || registrationData.class_name || 'שיעור לא ידוע'}
              </p>
              <p className="text-sm text-[#4B2E83]/70 mt-1">
                {new Date(registrationData.selected_date).toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">
              סטטוס הרשמה *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="active">פעיל</option>
              <option value="pending">ממתין</option>
              <option value="cancelled">בוטל</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#EC4899] text-[#EC4899] rounded-lg font-medium hover:bg-[#EC4899] hover:text-white transition-all duration-300"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Class Edit Modal Component
function ClassEditModal({ classData, isOpen, onClose, onSave, isLoading }: ClassEditModalProps) {
  const [formData, setFormData] = useState({
    name: classData.name || '',
    description: classData.description || '',
    price: classData.price || 0,
    duration: classData.duration || 60,
    level: classData.level || 'beginner',
    category: classData.category || '',
    is_active: classData.is_active || false,
    slug: classData.slug || ''
  });

  useEffect(() => {
    setFormData({
      name: classData.name || '',
      description: classData.description || '',
      price: classData.price || 0,
      duration: classData.duration || 60,
      level: classData.level || 'beginner',
      category: classData.category || '',
      is_active: classData.is_active || false,
      slug: classData.slug || ''
    });
  }, [classData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...classData, ...formData });
  };

  if (!isOpen) return null;

  const isNewClass = !classData.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#4B2E83]">
              {isNewClass ? 'הוספת שיעור חדש' : 'עריכת שיעור'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                שם השיעור *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
            </div>

            {isNewClass && (
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  מזהה URL (slug) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="לדוגמה: dance-class-1"
                  className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                קטגוריה
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                מחיר (₪) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                משך (דקות) *
              </label>
              <input
                type="number"
                required
                min="15"
                max="300"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                רמה
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              >
                <option value="beginner">מתחילים</option>
                <option value="intermediate">בינוני</option>
                <option value="advanced">מתקדם</option>
                <option value="all">כל הרמות</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-[#EC4899] focus:ring-[#EC4899] border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="mr-2 text-sm font-medium text-[#4B2E83]">
                שיעור פעיל
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">
              תיאור השיעור
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#EC4899] text-[#EC4899] rounded-lg font-medium hover:bg-[#EC4899] hover:text-white transition-all duration-300"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 