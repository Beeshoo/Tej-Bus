
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from '../types';
import { to12Hour } from '../constants';

interface PastTripsProps {
  tickets: Ticket[];
  onRate: (id: string, rating: number, review: string) => void;
  onMarkComplete: (id: string) => void;
  onCancel: (id: string) => void;
  singleTicketId?: string | null;
}

const PastTrips: React.FC<PastTripsProps> = ({ tickets, onRate, onMarkComplete, onCancel, singleTicketId }) => {
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const displayTickets = singleTicketId 
    ? tickets.filter(t => t.id === singleTicketId)
    : tickets;

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingId) {
      onRate(ratingId, rating, review);
      setRatingId(null);
      setRating(5);
      setReview('');
    }
  };

  const handleCancelConfirm = () => {
    if (cancellingId) {
      onCancel(cancellingId);
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 animate-fadeIn">
      {/* Rating Modal */}
      {ratingId && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-popIn">
            <h3 className="text-3xl font-black text-blue-900 mb-2 text-center">تقييم رحلتك الملكية</h3>
            <p className="text-gray-400 text-base text-center mb-8">رأيك يهمنا لنقدم لك دائماً الأفضل</p>
            
            <form onSubmit={handleRateSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform hover:scale-125 ${star <= rating ? 'grayscale-0' : 'grayscale opacity-30'}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 me-2">اكتب رأيك (اختياري)</label>
                <textarea 
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="كيف كانت تجربتك مع السائق والحافلة؟"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-base resize-none"
                  rows={4}
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setRatingId(null)}
                  className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 text-sm"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-blue-900 text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 text-sm"
                >
                  إرسال التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {cancellingId && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-popIn text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </div>
            <h3 className="text-3xl font-black text-blue-900 mb-2">تأكيد إلغاء الرحلة</h3>
            <p className="text-gray-400 text-base mb-8">هل أنت متأكد من رغبتك في إلغاء هذه الرحلة؟ سيتم استرداد المبلغ المدفوع إلى حسابك.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setCancellingId(null)}
                className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 text-sm"
              >
                تراجع
              </button>
              <button 
                onClick={handleCancelConfirm}
                className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-600/20 text-sm"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-10 gap-4">
        <div className="text-center md:text-right">
          <h2 className="text-3xl md:text-4xl font-black text-blue-900">
            {singleTicketId ? 'تم الحجز بنجاح! 🎉' : 'حجوزاتي الملكية'}
          </h2>
          <p className="text-base md:text-lg text-gray-400 font-medium">
            {singleTicketId ? '' : 'هنا تجد جميع تفاصيل رحلاتك الحالية والسابقة'}
          </p>
        </div>
        {!singleTicketId && (
          <div className="bg-amber-500 text-blue-900 px-6 py-2 rounded-2xl font-black shadow-lg text-base md:text-lg">
            {tickets.length} تذكرة نشطة
          </div>
        )}
      </div>

      {displayTickets.length === 0 ? (
        <div className="text-center py-16 md:py-24 bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl flex flex-col items-center border border-gray-100 px-6">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-200">
            <svg className="w-8 h-8 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-blue-900 mb-2">لا توجد حجوزات حالية</h3>
          <p className="text-sm md:text-base text-gray-400 mb-8 max-w-xs mx-auto">ابدأ رحلتك الأولى مع تاج باص واستمتع بتجربة سفر لا تُنسى.</p>
          <button className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg text-sm md:text-base">احجز رحلتك الأولى</button>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {displayTickets.map(t => (
            <div key={t.id} className="relative bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
              {/* Left Side: Ticket Visual */}
              <div className="bg-blue-900 text-white p-6 md:p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                   <p className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-300 mb-1">Boarding Pass</p>
                   <h4 className="text-2xl md:text-3xl font-black mb-4 md:mb-6">#{t.id}</h4>
                   <div className="space-y-3 md:space-y-4">
                      <div>
                        <p className="text-xs md:text-sm font-bold text-blue-400 uppercase">المقاعد</p>
                        <p className="text-xl md:text-2xl font-black">{t.selectedSeats.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-blue-400 uppercase">الدرجة</p>
                        <p className="font-black text-amber-500 text-base md:text-lg">{t.busType}</p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-blue-400 uppercase">الكابتن</p>
                        <p className="font-black text-white text-sm md:text-base truncate">
                          {t.driverName ? `👨‍✈️ ${t.driverName}` : '⏳ جاري التعيين...'}
                        </p>
                      </div>
                   </div>
                </div>
                <div className="mt-4 md:mt-6 border-t border-white/10 pt-3 relative z-10">
                   <div className="bg-white p-2 rounded-xl inline-block shadow-2xl">
                      <QRCodeSVG 
                        value={`https://tajbus.com/verify/${t.id}`}
                        size={85}
                        level="H"
                        includeMargin={false}
                        className="w-16 h-16 md:w-[85px] md:h-[85px]"
                      />
                   </div>
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="p-6 md:p-8 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 md:gap-4 mb-4">
                      <div className="text-center min-w-[60px] md:min-w-[80px]">
                        <p className="text-2xl md:text-4xl font-black text-blue-900">{t.from}</p>
                        <p className="text-xs md:text-sm text-gray-400 font-bold uppercase">نقطة الانطلاق</p>
                      </div>
                      <div className="flex-grow flex flex-col items-center px-2 md:px-4">
                        <div className="w-full h-[1px] md:h-[2px] bg-dashed bg-gray-200 relative">
                           <div className="absolute top-[-8px] md:top-[-10px] left-1/2 -translate-x-1/2 bg-white px-1 md:px-2 text-base md:text-lg">
                             🚌
                           </div>
                        </div>
                      </div>
                      <div className="text-center min-w-[60px] md:min-w-[80px]">
                        <p className="text-2xl md:text-4xl font-black text-blue-900">{t.to}</p>
                        <p className="text-xs md:text-sm text-gray-400 font-bold uppercase">وجهة الوصول</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100">
                  <div>
                    <p className="text-xs md:text-sm text-gray-400 font-bold mb-1">تاريخ الرحلة</p>
                    <p className="text-base md:text-lg font-black text-blue-900">{t.date}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-400 font-bold mb-1">وقت التحرك</p>
                    <p className="text-base md:text-lg font-black text-blue-900">{to12Hour(t.departureTime)}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-400 font-bold mb-1">السعر المدفوع</p>
                    <p className="text-base md:text-lg font-black text-green-600">{t.price} ج.م</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-50 flex items-center justify-center border-2 border-amber-500 shadow-md overflow-hidden flex-shrink-0">
                      {t.driverPhoto ? (
                        <img 
                          src={t.driverPhoto} 
                          alt={t.driverName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xl">👨‍✈️</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm md:text-base text-gray-400 font-bold mb-1">السائق</p>
                      <p className="text-lg md:text-xl font-black text-amber-600 truncate max-w-[200px]">
                        {t.driverName || 'جاري التعيين...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                         <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-400 font-bold leading-none">حالة الرحلة</p>
                        <p className="text-base md:text-lg font-bold text-blue-900">مؤكدة وجاهزة</p>
                      </div>
                   </div>
                   
                    <div className="w-full sm:w-auto text-center flex flex-col sm:flex-row gap-2">
                    {t.status === 'upcoming' ? (
                      <>
                        <button 
                          onClick={() => onMarkComplete(t.id)}
                          className="w-full sm:w-auto bg-green-500 text-white px-6 py-2 rounded-xl text-xs md:text-sm font-black shadow-lg shadow-green-500/20"
                        >
                          إنهاء الرحلة
                        </button>
                        <button 
                          onClick={() => setCancellingId(t.id)}
                          className="w-full sm:w-auto bg-red-50 text-red-600 border border-red-100 px-6 py-2 rounded-xl text-xs md:text-sm font-black hover:bg-red-100 transition-colors"
                        >
                          إلغاء واسترداد
                        </button>
                      </>
                    ) : t.status === 'cancelled' ? (
                      <div className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-xs md:text-sm font-black border border-red-100">
                        تم الإلغاء والاسترداد
                      </div>
                    ) : t.rating ? (
                      <div className="flex flex-col items-center">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= t.rating! ? 'grayscale-0' : 'grayscale opacity-30'}>⭐</span>
                          ))}
                        </div>
                        <p className="text-[10px] font-black text-blue-900">تم التقييم</p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setRatingId(t.id)}
                        className="w-full sm:w-auto bg-blue-900 text-white px-6 py-2 rounded-xl text-xs md:text-sm font-black"
                      >
                        تقييم الرحلة
                      </button>
                    )}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastTrips;
