import { useState } from 'react';
import { Link } from 'react-router-dom';
import { unitContent } from '../data';
import { PageHeading } from '../components/PageHeading';

const branchDestinations = ['/learn?section=0', '/learn?section=1', '/learn?section=2', '/learn?section=3', '/learn?section=3', '/bac'];
const destinationLabels = ['افتح محور المفاهيم الأساسية', 'افتح محور المنهج الوقائي', 'افتح محور المنهج العلاجي', 'افتح محور الخصائص والحكمة', 'افتح محور الخصائص والحكمة', 'افتح تدريب الوحدة'];

function makeStudentBranches() {
  return unitContent.mindMap.branches.map((branch, index) => {
    if (index === 0) return { ...branch, title: '1. المفاهيم الأساسية', sub_items: branch.sub_items.slice(0, 2) };
    if (index === 5) return { ...branch, title: '6. مهارات الإجابة' };
    return branch;
  });
}

export function MapPage() {
  const branches = makeStudentBranches();
  const [selected, setSelected] = useState(0);
  const activeBranch = branches[selected];

  return (
    <div className="page-wrap inner-page map-page">
      <PageHeading eyebrow="استكشف العلاقات" title="الخريطة المفاهيمية" description="اختر فرعًا لعرض عناصره والانتقال إلى موضعه في الدرس." />
      <section className="map-canvas" aria-label="الخريطة المفاهيمية التفاعلية">
        <div className="map-root"><p className="eyebrow">الموضوع الرئيس</p><h2>{unitContent.metadata.unit_title}</h2><span className="map-root__connector" aria-hidden="true" /></div>
        <div className="map-branches" role="list" aria-label="فروع الخريطة">
          {branches.map((branch, index) => (
            <article className={`map-branch${selected === index ? ' map-branch--selected' : ''}`} role="listitem" key={branch.title}>
              <button className="map-branch__button" type="button" aria-pressed={selected === index} aria-describedby={`branch-summary-${index}`} onClick={() => setSelected(index)}>
                <span className="map-branch__index"><bdi>{String(index + 1).padStart(2, '0')}</bdi></span>
                <span className="map-branch__title">{branch.title}</span>
                <span className="map-branch__chevron" aria-hidden="true">{selected === index ? '−' : '+'}</span>
              </button>
              <p id={`branch-summary-${index}`} className="map-branch__summary">{branch.sub_items[0]}</p>
            </article>
          ))}
        </div>
      </section>
      {activeBranch && (
        <section className="map-detail" aria-live="polite" aria-labelledby="map-detail-title">
          <div className="map-detail__heading"><span className="map-detail__badge"><bdi>{String(selected + 1).padStart(2, '0')}</bdi></span><div><p className="eyebrow">عناصر الفرع</p><h2 id="map-detail-title">{activeBranch.title}</h2></div></div>
          <ul className="map-detail__items">{activeBranch.sub_items.map((item) => <li key={item}><span aria-hidden="true">◇</span>{item}</li>)}</ul>
          <Link className="button button--navy" to={branchDestinations[selected] ?? '/learn'}>{destinationLabels[selected] ?? 'انتقل إلى الدرس'} <span aria-hidden="true">←</span></Link>
        </section>
      )}
      <p className="map-access-note"><span aria-hidden="true">ⓘ</span> الخريطة مكتوبة كنص وأزرار قابلة للتشغيل بلوحة المفاتيح؛ لا يعتمد التفاعل على رسم أو لون وحده.</p>
    </div>
  );
}
