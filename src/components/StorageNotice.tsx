import { useProgress } from '../context/useProgress';

const messages = {
  corrupt: 'تعذر قراءة تقدم سابق لأنه تالف أو لم يعد متوافقًا؛ بدأ الموقع بحالة نظيفة.',
  unavailable: 'التخزين المحلي غير متاح الآن. يمكنك متابعة الدرس والأنشطة، لكن لن يُحفظ تقدمك على هذا الجهاز.',
  'write-failed': 'لم يتمكن المتصفح من حفظ هذا التغيير. ما زال بإمكانك متابعة الاستخدام في الجلسة الحالية.',
} as const;

export function StorageNotice() {
  const { warning } = useProgress();
  if (!warning) return null;
  return <p className="storage-notice" role="status">{messages[warning]}</p>;
}
