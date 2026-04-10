
import React, { useState, useEffect } from 'react';
import { BackendAPI } from '../services/api';
import { User, Ticket, UserRole } from '../types';

interface DriverDashboardProps {
  driver: User;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driver, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'trips' | 'ratings' | 'profile'>('trips');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    const driverTickets = await BackendAPI.getDriverTickets(driver.id);
    setTickets(driverTickets);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [driver.id]);

  const stats = {
    totalTrips: tickets.length,
    completedTrips: tickets.filter(t => t.status === 'completed').length,
    upcomingTrips: tickets.filter(t => t.status === 'upcoming').length,
    avgRating: tickets.filter(t => t.rating && t.rating > 0).length > 0
      ? (tickets.filter(t => t.rating && t.rating > 0).reduce((acc, t) => acc + t.rating!, 0) / tickets.filter(t => t.rating && t.rating > 0).length).toFixed(1)
      : '0.0'
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-tajawal text-white">
      {/* القائمة الجانبية (Sidebar) */}
      <aside className="w-full md:w-72 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 text-xl font-black">T</div>
            <h1 className="text-xl font-black tracking-tight">تاج باص <span className="text-emerald-500 text-xs block font-bold">بوابة الكابتن</span></h1>
          </div>
          <div className="flex items-center gap-2 mt-6 p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-slate-950 overflow-hidden">
              {driver.photoUrl ? (
                <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                'DR'
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{driver.name}</p>
              <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest">كابتن محترف</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {[
            { id: 'trips', label: 'رحلاتي المسندة', icon: '🛣️' },
            { id: 'ratings', label: 'تقييمات الركاب', icon: '⭐' },
            { id: 'profile', label: 'ملفي الشخصي', icon: '👤' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-sm transition-all ${activeTab === item.id ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl font-black text-sm text-red-400 hover:bg-red-500/10 transition-all">
            <span>🚪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي (Main Content) */}
      <main className="flex-grow p-6 md:p-10 overflow-auto bg-slate-950">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-white">
              {activeTab === 'trips' && 'جدول الرحلات'}
              {activeTab === 'ratings' && 'آراء المسافرين'}
              {activeTab === 'profile' && 'بيانات الكابتن'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">مرحباً كابتن {driver.name.split(' ')[0]}، نتمنى لك رحلة سعيدة وآمنة</p>
          </div>
          <button onClick={refreshData} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={loading ? 'animate-spin' : ''}><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>
        </header>

        {/* صف الإحصائيات (Stats Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'إجمالي الرحلات', val: stats.totalTrips, icon: '🛣️', color: 'emerald' },
            { label: 'رحلات قادمة', val: stats.upcomingTrips, icon: '🕒', color: 'blue' },
            { label: 'رحلات مكتملة', val: stats.completedTrips, icon: '✅', color: 'emerald' },
            { label: 'متوسط التقييم', val: stats.avgRating + ' ⭐', icon: '⭐', color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-800 flex items-center gap-6">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* محتوى التبويبات (Tab Content) */}
        <div className="animate-fadeIn">
          {activeTab === 'trips' && (
            <div className="bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-800 overflow-hidden">
              <div className="p-8 border-b border-slate-800">
                <h3 className="text-xl font-black text-white">قائمة الرحلات المسندة</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-950/50 text-slate-500 font-black text-xs uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="p-6">رقم الرحلة</th>
                      <th className="p-6">المسار</th>
                      <th className="p-6">التاريخ والوقت</th>
                      <th className="p-6">نوع الحافلة</th>
                      <th className="p-6">عدد الركاب</th>
                      <th className="p-6">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {tickets.map(t => (
                      <tr key={t.id} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="p-6 font-mono text-xs text-emerald-500 font-bold">{t.id}</td>
                        <td className="p-6 font-black text-white">{t.from} ← {t.to}</td>
                        <td className="p-6 text-sm font-medium text-slate-400">
                          {t.date} 
                          <span className="text-[10px] block opacity-50">{t.departureTime}</span>
                        </td>
                        <td className="p-6">
                          <span className="text-[10px] bg-slate-800 text-emerald-400 px-3 py-1 rounded-full font-black">
                            {t.busType}
                          </span>
                        </td>
                        <td className="p-6 font-black text-white">{t.selectedSeats.length} ركاب</td>
                        <td className="p-6">
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black ${
                            t.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : 
                            t.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {t.status === 'upcoming' ? 'قادمة' : t.status === 'cancelled' ? 'ملغاة' : 'مكتملة'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-20 text-center text-slate-600 font-black text-xl">
                          لا توجد رحلات مسندة إليك حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ratings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.filter(t => t.rating && t.rating > 0).map(t => (
                <div key={t.id} className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-sm hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`text-sm ${star <= t.rating! ? 'grayscale-0' : 'grayscale opacity-20'}`}>⭐</span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500">{t.date}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed italic mb-6">"{t.review || 'لا يوجد تعليق مكتوب'}"</p>
                  <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-xs font-black text-emerald-500">T</div>
                      <span className="text-xs font-black text-white">{t.from} ← {t.to}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{t.busType}</span>
                  </div>
                </div>
              ))}
              {tickets.filter(t => t.rating && t.rating > 0).length === 0 && (
                <div className="col-span-full p-20 text-center bg-slate-900 rounded-[3rem] border border-dashed border-slate-800">
                  <p className="text-slate-600 font-black text-xl">لا توجد تقييمات من الركاب بعد</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="h-32 bg-gradient-to-r from-emerald-600 to-emerald-900 relative">
                <div className="absolute -bottom-12 right-12 w-24 h-24 bg-slate-900 rounded-3xl border-4 border-slate-950 flex items-center justify-center text-4xl shadow-xl overflow-hidden">
                  {driver.photoUrl ? (
                    <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    '👨‍✈️'
                  )}
                </div>
              </div>
              <div className="p-12 pt-16 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">{driver.name}</h3>
                  <p className="text-emerald-500 font-bold text-sm">كابتن معتمد لدى تاج باص</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">البريد الإلكتروني</label>
                    <p className="text-white font-bold">{driver.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">رقم الهاتف</label>
                    <p className="text-white font-bold">{driver.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">رقم رخصة القيادة</label>
                    <p className="text-white font-bold">{driver.licenseNumber || 'غير مسجل'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تاريخ الميلاد</label>
                    <p className="text-white font-bold">{driver.birthDate}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">حالة العمل</label>
                    <span className="inline-block px-4 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black">نشط حالياً</span>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-slate-800">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    * ملاحظة: لتعديل بياناتك الشخصية أو رقم الرخصة، يرجى مراجعة قسم الموارد البشرية في المقر الرئيسي لشركة تاج باص.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
