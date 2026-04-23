
import { BusType, TripSchedule } from './types';

export const CITIES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 
  'المنيا', 'القليوبية', 'الوادي الجديد', 'الشرقية', 'السويس', 
  'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 
  'شمال سيناء', 'سوهاج'
];

// منطق حساب الوقت بين المحافظات ليكون منطقياً
// تم تقسيم المحافظات لمناطق جغرافية لتبسيط حساب المسافة الزمنية
const CITY_ZONES: Record<string, number> = {
  'القاهرة': 0, 'الجيزة': 0, 'القليوبية': 0, // منطقة القاهرة الكبرى
  'المنوفية': 1, 'الغربية': 1, 'الشرقية': 1, 'الدقهلية': 1, 'كفر الشيخ': 1, 'دمياط': 1, 'البحيرة': 1, // الدلتا
  'الإسكندرية': 2, 'بورسعيد': 2, 'الإسماعيلية': 2, 'السويس': 2, 'الفيوم': 2, 'بني سويف': 2, // مدن القناة والوجه البحري القريب
  'المنيا': 3, 'شمال سيناء': 4, 'مطروح': 4, 'أسيوط': 4, // الوجه القبلي والحدود القريبة
  'سوهاج': 5, 'البحر الأحمر': 6, 'جنوب سيناء': 6, 'قنا': 6, // الوجه القبلي البعيد ومدن البحر الأحمر
  'الأقصر': 8, 'أسوان': 10, 'الوادي الجديد': 10 // أقصى الجنوب والوادي الجديد
};

export const calculateTravelDuration = (from: string, to: string): number => {
  const zoneFrom = CITY_ZONES[from] ?? 0;
  const zoneTo = CITY_ZONES[to] ?? 0;
  const diff = Math.abs(zoneFrom - zoneTo);
  
  // مدة الرحلة الأساسية هي ساعتين + فرق المناطق (كل منطقة فرق ساعة)
  // القاهرة للإسكندرية (فرق منطقتين) = 4 ساعات
  // القاهرة لأسوان (فرق 10 مناطق) = 12 ساعة
  return 2 + diff;
};

export const calculateTripPrice = (from: string, to: string, busType: BusType): number => {
  const duration = calculateTravelDuration(from, to);
  
  // أسعار منطقية بناءً على المسافة ونوع الخدمة
  const rates = {
    [BusType.STANDARD]: { base: 60, perHour: 30 },
    [BusType.VIP]: { base: 120, perHour: 60 },
    [BusType.ROYAL]: { base: 200, perHour: 120 }
  };
  
  const { base, perHour } = rates[busType];
  return base + (perHour * duration);
};

export const formatArrivalTime = (departureTime: string, durationHours: number): string => {
  const [hours, minutes] = departureTime.split(':').map(Number);
  let totalHours = hours + durationHours;
  const finalHours = totalHours % 24;
  return `${String(finalHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const to12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
};

export const TRIP_SCHEDULES: TripSchedule[] = [
  { id: 't1', departureTime: '06:00', arrivalTime: '', label: 'الرحلة الصباحية' },
  { id: 't2', departureTime: '10:00', arrivalTime: '', label: 'رحلة الظهيرة' },
  { id: 't3', departureTime: '15:00', arrivalTime: '', label: 'رحلة العصر' },
  { id: 't4', departureTime: '20:00', arrivalTime: '', label: 'الرحلة المسائية' },
  { id: 't5', departureTime: '01:00', arrivalTime: '', label: 'رحلة المبيت' }
];
