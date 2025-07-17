import React, { useState } from 'react';
import { RegistrationEditModal } from '../modals';

interface RegistrationsTabProps {
  data: any;
  session: any;
  fetchClasses: () => void;
}

export default function RegistrationsTab({ data, session, fetchClasses }: RegistrationsTabProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [registrationEditModalOpen, setRegistrationEditModalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<any>(null);
  const [isSavingRegistration, setIsSavingRegistration] = useState(false);

  // Define the processed registration type
  type ProcessedRegistration = {
    id: string;
    class_id: string;
    session_id: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    status: string;
    created_at: string;
    class_name: string;
    session_name: string;
    user_name: string;
  };

  // Process registrations data
  const processedRegistrations: ProcessedRegistration[] = (data.registrations || []).map((reg: any) => {
    const classData = data.classes.find((c: any) => c.id === reg.class_id);
    const sessionData = data.sessions.find((s: any) => s.id === reg.session_id);
    
    return {
      ...reg,
      class_name: classData?.name || 'שיעור לא ידוע',
      session_name: sessionData?.name || 'סשן לא ידוע',
      session_id: reg.session_id,
      user_name: reg.user ? 
        `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
        `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'לא ידוע'
    };
  });

  // Group registrations by session
  const registrationsBySession = processedRegistrations.reduce((acc: any, reg: any) => {
    const sessionKey = reg.session_id || 'no-session';
    if (!acc[sessionKey]) {
      acc[sessionKey] = {
        session_id: reg.session_id,
        session_name: reg.session_name,
        registrations: []
      };
    }
    acc[sessionKey].registrations.push(reg);
    return acc;
  }, {});

  // Convert to array and sort by session name
  const sessionsList = Object.values(registrationsBySession).sort((a: any, b: any) => 
    a.session_name.localeCompare(b.session_name, 'he')
  );

  // Filter registrations within each session
  const filteredSessionsList = sessionsList.map((sessionGroup: any) => ({
    ...sessionGroup,
    registrations: sessionGroup.registrations
      .filter((reg: any) => {
        const matchesSearch = reg.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             reg.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             reg.session_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  })).filter((sessionGroup: any) => sessionGroup.registrations.length > 0);

  // Statistics
  const totalRegistrations = processedRegistrations.length;
  const activeRegistrations = processedRegistrations.filter(reg => reg.status === 'active').length;
  const cancelledRegistrations = processedRegistrations.filter(reg => reg.status === 'cancelled').length;

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

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-3xl font-bold text-[#EC4899]">{totalRegistrations}</div>
          <div className="text-sm text-[#4B2E83]/70">סה"כ הרשמות</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-3xl font-bold text-[#4B2E83]">{activeRegistrations}</div>
          <div className="text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-3xl font-bold text-[#EC4899]">{cancelledRegistrations}</div>
          <div className="text-sm text-[#4B2E83]/70">הרשמות בוטלו</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">חיפוש הרשמה</label>
            <input
              type="text"
              placeholder="חפש לפי שם, אימייל, שיעור או סשן..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">סטטוס הרשמה</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="all">כל ההרשמות</option>
              <option value="active">פעילות בלבד</option>
              <option value="cancelled">בוטלו בלבד</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-[#4B2E83] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
            >
              נקה פילטרים
            </button>
          </div>
        </div>
      </div>

      {/* Registrations by Session */}
      <div className="space-y-6">
        {filteredSessionsList.map((sessionGroup: any) => (
          <div key={sessionGroup.session_id} className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
            <div className="p-6 border-b border-[#EC4899]/10 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <h2 className="text-xl font-bold text-[#4B2E83] mb-2">{sessionGroup.session_name}</h2>
              <p className="text-[#4B2E83]/70">{sessionGroup.registrations.length} הרשמות בסשן זה</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">שם מלא</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">אימייל</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">טלפון</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">שיעור</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">תאריך הרשמה</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">סטטוס</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EC4899]/10">
                  {sessionGroup.registrations.map((reg: any) => (
                    <tr 
                      key={reg.id} 
                      className="hover:bg-[#EC4899]/5 transition-colors"
                    >
                      <td className="px-6 py-4 border-l border-[#EC4899]/10">
                        <div className="font-semibold text-[#4B2E83]">{reg.user_name}</div>
                      </td>
                      <td className="px-6 py-4 border-l border-[#EC4899]/10">
                        <div className="text-sm text-[#4B2E83]/70">{reg.email}</div>
                      </td>
                      <td className="px-6 py-4 border-l border-[#EC4899]/10">
                        <div className="text-sm text-[#4B2E83]/70">{reg.phone}</div>
                      </td>
                      <td className="px-6 py-4 border-l border-[#EC4899]/10">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83]">
                          {reg.class_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-l border-[#EC4899]/10">
                        <div className="text-sm text-[#4B2E83]/70">
                          {new Date(reg.created_at).toLocaleDateString('he-IL')}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-l border-[#EC4899]/10">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reg.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reg.status === 'active' ? 'פעיל' : 
                           reg.status === 'cancelled' ? 'בוטל' : reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-l border-[#EC4899]/10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditRegistration(reg);
                          }}
                          className="px-3 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs"
                        >
                          ערוך
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredSessionsList.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">לא נמצאו הרשמות</h3>
          <p className="text-[#4B2E83]/70">נסה לשנות את פרמטרי החיפוש או הסינון</p>
        </div>
      )}

      {/* Registration Edit Modal */}
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
  );
} 