import { useEffect } from 'react';

interface ContactDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    created_at?: string;
  } | null;
}

export default function ContactDetailsModal({ isOpen, onClose, message }: ContactDetailsModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !message) return null;

  const createdAt = message.created_at ? new Date(message.created_at) : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div className="bg-gradient-to-b from-[#FFF5F9] to-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md lg:max-w-lg w-full mx-auto overflow-hidden border border-[#EC4899]/20" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-4 sm:p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative z-10 mb-4 sm:mb-6">
            <img src="/images/LOGOladance.png" alt="Ladance Avigail" className="h-17 sm:h-22 w-auto mx-auto drop-shadow-lg" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 font-agrandir-grand">פרטי פנייה</h2>
            {createdAt && (
              <p className="text-xs sm:text-sm text-white/90">{createdAt.toLocaleDateString('he-IL')} • {createdAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Top details: name, email, phone (always in one centered row) */}
          <div className="grid grid-cols-3 gap-3 text-sm place-items-center">
            <div className="text-center">
              <p className="text-[#4B2E83]/70">שם</p>
              <p className="text-[#4B2E83] font-medium">{message.name}</p>
            </div>
            <div className="text-center">
              <p className="text-[#4B2E83]/70">אימייל</p>
              <a href={`mailto:${message.email}`} className="text-[#4B2E83] font-medium hover:text-[#EC4899]">{message.email}</a>
            </div>
            <div className="text-center">
              <p className="text-[#4B2E83]/70">טלפון</p>
              {message.phone ? (
                <a href={`tel:${message.phone}`} className="text-[#4B2E83] font-medium hover:text-[#EC4899]">{message.phone}</a>
              ) : (
                <span className="text-[#4B2E83]/50">—</span>
              )}
            </div>
          </div>
          {message.subject && (
            <div className="col-span-3">
              <div className="w-full flex justify-start">
                <div className="flex items-center gap-2">
                  <span className="text-[#4B2E83]/70">נושא</span>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#EC4899]/30 bg-[#FFF5F9] text-[#4B2E83] shadow-sm">
                    <svg className="w-4 h-4 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5z" /></svg>
                    <span className="text-sm font-medium">{message.subject}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Message bubble (WhatsApp/mail style) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[#4B2E83]/70 text-sm">הודעה</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const isNew = (message as any).status === 'new';
                  const nextStatus = isNew ? 'read' : 'new';
                  const evt = new CustomEvent('toggleMessageStatus', { detail: { id: (message as any).id, status: nextStatus } });
                  window.dispatchEvent(evt);
                  onClose();
                }}
                className={`text-xs px-2 py-1 rounded-full border transition-colors duration-200 ${
                  (message as any).status === 'new'
                    ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                }`}
                title={(message as any).status === 'new' ? 'סמן כנקרא' : 'סמן כלא נקרא'}
                aria-label={(message as any).status === 'new' ? 'סמן כנקרא' : 'סמן כלא נקרא'}
              >
                {(message as any).status === 'new' ? (
                  // X icon (unread)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  // V icon (read)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                )}
              </button>
            </div>
            <div className="max-w-full lg:max-w-[85%] ml-auto rounded-2xl rounded-br-sm border border-[#EC4899]/30 bg-gradient-to-br from-[#FFF5F9] to-white p-4 text-[#2B2B2B] text-[0.95rem] leading-relaxed shadow-sm ring-1 ring-[#EC4899]/10">
              <div className="whitespace-pre-wrap">{message.message}</div>
              {createdAt && (
                <div className="mt-2 text-[11px] text-[#4B2E83]/50 text-left">{createdAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="w-full py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium">
            חזרה
          </button>
        </div>
      </div>
    </div>
  );
}


