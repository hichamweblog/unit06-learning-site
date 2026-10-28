import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { unitContent } from '../data';
import { useProgress } from '../context/useProgress';
import { PageHeading } from '../components/PageHeading';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { Feedback } from '../components/Feedback';

const sectionIds = ['concepts', 'prevention', 'penalties', 'wisdom'] as const;
const sectionLabels = ['المفاهيم الأساسية', 'المنهج الوقائي', 'المنهج العلاجي', 'الخصائص والحكمة'];
const sectionTitles = ['مفهوم الانحراف والجريمة', 'المنهج الوقائي', 'المنهج العلاجي والعقوبات', 'خصائص العقوبات والحكمة منها'];


function KnowledgeCheck({ id, question, options, answerIndex, explanation }: { id: string; question: string; options: string[]; answerIndex: number; explanation: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  return (
    <section className="knowledge-check" aria-labelledby={id}>
      <p className="eyebrow">توقّف وفكّر</p>
      <h3 id={id}>{question}</h3>
      <div className="choice-list">
        {options.map((option, index) => (
          <button type="button" className={`choice-button${selected === index ? ' choice-button--selected' : ''}`} key={option} aria-pressed={selected === index} onClick={() => { setSelected(index); setChecked(false); }}>
            <span className="choice-button__bullet" aria-hidden="true">{selected === index ? '✓' : ''}</span>{option}
          </button>
        ))}
      </div>
      <button type="button" className="button button--navy button--small" disabled={selected === null} onClick={() => setChecked(true)}>تحقّق من اختياري</button>
      {checked && selected !== null && <Feedback correct={selected === answerIndex} title={selected === answerIndex ? 'إجابة موفقة' : 'راجع التعريف ثم حاول مرة أخرى'}>{explanation}</Feedback>}
    </section>
  );
}

function ProofCard({ title, explanation, proof }: { title: string; explanation: string; proof: string }) {
  return (
    <article className="proof-card">
      <h3>{title}</h3>
      <p>{explanation}</p>
      <blockquote><p>{proof}</p></blockquote>
    </article>
  );
}

function LessonSection({ index }: { index: number }) {
  const content = unitContent.fullUnitText;
  const concepts = content.section_1_concepts_and_causes;
  const prevention = content.section_2_preventive_method;
  const penalties = content.section_3_curative_method_penalties;
  const characteristics = content.section_4_characteristics_and_wisdoms;

  if (index === 0) return (
    <div className="lesson-content">
      <div className="definition-grid">
        <article className="definition-card"><span className="definition-card__index">01</span><h3>الانحراف</h3><p>{concepts['1_definition_inhiraf']}</p></article>
        <article className="definition-card definition-card--copper"><span className="definition-card__index">02</span><h3>الجريمة</h3><p>{concepts['2_definition_crime']}</p></article>
      </div>
      <aside className="lesson-enrichment" aria-label="معلومة إضافية">
        <p className="eyebrow">فائدة إثرائية</p>
        <h3>عوامل قد تسهم في الانحراف</h3>
        <ul>{concepts['3_causes_of_crime'].map((cause) => <li key={cause}>{cause}</li>)}</ul>
      </aside>
      <KnowledgeCheck id="check-concepts" key="concept-check" question="أي التعريفين يخص الجريمة؟" options={[concepts['1_definition_inhiraf'], concepts['2_definition_crime']]} answerIndex={1} explanation="الجريمة هي محظورات شرعية زجر عنها الله بحد أو قصاص أو تعزير." />
    </div>
  );

  if (index === 1) return (
    <div className="lesson-content">
      <p className="lead-paragraph">{prevention.description}</p>
      <div className="proof-grid">
        <ProofCard {...prevention.means_1_strengthening_faith} />
        <ProofCard {...prevention.means_2_worship_and_ethics} />
      </div>
      <KnowledgeCheck id="check-prevention" key="prevention-check" question="ما الوسيلتان المذكورتان في المنهج الوقائي؟" options={[
        `${prevention.means_1_strengthening_faith.title}، و${prevention.means_2_worship_and_ethics.title}`,
        'تطبيق العقوبات بعد وقوع الجريمة',
      ]} answerIndex={0} explanation="يقوم المنهج الوقائي على تقوية الإيمان والوازع الديني، والحث على العبادات ومكارم الأخلاق." />
    </div>
  );

  if (index === 2) return (
    <div className="lesson-content">
      <div className="concept-banner"><span className="concept-banner__icon" aria-hidden="true">⚖</span><div><p className="eyebrow">بعد وقوع الجريمة</p><h3>مفهوم العقوبة</h3><p>{penalties.definition_penalty}</p></div></div>
      <div className="penalty-sections">
        {penalties.types_of_penalties.map((type, typeIndex) => (
          <section className="penalty-section" key={type.category}>
            <header><span className="penalty-section__number"><bdi>0{typeIndex + 1}</bdi></span><div><p className="eyebrow">نوع من أنواع العقوبات</p><h3>{type.category}</h3></div></header>
            <p className="penalty-section__definition">{type.definition}</p>
            <ResponsiveTable
              caption={`الجرائم والعقوبات ضمن ${type.category}`}
              headers={['الجريمة أو المثال', 'نوع العقوبة', 'المقصد الشرعي']}
              rows={type.crimes_and_details.map((detail) => [detail.crime, detail.penalty, detail.purpose])}
            />
          </section>
        ))}
      </div>
      <KnowledgeCheck id="check-penalty" key="penalty-check" question="أي نوع من العقوبات غير مقدّر شرعًا ويترك تقديره للقاضي؟" options={penalties.types_of_penalties.map((type) => type.category)} answerIndex={penalties.types_of_penalties.findIndex((type) => type.category === 'التعزير')} explanation="التعزير عقوبة غير مقدّرة، ويُترك تقديرها للقاضي بحسب المصلحة." />
    </div>
  );

  return (
    <div className="lesson-content">
      <section className="content-block"><div className="content-block__heading"><span className="mini-icon" aria-hidden="true">✦</span><div><p className="eyebrow">ما يميّز الأحكام</p><h3>خصائص العقوبات</h3></div></div><ol className="principle-list">{characteristics.characteristics.map((item, i) => <li key={item}><span className="principle-list__index"><bdi>{i + 1}</bdi></span><p>{item}</p></li>)}</ol></section>
      <section className="content-block content-block--cream"><div className="content-block__heading"><span className="mini-icon mini-icon--copper" aria-hidden="true">◎</span><div><p className="eyebrow">مقاصد التشريع</p><h3>الحكمة من تشريع العقوبات</h3></div></div><ol className="wisdom-grid">{characteristics.wisdoms.map((item, i) => <li key={item}><span className="wisdom-grid__number"><bdi>{i + 1}</bdi></span><p>{item}</p></li>)}</ol></section>
      <KnowledgeCheck id="check-wisdom" key="wisdom-check" question="أي مما يأتي من خصائص العقوبات؟" options={[
        characteristics.characteristics[3] ?? characteristics.characteristics[0] ?? '',
        characteristics.wisdoms[0] ?? '',
      ]} answerIndex={0} explanation="من الخصائص المذكورة: شرعية العقوبة، والمساواة، والعدالة وشخصية العقوبة، والرحمة." />
    </div>
  );
}

export function LearnPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { progress, markSectionComplete } = useProgress();
  const parsedIndex = Number(searchParams.get('section') ?? '0');
  const activeIndex = Number.isInteger(parsedIndex) && parsedIndex >= 0 && parsedIndex < sectionLabels.length ? parsedIndex : 0;

  function goToSection(index: number) {
    setSearchParams({ section: String(index) }, { replace: false });
    const motionOk = !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    window.scrollTo({ top: 0, behavior: motionOk ? 'smooth' : 'instant' });
  }

  const isComplete = progress.completedSections.includes(sectionIds[activeIndex] ?? 'concepts');
  const completedCount = progress.completedSections.filter((id) => sectionIds.includes(id as typeof sectionIds[number])).length;

  return (
    <div className="page-wrap inner-page learn-page">
      <PageHeading eyebrow="أربعة محاور" title="تعلّم الدرس" description="اقرأ المحور، ثم اختبر فهمك بسؤال قصير." />
      <div className="lesson-toolbar">
        <span className="lesson-toolbar__count">المحور <bdi>{activeIndex + 1}</bdi> من <bdi>4</bdi></span>
        <div className="lesson-toolbar__progress" aria-label={`أكملت ${completedCount} من أربعة محاور`}><span style={{ width: `${(completedCount / 4) * 100}%` }} /></div>
        <Link className="text-link" to="/map">انتقل إلى الخريطة <span aria-hidden="true">←</span></Link>
      </div>
      <nav className="lesson-tabs" aria-label="محاور الدرس">
        {sectionLabels.map((label, index) => (
          <button key={label} className={`lesson-tab${activeIndex === index ? ' lesson-tab--active' : ''}${progress.completedSections.includes(sectionIds[index] ?? '') ? ' lesson-tab--done' : ''}`} type="button" aria-current={activeIndex === index ? 'step' : undefined} onClick={() => goToSection(index)}>
            <span className="lesson-tab__number">{progress.completedSections.includes(sectionIds[index] ?? '') ? '✓' : <bdi>{index + 1}</bdi>}</span><span>{label}</span>
          </button>
        ))}
      </nav>
      <article className="lesson-panel">
        <header className="lesson-panel__heading"><span className="lesson-panel__index"><bdi>0{activeIndex + 1}</bdi></span><div><p className="eyebrow">المحور {activeIndex + 1}</p><h2>{sectionTitles[activeIndex]}</h2></div></header>
        <LessonSection index={activeIndex} />
        <div className="lesson-panel__footer">
          <div className="lesson-panel__mark">
            <button className={`button ${isComplete ? 'button--success' : 'button--navy'}`} type="button" onClick={() => markSectionComplete(sectionIds[activeIndex] ?? 'concepts')} disabled={isComplete}>
              {isComplete ? '✓ أُنجز هذا المحور' : 'أنهيت مراجعة هذا المحور'}
            </button>
            <span>يُسجّل إنجازك في هذا المتصفح.</span>
          </div>
          <div className="button-row lesson-panel__nav">
            <button className="button button--outline" type="button" onClick={() => goToSection(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0}>السابق</button>
            {activeIndex < 3
              ? <button className="button button--copper" type="button" onClick={() => goToSection(activeIndex + 1)}>المحور التالي <span aria-hidden="true">←</span></button>
              : <Link className="button button--copper" to="/activities">انتقل إلى الأنشطة <span aria-hidden="true">←</span></Link>}
          </div>
        </div>
      </article>
    </div>
  );
}
