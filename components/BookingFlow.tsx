
import React, { useState, useEffect } from 'react';
import { CITIES, BUS_PRICES, TRIP_SCHEDULES } from '../constants';
import { BusType, BookingState, Ticket } from '../types';
import { BackendAPI } from '../services/api';
import PaymentForm from './PaymentForm';

interface BookingFlowProps {
  onComplete: (ticket: Ticket) => void;
  userId: string;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ onComplete, userId }) => {
  const [step, setStep] = useState(1);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const [booking, setBooking] = useState<BookingState>({
    from: '', to: '', busType: BusType.STANDARD, date: '', departureTime: '', arrivalTime: '', selectedSeats: []
  });

  useEffect(() => {
    if (booking.date && booking.departureTime && booking.from && booking.to) {
      BackendAPI.getOccupiedSeats(booking.date, booking.departureTime, booking.from, booking.to)
        .then(seats => setOccupiedSeats(seats));
    }
  }, [booking.date, booking.departureTime, booking.from, booking.to]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const toggleSeat = (seat: number) => {
    if (occupiedSeats.includes(seat)) return;
    setBooking(prev => ({
      ...prev,
      selectedSeats: prev.selectedSeats.includes(seat) ? prev.selectedSeats.filter(s => s !== seat) : [...prev.selectedSeats, seat]
    }));
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      const result = await BackendAPI.createBooking({
        ...booking,
        paymentId
      } as any, userId);
      
      if (result.success && result.ticket) {
        onComplete(result.ticket);
      }
    } catch (err: any) {
      // إعادة رمي الخطأ ليتم التقاطه في PaymentForm وعرضه للمستخدم
      throw err;
    }
  };

  const canGoNext = () => {
    switch(step) {
      case 1: return booking.from && booking.to && booking.from !== booking.to && booking.date;
      case 2: return booking.departureTime !== '';
      case 3: return true; // نوع الحافلة له قيمة افتراضية
      case 4: return booking.selectedSeats.length > 0;
      default: return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-4 md:my-8 p-2 md:p-4">
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-4 md:p-10 border border-gray-100">
        {/* مؤشر التقدم (Progress Stepper) */}
        <div className="flex justify-between items-center mb-8 md:mb-12 relative px-2 md:px-4">
          <div className="absolute top-1/2 right-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
          <div className="absolute top-1/2 right-0 h-1 bg-blue-900 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-base md:text-lg transition-all duration-300 ${step >= s ? 'bg-blue-900 text-white scale-110 shadow-lg shadow-blue-900/20' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
              {s}
            </div>
          ))}
        </div>

        {/* الخطوة 1: الوجهة والتاريخ */}
        {step === 1 && (
          <div className="space-y-6 md:space-y-8 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-blue-900">أين وجهتك القادمة؟</h3>
              <p className="text-lg md:text-xl text-gray-400 mt-2 font-medium">اختر المدن وتاريخ السفر لبدء الحجز</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm md:text-base font-bold text-gray-400 mr-2">من محافظة</label>
                <select className="w-full p-5 md:p-6 rounded-xl md:rounded-2xl bg-gray-50 border-2 border-transparent focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer text-lg md:text-xl" value={booking.from} onChange={e => {
                  const newFrom = e.target.value;
                  setBooking(prev => ({
                    ...prev,
                    from: newFrom,
                    to: prev.to === newFrom ? '' : prev.to
                  }));
                }}>
                  <option value="">اختر نقطة الانطلاق</option>
                  {CITIES.filter(c => c !== booking.to).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm md:text-base font-bold text-gray-400 mr-2">إلى محافظة</label>
                <select className="w-full p-5 md:p-6 rounded-xl md:rounded-2xl bg-gray-50 border-2 border-transparent focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer text-lg md:text-xl" value={booking.to} onChange={e => {
                  const newTo = e.target.value;
                  setBooking(prev => ({
                    ...prev,
                    to: newTo,
                    from: prev.from === newTo ? '' : prev.from
                  }));
                }}>
                  <option value="">اختر وجهة الوصول</option>
                  {CITIES.filter(c => c !== booking.from).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm md:text-base font-bold text-gray-400 mr-2">تاريخ السفر</label>
              <input type="date" className="w-full p-5 md:p-6 rounded-xl md:rounded-2xl bg-gray-50 border-2 border-transparent focus:border-amber-500 outline-none transition-all cursor-pointer text-lg md:text-xl" value={booking.date} onChange={e => setBooking({...booking, date: e.target.value})} min={new Date().toISOString().split('T')[0]} />
            </div>
            <button onClick={handleNext} disabled={!canGoNext()} className="w-full bg-blue-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-blue-900/20 disabled:opacity-30 disabled:grayscale transition-all">ابحث عن الرحلات المتاحة</button>
          </div>
        )}

        {/* الخطوة 2: وقت التحرك */}
        {step === 2 && (
          <div className="space-y-6 md:space-y-8 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-black text-blue-900">اختر موعد الرحلة</h3>
              <p className="text-sm md:text-gray-400 mt-2 font-medium">مواعيد دقيقة لضمان راحتك</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
               {TRIP_SCHEDULES.map(ts => (
                 <div 
                  key={ts.id} 
                  onClick={() => setBooking({...booking, departureTime: ts.departureTime, arrivalTime: ts.arrivalTime})} 
                  className={`p-4 md:p-6 border-2 rounded-2xl md:rounded-[2rem] cursor-pointer transition-all flex justify-between items-center group ${booking.departureTime === ts.departureTime ? 'bg-blue-50 border-blue-600 shadow-lg' : 'bg-white border-gray-100 hover:border-blue-200'}`}
                 >
                   <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl transition-all ${booking.departureTime === ts.departureTime ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {ts.departureTime.split(':')[0] >= '18' ? '🌙' : '☀️'}
                      </div>
                      <div>
                        <p className="text-xl md:text-2xl font-black text-blue-900">{ts.label}</p>
                        <p className="text-sm md:text-base text-gray-400 font-bold">وصول متوقع في تمام {ts.arrivalTime}</p>
                      </div>
                   </div>
                   <div className="text-xl md:text-2xl font-black text-blue-900">{ts.departureTime}</div>
                 </div>
               ))}
            </div>
            <div className="flex gap-3 md:gap-4">
              <button onClick={handleBack} className="flex-1 bg-gray-100 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-gray-500 text-sm md:text-base">رجوع</button>
              <button onClick={handleNext} disabled={!canGoNext()} className="flex-[2] bg-blue-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black shadow-xl disabled:opacity-30 transition-all text-sm md:text-base">التالي</button>
            </div>
          </div>
        )}

        {/* الخطوة 3: نوع الحافلة */}
        {step === 3 && (
          <div className="space-y-6 md:space-y-8 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-black text-blue-900">اختر نوع الحافلة</h3>
              <p className="text-sm md:text-gray-400 mt-2 font-medium">مستويات مختلفة من الرفاهية تناسب احتياجاتك</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
               {(Object.values(BusType) as BusType[]).map(type => (
                 <div 
                  key={type} 
                  onClick={() => setBooking({...booking, busType: type})} 
                  className={`p-6 md:p-8 border-2 rounded-[2rem] md:rounded-[2.5rem] cursor-pointer transition-all text-center relative overflow-hidden group ${booking.busType === type ? 'bg-amber-50 border-amber-500 shadow-xl scale-105' : 'bg-white border-gray-100 hover:border-amber-200'}`}
                 >
                   <div className={`text-3xl md:text-4xl mb-4 transition-transform group-hover:scale-125 ${booking.busType === type ? 'animate-bounce' : ''}`}>
                      {type === BusType.STANDARD ? '🚌' : type === BusType.VIP ? '🛋️' : '👑'}
                   </div>
                   <h4 className="text-xl md:text-2xl font-black text-blue-900 mb-2">{type}</h4>
                   <p className="text-sm md:text-base text-gray-400 font-bold mb-4">
                     {type === BusType.STANDARD ? 'تكييف، واي فاي، مقاعد مريحة' : type === BusType.VIP ? 'شاشات عرض، مقعد واسع، وجبة' : 'خدمة ملكية، مساج، شاشة 4K'}
                   </p>
                   <div className="text-xl md:text-2xl font-black text-amber-600">
                     {BUS_PRICES[type]} <span className="text-xs">ج.م</span>
                   </div>
                   {booking.busType === type && (
                     <div className="absolute top-4 left-4 text-amber-500">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                     </div>
                   )}
                 </div>
               ))}
            </div>
            <div className="flex gap-3 md:gap-4">
              <button onClick={handleBack} className="flex-1 bg-gray-100 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-gray-500 text-sm md:text-base">رجوع</button>
              <button onClick={handleNext} className="flex-[2] bg-blue-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black shadow-xl transition-all text-sm md:text-base">التالي</button>
            </div>
          </div>
        )}

        {/* الخطوة 4: اختيار المقاعد */}
        {step === 4 && (
          <div className="space-y-6 md:space-y-8 text-center animate-fadeIn">
             <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-black text-blue-900">اختر مقعدك المفضل</h3>
              <p className="text-sm md:text-gray-400 mt-2 font-medium">المقاعد الملونة بالأحمر محجوزة مسبقاً</p>
             </div>

             {/* تصميم هيكل الحافلة */}
             <div className="relative inline-block mx-auto group/bus">
               {/* جسم الحافلة - تصميم عصري وأنيق */}
               <div className="bg-slate-50 border-[6px] border-slate-200 rounded-[4rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden">
                 {/* تأثير الزجاج الأمامي */}
                 <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-100/30 to-transparent pointer-events-none"></div>
                 
                 {/* القسم الأمامي مع السائق وعجلة القيادة */}
                 <div className="flex justify-end items-center mb-12 pb-8 border-b-2 border-slate-100">
                   <div className="flex flex-col items-center gap-2">
                     <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center text-2xl md:text-3xl border-2 border-slate-200 shadow-sm relative overflow-hidden">
                       <div className="absolute inset-0 bg-blue-500/5"></div>
                       👨‍✈️
                     </div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">الكابتن</div>
                   </div>
                 </div>

                 {/* شبكة المقاعد مع الممر */}
                 <div className="grid grid-cols-5 gap-y-6 md:gap-y-8">
                   {/* توليد 10 صفوف من المقاعد (إجمالي 40 مقعداً) */}
                   {Array.from({length: 10}, (_, row) => {
                     return [1, 2, 0, 3, 4].map((col, colIdx) => {
                       if (col === 0) return <div key={`aisle-${row}`} className="w-6 md:w-10 flex items-center justify-center">
                         <div className="w-0.5 h-full bg-slate-100/50 rounded-full"></div>
                       </div>; // الممر
                       
                       const seatNumber = row * 4 + col;
                       const isOccupied = occupiedSeats.includes(seatNumber);
                       const isSelected = booking.selectedSeats.includes(seatNumber);
                       
                       return (
                         <button 
                           key={`seat-${seatNumber}`} 
                           disabled={isOccupied}
                           onClick={() => toggleSeat(seatNumber)} 
                           className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center text-xs md:text-sm relative
                             ${isOccupied ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' : 
                               isSelected ? 'bg-blue-900 border-blue-900 text-white shadow-[0_10px_20px_rgba(30,58,138,0.3)] scale-110 z-10' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg'}`}
                         >
                           {/* مسند الرأس للمقعد */}
                           <div className={`absolute -top-1.5 w-1/2 h-2 rounded-t-lg ${isSelected ? 'bg-blue-800' : isOccupied ? 'bg-slate-200' : 'bg-slate-100'}`}></div>
                           
                           <span className="relative z-10">{seatNumber}</span>
                           
                           {/* تفاصيل وسادة المقعد */}
                           <div className={`mt-1 w-8 h-1 rounded-full ${isSelected ? 'bg-blue-400/50' : isOccupied ? 'bg-slate-200' : 'bg-slate-100'}`}></div>
                         </button>
                       );
                     });
                   })}
                 </div>

                 {/* منطقة المحرك الخلفية */}
                 <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-center">
                    <div className="w-24 h-2 bg-slate-200 rounded-full opacity-50"></div>
                 </div>
               </div>

               {/* عجلات الحافلة - تفاصيل إضافية */}
               <div className="absolute -left-3 top-32 w-5 h-16 bg-slate-800 rounded-l-2xl border-r-4 border-slate-700 shadow-lg"></div>
               <div className="absolute -right-3 top-32 w-5 h-16 bg-slate-800 rounded-r-2xl border-l-4 border-slate-700 shadow-lg"></div>
               <div className="absolute -left-3 bottom-32 w-5 h-16 bg-slate-800 rounded-l-2xl border-r-4 border-slate-700 shadow-lg"></div>
               <div className="absolute -right-3 bottom-32 w-5 h-16 bg-slate-800 rounded-r-2xl border-l-4 border-slate-700 shadow-lg"></div>
             </div>
             
             <div className="flex justify-center gap-4 md:gap-8 text-sm font-bold bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-fit mx-auto">
               <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border-2 border-gray-200 rounded-md"></div> متاح</div>
               <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-900 rounded-md"></div> مختار</div>
               <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-50 border-2 border-red-100 rounded-md"></div> محجوز</div>
             </div>

             <div className="flex gap-3 md:gap-4 mt-8">
              <button onClick={handleBack} className="flex-1 bg-gray-100 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-gray-500 text-sm md:text-base">رجوع</button>
              <button onClick={handleNext} disabled={!canGoNext()} className="flex-[2] bg-blue-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black shadow-xl disabled:opacity-30 transition-all text-sm md:text-base">
                {booking.selectedSeats.length > 0 ? `تأكيد ${booking.selectedSeats.length} مقاعد والدفع` : 'يرجى اختيار مقعد'}
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 5: الدفع */}
        {step === 5 && (
          <PaymentForm 
            amount={booking.selectedSeats.length * BUS_PRICES[booking.busType]} 
            onSuccess={handlePaymentSuccess} 
            onCancel={handleBack} 
          />
        )}
      </div>
    </div>
  );
};
export default BookingFlow;
