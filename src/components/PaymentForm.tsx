
import React, { useState } from 'react';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => Promise<void> | void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // تم إيقاف التحقق من صحة البيانات بناءً على طلب المستخدم لتسهيل التجربة
    // (ملاحظة: في النظام الحقيقي يجب تفعيل هذه القيود)

    setLoading(true);
    
    try {
      // محاكاة عملية الدفع البنكية
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const paymentId = 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // انتظار انتهاء عملية الحجز في الخلفية قبل إغلاق التحميل
      await onSuccess(paymentId);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الدفع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex justify-between items-center">
        <div>
          <p className="text-blue-900 font-bold">إجمالي المبلغ المطلوب</p>
          <p className="text-sm md:text-base text-blue-600">ضمان حجز فوري ومؤكد</p>
        </div>
        <div className="text-2xl font-black text-blue-900">{amount} ج.م</div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm md:text-base font-bold border border-red-100 animate-shake">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">الاسم على البطاقة</label>
          <input 
            type="text" 
            required 
            placeholder="الاسم بالكامل"
            className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, cardName: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">رقم البطاقة</label>
          <div className="relative">
            <input 
              type="text" 
              required 
              placeholder="0000 0000 0000 0000"
              className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ps-12"
              onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
              value={formData.cardNumber}
            />
            <div className="absolute left-4 top-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الانتهاء</label>
            <input 
              type="text" 
              required 
              placeholder="MM/YY"
              className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, expiry: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">رمز CVV</label>
            <input 
              type="password" 
              required 
              maxLength={3}
              placeholder="***"
              className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, cvv: e.target.value})}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-100 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-[2] bg-blue-900 text-white py-4 rounded-xl font-black shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                جاري معالجة الدفع...
              </>
            ) : (
              `إتمام الدفع الآن`
            )}
          </button>
        </div>
      </form>
      
      <p className="text-center text-lg md:text-xl text-gray-400 flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        دفع آمن بنسبة 100% عبر تشفير SSL
      </p>
    </div>
  );
};

export default PaymentForm;
