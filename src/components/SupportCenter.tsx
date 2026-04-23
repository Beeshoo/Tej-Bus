
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ChatMessage } from '../types';
import { BackendAPI } from '../services/api';

const FAQS = [
  {
    question: "كيف يمكنني حجز تذكرة؟",
    answer: "يمكنك الحجز بسهولة من خلال الصفحة الرئيسية، اختر وجهتك، تاريخ الرحلة، وفئة الحافلة، ثم اختر مقعدك المفضل وأتمم عملية الدفع."
  },
  {
    question: "هل يمكنني إلغاء حجزي واسترداد المبلغ؟",
    answer: "نعم، يمكنك إلغاء الحجز من قسم 'رحلاتي' بشرط أن يكون ذلك قبل موعد الرحلة بـ 24 ساعة على الأقل لاسترداد المبلغ كاملاً."
  },
  {
    question: "ما هي أنواع الحافلات المتوفرة؟",
    answer: "لدينا ثلاث فئات: الاقتصادية (راحة وسعر منافس)، VIP (مقاعد واسعة وشاشات ذكية)، ورويال الملكية (خصوصية تامة ووجبات ساخنة)."
  },
  {
    question: "أين أجد رقم التذكرة الخاص بي؟",
    answer: "بعد إتمام الحجز، ستجد التذكرة في قسم 'رحلاتي' وبها كود QR ورقم مسلسل يبدأ بـ 'TAJ-'."
  },
  {
    question: "هل يوجد خصم للرحلات الجماعية؟",
    answer: "نعم، نقدم خصومات خاصة للمجموعات التي تزيد عن 5 أفراد، يرجى التواصل مع الدعم الفني للحصول على كود الخصم."
  }
];

interface SupportCenterProps {
  user: User | null;
}

const SupportCenter: React.FC<SupportCenterProps> = ({ user }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (isChatOpen && user) {
      loadMessages();
      // محاكاة استلام رسائل جديدة (Polling)
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isChatOpen, user]);

  const loadMessages = async () => {
    if (!user) return;
    try {
      const messages = await BackendAPI.getUserChatMessages(user.id);
      if (messages.length === 0) {
        // رسالة ترحيب أولية لو القاعدة فارغة لهذا المستخدم
        setChatMessages([{ sender: 'admin', text: 'أهلاً بك في دعم تاج باص! كيف يمكنني مساعدتك اليوم؟', userId: 'system', userName: 'فريق الدعم', timestamp: new Date().toISOString() }]);
      } else {
        setChatMessages(messages);
      }
    } catch (err) {
      console.error("فشل في تحميل رسائل الدردشة", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      await BackendAPI.sendChatMessage({
        userId: user.id,
        userName: user.name,
        sender: 'user',
        text: userMsg
      });
      
      await loadMessages();

      // رد آلي أول مرة فقط لو مفيش رسائل لسة
      if (chatMessages.length <= 1) {
        setTimeout(async () => {
          await BackendAPI.sendChatMessage({
            userId: user.id,
            userName: 'فريق الدعم',
            sender: 'admin',
            text: 'شكراً لتواصلك معنا. تم استلام رسالتك وسيقوم أحد ممثلي خدمة العملاء بالرد عليك قريباً.'
          });
          loadMessages();
        }, 1000);
      }
    } catch (err) {
      console.error("فشل في إرسال الرسالة", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 font-tajawal">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-blue-900 mb-6">مركز المساعدة والدعم</h2>
        <p className="text-gray-500 text-lg md:text-xl">كل ما تحتاجه من إجابات وتواصل مباشر في مكان واحد</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-2xl font-black text-blue-900 mb-8 flex items-center gap-3">
            <span className="bg-amber-500 w-2 h-8 rounded-full"></span>
            الأسئلة الشائعة
          </h3>
          
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-right flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-bold text-blue-900">{faq.question}</span>
                <span className={`transform transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </span>
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-gray-500 leading-relaxed border-t border-gray-50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-blue-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-2xl font-black mb-6 relative z-10">تواصل معنا فوراً</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📞</div>
                <div>
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">رقم خدمة العملاء</p>
                  <p className="font-black text-xl">19000 (على مدار الساعة)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📧</div>
                <div>
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">البريد الإلكتروني</p>
                  <p className="font-black text-lg">support@tajbus.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📍</div>
                <div>
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">المقر الرئيسي</p>
                  <p className="font-black text-lg">القاهرة، مصر</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Bubble */}
      <div className="fixed bottom-8 left-8 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-white w-[350px] md:w-[400px] h-[500px] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col mb-4 overflow-hidden"
            >
              <div className="p-6 bg-blue-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl animate-bounce">💬</div>
                  <div>
                    <h4 className="font-black">دردشة تاج باص</h4>
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">متصل الآن</span>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:rotate-90 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-900 text-white rounded-be-none' 
                        : msg.sender === 'admin'
                          ? 'bg-amber-500 text-blue-900 rounded-bs-none font-black'
                          : 'bg-white text-gray-700 border border-gray-100 rounded-bs-none'
                    }`}>
                      {msg.text}
                      <div className={`text-[8px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-left' : 'text-right'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {user ? (
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    disabled={loading}
                    className="flex-grow p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                  />
                  <button type="submit" disabled={loading} className="bg-blue-900 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </form>
              ) : (
                <div className="p-6 text-center bg-gray-50">
                  <p className="text-gray-400 text-xs font-bold mb-3">يرجى تسجيل الدخول لبدء الدردشة مع فريقنا</p>
                  {/* Note: ideally button to navigate to login */}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-amber-500 text-blue-900 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all animate-pulse"
        >
          {isChatOpen ? '✕' : '💬'}
        </button>
      </div>
    </div>
  );
};

export default SupportCenter;
