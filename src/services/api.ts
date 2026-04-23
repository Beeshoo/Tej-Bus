
import { User, Ticket, BookingState, Complaint, Driver, UserRole, ChatMessage } from '../types';
import { db } from './db';
import { calculateTripPrice } from '../constants.tsx';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const BackendAPI = {
  // --- نظام الدردشة المباشرة ---
  async sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...message,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    const id = await db.chatMessages.add(newMessage);
    return { ...newMessage, id };
  },

  async getUserChatMessages(userId: string): Promise<ChatMessage[]> {
    return await db.chatMessages.where('userId').equals(userId).sortBy('timestamp');
  },

  async getAllChatMessages(): Promise<ChatMessage[]> {
    return await db.chatMessages.reverse().sortBy('timestamp');
  },

  async markChatAsRead(userId: string): Promise<void> {
    const messages = await db.chatMessages.where('userId').equals(userId).toArray();
    for (const msg of messages) {
      if (msg.id) {
        await db.chatMessages.update(msg.id, { isRead: true });
      }
    }
  },

  // --- نظام الحسابات وإدارة الجلسات ---
  // دالة إنشاء حساب جديد مع التحقق من البريد الإلكتروني وصلاحيات المدير
  // يتم التحقق من وجود البريد مسبقاً لمنع التكرار
  async signup(userData: any): Promise<{ success: boolean; user?: User; message?: string }> {
    await delay(800); // محاكاة التأخير في طلبات الشبكة لجعل الواجهة تبدو واقعية
    const existing = await db.users.where('email').equals(userData.email).first();
    
    if (existing) {
      return { success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل' };
    }

    // إعداد كائن المستخدم الجديد
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      birthDate: userData.birthDate,
      role: userData.role || UserRole.USER,
      licenseNumber: userData.licenseNumber,
      photoUrl: userData.photoUrl,
      loggedIn: true
    };

    // حماية إضافية: التحقق من كود الأمان للمديرين لمنع أي شخص من جعل نفسه مديراً
    if (userData.role === UserRole.ADMIN) {
      if (userData.securityKey !== '2026') {
        return { success: false, message: 'كود تفعيل المدير غير صحيح' };
      }
    }

    // حفظ في قاعدة البيانات المحلية (Dexie) وحفظ الجلسة في localStorage
    await db.users.add({ ...newUser, password: userData.password });
    localStorage.setItem('taj_bus_current_session', JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  // دالة تسجيل الدخول والتحقق من كلمة المرور من قاعدة البيانات المحلية
  async login(email: string, pass: string): Promise<{ success: boolean; user?: User; message?: string }> {
    await delay(800);
    const user = await db.users.where('email').equals(email).first();

    if (user && user.password === pass) {
      const { password, ...sessionUser } = user;
      localStorage.setItem('taj_bus_current_session', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser as User };
    }
    return { success: false, message: 'بيانات الدخول غير صحيحة' };
  },

  // تسجيل الخروج وحذف بيانات الجلسة من التخزين المحلي
  async logout() {
    localStorage.removeItem('taj_bus_current_session');
  },

  // استعادة بيانات الجلسة الحالية عند فتح التطبيق
  async getSession(): Promise<User | null> {
    const session = localStorage.getItem('taj_bus_current_session');
    return session ? JSON.parse(session) : null;
  },

  async getUserById(id: string): Promise<User | null> {
    const user = await db.users.get(id);
    return user || null;
  },

  async getTicketById(id: string): Promise<Ticket | null> {
    const ticket = await db.tickets.get(id);
    return ticket || null;
  },

  // --- نظام الحجز وإدارة المقاعد ---
  // جلب المقاعد المحجوزة لرحلة معينة لمنع الحجز المزدوج
  async getOccupiedSeats(date: string, time: string, from: string, to: string): Promise<number[]> {
    const tickets = await db.tickets
      .where('date').equals(date)
      .and(t => t.departureTime === time && t.from === from && t.to === to && t.status !== 'cancelled')
      .toArray();
    
    return tickets.flatMap(t => t.selectedSeats);
  },

  // إنشاء حجز جديد وتوليد تذكرة بعد التأكد من توفر المقاعد
  async createBooking(bookingData: BookingState, userId: string): Promise<{ success: boolean; ticket?: Ticket }> {
    await delay(1200);
    
    // عملية فحص المقاعد داخل قاعدة البيانات
    const occupied = await this.getOccupiedSeats(bookingData.date, bookingData.departureTime, bookingData.from, bookingData.to);
    const isTaken = bookingData.selectedSeats.some(s => occupied.includes(s));
    
    if (isTaken) {
      throw new Error('تعارض في قاعدة البيانات: تم حجز هذه المقاعد للتو');
    }

    const newTicket: Ticket = {
      id: 'TAJ-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId,
      ...bookingData,
      price: (bookingData.selectedSeats.length) * calculateTripPrice(bookingData.from, bookingData.to, bookingData.busType),
      status: 'upcoming',
      paymentStatus: 'paid',
      paymentId: 'PAY-' + Date.now()
    };

    await db.tickets.add(newTicket);
    return { success: true, ticket: newTicket };
  },

  // جلب جميع تذاكر مستخدم معين لعرضها في سجل الرحلات
  async getUserTickets(userId: string): Promise<Ticket[]> {
    return await db.tickets.where('userId').equals(userId).reverse().toArray();
  },

  // --- نظام الشكاوي والمقترحات ---
  // إرسال شكوى جديدة وحفظها في قاعدة البيانات بحالة "قيد الانتظار"
  async submitComplaint(complaintData: Omit<Complaint, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    await delay(1000);
    const newComplaint: Complaint = {
      ...complaintData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await db.complaints.add(newComplaint);
    return { success: true, message: 'تم إرسال شكواك بنجاح. سنقوم بالرد عليك في أقرب وقت.' };
  },

  async getUserComplaints(userId: string): Promise<Complaint[]> {
    return await db.complaints.where('userId').equals(userId).reverse().toArray();
  },

  // جلب التذاكر المسندة لسائق معين لعرضها في لوحة تحكم السائق
  async getDriverTickets(driverId: string): Promise<Ticket[]> {
    return await db.tickets.where('driverId').equals(driverId).reverse().toArray();
  },

  // --- نظام الإدارة والتحكم ---
  // جلب كافة التذاكر في النظام (للمدير فقط)
  async getAllTickets(): Promise<Ticket[]> {
    return await db.tickets.reverse().toArray();
  },

  async getAllComplaints(): Promise<Complaint[]> {
    return await db.complaints.reverse().toArray();
  },

  async updateComplaintStatus(id: number, status: 'pending' | 'resolved' | 'ignored'): Promise<boolean> {
    await db.complaints.update(id, { status });
    return true;
  },

  async replyToComplaint(id: number, adminReply: string): Promise<boolean> {
    await db.complaints.update(id, { 
      adminReply, 
      repliedAt: new Date().toISOString(),
      status: 'resolved' 
    });
    return true;
  },

  // جلب قائمة السائقين مع إضافة بيانات أولية في حال كانت القاعدة فارغة (Seed Data)
  async getDrivers(): Promise<Driver[]> {
    const drivers = await db.drivers.toArray();
    if (drivers.length === 0) {
      // إضافة سائقين افتراضيين لتجربة النظام لأول مرة
      const initialDrivers: Driver[] = [
        {
          id: 'dr-1',
          name: 'كابتن أحمد المنشاوي',
          phone: '01012345678',
          licenseNumber: 'L-998877',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        },
        {
          id: 'dr-2',
          name: 'كابتن محمد عبد العزيز',
          phone: '01122334455',
          licenseNumber: 'L-554433',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
        },
        {
          id: 'dr-3',
          name: 'كابتن محمود الشافعي',
          phone: '01233445566',
          licenseNumber: 'L-112233',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
        },
        {
          id: 'dr-4',
          name: 'كابتن حسن البدري',
          phone: '01555667788',
          licenseNumber: 'L-776655',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop'
        },
        {
          id: 'dr-5',
          name: 'كابتن ياسر الجندي',
          phone: '01099887766',
          licenseNumber: 'L-223344',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop'
        },
        {
          id: 'dr-6',
          name: 'كابتن إبراهيم فوزي',
          phone: '01144556677',
          licenseNumber: 'L-665544',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=400&fit=crop'
        },
        {
          id: 'dr-7',
          name: 'كابتن سامح عبد الله',
          phone: '01277889900',
          licenseNumber: 'L-334455',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop'
        },
        {
          id: 'dr-8',
          name: 'كابتن علي حسن',
          phone: '01011223344',
          licenseNumber: 'L-445566',
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'
        }
      ];
      await db.drivers.bulkAdd(initialDrivers);
      return initialDrivers;
    }
    return drivers;
  },

  async addDriver(driver: Omit<Driver, 'id'>): Promise<Driver> {
    const id = Math.random().toString(36).substr(2, 9);
    const newDriver = { ...driver, id };
    await db.drivers.add(newDriver);
    return newDriver;
  },

  async deleteDriver(id: any): Promise<void> {
    console.log('BackendAPI: جاري حذف السائق بالمعرف:', id);
    // محاول الحذف بالمعرف كنص (string) وكعدد (number) لضمان التوافق مع Dexie auto-increment
    await db.drivers.delete(id);
    
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      await db.drivers.delete(numericId);
    }
    
    // التحقق من جدول المستخدمين أيضاً
    const users = await db.users.toArray();
    const user = users.find(u => String(u.id) === String(id));
    
    if (user && user.role === UserRole.DRIVER) {
      console.log('تم العثور على مستخدم بصلاحية سائق، جاري إرجاعه لمستخدم عادي:', user.id);
      await db.users.update(user.id, { role: UserRole.USER });
    }
  },

  // جلب بيانات سائق معين بواسطة المعرف الخاص به
  async getDriverById(id: string): Promise<Driver | null> {
    const driver = await db.drivers.get(id);
    if (driver) return driver;
    
    // البحث في جدول المستخدمين في حال كان السائق قد سجل بنفسه ولم يضفه المدير يدوياً
    const user = await db.users.get(id);
    if (user && user.role === UserRole.DRIVER) {
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        licenseNumber: user.licenseNumber || 'غير متوفر',
        status: user.status || 'active',
        photoUrl: user.photoUrl
      };
    }
    return null;
  },

  // تقييم الرحلة بعد اكتمالها وإضافة تعليق المستخدم
  async rateTicket(ticketId: string, rating: number, review: string): Promise<boolean> {
    await db.tickets.update(ticketId, { rating, review, status: 'completed' });
    return true;
  },

  // إلغاء تذكرة وتغيير حالتها في النظام
  async cancelTicket(ticketId: string): Promise<boolean> {
    await delay(1000);
    await db.tickets.update(ticketId, { status: 'cancelled', paymentStatus: 'pending' });
    return true;
  },

  // إسناد سائق لتذكرة فردية
  async assignDriverToTicket(ticketId: string, driverId: string, driverName: string, driverPhoto?: string): Promise<boolean> {
    await db.tickets.update(ticketId, { driverId, driverName, driverPhoto });
    return true;
  },

  // إسناد سائق لرحلة كاملة (جميع التذاكر التي تشترك في نفس المسار والوقت)
  async assignDriverToTrip(from: string, to: string, date: string, time: string, busType: string, driverId: string, driverName: string, driverPhoto?: string): Promise<boolean> {
    const tickets = await db.tickets
      .where({ from, to, date, departureTime: time, busType })
      .toArray();
    
    for (const ticket of tickets) {
      await db.tickets.update(ticket.id, { driverId, driverName, driverPhoto });
    }
    return true;
  },

  // وظيفة للمطورين لرؤية كل البيانات
  async getAllData() {
    return {
      users: await db.users.toArray(),
      tickets: await db.tickets.toArray(),
      complaints: await db.complaints.toArray(),
      drivers: await db.drivers.toArray()
    };
  }
};
