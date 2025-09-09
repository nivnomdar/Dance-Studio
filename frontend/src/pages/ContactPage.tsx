import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiService } from "../lib/api";
import { ContactSuccessModal } from "../components/common";

function ContactPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", subject: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactTermsAccepted, setContactTermsAccepted] = useState(false);

  // Check for email parameter from URL and pre-fill the form
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setForm(prev => ({ ...prev, email: emailFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Validate all required fields including the new checkbox
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.subject.trim() || !form.message.trim() || !contactTermsAccepted) {
      setError("כל השדות הם שדות חובה, ויש לאשר את התקנון. אנא מלאי את כל הפרטים");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        contact_terms_accepted: true,
        contact_terms_accepted_at: new Date().toISOString()
      };
      await apiService.contact.submitMessage(payload);
      setShowSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "", subject: "" });
      setContactTermsAccepted(false); // Reset checkbox state
    } catch (err: any) {
      setError(err?.message || "אירעה שגיאה בשליחת ההודעה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#FDF9F6] py-8 sm:py-12 lg:py-16" 
      lang="he" 
      dir="rtl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <motion.h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4B2E83] mb-4 sm:mb-6 font-agrandir-grand"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
           צרי קשר
          </motion.h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#4B2E83] mx-auto" aria-hidden="true"></div>
          <motion.p 
            className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-[#2B2B2B] max-w-3xl mx-auto font-agrandir-regular px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
          אשמח לשמוע ממך! השאירי פרטים ואחזור אליך בהקדם💜
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          {/* Contact Form */}
          <motion.div 
            className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg flex flex-col justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit} aria-label="טופס יצירת קשר">
              {error && (
                <div className="p-3 sm:p-4 rounded-md bg-red-50 text-red-700 text-sm sm:text-base" role="alert" id="contact-form-error" aria-live="polite">
                  {error}
                </div>
              )}
              
              {/* First row: Name and Email */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-[#2B2B2B] mb-1 sm:mb-1.5">
                    שם מלא <span className="text-red-500" aria-label="שדה חובה">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:ring-[#4B2E83] focus:border-[#4B2E83] text-sm"
                    value={form.name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-describedby={error ? 'contact-form-error' : 'name-help'}
                    aria-invalid={error ? 'true' : 'false'}
                  />
                  <div id="name-help" className="sr-only">הזיני את שמך המלא</div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[#2B2B2B] mb-1 sm:mb-1.5">
                    אימייל <span className="text-red-500" aria-label="שדה חובה">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:ring-[#4B2E83] focus:border-[#4B2E83] text-sm"
                    value={form.email}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-describedby={error ? 'contact-form-error' : 'email-help'}
                    aria-invalid={error ? 'true' : 'false'}
                  />
                  <div id="email-help" className="sr-only">הזיני כתובת אימייל תקינה</div>
                </div>
              </div>

              {/* Second row: Phone and Subject */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-[#2B2B2B] mb-1 sm:mb-1.5">
                    טלפון <span className="text-red-500" aria-label="שדה חובה">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:ring-[#4B2E83] focus:border-[#4B2E83] text-sm"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-describedby={error ? 'contact-form-error' : 'phone-help'}
                    aria-invalid={error ? 'true' : 'false'}
                  />
                  <div id="phone-help" className="sr-only">הזיני מספר טלפון תקין</div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-[#2B2B2B] mb-1 sm:mb-1.5">
                    נושא <span className="text-red-500" aria-label="שדה חובה">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:ring-[#4B2E83] focus:border-[#4B2E83] text-sm"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-describedby={error ? 'contact-form-error' : 'subject-help'}
                    aria-invalid={error ? 'true' : 'false'}
                  />
                  <div id="subject-help" className="sr-only">הזיני נושא הה הודעה</div>
                </div>
              </div>

              {/* Third row: Message */}
              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-[#2B2B2B] mb-1 sm:mb-1.5">
                  הודעה <span className="text-red-500" aria-label="שדה חובה">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:ring-[#4B2E83] focus:border-[#4B2E83] text-sm resize-none"
                  value={form.message}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-describedby={error ? 'contact-form-error' : 'message-help'}
                  aria-invalid={error ? 'true' : 'false'}
                ></textarea>
                <div id="message-help" className="sr-only">הזיני את תוכן ההודעה שלך</div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="contactTermsAccepted"
                  name="contactTermsAccepted"
                  checked={contactTermsAccepted}
                  onChange={(e) => setContactTermsAccepted(e.target.checked)}
                  required
                  className="h-4 w-4 text-[#EC4899] focus:ring-[#EC4899] border-gray-300 rounded mt-1 sm:mt-1.5"
                  aria-required="true"
                  aria-describedby={error ? 'contact-form-error' : 'terms-help'}
                  aria-invalid={error ? 'true' : 'false'}
                />
                <label htmlFor="contactTermsAccepted" className="mr-2 block text-xs sm:text-sm text-[#2B2B2B] cursor-pointer">
                  אני מאשרת את <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-[#4B2E83] hover:text-[#EC4899] font-medium transition-colors duration-300">התקנון</a> ואת <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#4B2E83] hover:text-[#EC4899] font-medium transition-colors duration-300">מדיניות הפרטיות</a> <span className="text-red-500" aria-label="שדה חובה">*</span>
                </label>
                <div id="terms-help" className="sr-only">אנא אשר/י את התקנון ומדיניות הפרטיות כדי להמשיך</div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#EC4899] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:bg-[#EC4899]/90 transition-colors duration-300 font-medium text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={isSubmitting ? 'שולח הודעה...' : 'שלחי הודעה'}
                aria-describedby="submit-help"
              >
                {isSubmitting ? 'שולח...' : 'שלחי הודעה'}
              </button>
              <div id="submit-help" className="sr-only">לחצי על הכפתור כדי לשלוח את ההודעה</div>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            className="space-y-6 sm:space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          >
            <motion.div 
              className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              <motion.h3 
                className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4B2E83] mb-3 sm:mb-4 font-agrandir-grand"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
              >
                פרטי התקשרות
              </motion.h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {/* פרטי התקשרות */}
                   <div className="space-y-4 sm:space-y-5">
                                     {/* כתובת */}
                   <motion.div 
                     className="flex items-start space-x-4 space-x-reverse"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                   >
                     <div className="flex-shrink-0 w-10 h-10 bg-[#4B2E83] rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#4B2E83]/30">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                     </div>
                     <div className="mr-2 flex-1">
                       <p className="text-[#2B2B2B] text-sm sm:text-base font-medium">כתובת</p>
                       <p className="text-gray-600 text-sm whitespace-nowrap overflow-hidden text-ellipsis">רחוב יוסף לישנסקי 6, ראשון לציון</p>
                     </div>
                   </motion.div>

                   {/* טלפון */}
                   <motion.div 
                     className="flex items-start space-x-4 space-x-reverse"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
                   >
                     <div className="flex-shrink-0 w-10 h-10 bg-[#4B2E83] rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#4B2E83]/30">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                       </svg>
                     </div>
                     <div className="mr-2 flex-1">
                       <p className="text-[#2B2B2B] text-sm sm:text-base font-medium">טלפון</p>
                       <p className="text-gray-600 text-sm">050-1234567</p>
                     </div>
                   </motion.div>

                   {/* אימייל */}
                   <motion.div 
                     className="flex items-start space-x-4 space-x-reverse"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
                   >
                     <div className="flex-shrink-0 w-10 h-10 bg-[#4B2E83] rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#4B2E83]/30">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                       </svg>
                     </div>
                     <div className="mr-2 flex-1">
                       <p className="text-[#2B2B2B] text-sm sm:text-base font-medium">אימייל</p>
                       <p className="text-gray-600 text-sm break-all">info@ladances.com</p>
                     </div>
                   </motion.div>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mt-6 sm:mt-8 lg:mt-12">
              <motion.a 
                href="https://www.instagram.com/avigailladani?igsh=MXc4ZXU5cGdsM3U2cw==" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 sm:p-6 rounded-lg bg-white shadow-md group transition-all duration-300 hover:scale-110 relative"
                aria-label="עקבי אחרי באינסטגרם - @avigailladani"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }} // Adjusted delay for stagger
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 mr-2 group-hover:shadow-pink-300 group-hover:shadow-lg transition-all duration-300 ring-2 ring-[#EC4899]/30 group-hover:ring-4 group-hover:ring-[#EC4899]/50">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-[#4B2E83] font-medium group-hover:text-[#EC4899] transition-colors duration-300 text-sm sm:text-base">אינסטגרם</span>
                <span className="text-xs text-gray-500">@avigailladani</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 bg-[#EC4899] text-white text-xs rounded px-2 py-1 mt-2 transition-all duration-300 pointer-events-none shadow-lg">עקבי אחרי באינסטגרם</span>
              </motion.a>
              {/* TODO: החלף במספר וואטסאפ אמיתי */}
              <motion.a 
                href="https://wa.me/972XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 sm:p-6 rounded-lg bg-white shadow-md group transition-all duration-300 hover:scale-110 relative"
                aria-label="שלחי הודעה בוואטסאפ - צרי קשר ישיר"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }} // Adjusted delay for stagger
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#25D366] rounded-full flex items-center justify-center mb-1.5 sm:mb-2 mr-2 group-hover:shadow-green-300 group-hover:shadow-lg transition-all duration-300 ring-2 ring-[#25D366]/30 group-hover:ring-4 group-hover:ring-[#25D366]/50">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <span className="text-[#4B2E83] font-medium group-hover:text-[#25D366] transition-colors duration-300 text-sm sm:text-base">וואטסאפ</span>
                <span className="text-xs text-gray-500">צרי קשר ישיר</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 bg-[#25D366] text-white text-xs rounded px-2 py-1 mt-2 transition-all duration-300 pointer-events-none shadow-lg">שלחי הודעה בוואטסאפ</span>
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <ContactSuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} />
    </motion.div>
  );
}

export default ContactPage; 