
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import { User, Ticket, Complaint, Driver, ChatMessage } from '../types';

export class TajBusDatabase extends Dexie {
  // تعريف الجداول المستخدمة في قاعدة البيانات ونماذج البيانات الخاصة بها
  users!: Table<User & { password?: string }>;
  tickets!: Table<Ticket>;
  complaints!: Table<Complaint>;
  drivers!: Table<Driver>;
  chatMessages!: Table<ChatMessage>;

  constructor() {
    super('TajBusDB'); // اسم قاعدة البيانات المخزنة في المتصفح المحلي للعميل (IndexedDB)
    
    // تعريف إصدار قاعدة البيانات والجداول والمفاتيح التي سيتم الفهرسة بناءً عليها للبحث السريع
    this.version(4).stores({
      users: '++id, email, name, role', // جدول المستخدمين (المفتاح هو المعرف التلقائي)
      tickets: '++id, userId, driverId, date, from, to', // جدول التذاكر المحجوزة
      complaints: '++id, userId, subject, status', // جدول الشكاوى والمقترحات
      drivers: '++id, name, licenseNumber', // جدول بيانات السائقين
      chatMessages: '++id, userId, sender, timestamp' // جدول رسائل الدردشة المباشرة
    });

    // إضافة بيانات أولية في حال كانت الجداول فارغة عند التشغيل الأول
    this.on('populate', () => {
      this.drivers.bulkAdd([
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
        }
      ]);
    });
  }
}

export const db = new TajBusDatabase();
