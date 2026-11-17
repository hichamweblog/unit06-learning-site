import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeading } from '../components/PageHeading';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { Feedback } from '../components/Feedback';
import { FlashcardsPage } from './FlashcardsPage';
import { QuizPage } from './QuizPage';
import { BacPage } from './BacPage';
import { useProgress } from '../context/useProgress';
import { sectionKey, useUnit } from '../context/useUnit';
import type { RawActivity } from '../data/units/types';

type ActivityTab = 'classify' | 'compare';

type ClassifyItem = Extract<RawActivity, { kind: 'classify' }>;
type DifferenceItem = Extract<RawActivity, { kind: 'difference' }>;

function FastClassifyActivity({ items, onComplete }: { items: ClassifyItem[]; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const current = items[index];

  function check() {
    if (!current || !choice || checked !== null) return;
    const correct = choice === current.answer;
    setChecked(correct);
    if (correct) setScore((value) => value + 1);
  }

  function next() {
    if (index === items.length - 1) {
      setFinished(true);
      onComplete?.();
    } else {
      setIndex((value) => value + 1);
      setChoice(null);
      setChecked(null);
    }
  }

  function retry() {
    setIndex(0);
    setChoice(null);
    setChecked(null);
    setFinished(false);
    setScore(0);
  }

  if (finished) {
    return (
      <div className="activity-result" role="status">
        <span className="result-seal" aria-hidden="true">✓</span>
        <p className="eyebrow">اكتمل نشاط الفرز والتمييز</p>
        <h3>أحسنت! أتممت أسئلة الفرز بنجاح</h3>
        <p>النتيجة النهائية: <strong><bdi>{score}</bdi> من <bdi>{items.length}</bdi></strong> إجابة صحيحة</p>
        <button className="button button--navy" type="button" onClick={retry}>
          إعادة النشاط
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="activity-step">
      <div className="activity-step__meta">
        <span>
          المسألة <bdi>{index + 1}</bdi> من <bdi>{items.length}</bdi>
          {' · '}{current.group}
        </span>
        <div className="step-dots" aria-hidden="true">
          {items.map((_, i) => (
            <i key={i} className={i <= index ? 'step-dots__active' : ''} />
          ))}
        </div>
      </div>

      <p className="eyebrow">{current.group}</p>
      <h3>{current.prompt}</h3>

      <div className="choice-grid" role="group" aria-label="خيارات التصنيف">
        {current.choices.map((item) => (
          <button
            key={item}
            type="button"
            className={`choice-button ${choice === item ? 'choice-button--selected' : ''}`}
            aria-pressed={choice === item}
            disabled={checked !== null}
            onClick={() => setChoice(item)}
          >
            <span className="choice-button__bullet" aria-hidden="true">
              {choice === item ? '✓' : ''}
            </span>
            {item}
          </button>
        ))}
      </div>

      {checked !== null && (
        <Feedback
          correct={checked}
          title={checked ? 'إجابة صحيحة ✓' : `الإجابة الصحيحة: ${current.answer}`}
        >
          {current.explanation}
        </Feedback>
      )}

      <div className="activity-controls">
        {checked === null ? (
          <button className="button button--navy" type="button" disabled={!choice} onClick={check}>
            تأكيد الاختيار
          </button>
        ) : (
          <button className="button button--copper" type="button" onClick={next}>
            {index === items.length - 1 ? 'عرض النتيجة النهائية' : 'المسألة التالية'} <span aria-hidden="true">←</span>
          </button>
        )}
      </div>
    </div>
  );
}

function ComparisonActivity({ items, onComplete }: { items: DifferenceItem[]; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = items[index];
  const choices = current?.choices ?? [];
  const table = items.find((item) => item.table)?.table;

  function check() {
    if (!current || !choice || checked !== null) return;
    const correct = choice === current.answer;
    setChecked(correct);
    if (correct) setScore((value) => value + 1);
  }

  function next() {
    if (index === items.length - 1) {
      setFinished(true);
      onComplete?.();
    } else {
      setIndex((value) => value + 1);
      setChoice('');
      setChecked(null);
    }
  }

  function retry() {
    setIndex(0);
    setChoice('');
    setChecked(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="activity-result" role="status">
        <span className="result-seal" aria-hidden="true">✓</span>
        <p className="eyebrow">اكتملت المقارنة والأحكام</p>
        <h3>أحسنت! أنهيت أسئلة الفروق الشرعية</h3>
        <p>النتيجة: <strong><bdi>{score}</bdi> من <bdi>{items.length}</bdi></strong> إجابة صحيحة</p>
        <button className="button button--navy" type="button" onClick={retry}>
          إعادة التمرين
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="comparison-activity">
      <p className="activity-instruction">
        راجع جدول الفروق الجوهرية بين العقوبات، ثم أجب عن أسئلة التطبيق التحليلية:
      </p>
      {table && <ResponsiveTable caption={table.caption} headers={table.headers} rows={table.rows} />}

      <section className="comparison-question">
        <div className="activity-step__meta">
          <span>السؤال <bdi>{index + 1}</bdi> من <bdi>{items.length}</bdi></span>
          <div className="step-dots" aria-hidden="true">
            {items.map((_, i) => (
              <i key={i} className={i <= index ? 'step-dots__active' : ''} />
            ))}
          </div>
        </div>

        <p className="eyebrow">سؤال في الفروق الشرعية</p>
        <h3>{current.prompt}</h3>

        <div className="choice-grid" role="group" aria-label="خيارات المقارنة">
          {choices.map((item) => (
            <button
              type="button"
              key={item}
              className={`choice-button ${choice === item ? 'choice-button--selected' : ''}`}
              aria-pressed={choice === item}
              disabled={checked !== null}
              onClick={() => setChoice(item)}
            >
              <span className="choice-button__bullet" aria-hidden="true">
                {choice === item ? '✓' : ''}
              </span>
              {item}
            </button>
          ))}
        </div>

        {checked !== null && (
          <Feedback correct={checked} title={checked ? 'إجابة دقيقة ✓' : `الإجابة الصحيحة: ${current.answer}`}>
            {current.explanation}
          </Feedback>
        )}

        <div className="activity-controls">
          {checked === null ? (
            <button className="button button--navy" type="button" disabled={!choice} onClick={check}>
              تحقّق من الإجابة
            </button>
          ) : (
            <button className="button button--copper" type="button" onClick={next}>
              {index === items.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'} <span aria-hidden="true">←</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

type HubTab = 'flashcards' | 'interactive' | 'assessment';

interface HubTabItem {
  id: HubTab;
  label: string;
  sublabel: string;
  number: string;
}

const hubTabs: HubTabItem[] = [
  { id: 'flashcards', label: 'بطاقات المراجعة', sublabel: 'الحفظ والاسترجاع', number: '01' },
  { id: 'interactive', label: 'الأنشطة التطبيقية', sublabel: 'التثبيت والتطبيق', number: '02' },
  { id: 'assessment', label: 'الامتحانات والتقويم', sublabel: 'الاختبار والبكالوريا', number: '03' },
];

export function ActivitiesPage() {
  const unit = useUnit();
  const [searchParams, setSearchParams] = useSearchParams();
  const { progress, markSectionComplete } = useProgress();

  const rawTab = searchParams.get('tab');
  const rawSub = searchParams.get('sub');

  // Handle backward compatibility for routes like /quiz and /bac
  let activeHubTab: HubTab = 'flashcards';
  let initialAssessmentSub: 'quiz' | 'bac' = 'quiz';

  if (rawTab === 'interactive') {
    activeHubTab = 'interactive';
  } else if (rawTab === 'quiz') {
    activeHubTab = 'assessment';
    initialAssessmentSub = 'quiz';
  } else if (rawTab === 'bac') {
    activeHubTab = 'assessment';
    initialAssessmentSub = 'bac';
  } else if (rawTab === 'assessment') {
    activeHubTab = 'assessment';
    if (rawSub === 'bac') initialAssessmentSub = 'bac';
  } else {
    activeHubTab = 'flashcards';
  }

  const [assessmentSubTab, setAssessmentSubTab] = useState<'quiz' | 'bac'>(initialAssessmentSub);
  const [activeActivityTab, setActiveActivityTab] = useState<ActivityTab>('classify');

  function setHubTab(tab: HubTab) {
    setSearchParams({ tab });
  }

  // Completion criteria
  const isFlashcardsDone = progress.masteredFlashcardIds.length >= 6 || progress.completedSections.includes(sectionKey(unit, 'flashcards'));
  const isInteractiveDone = progress.completedSections.includes(sectionKey(unit, 'activity-interactive'));
  const isAssessmentDone = progress.latestQuizScore !== undefined || progress.completedSections.includes(sectionKey(unit, 'activity-bac-practice'));

  const completedHubCount = (isFlashcardsDone ? 1 : 0) + (isInteractiveDone ? 1 : 0) + (isAssessmentDone ? 1 : 0);

  function handleCompleteInteractive() {
    markSectionComplete(sectionKey(unit, 'activity-interactive'));
  }

  return (
    <div className="page-wrap inner-page activities-hub-page">
      <PageHeading
        eyebrow="منظومة التدريب والتقويم"
        title="الأنشطة والتقويم"
        description="مسار تعليمي ثلاثي متدرج: ابدأ بالحفظ والاسترجاع، ثم ثبّت المفاهيم بالأنشطة التطبيقية، واختم بالامتحانات وتدريبات البكالوريا."
      />

      {/* Progress & Milestone Overview Bar */}
      <section className="hub-milestone-bar" aria-label="ملخص إنجاز محطات التقويم">
        <div className="hub-milestone-bar__header">
          <div className="hub-milestone-bar__title-group">
            <span className="hub-milestone-bar__badge">
              {completedHubCount === 3 ? '✓ اكتملت جميع المحطات' : 'محطات التعلم والتقويم'}
            </span>
            <span className="hub-milestone-bar__status">
              أنجزت <bdi>{completedHubCount}</bdi> من <bdi>3</bdi> محطات ({Math.round((completedHubCount / 3) * 100)}%)
            </span>
          </div>
        </div>
        <div
          className="hub-milestone-bar__track"
          role="progressbar"
          aria-valuenow={completedHubCount}
          aria-valuemin={0}
          aria-valuemax={3}
          aria-label={`التقدم: ${completedHubCount} من 3`}
        >
          <div
            className="hub-milestone-bar__fill"
            style={{ width: `${(completedHubCount / 3) * 100}%` }}
          />
        </div>
      </section>

      {/* 3 Main Hub Tabs */}
      <nav className="hub-nav-tabs hub-nav-tabs--three" role="tablist" aria-label="محطات التعلم والتقويم الثلاث">
        {hubTabs.map((hub) => {
          const isDone =
            hub.id === 'flashcards'
              ? isFlashcardsDone
              : hub.id === 'interactive'
                ? isInteractiveDone
                : isAssessmentDone;

          return (
            <button
              key={hub.id}
              role="tab"
              type="button"
              aria-selected={activeHubTab === hub.id}
              className={`hub-tab-btn ${activeHubTab === hub.id ? 'hub-tab-btn--active' : ''} ${isDone ? 'hub-tab-btn--done' : ''}`}
              onClick={() => setHubTab(hub.id)}
            >
              <span className="hub-tab-step-badge" aria-hidden="true">
                {isDone ? '✓' : hub.number}
              </span>
              <div className="hub-tab-info">
                <span className="hub-tab-label">{hub.label}</span>
                <span className="hub-tab-sublabel">{hub.sublabel}</span>
              </div>
              {isDone && <span className="hub-tab-done-tag">مكتمل</span>}
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <div className="hub-tab-content">
        {/* Hub Tab 1: Flashcards (الحفظ والاسترجاع) */}
        {activeHubTab === 'flashcards' && (
          <section className="hub-subpage-container" aria-label="محطة الحفظ والاسترجاع">
            <FlashcardsPage embedded />
          </section>
        )}

        {/* Hub Tab 2: Merged Interactive Activities (التثبيت والتطبيق) */}
        {activeHubTab === 'interactive' && (
          <section className="interactive-hub-section" aria-label="محطة الأنشطة التطبيقية">
            <div className="activity-tabs" role="tablist" aria-label="تمارين التطبيق">
              <button
                id="activity-tab-classify"
                role="tab"
                tabIndex={activeActivityTab === 'classify' ? 0 : -1}
                aria-selected={activeActivityTab === 'classify'}
                aria-controls="activity-panel"
                className={`activity-tab ${activeActivityTab === 'classify' ? 'activity-tab--active' : ''}`}
                type="button"
                onClick={() => setActiveActivityTab('classify')}
              >
                <span className="activity-tab__number"><bdi>01</bdi></span>
                <span>الفرز والتمييز السريع</span>
              </button>

              <button
                id="activity-tab-compare"
                role="tab"
                tabIndex={activeActivityTab === 'compare' ? 0 : -1}
                aria-selected={activeActivityTab === 'compare'}
                aria-controls="activity-panel"
                className={`activity-tab ${activeActivityTab === 'compare' ? 'activity-tab--active' : ''}`}
                type="button"
                onClick={() => setActiveActivityTab('compare')}
              >
                <span className="activity-tab__number"><bdi>02</bdi></span>
                <span>الفروق والأحكام الشرعية</span>
              </button>
            </div>

            <div id="activity-panel" className="activity-panel" role="tabpanel">
              {activeActivityTab === 'classify' && (
                <FastClassifyActivity items={unit.activities.classify} key="fast-classify" onComplete={handleCompleteInteractive} />
              )}
              {activeActivityTab === 'compare' && (
                <ComparisonActivity items={unit.activities.difference} key="compare-diff" onComplete={handleCompleteInteractive} />
              )}
            </div>
          </section>
        )}

        {/* Hub Tab 3: Exams & Bac (الامتحانات والتقويم) */}
        {activeHubTab === 'assessment' && (
          <section className="assessment-hub-section" aria-label="محطة الامتحانات والتقويم">
            <nav className="assessment-switcher" aria-label="أقسام الامتحانات">
              <button
                type="button"
                className={`assessment-switcher__btn ${assessmentSubTab === 'quiz' ? 'assessment-switcher__btn--active' : ''}`}
                onClick={() => setAssessmentSubTab('quiz')}
                aria-pressed={assessmentSubTab === 'quiz'}
              >
                <span>اختبر نفسك ({unit.quiz.length} سؤالاً)</span>
                {progress.latestQuizScore !== undefined && (
                  <span className="assessment-switcher__badge"><bdi>{progress.latestQuizScore}%</bdi></span>
                )}
              </button>

              <button
                type="button"
                className={`assessment-switcher__btn ${assessmentSubTab === 'bac' ? 'assessment-switcher__btn--active' : ''}`}
                onClick={() => setAssessmentSubTab('bac')}
                aria-pressed={assessmentSubTab === 'bac'}
              >
                <span>تدريبات البكالوريا</span>
                {progress.completedSections.includes(sectionKey(unit, 'activity-bac-practice')) && (
                  <span className="assessment-switcher__badge">✓ تم التدريب</span>
                )}
              </button>
            </nav>

            <div className="assessment-view">
              {assessmentSubTab === 'quiz' ? (
                <QuizPage embedded />
              ) : (
                <BacPage embedded />
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
