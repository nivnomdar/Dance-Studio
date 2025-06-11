function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F6] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#EC4899] mb-6 font-agrandir-grand">
            צור קשר
          </h1>
          <div className="w-24 h-1 bg-[#E6C17C] mx-auto"></div>
          <p className="mt-6 text-lg text-[#2B2B2B] max-w-3xl mx-auto font-agrandir-regular">
            נשמח לשמוע ממך! השאירי פרטים ונחזור אליך בהקדם
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#2B2B2B] mb-2">
                  שם מלא
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#4B2E83] focus:border-[#4B2E83]"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2B2B2B] mb-2">
                  אימייל
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#4B2E83] focus:border-[#4B2E83]"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#2B2B2B] mb-2">
                  טלפון
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#4B2E83] focus:border-[#4B2E83]"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#2B2B2B] mb-2">
                  הודעה
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#4B2E83] focus:border-[#4B2E83]"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-[#EC4899] text-white py-3 px-6 rounded-xl hover:bg-[#EC4899]/90 transition-colors duration-300 font-medium"
              >
                שלח הודעה
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-[#4B2E83] mb-4 font-agrandir-grand">
                פרטי התקשרות
              </h3>
              <div className="space-y-4">
                <p className="flex items-center text-[#2B2B2B]">
                  <svg className="w-6 h-6 text-[#D8A7B1] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <a 
                    href="https://waze.com/ul?ll=31.9737,34.7928&navigate=yes" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mr-2 hover:text-[#4B2E83] transition-colors duration-200"
                  >
                    רחוב יוסף לישנסקי 6, ראשון לציון
                  </a>
                </p>
                <p className="flex items-center text-[#2B2B2B]">
                  <svg className="w-6 h-6 text-[#D8A7B1] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a className="mr-2">03-1234567</a>
                  
                </p>
                <p className="flex items-center text-[#2B2B2B]">
                  <svg className="w-6 h-6 text-[#D8A7B1] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a className="mr-2">info@avigaildance.com</a>
                </p>
              </div>
            </div>

            <div className="mr-2 bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-[#4B2E83] mb-6 font-agrandir-grand">
                עקבו אחרינו
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="https://www.instagram.com/avigailladani?igsh=MXc4ZXU5cGdsM3U2cw==" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-[#FDF9F6] transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </div>
                  <span className="text-[#4B2E83] font-medium group-hover:text-[#EC4899] transition-colors duration-300">אינסטגרם</span>
                  <span className="text-sm text-gray-500">@avigailladani</span>
                </a>
                <a 
                  href="https://www.facebook.com/alina.ladani.2025?locale=he_IL" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-[#FDF9F6] transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="text-[#4B2E83] font-medium group-hover:text-[#1877F2] transition-colors duration-300">פייסבוק</span>
                  <span className="text-sm text-gray-500">Avigail Ladani</span>
                </a>
                <a 
                  href="https://wa.me/972XXXXXXXXX" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-[#FDF9F6] transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <span className="text-[#4B2E83] font-medium group-hover:text-[#25D366] transition-colors duration-300">וואטסאפ</span>
                  <span className="text-sm text-gray-500">צרי קשר ישיר</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage; 