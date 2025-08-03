import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaCheck } from 'react-icons/fa';

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
      {/* Search and Result Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input - Full width on mobile, 2/3 on desktop */}
        <div className="relative w-full lg:w-2/3">
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
            className={`w-full px-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] focus:outline-none transition-all duration-200 bg-white shadow-sm ${
              error 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : 'hover:border-gray-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <div className="absolute top-6 left-0 pl-3 transform -translate-y-1/2 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#EC4899]"></div>
            ) : (
              <FaSearch className="w-4 h-4 text-gray-400" />
            )}
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute top-6 right-0 pr-3 transform -translate-y-1/2 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-50 rounded-md p-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Dropdown - Positioned relative to the input container */}
          {isOpen && filteredUsers.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 mt-1 lg:mt-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              style={{
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              {filteredUsers.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  className={`w-full p-2.5 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 h-16 flex items-center ${
                    index === selectedIndex ? 'bg-[#EC4899]/5 border-l-2 border-l-[#EC4899]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#EC4899]/10 to-[#EC4899]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="w-3.5 h-3.5 text-[#EC4899]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {user.first_name} {user.last_name}
                        </h4>
                      </div>
                      <div className="space-y-0">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FaEnvelope className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone_number && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <FaPhone className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {index === selectedIndex && (
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 bg-[#EC4899] rounded-full flex items-center justify-center">
                          <FaCheck className="w-2 h-2 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results - Positioned relative to the input container */}
          {isOpen && searchTerm.trim() && filteredUsers.length === 0 && !isSearching && (
            <div 
              className="absolute top-full left-0 right-0 mt-1 lg:mt-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-6"
            >
              <div className="text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaSearch className="w-4 h-4 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">לא נמצאו משתמשים</h4>
                <p className="text-xs text-gray-500">נסי לחפש בשם או באימייל</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected User Display - Full width on mobile, 1/3 on desktop */}
        <div className="w-full lg:w-1/3">
          {selectedUser ? (
            <div className="h-full p-3 bg-gradient-to-r from-[#EC4899]/5 to-[#EC4899]/10 border border-[#EC4899]/20 rounded-lg shadow-sm">
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-[#EC4899] rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <h4 className="text-xs font-semibold text-gray-900 truncate">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </h4>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#EC4899] text-white text-xs rounded-full flex-shrink-0">
                        <FaCheck className="w-2.5 h-2.5" />
                        <span className="text-xs">נבחר</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {selectedUser.email}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-md hover:bg-red-50 flex-shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex items-center justify-center">
              <div className="text-center text-gray-400">
                <FaUser className="w-4 h-4 mx-auto mb-1" />
                <p className="text-xs">לא נבחר משתמש</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 