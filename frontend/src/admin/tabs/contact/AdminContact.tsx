import { useEffect, useState } from 'react';
import { useAdminData } from '../../contexts';
import type { UserProfile } from '../../../types/auth';
import { RefreshButton } from '../../components';
import { ContactDetailsModal } from '../../modals';
import { apiService } from '../../../lib/api';

interface AdminContactProps {
  profile: UserProfile;
}

export default function AdminContact({ profile: _profile }: AdminContactProps) {
  const { data, isLoading, error, fetchContact, isFetching } = useAdminData();
  const [filter, setFilter] = useState<'all' | 'new'>('all');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(4);

  // טעינת נתונים רק אם אין נתונים או שהם ישנים
  useEffect(() => {
    if (data.messages.length === 0) {
      fetchContact();
    }
  }, [data.messages.length, fetchContact]);

  const totalMessages = data.messages.length;
  const newMessages = data.messages.filter(msg => msg.status === 'new').length;
  // removed unused repliedMessages to avoid linter warnings
  
  // Calculate messages this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const messagesThisWeek = data.messages.filter((msg: any) => 
    new Date(msg.created_at) > oneWeekAgo
  ).length;
  
  // removed avgResponseTime (unused)
  
  const filteredMessages = filter === 'all' 
    ? data.messages 
    : data.messages.filter(msg => msg.status === 'new');

  // Reset pagination when filter or data changes
  useEffect(() => {
    setVisibleCount(4);
  }, [filter, data.messages.length]);

  // Toggle unread dot on contact tab button based on unread count
  useEffect(() => {
    const contactBtn = document.querySelector('button[data-tab-key="contact"]');
    const dot = contactBtn?.querySelector('.contact-unread-dot') as HTMLElement | null;
    if (dot) {
      if (newMessages > 0) {
        dot.classList.remove('hidden');
      } else {
        dot.classList.add('hidden');
      }
    }
  }, [newMessages]);

  // Listen for status toggle from modal and apply same behavior as icon click
  useEffect(() => {
    const handler = (e: any) => {
      const { id, status } = e.detail || {};
      const msg = data.messages.find((m: any) => m.id === id);
      if (!msg) return;
      const prev = msg.status;
      msg.status = status;
      apiService.contact.updateStatus(id, status as any)
        .then(() => fetchContact(true))
        .catch(() => { msg.status = prev; });
    };
    window.addEventListener('toggleMessageStatus', handler as EventListener);
    return () => window.removeEventListener('toggleMessageStatus', handler as EventListener);
  }, [data.messages, fetchContact]);

  if (isLoading && data.messages.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83]">פניות יצירת קשר</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#4B2E83]/70">טוענת נתונים...</p>
        </div>
      </div>
    );
  }

  if (error && data.messages.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83]">פניות יצירת קשר</h2>
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => { void fetchContact(true); }}
            className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
          >
            נסי שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E83]">פניות יצירת קשר</h2>
          <p className="text-sm text-[#4B2E83]/70 mt-1">ניהול פניות ותמיכה</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Weekly metric with unread count */}
          <button
            onClick={() => setFilter('all')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#EC4899]/20 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 text-[#4B2E83] text-sm font-medium hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 hover:border-[#EC4899]/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            title='לחצי לראות את כל הפניות השבוע'
            aria-label={`התקבלו השבוע: ${messagesThisWeek} (${newMessages} לא נקראו)`}
          >
            <span className="h-5 w-5 rounded-full bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </span>
            <span className="font-semibold">השבוע</span>
            <span className="text-[#EC4899] font-bold">{messagesThisWeek}</span>
            <span className="text-xs opacity-70">({newMessages} לא נקראו)</span>
          </button>
          
          <RefreshButton
            onClick={() => { void fetchContact(true); }}
            isFetching={isFetching}
          />
        </div>
      </div>

      {/* Contact Messages List */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
          <h3 className="text-lg font-semibold text-[#4B2E83]">רשימת פניות</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white hover:from-[#EC4899] hover:to-[#4B2E83]'
              }`}
            >
              כל הפניות ({totalMessages})
            </button>
            <button 
              onClick={() => setFilter('new')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${
                filter === 'new'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white hover:from-[#EC4899] hover:to-[#4B2E83]'
              }`}
            >
              לא נקראו ({newMessages})
            </button>
          </div>
        </div>


        {filteredMessages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
              {filteredMessages.slice(0, visibleCount).map((message: any) => {
              const initials = (message.name || '')
                .split(' ')
                .filter((p: string) => p)
                .map((p: string) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'א';
              const createdAt = new Date(message.created_at);
              // const canMarkRead = message.status !== 'read';
              return (
                <div
                  key={message.id}
                  className="group relative rounded-2xl border border-[#EC4899]/20 bg-gradient-to-b from-[#FFF5F9] to-white p-3 shadow-sm hover:shadow-md hover:ring-1 hover:ring-[#EC4899]/30 transition-all duration-300 hover:-translate-y-0.5 h-full min-h-[220px] lg:min-h-[240px] flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EC4899]/30"
                  tabIndex={0}
                  onClick={() => {
                    const wasNew = message.status === 'new';
                    // Open modal immediately
                    setSelectedMessage({ ...message, status: 'read' });
                    // Background status update (no await)
                    if (wasNew) {
                      apiService.contact.updateStatus(message.id, 'read')
                        .then(() => fetchContact(true))
                        .catch(() => {/* ignore */});
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const wasNew = message.status === 'new';
                      setSelectedMessage({ ...message, status: 'read' });
                      if (wasNew) {
                        apiService.contact.updateStatus(message.id, 'read')
                          .then(() => fetchContact(true))
                          .catch(() => {/* ignore */});
                      }
                    }
                  }}
                >
                   <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-t-2xl" />
                  <div className="pt-2 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2 min-h-[40px]">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#EC4899]/10 to-[#4B2E83]/10 text-[#4B2E83] font-semibold flex items-center justify-center ring-1 ring-[#EC4899]/20">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#4B2E83] text-sm leading-5">{message.name}</h4>
                          <p className="text-[11px] text-[#EC4899] whitespace-nowrap">{createdAt.toLocaleDateString('he-IL')} • {createdAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const nextStatus = message.status === 'new' ? 'read' : 'new';
                          // optimistic UI
                          const prevStatus = message.status;
                          message.status = nextStatus;
                          // bump unread dot immediately
                          const contactBtn = document.querySelector('button[data-tab-key="contact"]');
                          const dot = contactBtn?.querySelector('.contact-unread-dot') as HTMLElement | null;
                          if (dot) {
                            if (nextStatus === 'new') dot.classList.remove('hidden');
                            if (nextStatus === 'read') {
                              const anyUnread = data.messages.some(m => (m.id === message.id ? nextStatus : m.status) === 'new');
                              if (!anyUnread) dot.classList.add('hidden');
                            }
                          }
                          try {
                            await apiService.contact.updateStatus(message.id, nextStatus as any);
                          } catch (err) {
                            // revert on error
                            message.status = prevStatus;
                          } finally {
                            fetchContact(true);
                          }
                        }}
                        className={`cursor-pointer text-xs px-2 py-1 rounded-full border transition-colors duration-200 ${
                        message.status === 'new' 
                            ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                        }`}
                        title={message.status === 'new' ? 'סמן כנקרא' : 'סמן כלא נקרא'}
                      >
                        {message.status === 'new' ? (
                          // X icon (unread)
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          // V icon (read)
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {message.subject ? (
                      <div className="flex items-center gap-1.5 h-5 mb-1 text-xs text-[#4B2E83]/70">
                        <svg className="w-3.5 h-3.5 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5z" /></svg>
                        <span className="truncate">{message.subject}</span>
                    </div>
                    ) : (
                      <div className="h-5 mb-1" />
                    )}

                    <p className="text-xs text-[#4B2E83]/80 mb-1 flex items-center gap-1.5 h-5">
                      <svg className="w-3.5 h-3.5 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      <span className="truncate">{message.email}</span>
                    </p>

                    {message.phone ? (
                      <p className="text-xs text-[#4B2E83]/80 mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2h6a2 2 0 012 2v16a2 2 0 01-2 2H9a2 2 0 01-2-2V4a2 2 0 012-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18h6" />
                        </svg>
                        <span>{message.phone}</span>
                      </p>
                    ) : (
                      <div className="h-5 mb-2" />
                    )}

                    <p className="text-[13px] text-[#2B2B2B] h-12 overflow-hidden leading-5">
                      {message.message}
                    </p>

                  </div>
                </div>
              );
              })}
              </div>
            {filteredMessages.length > visibleCount && (
              <div className="mt-4 flex justify-center border-t border-[#EC4899]/10 pt-4">
                <button
                  onClick={() => setVisibleCount(c => c + 4)}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm"
                >
                  עוד פניות
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-[#4B2E83] mb-2">
              {filter === 'all' ? 'אין פניות כרגע' : 'אין פניות שלא נקראו'}
            </h4>
            <p className="text-[#4B2E83]/70">
              {filter === 'all' 
                ? 'כאשר יתקבלו פניות חדשות, הן יופיעו כאן'
                : 'כל הפניות נענו או נקראו'
              }
            </p>
          </div>
        )}
      </div>

      {/* Contact Management Tools removed */}
      {/* Message Details Modal (GoogleLogin style) */}
      <ContactDetailsModal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        message={selectedMessage}
      />
    </div>
  );
} 

// Details modal
// Placed outside default export to keep file tidy (render is within component via state)
