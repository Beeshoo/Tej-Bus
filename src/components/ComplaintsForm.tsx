
import React, { useState, useEffect } from 'react';
import { User, Complaint, Ticket } from '../types';
import { BackendAPI } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Send, 
  Tag, 
  Ticket as TicketIcon, 
  ChevronDown, 
  X
} from 'lucide-react';

interface ComplaintsFormProps {
  user: User;
}

const ComplaintsForm: React.FC<ComplaintsFormProps> = ({ user }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<Complaint['category']>('other');
  const [ticketId, setTicketId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const categories = [
    { id: 'bus', label: 'حالة الحافلة', icon: '🚌' },
    { id: 'driver', label: 'سلوك السائق', icon: '👨‍✈️' },
    { id: 'delay', label: 'تأخير في المواعيد', icon: '⏱️' },
    { id: 'app', label: 'مشكلة في التطبيق', icon: '📱' },
    { id: 'other', label: 'أخرى', icon: '⚙️' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsData, ticketsData] = await Promise.all([
          BackendAPI.getUserComplaints(user.id),
          BackendAPI.getUserTickets(user.id)
        ]);
        setComplaints(complaintsData);
        setUserTickets(ticketsData.filter(t => t.status !== 'cancelled'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComplaints(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    if (subject.length < 5) return;
    if (message.length < 10) return;

    setLoading(true);
    try {
      // Submit to backend
      const result = await BackendAPI.submitComplaint({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        category,
        ticketId: ticketId || undefined,
        subject,
        message
      });

      if (result.success) {
        setSuccess(result.message);
        setSubject('');
        setMessage('');
        setCategory('other');
        setTicketId('');
        
        // Refresh list
        const updated = await BackendAPI.getUserComplaints(user.id);
        setComplaints(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1"><Clock size={12} /> قيد المراجعة</span>;
      case 'resolved':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1"><CheckCircle2 size={12} /> تم الحل</span>;
      case 'ignored':
        return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-black">مغلق</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Complaint Hub */}
        <div className="lg:col-span-12 mb-12 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4"
          >
            <Logo className="w-20 h-20 md:w-24 md:h-24" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-blue-900 mb-4"
          >
            صوتك "مسموع" في Taj Bus
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            نحن نؤمن بأن التميز يأتي من الاستماع لعملائنا. قدم شكواك أو مقترحك وسيتعامل معها فريق الجودة فوراً.
          </motion.p>
        </div>

        {/* Left: Form Section */}
        <div className="lg:col-span-7">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[3rem] shadow-2xl border border-blue-50 relative overflow-hidden"
          >
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-black text-blue-900">تم الاستلام بنجاح!</h3>
                <p className="text-gray-600 text-lg">لقد وصلت شكواك لفريقنا، وسنقوم بمراجعتها بدقة.</p>
                <button 
                  onClick={() => setSuccess(null)}
                  className="bg-blue-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-800 transition-all"
                >
                  إرسال موضوع آخر
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-gray-900 font-black flex items-center gap-2 mb-2">
                    <Tag size={18} className="text-blue-600" /> تصنيف الشكوى
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                          category === cat.id 
                            ? 'border-blue-600 bg-blue-50 text-blue-900' 
                            : 'border-gray-100 hover:border-blue-200 text-gray-500'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-[10px] md:text-xs font-black">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subject Input */}
                  <div className="space-y-2">
                    <label className="text-gray-900 font-black flex items-center gap-2">
                      <MessageSquare size={18} className="text-blue-600" /> الموضوع
                    </label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="اختصر مشكلتك في جملة..."
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                      required
                    />
                  </div>

                  {/* Ticket Selection */}
                  <div className="space-y-2">
                    <label className="text-gray-900 font-black flex items-center gap-2">
                      <TicketIcon size={18} className="text-blue-600" /> رقم الرحلة (اختياري)
                    </label>
                    <div className="relative">
                      <select
                        value={ticketId}
                        onChange={(e) => setTicketId(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all font-bold appearance-none cursor-pointer"
                      >
                        <option value="">لا توجد رحلة محددة</option>
                        {userTickets.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.id} - {t.from} إلى {t.to} ({t.date})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-2">
                  <label className="text-gray-900 font-black flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-600" /> تفاصيل ما حدث
                  </label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="يرجى كتابة التفاصيل بدقة لنتمكن من مساعدتك..."
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 translate-y-0 hover:-translate-y-1"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send size={20} /> إرسال الآن
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Right: History & Feedback Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-black text-blue-900">سجل البلاغات</h3>
            <span className="text-xs bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-bold">{complaints.length} بلاغ</span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pe-2 custom-scrollbar">
            {loadingComplaints ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="bg-gray-50 p-12 rounded-[2.5rem] text-center border-2 border-dashed border-gray-200">
                <div className="text-gray-300 mb-4"><MessageSquare size={48} className="mx-auto" /></div>
                <p className="text-gray-500 font-black">لا يوجد بلاغات سابقة.</p>
              </div>
            ) : (
              <AnimatePresence>
                {complaints.map((c, idx) => (
                  <motion.div 
                    key={c.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedComplaint(c)}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      {getStatusBadge(c.status)}
                      <span className="text-[10px] md:text-xs text-gray-400 font-bold">{new Date(c.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{categories.find(cat => cat.id === c.category)?.icon || '📋'}</span>
                      <h4 className="font-black text-blue-900 truncate flex-1">{c.subject}</h4>
                    </div>
                    <p className="text-gray-500 text-xs md:text-sm line-clamp-1">{c.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>

      {/* Complaint Detail Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="absolute inset-0 bg-blue-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="absolute top-6 left-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all text-gray-500 z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Logo className="w-14 h-14" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {getStatusBadge(selectedComplaint.status)}
                      <span className="text-xs text-gray-400 font-bold">{new Date(selectedComplaint.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <h3 className="text-2xl font-black text-blue-900">{selectedComplaint.subject}</h3>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{categories.find(cat => cat.id === selectedComplaint.category)?.icon || '📋'}</span>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">نوع البلاغ ومحتواه</label>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{selectedComplaint.message}</p>
                    {selectedComplaint.ticketId && (
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-blue-900 font-black text-xs">
                        <TicketIcon size={14} /> رحلة رقم: {selectedComplaint.ticketId}
                      </div>
                    )}
                  </div>

                  {selectedComplaint.adminReply && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 size={20} className="text-amber-500" />
                          <label className="text-xs font-black uppercase text-blue-300 tracking-widest">رد الإدارة الرسمي</label>
                        </div>
                        <p className="text-lg leading-relaxed font-bold">{selectedComplaint.adminReply}</p>
                        {selectedComplaint.repliedAt && (
                          <p className="text-[10px] text-blue-400 mt-4 font-bold">تاريخ الرد: {new Date(selectedComplaint.repliedAt).toLocaleString('ar-EG')}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplaintsForm;
