import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setUser(user);
      // טעינת פרטי המשתמש מה-metadata
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        email: user.email || '',
        address: user.user_metadata?.address || '',
      });
    };
    checkUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        }
      });
      
      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDF9F6] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#4B2E83] px-6 py-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[#FDF9F6] font-agrandir-grand">
                פרופיל משתמש
              </h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-[#E6C17C] text-[#4B2E83] rounded-lg hover:bg-[#FDF9F6] transition-colors duration-200"
              >
                {isEditing ? 'ביטול עריכה' : 'ערוך פרופיל'}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-[#4B2E83] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[#E6C17C]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="8" r="4" strokeWidth="1.5" fill="currentColor" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    </svg>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-[#E6C17C] p-2 rounded-full hover:bg-[#FDF9F6] transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4B2E83]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    שם מלא
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-[#4B2E83]/20 focus:border-[#E6C17C] focus:ring-2 focus:ring-[#E6C17C]/20 outline-none transition-colors duration-200 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    טלפון
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-[#4B2E83]/20 focus:border-[#E6C17C] focus:ring-2 focus:ring-[#E6C17C]/20 outline-none transition-colors duration-200 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    אימייל
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-[#4B2E83]/20 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    כתובת
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-[#4B2E83]/20 focus:border-[#E6C17C] focus:ring-2 focus:ring-[#E6C17C]/20 outline-none transition-colors duration-200 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#4B2E83] text-[#FDF9F6] rounded-lg hover:bg-[#E6C17C] hover:text-[#4B2E83] transition-colors duration-200"
                  >
                    שמור שינויים
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 