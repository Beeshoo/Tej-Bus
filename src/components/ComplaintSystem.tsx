
import React, { useState } from 'react';

const ComplaintSystem: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    // محاكاة إرسال الشكوى إلى الإدارة
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSuccess(true);
    setLoading(false);
    setSubject('');
    setDesc('');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-12 px-4">
      <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 text-red-600 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl">
            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-blue-900">هل واجهت مشكلة؟</h2>
            <p className="text-sm md:text-base text-gray-400 font-medium">سجل شكواك وسيقوم فريق الدعم بمراجعتها في أقرب وقت</p>
          </div>
        </div>

        <form onSubmit={send} className="space-y-4 md:space-y-5">
          <div className="space-y-1">
            <label className="text-xs md:text-sm font-bold text-gray-500 mr-2">موضوع الشكوى</label>
            <input 
              type="text" 
              placeholder="مثال: تأخير في موعد التحرك" 
              className="w-full p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-500 transition-all text-base md:text-lg" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs md:text-sm font-bold text-gray-500 mr-2">تفاصيل المشكلة</label>
            <textarea 
              placeholder="اشرح لنا ما حدث بالتفصيل..." 
              className="w-full p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-500 transition-all h-32 md:h-40 text-base md:text-lg" 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-red-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-base md:text-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                جاري الإرسال...
              </>
            ) : (
              'إرسال الشكوى الآن'
            )}
          </button>
        </form>

        {success && (
          <div className="mt-10 p-6 bg-green-50 border border-green-100 rounded-[2rem] animate-popIn relative">
            <div className="absolute -top-3 right-6 bg-green-600 text-white text-xs md:text-sm px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
              تم الإرسال بنجاح
            </div>
            <p className="text-green-900 text-base md:text-lg leading-relaxed">شكراً لك، لقد تم استلام شكواك بنجاح. سيقوم فريق خدمة العملاء بمراجعتها والرد عليك في أقرب وقت ممكن.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintSystem;
