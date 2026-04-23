import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthForm from './components/AuthForm';
import AdminAuthForm from './components/AdminAuthForm';
import BookingFlow from './components/BookingFlow';
import PastTrips from './components/PastTrips';
import ComplaintsForm from './components/ComplaintsForm';
import DatabaseExplorer from './components/DatabaseExplorer';
import AdminDashboard from './components/AdminDashboard';
import DriverAuthForm from './components/DriverAuthForm';
import DriverDashboard from './components/DriverDashboard';
import SupportCenter from './components/SupportCenter';
import { BackendAPI } from './services/api';
import { User, Ticket, UserRole } from './types';

const App: React.FC = () => {
  // --- تعريف حالات النظام (System State) ---
  const [currentPage, setCurrentPage] = useState('home'); // الصفحة الحالية
  const [user, setUser] = useState<User | null>(null); // بيانات المستخدم المسجل
  const [tickets, setTickets] = useState<Ticket[]>([]); // قائمة التذاكر الخاصة بالمستخدم
  const [lastBookedTicketId, setLastBookedTicketId] = useState<string | null>(null); // معرف آخر تذكرة تم حجزها
  const [loading, setLoading] = useState(true); // حالة التحميل الابتدائية
  const [isExplorerOpen, setIsExplorerOpen] = useState(false); // حالة فتح مستكشف البيانات
  const [logoClicks, setLogoClicks] = useState(0); // عداد الضغطات لفتح ميزة سرية

  // --- دالة تهيئة التطبيق عند التشغيل (Initialization) ---
  useEffect(() => {
    const initApp = async () => {
      try {
        // محاولة استعادة الجلسة السابقة من التخزين المحلي
        const sessionUser = await BackendAPI.getSession();
        if (sessionUser) {
          setUser(sessionUser);
          // توجيه المستخدم حسب صلاحياته
          if (sessionUser.role === UserRole.USER) {
            const userTickets = await BackendAPI.getUserTickets(sessionUser.id);
            setTickets(userTickets);
          } else if (sessionUser.role === UserRole.ADMIN) {
            setCurrentPage('admin-dashboard');
          } else if (sessionUser.role === UserRole.DRIVER) {
            setCurrentPage('driver-dashboard');
          }
        }
      } catch (err) {
        console.error("خطأ أثناء تهيئة النظام:", err);
      } finally {
        setLoading(false); // إنهاء حالة التحميل
      }
    };
    initApp();
  }, []);

  // --- دوال التحكم في الواجهة (Event Handlers) ---

  // معالجة تسجيل الدخول الناجح
  const handleLogin = async (u: User) => { 
    setUser(u); 
    if (u.role === UserRole.USER) {
      const userTickets = await BackendAPI.getUserTickets(u.id);
      setTickets(userTickets);
      setCurrentPage('home'); 
    } else if (u.role === UserRole.DRIVER) {
      setCurrentPage('driver-dashboard');
    } else {
      setCurrentPage('admin-dashboard');
    }
  };

  // معالجة تسجيل الخروج
  const handleLogout = async () => { 
    await BackendAPI.logout();
    setUser(null); 
    setTickets([]);
    setCurrentPage('home'); 
  };
  
  // معالجة إتمام حجز بنجاح
  const handleBookingComplete = async (ticket: Ticket) => { 
    const updatedTickets = await BackendAPI.getUserTickets(user!.id);
    setTickets(updatedTickets);
    setLastBookedTicketId(ticket.id);
    setCurrentPage('booking-success'); 
  };

  // معالجة تقييم رحلة
  const handleRate = async (id: string, rating: number, review: string) => {
    await BackendAPI.rateTicket(id, rating, review);
    const updatedTickets = await BackendAPI.getUserTickets(user!.id);
    setTickets(updatedTickets);
  };

  // تحديث حالة الرحلة لمكتملة
  const handleMarkComplete = async (id: string) => {
    await BackendAPI.rateTicket(id, 0, ''); 
    const updatedTickets = await BackendAPI.getUserTickets(user!.id);
    setTickets(updatedTickets);
  };

  // معالجة إلغاء التذكرة
  const handleCancel = async (id: string) => {
    await BackendAPI.cancelTicket(id);
    const updatedTickets = await BackendAPI.getUserTickets(user!.id);
    setTickets(updatedTickets);
  };

  // ميزة المطور: فتح مستكشف قاعدة البيانات بخمس ضغطات على الشعار
  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    if (newCount >= 5) {
      setIsExplorerOpen(true);
      setLogoClicks(0);
    } else {
      setLogoClicks(newCount);
      setTimeout(() => setLogoClicks(0), 3000);
    }
  };

  // حماية المسارات من الدخول المباشر بالرابط
  useEffect(() => {
    if (user && currentPage === 'home') {
      if (user.role === UserRole.ADMIN) {
        setCurrentPage('admin-dashboard');
      } else if (user.role === UserRole.DRIVER) {
        setCurrentPage('driver-dashboard');
      }
    }
  }, [user, currentPage]);

  // شاشة التحميل الابتدائية
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 font-tajawal">
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-1">
          <p className="text-white text-xl font-black">تاج باص</p>
          <p className="text-blue-300 text-sm animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    </div>
  );

  // دالة التنقل بين الصفحات
  const handleNavigate = (page: string) => {
    setLastBookedTicketId(null);
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex flex-col font-tajawal bg-[#f8fafc]">
      {/* شريط التنقل العلوي */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={handleNavigate} 
        currentPage={currentPage}
        onLogoClick={handleLogoClick}
      />
      
      {/* محتوى الصفحة الرئيسي المتغير */}
      <main className="flex-grow">
        {currentPage === 'login' && <AuthForm onLogin={handleLogin} />}
        {currentPage === 'admin-login' && <AdminAuthForm onLogin={handleLogin} />}
        {currentPage === 'driver-login' && <DriverAuthForm onLogin={handleLogin} />}
        
        {currentPage === 'admin-dashboard' && user && user.role === UserRole.ADMIN && (
          <AdminDashboard admin={user} onLogout={handleLogout} onNavigate={setCurrentPage} />
        )}

        {currentPage === 'driver-dashboard' && user && user.role === UserRole.DRIVER && (
          <DriverDashboard driver={user} onLogout={handleLogout} onNavigate={setCurrentPage} />
        )}

        {currentPage === 'booking-success' && user && (
          <div className="space-y-8">
            <PastTrips 
              tickets={tickets} 
              onRate={handleRate} 
              onMarkComplete={handleMarkComplete}
              onCancel={handleCancel}
              singleTicketId={lastBookedTicketId}
            />
            <div className="flex justify-center pb-20">
              <button 
                onClick={() => {
                  setLastBookedTicketId(null);
                  setCurrentPage('my-tickets');
                }}
                className="bg-blue-900 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-all"
              >
                عرض جميع حجوزاتي
              </button>
            </div>
          </div>
        )}

        {currentPage === 'my-tickets' && (
          user ? (
            <PastTrips 
              tickets={tickets} 
              onRate={handleRate} 
              onMarkComplete={handleMarkComplete}
              onCancel={handleCancel}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
               <div className="bg-blue-100 p-8 rounded-full text-blue-900 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
               </div>
               <div className="max-w-xs">
                 <h2 className="text-2xl font-black text-blue-900 mb-2">رحلاتك بانتظارك</h2>
                 <p className="text-gray-400 text-sm mb-6">سجل دخولك لتتمكن من استعراض تذاكرك المحجوزة وإدارة رحلاتك القادمة.</p>
               </div>
               <button onClick={() => setCurrentPage('login')} className="bg-blue-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">دخول / إنشاء حساب</button>
            </div>
          )
        )}

        {currentPage === 'complaints' && user && (
          <ComplaintsForm user={user} />
        )}

        {currentPage === 'support' && (
          <SupportCenter user={user} />
        )}

        {currentPage === 'home' && (
          <div className="space-y-8 md:space-y-12 pb-20">
            {/* واجهة الترحيب الرئيسية (Hero Section) */}
            <div className="relative min-h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden bg-blue-900">
              <div className="absolute inset-0 opacity-30">
                <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="bus" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent"></div>
              
              <div className="relative z-10 text-center px-6 max-w-4xl">
                <span className="bg-amber-500 text-blue-900 px-6 py-2 rounded-full text-lg md:text-2xl font-black uppercase tracking-widest mb-4 inline-block animate-fadeIn">رفاهية بلا حدود</span>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl leading-tight">سافر كالملوك مع تاج باص</h1>
                <p className="text-blue-100 text-lg md:text-xl mb-8 font-medium max-w-2xl mx-auto">احجز مقعدك الآن في أرقى أسطول حافلات في مصر، مع نخبة من السائقين المحترفين.</p>
                
                {!user && (
                  <button onClick={() => setCurrentPage('login')} className="bg-white text-blue-900 px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl hover:scale-105 transition-transform shadow-2xl flex items-center gap-3 mx-auto">
                    ابدأ رحلتك الآن
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                )}
              </div>
            </div>

            {/* نظام الحجز التفاعلي */}
            {user ? (
              <div className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-20">
                <div className="bg-white/80 backdrop-blur-md p-2 rounded-[2rem] md:rounded-[3rem] shadow-2xl">
                  <BookingFlow onComplete={handleBookingComplete} userId={user.id} />
                </div>
              </div>
            ) : (
              <div className="container mx-auto px-6 py-12 text-center">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    {[
                      { title: 'أسطول رويال', desc: 'حافلات مجهزة بأحدث وسائل الراحة وشاشات عرض خاصة.', icon: '🚌' },
                      { title: 'أمان تام', desc: 'سائقون معتمدون وتقييمات حقيقية من المسافرين.', icon: '🛡️' },
                      { title: 'حجز فوري', desc: 'اختر مقعدك وادفع إلكترونياً بضغطة زر واحدة.', icon: '⚡' }
                    ].map((feature, i) => (
                      <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-lg border border-gray-50 hover:translate-y-[-5px] transition-all">
                        <div className="text-4xl md:text-5xl mb-4">{feature.icon}</div>
                        <h3 className="text-3xl md:text-4xl font-black text-blue-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-500 text-xl md:text-2xl leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>
            )}
            
            {/* قسم الأسئلة الشائعة والدعم الفني والدردشة المباشرة */}
            <SupportCenter user={user} />
          </div>
        )}
      </main>

      {/* مستكشف البيانات للمطورين */}
      <DatabaseExplorer isOpen={isExplorerOpen} onClose={() => setIsExplorerOpen(false)} />
      
      {/* التذييل (Footer) */}
      <footer className="bg-blue-950 text-blue-400 py-10 text-center border-t border-blue-900 px-4 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-4xl font-black text-white">تاج باص</span>
            <p className="text-base">خدمة النقل الملكي الأولى في الشرق الأوسط</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-sm opacity-50">© 2026 جميع الحقوق محفوظة لشركة تاج باص للنقل والسياحة</p>
            {!user ? (
              <div className="flex gap-4">
                <button 
                  onClick={() => setCurrentPage('admin-login')} 
                  className="text-sm font-bold text-blue-400 hover:text-amber-500 transition-colors uppercase"
                >
                  دخول الإدارة
                </button>
                <button 
                  onClick={() => setCurrentPage('driver-login')} 
                  className="text-sm font-bold text-blue-400 hover:text-emerald-500 transition-colors uppercase"
                >
                  دخول السائقين
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                {user.role === UserRole.ADMIN && (
                  <button 
                    onClick={() => setCurrentPage('admin-dashboard')} 
                    className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase"
                  >
                    لوحة الإدارة
                  </button>
                )}
                {user.role === UserRole.DRIVER && (
                  <button 
                    onClick={() => setCurrentPage('driver-dashboard')} 
                    className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase"
                  >
                    بوابة الكابتن
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
