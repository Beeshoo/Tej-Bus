
import React, { useState, useEffect } from 'react';
import { BackendAPI } from '../services/api';
import { User, Ticket, Complaint, Driver, UserRole, BusType } from '../types';
import { TRIP_SCHEDULES, BUS_PRICES } from '../constants';

interface AdminDashboardProps {
  admin: User;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'activeTrips' | 'drivers' | 'payments' | 'complaints' | 'schedules'>('overview');
  const [data, setData] = useState<{
    users: User[];
    tickets: Ticket[];
    complaints: Complaint[];
    drivers: Driver[];
  }>({ users: [], tickets: [], complaints: [], drivers: [] });
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    const allData = await BackendAPI.getAllData();
    // جلب السائقين من جدول المستخدمين أيضاً (في حال سجلوا بأنفسهم)
    const driverUsers = allData.users.filter(u => u.role === UserRole.DRIVER);
    const allDrivers = [...allData.drivers, ...driverUsers.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      licenseNumber: u.licenseNumber || 'N/A',
      status: u.status || 'active',
      photoUrl: u.photoUrl
    }))];
    
    // إزالة التكرار بناءً على المعرف (ID)
    const uniqueDrivers = Array.from(new Map(allDrivers.map(d => [d.id, d]) ).values());

    setData({
      ...allData,
      drivers: uniqueDrivers
    });
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleUpdateComplaint = async (id: number, status: 'pending' | 'resolved' | 'ignored') => {
    await BackendAPI.updateComplaintStatus(id, status);
    refreshData();
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    await BackendAPI.addDriver({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      licenseNumber: formData.get('license') as string,
      photoUrl: formData.get('photoUrl') as string,
      status: 'active'
    });
    form.reset();
    refreshData();
  };

  const handleDeleteDriver = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السائق؟')) {
      await BackendAPI.deleteDriver(id);
      refreshData();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-tajawal">
      {/* القائمة الجانبية (Sidebar) */}
      <aside className="w-full md:w-72 bg-blue-950 text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-blue-950 text-xl font-black">T</div>
            <h1 className="text-xl font-black tracking-tight">تاج باص <span className="text-amber-500 text-xs block font-bold">لوحة الإدارة</span></h1>
          </div>
          <div className="flex items-center gap-2 mt-6 p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">AD</div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{admin.name}</p>
              <p className="text-xs text-blue-300 font-bold uppercase tracking-widest">مدير النظام</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: '📊' },
            { id: 'activeTrips', label: 'إدارة الرحلات', icon: '🚌' },
            { id: 'trips', label: 'سجل الحجوزات', icon: '🎫' },
            { id: 'drivers', label: 'إدارة السائقين', icon: '👨‍✈️' },
            { id: 'payments', label: 'المدفوعات المالية', icon: '💳' },
            { id: 'complaints', label: 'شكاوي العملاء', icon: '📩' },
            { id: 'schedules', label: 'مواعيد الحافلات', icon: '🕒' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-sm transition-all ${activeTab === item.id ? 'bg-amber-500 text-blue-950 shadow-lg shadow-amber-500/20' : 'hover:bg-white/5 text-blue-200'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl font-black text-sm text-red-400 hover:bg-red-500/10 transition-all">
            <span>🚪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي (Main Content) */}
      <main className="flex-grow p-6 md:p-10 overflow-auto">
        {/* رأس الصفحة (Header) */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-blue-950">
              {activeTab === 'overview' && 'إحصائيات المنصة'}
              {activeTab === 'activeTrips' && 'إدارة الرحلات الحالية'}
              {activeTab === 'trips' && 'سجل الحجوزات'}
              {activeTab === 'drivers' && 'فريق السائقين'}
              {activeTab === 'payments' && 'التقارير المالية'}
              {activeTab === 'complaints' && 'صندوق الوارد'}
              {activeTab === 'schedules' && 'جدول المواعيد'}
            </h2>
            <p className="text-gray-400 font-medium mt-1">مرحباً بك مجدداً، إليك آخر التحديثات اليوم</p>
          </div>
          <button onClick={refreshData} className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={loading ? 'animate-spin' : ''}><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>
        </header>

        {/* محتوى التبويبات (Tab Content) */}
        <div className="animate-fadeIn">
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'إجمالي المستخدمين', val: data.users.length, icon: '👥', color: 'blue' },
                  { label: 'التذاكر المحجوزة', val: data.tickets.filter(t => t.status !== 'cancelled').length, icon: '🎫', color: 'amber' },
                  { label: 'إجمالي الإيرادات', val: data.tickets.filter(t => t.status !== 'cancelled').reduce((acc, t) => acc + t.price, 0) + ' ج.م', icon: '💰', color: 'green' },
                  { label: 'تذاكر ملغاة', val: data.tickets.filter(t => t.status === 'cancelled').length, icon: '❌', color: 'red' },
                  { label: 'متوسط التقييم', val: data.tickets.filter(t => t.rating && t.rating > 0).length > 0 ? (data.tickets.filter(t => t.rating && t.rating > 0).reduce((acc, t) => acc + t.rating!, 0) / data.tickets.filter(t => t.rating && t.rating > 0).length).toFixed(1) + ' ⭐' : 'N/A', icon: '⭐', color: 'amber' },
                  { label: 'شكاوي معلقة', val: data.complaints.filter(c => c.status === 'pending').length, icon: '📩', color: 'red' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl bg-${stat.color}-50 text-${stat.color}-600`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-3xl font-black text-blue-950">{stat.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-blue-950 mb-6">أحدث الحجوزات</h3>
                  <div className="space-y-4">
                    {data.tickets.slice(0, 5).map(t => (
                      <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-900 text-white rounded-xl flex items-center justify-center font-black text-xs">T</div>
                          <div>
                            <p className="text-base font-black text-blue-950">{t.from} ← {t.to}</p>
                            <p className="text-xs text-gray-400 font-bold">{t.date} | {t.departureTime}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-amber-600">{t.price} ج.م</p>
                          <p className="text-xs font-bold text-gray-400 uppercase">{t.paymentStatus}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-blue-950 mb-6">توزيع الحافلات</h3>
                  <div className="space-y-6">
                    {Object.values(BusType).map(type => {
                      const count = data.tickets.filter(t => t.busType === type).length;
                      const percentage = data.tickets.length > 0 ? (count / data.tickets.length) * 100 : 0;
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between text-sm font-black text-blue-900">
                            <span>{type}</span>
                            <span>{count} حجز</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-blue-950 mb-6">أحدث تقييمات العملاء</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.tickets.filter(t => t.rating && t.rating > 0).slice(0, 6).map(t => (
                    <div key={t.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={`text-xs ${star <= t.rating! ? 'grayscale-0' : 'grayscale opacity-30'}`}>⭐</span>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-400">{t.date}</span>
                      </div>
                      <p className="text-base text-blue-950 font-black mb-2">{data.users.find(u => u.id === t.userId)?.name}</p>
                      <p className="text-sm text-gray-500 leading-relaxed italic">"{t.review || 'لا يوجد تعليق'}"</p>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-600">{t.from} ← {t.to}</span>
                        <span className="text-xs font-bold text-amber-600">{t.busType}</span>
                      </div>
                    </div>
                  ))}
                  {data.tickets.filter(t => t.rating && t.rating > 0).length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-300 font-bold">لا توجد تقييمات بعد</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activeTrips' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-blue-950 mb-6">الرحلات القادمة (تجميع حسب المسار والوقت)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-400 font-black text-sm uppercase tracking-widest border-b">
                      <tr>
                        <th className="p-6">المسار</th>
                        <th className="p-6">التاريخ</th>
                        <th className="p-6">الوقت</th>
                        <th className="p-6">نوع الحافلة</th>
                        <th className="p-6">عدد الركاب</th>
                        <th className="p-6">السائق الحالي</th>
                        <th className="p-6">إسناد سائق</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(() => {
                        // تجميع التذاكر في رحلات فريدة بناءً على المسار والوقت
                        const tripsMap = new Map<string, {
                          from: string, to: string, date: string, time: string, busType: string, 
                          passengers: number, driverId?: string, driverName?: string
                        }>();

                        data.tickets.filter(t => t.status !== 'cancelled').forEach(t => {
                          const key = `${t.from}-${t.to}-${t.date}-${t.departureTime}-${t.busType}`;
                          if (!tripsMap.has(key)) {
                            tripsMap.set(key, {
                              from: t.from, to: t.to, date: t.date, time: t.departureTime, 
                              busType: t.busType, passengers: 0, driverId: t.driverId, driverName: t.driverName
                            });
                          }
                          tripsMap.get(key)!.passengers += t.selectedSeats.length;
                        });

                        return Array.from(tripsMap.values()).map((trip, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-6 font-black text-blue-950">{trip.from} ← {trip.to}</td>
                            <td className="p-6 text-base font-medium text-gray-500">{trip.date}</td>
                            <td className="p-6 text-base font-black text-amber-600">{trip.time}</td>
                            <td className="p-6"><span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black">{trip.busType}</span></td>
                            <td className="p-6 font-black text-blue-950">{trip.passengers} راكب</td>
                            <td className="p-6">
                              {trip.driverName ? (
                                <span className="text-sm font-bold text-green-600">👨‍✈️ {trip.driverName}</span>
                              ) : (
                                <span className="text-sm font-bold text-red-400 italic">لم يسند بعد</span>
                              )}
                            </td>
                            <td className="p-6">
                              <select 
                                className="text-xs bg-white border border-gray-200 rounded-lg p-2 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                value={trip.driverId || ''}
                                onChange={async (e) => {
                                  const driver = data.drivers.find(d => d.id === e.target.value);
                                  if (driver) {
                                    await BackendAPI.assignDriverToTrip(trip.from, trip.to, trip.date, trip.time, trip.busType, driver.id, driver.name, driver.photoUrl);
                                    refreshData();
                                  }
                                }}
                              >
                                <option value="">اختر سائقاً</option>
                                {data.drivers.map(d => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-400 font-black text-xs uppercase tracking-widest border-b">
                  <tr>
                    <th className="p-6">رقم التذكرة</th>
                    <th className="p-6">المسافر</th>
                    <th className="p-6">المسار</th>
                    <th className="p-6">التاريخ</th>
                    <th className="p-6">النوع</th>
                    <th className="p-6">السعر</th>
                    <th className="p-6">السائق</th>
                    <th className="p-6">التقييم</th>
                    <th className="p-6">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.tickets.map(t => (
                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-6 font-mono text-xs text-blue-600 font-bold">{t.id}</td>
                      <td className="p-6 font-black text-blue-950">{data.users.find(u => u.id === t.userId)?.name || 'مستخدم مجهول'}</td>
                      <td className="p-6 font-bold text-gray-600">{t.from} ← {t.to}</td>
                      <td className="p-6 text-sm font-medium text-gray-500">{t.date} <span className="text-[10px] block opacity-50">{t.departureTime}</span></td>
                      <td className="p-6"><span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black">{t.busType}</span></td>
                      <td className="p-6 font-black text-amber-600">{t.price} ج.م</td>
                      <td className="p-6">
                        <select 
                          className="text-[10px] bg-gray-50 border border-gray-200 rounded-lg p-1 font-bold outline-none"
                          value={t.driverId || ''}
                          onChange={async (e) => {
                            const driver = data.drivers.find(d => d.id === e.target.value);
                            if (driver) {
                              await BackendAPI.assignDriverToTicket(t.id, driver.id, driver.name, driver.photoUrl);
                              refreshData();
                            }
                          }}
                        >
                          <option value="">إسناد سائق</option>
                          {data.drivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-6">
                        {t.rating ? (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={`text-[10px] ${star <= t.rating! ? 'grayscale-0' : 'grayscale opacity-30'}`}>⭐</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 font-bold italic">لا يوجد</span>
                        )}
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black ${
                          t.status === 'upcoming' ? 'bg-green-100 text-green-700' : 
                          t.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {t.status === 'upcoming' ? 'قادمة' : t.status === 'cancelled' ? 'ملغاة' : 'مكتملة'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex-grow">
                  <h3 className="text-xl font-black text-blue-950 mb-6">إضافة سائق جديد</h3>
                  <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input name="name" required placeholder="اسم السائق" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    <input name="phone" required placeholder="رقم الهاتف" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    <input name="license" required placeholder="رقم الرخصة" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    <input name="photoUrl" placeholder="رابط الصورة (URL)" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    <button type="submit" className="bg-blue-900 text-white font-black rounded-2xl hover:bg-blue-800 transition-all">إضافة للفريق</button>
                  </form>
                </div>
                
                {data.drivers.length < 5 && (
                  <div className="bg-amber-50 p-8 rounded-[2.5rem] border-2 border-dashed border-amber-200 flex flex-col items-center justify-center text-center min-w-[250px]">
                    <p className="text-amber-800 font-black mb-4 text-sm">هل تريد إضافة سائقين افتراضيين؟</p>
                    <button 
                      onClick={async () => {
                        await BackendAPI.getDrivers();
                        refreshData();
                      }}
                      className="bg-amber-500 text-blue-900 px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                    >
                      تعبئة السائقين (Seed)
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.drivers.map(d => (
                  <div key={d.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative group">
                    <button onClick={() => handleDeleteDriver(d.id)} className="absolute top-6 left-6 text-red-200 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2 2H5V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mb-6 overflow-hidden">
                      {d.photoUrl ? (
                        <img src={d.photoUrl} alt={d.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        '👨‍✈️'
                      )}
                    </div>
                    <h4 className="text-xl font-black text-blue-950 mb-1">{d.name}</h4>
                    <p className="text-xs text-gray-400 font-bold mb-4">رخصة: {d.licenseNumber}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-sm font-bold text-gray-600">{d.phone}</span>
                      <span className="text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full font-black">نشط حالياً</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-xl font-black text-blue-950">سجل المعاملات المالية</h3>
                <div className="bg-green-100 text-green-700 px-6 py-2 rounded-2xl font-black text-sm">
                  إجمالي التحصيل الفعلي: {data.tickets.filter(t => t.status !== 'cancelled').reduce((acc, t) => acc + t.price, 0)} ج.م
                </div>
              </div>
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-400 font-black text-xs uppercase tracking-widest border-b">
                  <tr>
                    <th className="p-6">معرف الدفع</th>
                    <th className="p-6">المستخدم</th>
                    <th className="p-6">المبلغ</th>
                    <th className="p-6">التاريخ</th>
                    <th className="p-6">الوسيلة</th>
                    <th className="p-6">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.tickets.map(t => (
                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-6 font-mono text-xs text-blue-600 font-bold">{t.paymentId}</td>
                      <td className="p-6 font-black text-blue-950">{data.users.find(u => u.id === t.userId)?.name}</td>
                      <td className="p-6 font-black text-green-600">{t.price} ج.م</td>
                      <td className="p-6 text-sm font-medium text-gray-500">{t.date}</td>
                      <td className="p-6 text-xs font-bold text-gray-400">بطاقة ائتمان</td>
                      <td className="p-6">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black ${t.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {t.status === 'cancelled' ? 'مستردة' : 'ناجحة'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="grid grid-cols-1 gap-6">
              {data.complaints.map(c => (
                <div key={c.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] px-4 py-1 rounded-full font-black ${
                        c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c.status === 'pending' ? 'قيد الانتظار' : c.status === 'resolved' ? 'تم الحل' : 'تم التجاهل'}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">{new Date(c.createdAt).toLocaleString('ar-EG')}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-blue-950 mb-1">{c.subject}</h4>
                      <p className="text-sm text-gray-400 font-bold">من: {c.userName} ({c.userEmail})</p>
                    </div>
                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-3xl border border-gray-100">{c.message}</p>
                  </div>
                  <div className="flex md:flex-col gap-3 shrink-0 justify-center">
                    <button onClick={() => handleUpdateComplaint(c.id!, 'resolved')} className="px-8 py-3 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 transition-all">تم الحل</button>
                    <button onClick={() => handleUpdateComplaint(c.id!, 'ignored')} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all">تجاهل</button>
                  </div>
                </div>
              ))}
              {data.complaints.length === 0 && (
                <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                  <p className="text-gray-300 font-black text-xl">لا يوجد شكاوي حالياً</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRIP_SCHEDULES.map(ts => (
                <div key={ts.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-6">{ts.departureTime.split(':')[0] >= '18' ? '🌙' : '☀️'}</div>
                    <h4 className="text-2xl font-black text-blue-950 mb-2">{ts.label}</h4>
                    <div className="flex items-center gap-4 text-amber-600 font-black text-xl mb-6">
                      <span>{ts.departureTime}</span>
                      <span className="text-gray-300 text-sm">←</span>
                      <span className="text-gray-400">{ts.arrivalTime}</span>
                    </div>
                    <div className="space-y-3">
                      {Object.values(BusType).map(type => (
                        <div key={type} className="flex justify-between text-xs font-bold">
                          <span className="text-gray-400">{type}</span>
                          <span className="text-blue-900">{BUS_PRICES[type]} ج.م</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
