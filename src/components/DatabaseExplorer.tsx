
import React, { useState, useEffect } from 'react';
import { BackendAPI } from '../services/api';
import { db } from '../services/db';
import Logo from './Logo';

interface DatabaseExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);

  const refresh = async () => {
    const allData = await BackendAPI.getAllData();
    setData(allData);
  };

  const clearDatabase = async () => {
    if (confirm('هل أنت متأكد من حذف كافة البيانات؟ سيتم مسح جميع المستخدمين والتذاكر.')) {
      await db.users.clear();
      await db.tickets.clear();
      localStorage.clear();
      alert('تم مسح قاعدة البيانات بنجاح. سيتم إعادة تحميل الصفحة.');
      window.location.reload();
    }
  };

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="bg-blue-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <Logo className="w-12 h-12" />
            <div>
              <h2 className="text-xl font-black">محرك قاعدة البيانات الملكية</h2>
              <p className="text-[10px] text-blue-300 font-black uppercase tracking-[0.2em] opacity-80">IndexedDB Real-Time Explorer</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-grow overflow-auto p-8 space-y-10">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-blue-900 text-lg flex items-center gap-3">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                جدول المستخدمين (Users Table)
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase">
                {data?.users.length || 0} سجلات
              </span>
            </div>
            <div className="overflow-hidden border border-gray-100 rounded-2xl">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-400 font-black border-b">
                  <tr>
                    <th className="p-4 text-right">المعرف</th>
                    <th className="p-4 text-right">الاسم الملكي</th>
                    <th className="p-4 text-right">البريد الإلكتروني</th>
                    <th className="p-4 text-right">الهاتف</th>
                    <th className="p-4 text-right">تاريخ الميلاد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="p-4 font-mono text-[10px] text-gray-400">{u.id}</td>
                      <td className="p-4 font-black text-blue-900 group-hover:text-blue-600">{u.name}</td>
                      <td className="p-4 text-gray-500 font-medium">{u.email}</td>
                      <td className="p-4 text-gray-500 font-medium">{u.phone || '—'}</td>
                      <td className="p-4 text-gray-500 font-medium">{u.birthDate || '—'}</td>
                    </tr>
                  ))}
                  {(!data?.users || data.users.length === 0) && (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-300 font-bold">لا يوجد مستخدمون مسجلون حالياً</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-amber-600 text-lg flex items-center gap-3">
                <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></span>
                جدول التذاكر (Tickets Table)
              </h3>
              <span className="text-[10px] bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-black uppercase">
                {data?.tickets.length || 0} سجلات
              </span>
            </div>
            <div className="overflow-hidden border border-gray-100 rounded-2xl">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-400 font-black border-b">
                  <tr>
                    <th className="p-4">رقم التذكرة</th>
                    <th className="p-4">المسار</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.tickets.map((t: any) => (
                    <tr key={t.id} className="hover:bg-amber-50/50 transition-colors group">
                      <td className="p-4 font-mono text-[10px] text-amber-700">{t.id}</td>
                      <td className="p-4 font-black text-blue-900">{t.from} ← {t.to}</td>
                      <td className="p-4 font-medium text-gray-500">{t.date}</td>
                      <td className="p-4 font-black text-amber-600">{t.price} ج.م</td>
                    </tr>
                  ))}
                  {(!data?.tickets || data.tickets.length === 0) && (
                    <tr><td colSpan={4} className="p-10 text-center text-gray-300 font-bold">لم يتم حجز أي تذاكر في قاعدة البيانات بعد</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <button 
            onClick={clearDatabase} 
            className="text-red-500 text-xs font-black hover:bg-red-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            مسح قاعدة البيانات نهائياً
          </button>
          
          <div className="flex gap-3">
            <button onClick={refresh} className="bg-white border-2 border-blue-900 text-blue-900 px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all">
              تحديث العرض
            </button>
            <button onClick={onClose} className="bg-blue-900 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 hover:scale-105 transition-all">
              إغلاق المستكشف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseExplorer;
