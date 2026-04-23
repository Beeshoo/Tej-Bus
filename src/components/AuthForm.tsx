
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { BackendAPI } from '../services/api';

interface AuthFormProps {
  onLogin: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phone: '', 
    birthDay: '', 
    birthMonth: '', 
    birthYear: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // التحقق من صحة البيانات
      if (!isLogin) {
        if (formData.name.trim().length < 3) {
          setError('الاسم يجب أن يكون 3 أحرف على الأقل');
          setLoading(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('يرجى إدخال بريد إلكتروني صحيح');
          setLoading(false);
          return;
        }

        const phoneRegex = /^01[0125][0-9]{8}$/;
        if (!phoneRegex.test(formData.phone)) {
          setError('يرجى إدخال رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01)');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          setLoading(false);
          return;
        }

        if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
          setError('يرجى إدخال تاريخ الميلاد كاملاً');
          setLoading(false);
          return;
        }

        const year = parseInt(formData.birthYear);
        const currentYear = new Date().getFullYear();
        if (year < 1940 || year > currentYear - 12) {
          setError(`سنة الميلاد يجب أن تكون بين 1940 و ${currentYear - 12}`);
          setLoading(false);
          return;
        }
      } else {
        if (!formData.email || !formData.password) {
          setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
          setLoading(false);
          return;
        }
      }

      let result;
      if (isLogin) {
        result = await BackendAPI.login(formData.email, formData.password);
      } else {
        // تجميع تاريخ الميلاد
        const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;
        
        result = await BackendAPI.signup({
          ...formData,
          birthDate,
          role: UserRole.USER
        });
      }

      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.message || 'حدث خطأ غير متوقع');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم الافتراضي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-4 md:my-12 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
      <div className="py-8 md:py-10 text-center text-white relative transition-colors duration-500 bg-blue-900">
        <h2 className="text-2xl md:text-3xl font-black mb-2">
          {isLogin ? 'دخول المسافرين' : 'حساب ملكي جديد'}
        </h2>
        <p className="text-white/70 text-sm md:text-base">
          {isLogin ? 'أهلاً بك في حافلتك المفضلة' : 'خطوات بسيطة وتبدأ رحلتك'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-3 md:space-y-4">
        {error && (
          <div className="p-3 md:p-4 bg-red-50 text-red-600 rounded-xl text-sm md:text-base font-bold border border-red-100 animate-popIn">
            ⚠️ {error}
          </div>
        )}

        {!isLogin && (
          <>
            <div className="space-y-1">
              <label className="text-xs md:text-sm font-bold text-gray-400 me-2">الاسم بالكامل</label>
              <input 
                type="text" 
                required 
                className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 focus:ring-2 focus:ring-amber-500 outline-none text-sm md:text-base" 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs md:text-sm font-bold text-gray-400 me-2">رقم الهاتف</label>
              <input 
                type="tel" 
                required 
                placeholder="05xxxxxxxx"
                className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 focus:ring-2 focus:ring-amber-500 outline-none text-sm md:text-base" 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs md:text-sm font-bold text-gray-400 me-2">تاريخ الميلاد</label>
              <div className="grid grid-cols-3 gap-2">
                <select 
                  required
                  className="p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 focus:ring-2 focus:ring-amber-500 outline-none text-sm md:text-base"
                  onChange={(e) => setFormData({...formData, birthDay: e.target.value})}
                >
                  <option value="">اليوم</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select 
                  required
                  className="p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 focus:ring-2 focus:ring-amber-500 outline-none text-sm md:text-base"
                  onChange={(e) => setFormData({...formData, birthMonth: e.target.value})}
                >
                  <option value="">الشهر</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  required 
                  placeholder="السنة"
                  min="1940"
                  max={new Date().getFullYear() - 12}
                  className="p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 focus:ring-2 focus:ring-amber-500 outline-none text-sm md:text-base" 
                  onChange={(e) => setFormData({...formData, birthYear: e.target.value})} 
                />
              </div>
            </div>
          </>
        )}
        
        <div className="space-y-1">
          <label className="text-xs md:text-sm font-bold text-gray-400 me-2">البريد الإلكتروني</label>
          <input 
            type="email" 
            required 
            className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 focus:ring-2 focus:ring-amber-500 outline-none text-sm md:text-base" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs md:text-sm font-bold text-gray-400 me-2">كلمة المرور</label>
          <input 
            type="password" 
            required 
            className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 focus:ring-2 focus:ring-amber-500 outline-none text-sm md:text-base" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-900 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isLogin ? 'دخول' : 'إنشاء حساب')}
        </button>

        <button 
          type="button" 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full text-blue-600 text-sm md:text-base font-bold pt-4 hover:underline"
        >
          {isLogin ? 'أنا جديد هنا، أريد إنشاء حساب' : 'لدي حساب بالفعل، أريد الدخول'}
        </button>
      </form>
    </div>
  );
};
export default AuthForm;
