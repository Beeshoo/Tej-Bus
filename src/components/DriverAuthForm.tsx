
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { BackendAPI } from '../services/api';

interface DriverAuthFormProps {
  onLogin: (user: User) => void;
}

const DriverAuthForm: React.FC<DriverAuthFormProps> = ({ onLogin }) => {
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
    birthYear: '',
    licenseNumber: '',
    photoUrl: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (isLogin) {
        result = await BackendAPI.login(formData.email, formData.password);
        if (result.success && result.user && result.user.role !== UserRole.DRIVER) {
          setError('هذا الحساب ليس لديه صلاحيات سائق');
          setLoading(false);
          return;
        }
      } else {
        // التحقق من صحة البيانات للسائق الجديد
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

        if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
          setError('يرجى إدخال تاريخ الميلاد كاملاً');
          setLoading(false);
          return;
        }

        if (formData.licenseNumber.trim().length < 5) {
          setError('يرجى إدخال رقم رخصة قيادة صحيح');
          setLoading(false);
          return;
        }

        if (!formData.photoUrl) {
          setError('يرجى رفع صورة شخصية واضحة');
          setLoading(false);
          return;
        }

        const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;

        result = await BackendAPI.signup({
          ...formData,
          birthDate,
          role: UserRole.DRIVER,
          status: 'active'
        });
      }

      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.message || 'حدث خطأ غير متوقع');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 animate-fadeIn text-white">
      <div className="py-10 text-center bg-gradient-to-br from-emerald-600 to-emerald-800 relative">
        <h2 className="text-4xl font-black mb-2 relative z-10">
          {isLogin ? 'دخول السائقين' : 'إنشاء حساب سائق'}
        </h2>
        <p className="text-emerald-100/70 text-lg relative z-10">
          بوابة كباتن أسطول تاج باص
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-slate-900">
        {error && (
          <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm font-bold border border-red-500/20 animate-popIn">
            ⚠️ {error}
          </div>
        )}

        {!isLogin && (
          <>
            <div className="space-y-1">
              <label className="text-base font-bold text-slate-500 me-2">الاسم الكامل للكابتن</label>
              <input 
                type="text" 
                required 
                className="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-white" 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-base font-bold text-slate-500 me-2">رقم الهاتف</label>
              <input 
                type="tel" 
                required 
                placeholder="01xxxxxxxxx"
                className="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-white" 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-base font-bold text-slate-500 me-2">رقم رخصة القيادة</label>
              <input 
                type="text" 
                required 
                className="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-white" 
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-base font-bold text-slate-500 me-2">تاريخ الميلاد</label>
              <div className="grid grid-cols-3 gap-2">
                <select 
                  required
                  className="p-4 bg-slate-800 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-white text-base"
                  onChange={(e) => setFormData({...formData, birthDay: e.target.value})}
                >
                  <option value="">اليوم</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select 
                  required
                  className="p-4 bg-slate-800 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-white text-base"
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
                  max={new Date().getFullYear() - 21}
                  className="p-4 bg-slate-800 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-white text-base" 
                  onChange={(e) => setFormData({...formData, birthYear: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-base font-bold text-slate-500 me-2">الصورة الشخصية</label>
              <label className="flex items-center justify-center gap-4 w-full p-4 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700 cursor-pointer hover:border-emerald-500 transition-all text-slate-400 overflow-hidden relative min-h-[64px]">
                {formData.photoUrl ? (
                  <div className="flex items-center gap-4 w-full">
                    <img src={formData.photoUrl} className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500" alt="Preview" />
                    <div className="text-right">
                      <p className="text-emerald-500 font-black text-sm">تم اختيار الصورة</p>
                      <p className="text-[10px] text-slate-500">اضغط لتغيير الصورة</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📷</span>
                    <span className="font-bold">ارفع صورتك الرسمية هنا</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </>
        )}
        
        <div className="space-y-1">
          <label className="text-base font-bold text-slate-500 me-2">البريد الإلكتروني</label>
          <input 
            type="email" 
            required 
            className="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-white" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-base font-bold text-slate-500 me-2">كلمة المرور</label>
          <input 
            type="password" 
            required 
            className="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-white" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isLogin ? 'دخول الكباتن' : 'تفعيل حساب سائق')}
        </button>

        <button 
          type="button" 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full text-slate-400 text-base font-bold pt-4 hover:text-emerald-500 transition-colors"
        >
          {isLogin ? 'طلب الانضمام لأسطولنا' : 'لديك حساب سائق؟ سجل دخولك'}
        </button>
      </form>
      
      <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-600 uppercase tracking-widest font-black">
          Driver Portal Access Only
        </p>
      </div>
    </div>
  );
};

export default DriverAuthForm;
