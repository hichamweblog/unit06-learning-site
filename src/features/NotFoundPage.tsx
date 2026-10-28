import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="not-found page-wrap" aria-labelledby="not-found-title">
      <nav className="breadcrumbs" aria-label="مسار التنقل"><ol><li><Link to="/">الرئيسية</Link></li><li className="breadcrumbs__separator" aria-hidden="true">/</li><li aria-current="page">صفحة غير موجودة</li></ol></nav>
      <span className="not-found__code"><bdi>404</bdi></span>
      <p className="eyebrow">مسار غير موجود</p>
      <h1 id="not-found-title">لم نجد هذه الصفحة</h1>
      <p>قد يكون الرابط غير صحيح أو تغيّر. يمكنك العودة إلى الصفحة الرئيسية أو اختيار أحد أقسام الوحدة من القائمة.</p>
      <Link className="button button--navy" to="/">العودة إلى الرئيسية <span aria-hidden="true">←</span></Link>
    </section>
  );
}
