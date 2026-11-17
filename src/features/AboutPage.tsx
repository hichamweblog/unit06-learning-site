import { Link } from 'react-router-dom';
import { units } from '../data/units/registry';
import { PageHeading } from '../components/PageHeading';
import { site, unitPath } from '../lib/site';

const sources = [...new Set(units.flatMap((unit) => unit.provenance.sources))];
const reviews = units
  .filter((unit) => unit.provenance.reviewedAt)
  .map((unit) => ({ title: unit.title, date: unit.provenance.reviewedAt, by: unit.provenance.reviewedBy }));

export function AboutPage() {
  return (
    <div className="page-wrap inner-page about-page">
      <PageHeading
        eyebrow="الشفافية أولًا"
        title="عن المنصة والمنهجية"
        description="منهاج منصة مستقلة لمراجعة العلوم الإسلامية في البكالوريا. هذه الصفحة تشرح كيف نصنع المحتوى، ومن يراجعه، وما نفعله ببياناتك."
      />

      <section className="content-block" aria-labelledby="method-title">
        <div className="content-block__heading">
          <span className="mini-icon" aria-hidden="true">✦</span>
          <div>
            <p className="eyebrow">كيف نبني الوحدة</p>
            <h3 id="method-title">من المصدر إلى الصفحة</h3>
          </div>
        </div>
        <ol className="principle-list">
          <li><span className="principle-list__index"><bdi>1</bdi></span><p>نبدأ من التدرجات الرسمية والكتاب المدرسي ودليل الأستاذ لتحديد محاور الوحدة بدقة.</p></li>
          <li><span className="principle-list__index"><bdi>2</bdi></span><p>نكتب الشرح بلغة المتعلم، مع الأدلة الشرعية مشكولة، وجداول الفروق الدقيقة.</p></li>
          <li><span className="principle-list__index"><bdi>3</bdi></span><p>تُراجع التعريفات والأحكام تحريريًا، وتُوثّق التصحيحات بدل إخفائها.</p></li>
          <li><span className="principle-list__index"><bdi>4</bdi></span><p>تُبنى الأسئلة على مستويات معرفية متدرجة، وتُوزّع مواضع الإجابات لمنع التخمين.</p></li>
          <li><span className="principle-list__index"><bdi>5</bdi></span><p>كل وحدة تُلحق بأرشيف مواضيع البكالوريا المرتبطة بها مع إجابة نموذجية.</p></li>
        </ol>
      </section>

      <section className="content-block content-block--cream" aria-labelledby="sources-title">
        <div className="content-block__heading">
          <span className="mini-icon mini-icon--copper" aria-hidden="true">◎</span>
          <div>
            <p className="eyebrow">المرجعية</p>
            <h3 id="sources-title">المصادر المعتمدة</h3>
          </div>
        </div>
        <ul className="source-list">
          {sources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
        {reviews.length > 0 && (
          <div className="review-log">
            <h4>سجل المراجعة</h4>
            {reviews.map((review) => (
              <p key={review.title}>
                <strong>{review.title}</strong> — آخر مراجعة: <bdi>{review.date}</bdi>
                {review.by ? ` · ${review.by}` : ''}
              </p>
            ))}
          </div>
        )}
        <p className="about-note">
          المنصة ليست جهة رسمية، ولا تُغني عن الأستاذ أو الكتاب المدرسي. المحتوى أصلي بصياغتنا، ولا يُعاد نشر
          الكتاب المدرسي نصًّا. إن لاحظت خطأً فالتصحيح يُوثّق في سجل المراجعة أعلاه.
        </p>
      </section>

      <section className="content-block" aria-labelledby="privacy-title">
        <div className="content-block__heading">
          <span className="mini-icon" aria-hidden="true">🛡</span>
          <div>
            <p className="eyebrow">الخصوصية</p>
            <h3 id="privacy-title">ما نعرفه عنك</h3>
          </div>
        </div>
        <ul className="about-list">
          <li>لا يوجد تسجيل ولا حساب ولا بريد إلكتروني، ولا نطلب أي بيانات شخصية.</li>
          <li>تقدمك (المحاور المكتملة، البطاقات المتقنة، نتائج الاختبار) يُخزّن في <code>localStorage</code> على جهازك فقط، ويمكن مسحه بزر «إعادة ضبط التقدم».</li>
          <li>لا نستخدم كوكيز تتبّع ولا إعلانات. وإذا فُعّلت إحصاءات الزيارات فهي بلا كوكيز وبلا معرّفات شخصية، وتُستخدم لمعرفة الصفحات المفيدة فقط.</li>
          <li>الموقع يعمل كتطبيق ويب تقدمي (PWA) ويُخزّن ملفاته في متصفحك للعمل دون اتصال.</li>
        </ul>
      </section>

      <section className="content-block content-block--cream" aria-labelledby="next-title">
        <div className="content-block__heading">
          <span className="mini-icon mini-icon--copper" aria-hidden="true">↗</span>
          <div>
            <p className="eyebrow">خريطة الطريق</p>
            <h3 id="next-title">ما نعمل عليه الآن</h3>
          </div>
        </div>
        <ul className="about-list">
          <li>إكمال تغطية وحدات المقرر الرسمي وحدة بعد وحدة.</li>
          <li>أرشيف مواضيع البكالوريا الرسمية مع تصحيح مفصّل وسلّم تنقيط.</li>
          <li>محاكاة امتحان بمؤقّت وتقرير نقاط ضعف حسب المحور.</li>
          <li>مراجعة متباعدة آلية تُعيد البطاقات الضعيفة في موعدها.</li>
        </ul>
        <div className="button-row">
          {units[0] && (
            <Link className="button button--navy" to={unitPath(units[0].slug)}>
              العودة إلى الوحدة المتاحة <span aria-hidden="true">←</span>
            </Link>
          )}
          <Link className="button button--outline" to="/">
            الصفحة الرئيسية
          </Link>
        </div>
      </section>

      <p className="about-footer-note">
        {site.name} · {site.tagline} · للتواصل والتصحيحات: تُضاف قناة تواصل رسمية قريبًا.
      </p>
    </div>
  );
}
