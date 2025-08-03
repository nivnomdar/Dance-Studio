import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaCheck, FaTimes } from 'react-icons/fa';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
}

interface UserSearchProps {
  selectedUserId: string;
  onUserSelect: (userId: string) => void;
  profiles: User[];
  error?: string;
  placeholder?: string;
  onSearch?: (searchTerm: string) => Promise<void>;
  isLoading?: boolean;
}

export default function UserSearch({
  selectedUserId,
  onUserSelect,
  profiles,
  error,
  placeholder = "חיפוש לפי שם או אימייל...",
  onSearch,
  isLoading = false
}: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get selected user details
  const selectedUser = profiles.find(p => p.id === selectedUserId);

  // Debounced search function
  const debouncedSearch = useCallback((term: string) => {
    if (!onSearch) return; // Don't search if no onSearch function provided
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (term.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          await onSearch(term);
        } catch (error) {
          console.error('Search error:', error);
        }
        setIsSearching(false);
      }, 300);
    } else if (term.trim().length === 0) {
      // Clear search results when search term is empty
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          await onSearch('');
        } catch (error) {
          console.error('Search error:', error);
        }
      }, 300);
    }
  }, [onSearch]); // Only depend on onSearch

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
      return;
    }

    const filtered = profiles.filter(user => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) || email.includes(searchLower);
    });

    setFilteredUsers(filtered.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(-1);
  }, [searchTerm, profiles]);

  // Handle search term changes - only trigger server search when user types
  useEffect(() => {
    // Only trigger server search if onSearch is provided and search term is long enough
    if (onSearch && searchTerm.trim().length >= 2) {
      debouncedSearch(searchTerm);
    } else if (onSearch && searchTerm.trim().length === 0) {
      // Clear search results when search term is empty
      debouncedSearch('');
    }
  }, [searchTerm, onSearch]); // Remove debouncedSearch from dependencies

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredUsers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleUserSelect(filteredUsers[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user.id);
    // Don't clear searchTerm to keep the selected user visible
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    // Clear selected user if user starts typing something different
    if (selectedUser && value !== `${selectedUser.first_name} ${selectedUser.last_name}`) {
      onUserSelect('');
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() || !selectedUser) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on dropdown items
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const clearSelection = () => {
    onUserSelect('');
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative">
      {/* Enhanced Search Input */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className={`w-full px-12 py-3 text-sm border-2 rounded-xl focus:ring-4 focus:ring-[#EC4899]/20 focus:border-[#EC4899] focus:outline-none transition-all duration-300 bg-white shadow-sm hover:shadow-md ${
              error 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : 'border-gray-200 hover:border-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#EC4899] border-t-transparent"></div>
            ) : (
              <FaSearch className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {/* Clear Button */}
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-50 rounded-r-xl p-1"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Enhanced Dropdown */}
        {isOpen && filteredUsers.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
            style={{
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {filteredUsers.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleUserSelect(user)}
                className={`w-full p-4 text-left hover:bg-gradient-to-r hover:from-[#EC4899]/5 hover:to-[#4B2E83]/5 transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
                  index === selectedIndex ? 'bg-gradient-to-r from-[#EC4899]/10 to-[#4B2E83]/10 border-l-4 border-l-[#EC4899]' : ''
                }`}
              >
                <div className="flex items-center gap-4 w-full">
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-[#EC4899] to-[#4B2E83] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FaUser className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {user.first_name} {user.last_name}
                      </h4>
                      {index === selectedIndex && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#EC4899] text-white text-xs rounded-full flex-shrink-0">
                          <FaCheck className="w-2.5 h-2.5" />
                          <span>נבחר</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FaEnvelope className="w-3 h-3 flex-shrink-0 text-[#EC4899]" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone_number && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FaPhone className="w-3 h-3 flex-shrink-0 text-[#4B2E83]" />
                          <span className="truncate">{user.phone_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {index === selectedIndex && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-full flex items-center justify-center shadow-sm">
                        <FaCheck className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Enhanced No Results */}
        {isOpen && searchTerm.trim() && filteredUsers.length === 0 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl z-20 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaSearch className="w-5 h-5 text-gray-400" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">לא נמצאו משתמשים</h4>
              <p className="text-xs text-gray-500">נסי לחפש בשם או באימייל</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Selected User Display */}
      {selectedUser && (
        <div className="mt-4 p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border-2 border-[#EC4899]/20 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <FaUser className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h4>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white text-xs rounded-full flex-shrink-0 shadow-sm">
                    <FaCheck className="w-2.5 h-2.5" />
                    <span>נבחר</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FaEnvelope className="w-3 h-3 flex-shrink-0 text-[#EC4899]" />
                    <span className="truncate">{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone_number && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FaPhone className="w-3 h-3 flex-shrink-0 text-[#4B2E83]" />
                      <span className="truncate">{selectedUser.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-red-50 flex-shrink-0"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Error Message */}
      {error && (
        <div className="mt-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FaTimes className="w-3 h-3 text-white" />
            </div>
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
} 