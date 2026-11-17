import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { RawBlock, RawSection } from '../data/units/types';
import { useProgress } from '../context/useProgress';
import { sectionKey, useUnit } from '../context/useUnit';
import { PageHeading } from '../components/PageHeading';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { Feedback } from '../components/Feedback';
import { unitPath } from '../lib/site';
import { track } from '../lib/analytics';

/* ------------------------------------------------------------------ */
/* مكوّنات الكتل: عامة لكل الوحدات، تقرأ المحتوى من مخطط الوحدة        */
/* ------------------------------------------------------------------ */

function KnowledgeCheck({
  id,
  question,
  options,
  answerIndex,
  explanation,
  onAnswered,
}: {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  onAnswered?: (id: string, correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function verify() {
    if (selected === null) return;
    setChecked(true);
    onAnswered?.(id, selected === answerIndex);
  }

  return (
    <section className="knowledge-check" aria-labelledby={id}>
      <p className="eyebrow">توقّف وفكّر</p>
      <h3 id={id}>{question}</h3>
      <div className="choice-list">
        {options.map((option, index) => (
          <button
            type="button"
            className={`choice-button${selected === index ? ' choice-button--selected' : ''}`}
            key={option}
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index);
              setChecked(false);
            }}
          >
            <span className="choice-button__bullet" aria-hidden="true">
              {selected === index ? '✓' : ''}
            </span>
            {option}
          </button>
        ))}
      </div>
      <button type="button" className="button button--navy button--small" disabled={selected === null} onClick={verify}>
        {checked ? 'تحقّق مرة أخرى' : 'تحقّق من اختياري'}
      </button>
      {checked && selected !== null && (
        <Feedback
          correct={selected === answerIndex}
          title={selected === answerIndex ? 'إجابة موفقة' : 'راجع التعريف ثم حاول مرة أخرى'}
        >
          {explanation}
        </Feedback>
      )}
    </section>
  );
}

function ProofCard({ title, explanation, proof }: { title: string; explanation: string; proof: string }) {
  return (
    <article className="proof-card">
      <h3>{title}</h3>
      <p>{explanation}</p>
      <blockquote>
        <p>{proof}</p>
      </blockquote>
    </article>
  );
}

function BulletsBlock({ block }: { block: Extract<RawBlock, { type: 'bullets' }> }) {
  const items = block.items.map((item, index) => (
    <li key={item}>
      {block.style === 'numbered' && <span className="principle-list__index"><bdi>{index + 1}</bdi></span>}
      <p>{item}</p>
    </li>
  ));

  if (block.layout === 'note') {
    return (
      <aside className="lesson-enrichment" aria-label={block.title ?? 'فائدة إثرائية'}>
        {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
        {block.title && <h3>{block.title}</h3>}
        <ul>{items}</ul>
      </aside>
    );
  }

  if (block.layout === 'wisdom') {
    return (
      <section className="content-block content-block--cream">
        <div className="content-block__heading">
          <span className="mini-icon mini-icon--copper" aria-hidden="true">◎</span>
          <div>
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            {block.title && <h3>{block.title}</h3>}
          </div>
        </div>
        <ol className="wisdom-grid">{items}</ol>
      </section>
    );
  }

  return (
    <section className="content-block">
      <div className="content-block__heading">
        <span className="mini-icon" aria-hidden="true">✦</span>
        <div>
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          {block.title && <h3>{block.title}</h3>}
        </div>
      </div>
      <ol className="principle-list">{items}</ol>
    </section>
  );
}

function BlockRenderer({ block, onAnswered }: { block: RawBlock; onAnswered: (id: string, correct: boolean) => void }) {
  switch (block.type) {
    case 'definitions':
      return (
        <div className="definition-grid">
          {block.items.map((item, index) => (
            <article
              className={`definition-card${item.tone === 'copper' || index % 2 === 1 ? ' definition-card--copper' : ''}`}
              key={item.term}
            >
              <span className="definition-card__index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.term}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      );
    case 'paragraph':
      return <p className="lead-paragraph">{block.text}</p>;
    case 'evidence':
      return (
        <div className="proof-grid">
          {block.items.map((item) => (
            <ProofCard key={item.title} {...item} />
          ))}
        </div>
      );
    case 'bullets':
      return <BulletsBlock block={block} />;
    case 'callout':
      return (
        <div className="concept-banner">
          <span className="concept-banner__icon" aria-hidden="true">{block.icon ?? '◆'}</span>
          <div>
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            <h3>{block.title}</h3>
            <p>{block.text}</p>
          </div>
        </div>
      );
    case 'table':
      return <ResponsiveTable caption={block.caption} headers={block.headers} rows={block.rows} />;
    case 'group':
      return (
        <section className="penalty-section">
          <header>
            <span className="penalty-section__number" aria-hidden="true">◆</span>
            <div>
              {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
              <h3>{block.title}</h3>
            </div>
          </header>
          {block.intro && <p className="penalty-section__definition">{block.intro}</p>}
          <ResponsiveTable caption={block.table.caption} headers={block.table.headers} rows={block.table.rows} />
        </section>
      );
    case 'check':
      return (
        <KnowledgeCheck
          id={block.id}
          question={block.question}
          options={block.options}
          answerIndex={block.answerIndex}
          explanation={block.explanation}
          onAnswered={onAnswered}
        />
      );
    default:
      return null;
  }
}

type SectionItem =
  | { kind: 'block'; block: RawBlock; index: number }
  | { kind: 'groups'; blocks: Extract<RawBlock, { type: 'group' }>[] };

function buildSectionItems(blocks: RawBlock[]): SectionItem[] {
  const items: SectionItem[] = [];
  blocks.forEach((block, index) => {
    if (block.type === 'group') {
      const last = items[items.length - 1];
      if (last && last.kind === 'groups') last.blocks.push(block);
      else items.push({ kind: 'groups', blocks: [block] });
      return;
    }
    items.push({ kind: 'block', block, index });
  });
  return items;
}

function LessonSection({ section, onAnswered }: { section: RawSection; onAnswered: (id: string, correct: boolean) => void }) {
  return (
    <div className="lesson-content">
      {buildSectionItems(section.blocks).map((item) =>
        item.kind === 'groups' ? (
          <div className="penalty-sections" key={`${section.id}-groups-${item.blocks[0]?.title ?? ''}`}>
            {item.blocks.map((block) => (
              <BlockRenderer block={block} key={`${section.id}-group-${block.title}`} onAnswered={onAnswered} />
            ))}
          </div>
        ) : (
          <BlockRenderer
            block={item.block}
            key={`${section.id}-${item.block.type}-${item.index}`}
            onAnswered={onAnswered}
          />
        ),
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function LearnPage() {
  const unit = useUnit();
  const [searchParams, setSearchParams] = useSearchParams();
  const { progress, markSectionComplete } = useProgress();
  const [answeredChecks, setAnsweredChecks] = useState<Record<string, boolean>>({});
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const sections = unit.sections;
  const parsedIndex = Number(searchParams.get('section') ?? '0');
  const activeIndex = Number.isInteger(parsedIndex) && parsedIndex >= 0 && parsedIndex < sections.length ? parsedIndex : 0;
  const activeSection = sections[activeIndex]!;

  const completedSections = useMemo(
    () => new Set(progress.completedSections),
    [progress.completedSections],
  );
  const completedCount = sections.filter((section) => completedSections.has(sectionKey(unit, section.id))).length;
  const isComplete = completedSections.has(sectionKey(unit, activeSection.id));

  const sectionChecks = activeSection.blocks.filter((block) => block.type === 'check');
  const pendingChecks = sectionChecks.filter((block) => answeredChecks[block.id] !== true);
  const canComplete = pendingChecks.length === 0;

  function goToSection(index: number) {
    setSearchParams({ section: String(index) }, { replace: false });
    setLastAnswerCorrect(null);
    const motionOk = !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    window.scrollTo({ top: 0, behavior: motionOk ? 'smooth' : 'instant' });
  }

  function handleAnswered(id: string, correct: boolean) {
    setAnsweredChecks((current) => ({ ...current, [id]: correct }));
    setLastAnswerCorrect(correct);
    track('lesson_check_answered', { unit: unit.slug, section: activeSection.id, correct });
  }

  function complete() {
    markSectionComplete(sectionKey(unit, activeSection.id));
    track('lesson_section_completed', { unit: unit.slug, section: activeSection.id });
  }

  return (
    <div className="page-wrap inner-page learn-page">
      <PageHeading
        eyebrow={unit.copy.learnEyebrow ?? 'المحاور'}
        title={unit.copy.learnTitle ?? 'تعلّم الدرس'}
        description={unit.copy.learnDescription ?? 'اقرأ المحور، ثم اختبر فهمك بسؤال قصير.'}
      />
      <div className="lesson-toolbar">
        <span className="lesson-toolbar__count">
          المحور <bdi>{activeIndex + 1}</bdi> من <bdi>{sections.length}</bdi>
        </span>
        <div
          className="lesson-toolbar__progress"
          aria-label={`أكملت ${completedCount} من ${sections.length} محاور`}
        >
          <span style={{ width: `${(completedCount / sections.length) * 100}%` }} />
        </div>
        <Link className="text-link" to={unitPath(unit.slug, 'map')}>
          انتقل إلى الخريطة <span aria-hidden="true">←</span>
        </Link>
      </div>

      <nav className="lesson-tabs" aria-label="محاور الدرس">
        {sections.map((section, index) => {
          const done = completedSections.has(sectionKey(unit, section.id));
          return (
            <button
              key={section.id}
              className={`lesson-tab${activeIndex === index ? ' lesson-tab--active' : ''}${done ? ' lesson-tab--done' : ''}`}
              type="button"
              aria-current={activeIndex === index ? 'step' : undefined}
              onClick={() => goToSection(index)}
            >
              <span className="lesson-tab__number">{done ? '✓' : <bdi>{index + 1}</bdi>}</span>
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>

      <article className="lesson-panel">
        <header className="lesson-panel__heading">
          <span className="lesson-panel__index">
            <bdi>{String(activeIndex + 1).padStart(2, '0')}</bdi>
          </span>
          <div>
            <p className="eyebrow">{activeSection.eyebrow ?? `المحور ${activeIndex + 1}`}</p>
            <h2>{activeSection.title}</h2>
          </div>
        </header>

        <LessonSection section={activeSection} onAnswered={handleAnswered} />

        <div className="lesson-panel__footer">
          <div className="lesson-panel__mark">
            <button className={`button ${isComplete ? 'button--success' : 'button--navy'}`} type="button" onClick={complete} disabled={isComplete || !canComplete}>
              {isComplete ? '✓ أُنجز هذا المحور' : 'أنهيت مراجعة هذا المحور'}
            </button>
            <span>
              {isComplete
                ? 'يُسجّل إنجازك في هذا المتصفح.'
                : canComplete
                  ? 'يُسجّل إنجازك في هذا المتصفح.'
                  : lastAnswerCorrect === false
                    ? 'أعد المحاولة في سؤال الفهم ثم سجّل إنجازك.'
                    : 'أجب عن سؤال الفهم أولًا ثم سجّل إنجازك.'}
            </span>
          </div>
          <div className="button-row lesson-panel__nav">
            <button className="button button--outline" type="button" onClick={() => goToSection(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0}>
              السابق
            </button>
            {activeIndex < sections.length - 1 ? (
              <button className="button button--copper" type="button" onClick={() => goToSection(activeIndex + 1)}>
                المحور التالي <span aria-hidden="true">←</span>
              </button>
            ) : (
              <Link className="button button--copper" to={unitPath(unit.slug, 'activities')}>
                انتقل إلى الأنشطة <span aria-hidden="true">←</span>
              </Link>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
