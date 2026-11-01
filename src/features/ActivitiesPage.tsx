import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeading } from '../components/PageHeading';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { Feedback } from '../components/Feedback';
import { FlashcardsPage } from './FlashcardsPage';
import { QuizPage } from './QuizPage';
import { BacPage } from './BacPage';
import { useProgress } from '../context/useProgress';

type ActivityTab = 'classify' | 'compare';

interface ClassificationItem {
  prompt: string;
  type: 'method' | 'penalty';
  answer: string;
  choices: string[];
  explanation: string;
}

const classificationItems: ClassificationItem[] = [
  // Phase 1: Method distinction (وقائي أم علاجي)
  {
    prompt: 'تقوية الإيمان والوازع الديني في قلب المسلم',
    type: 'method',
    answer: 'وقائي',
    choices: ['وقائي', 'علاجي/عقابي'],
    explanation: 'تقوية الإيمان وسيلة وقائية تعمل قبل وقوع الجريمة لحماية الفرد والمجتمع.',
  },
  {
    prompt: 'تطبيق حد السرقة بقطع اليد بعد ثبوت الجريمة',
    type: 'method',
    answer: 'علاجي/عقابي',
    choices: ['وقائي', 'علاجي/عقابي'],
    explanation: 'تطبيق الحدود وسيلة علاجية عقابية تُنفّذ بعد وقوع الجريمة ردعاً وزجراً.',
  },
  {
    prompt: 'الحث على الصلاة والعبادات ومكارم الأخلاق',
    type: 'method',
    answer: 'وقائي',
    choices: ['وقائي', 'علاجي/عقابي'],
    explanation: 'الصلاة والعبادات تنهى عن الفحشاء والمنكر وتزكي النفس وقائياً.',
  },
  {
    prompt: 'الحكم بالقصاص في القتل العمد أو الدية عند عفو الأولياء',
    type: 'method',
    answer: 'علاجي/عقابي',
    choices: ['وقائي', 'علاجي/عقابي'],
    explanation: 'القصاص والدية من وسائل المنهج العلاجي بعد وقوع الاعتداء.',
  },
  {
    prompt: 'استشعار مراقبة الله عز وجل والخشية من عقابه الأخروي',
    type: 'method',
    answer: 'وقائي',
    choices: ['وقائي', 'علاجي/عقابي'],
    explanation: 'الوازع الإيماني ومراقبة الله حصن وقائي داخلي يمنع ارتكاب المعصية.',
  },
  {
    prompt: 'عقوبة الغرامة أو السجن التي يقررها القاضي في الرشوة',
    type: 'method',
    answer: 'علاجي/عقابي',
    choices: ['وقائي', 'علاجي/عقابي'],
    explanation: 'التعزير بالحبس أو الغرامة وسيلة علاجية بعد وقوع الجريمة.',
  },

  // Phase 2: Penalty classification (حدود، قصاص، دية، تعزير)
  {
    prompt: 'سرقة مال محرز خفية استوفى شروطه ونصابه',
    type: 'penalty',
    answer: 'الحدود',
    choices: ['الحدود', 'القصاص', 'الدية', 'التعزير'],
    explanation: 'السرقة المستوفية للشروط عقوبتها مقدّرة شرعاً (حد السرقة: قطع اليد).',
  },
  {
    prompt: 'الاعتداء بالقتل العمد مع ترصد الجاني للضحية',
    type: 'penalty',
    answer: 'القصاص',
    choices: ['الحدود', 'القصاص', 'الدية', 'التعزير'],
    explanation: 'الجناية العمدية على النفس عقوبتها الأصلية القصاص بالمماثلة.',
  },
  {
    prompt: 'تسبب سائق في وفاة شخص نتيجة حادث سير عن غير قصد (قتل خطأ)',
    type: 'penalty',
    answer: 'الدية',
    choices: ['الحدود', 'القصاص', 'الدية', 'التعزير'],
    explanation: 'القتل الخطأ تجب فيه الدية المسلّمة لأهل القتيل مع الكفارة، ولا قصاص في الخطأ.',
  },
  {
    prompt: 'ترويع المارة وقطع الطريق وسلب الأموال بالقوة (الحرابة)',
    type: 'penalty',
    answer: 'الحدود',
    choices: ['الحدود', 'القصاص', 'الدية', 'التعزير'],
    explanation: 'الحرابة من جرائم الحدود المقدرة شرعاً في سورة المائدة.',
  },
  {
    prompt: 'التزوير في المحررات الرسمية وشهادة الزور ورشوة الموظف',
    type: 'penalty',
    answer: 'التعزير',
    choices: ['الحدود', 'القصاص', 'الدية', 'التعزير'],
    explanation: 'الرشوة والتزوير لم يُقدّر الشرع عقوبة محددة لها، فيقدّرها القاضي تعزيراً بحسب المصلحة.',
  },
  {
    prompt: 'رمي المسلم المحصن بالزنا دون إحضار أربعة شهود (القذف)',
    type: 'penalty',
    answer: 'الحدود',
    choices: ['الحدود', 'القصاص', 'الدية', 'التعزير'],
    explanation: 'القذف عقوبته مقدّرة شرعاً بـ 80 جلدة حفظاً للعرض وهو من الحدود.',
  },
];

function FastClassifyActivity({ onComplete }: { onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const current = classificationItems[index];

  function check() {
    if (!current || !choice || checked !== null) return;
    const correct = choice === current.answer;
    setChecked(correct);
    if (correct) setScore((value) => value + 1);
  }

  function next() {
    if (index === classificationItems.length - 1) {
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
        <p>النتيجة النهائية: <strong><bdi>{score}</bdi> من <bdi>{classificationItems.length}</bdi></strong> إجابة صحيحة</p>
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
          المسألة <bdi>{index + 1}</bdi> من <bdi>{classificationItems.length}</bdi>
          {current.type === 'method' ? ' · (فرز المنهج)' : ' · (تصنيف العقوبة)'}
        </span>
        <div className="step-dots" aria-hidden="true">
          {classificationItems.map((_, i) => (
            <i key={i} className={i <= index ? 'step-dots__active' : ''} />
          ))}
        </div>
      </div>

      <p className="eyebrow">
        {current.type === 'method' ? 'هل المثال يتبع المنهج الوقائي أم العلاجي؟' : 'ما نوع العقوبة الشرعية المقررة لهذا المثال؟'}
      </p>
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
            {index === classificationItems.length - 1 ? 'عرض النتيجة النهائية' : 'المسألة التالية'} <span aria-hidden="true">←</span>
          </button>
        )}
      </div>
    </div>
  );
}

const comparisonHeaders = ['وجه المقارنة', 'الحدود', 'القصاص والدية', 'التعزير'];

const comparisonRows = [
  ['المفهوم الأساسي', 'عقوبة مقدّرة شرعاً تجب حقاً لله تعالى', 'القصاص: معاقبة الجاني بالمثل · الدية: بدل مالي عند العفو', 'عقوبة غير مقدّرة شرعاً يقدّرها القاضي بحسب المصلحة'],
  ['التقدير والضبط', 'مقدّرة بدقة ولا تجوز الزيادة أو النقصان', 'مقدّرة (المماثلة في القصاص، ومقادير الدية مقدرة شرعاً)', 'غير مقدّرة وتختلف باختلاف الجريمة والجاني والمصلحة'],
  ['إمكانية العفو والشفاعة', 'لا عفو ولا شفاعة بعد وصول الأمر إلى القاضي', 'يقبل العفو من أولياء الدم (مجاناً أو مع الدية)', 'يقبل العفو والشفاعة إذا اقتضت المصلحة الشرعية ذلك'],
  ['الحق الغالب', 'حق الله تعالى (الحق العام وحفظ النظام)', 'حق العبد والمجني عليه وأوليائه غالب', 'حق الله تعالى والمجتمع هو الغالب'],
  ['المقصد الشرعي الأساسي', 'حفظ الكليات الخمس الكبرى ردعاً للمعتدي', 'حفظ النفس وصيانتها وحقن دماء المجتمع', 'تأديب الجاني وإصلاحه وحفظ النظام العام بما لم يُنص عليه'],
];

const comparisonQuestions = [
  {
    prompt: 'أي عقوبة لا تسقط فيها الشفاعة أو العفو إطلاقاً بعد أن تبلغ القاضي؟',
    answer: 'الحدود',
    explanation: 'الحدود حق خالص لله تعالى، فلا عفو فيها ولا شفاعة بعد بلوغها الحاكم/القاضي.',
  },
  {
    prompt: 'في أي نوع من العقوبات يجوز لأولياء المجني عليه العفو مجاناً أو مقابل بدل مالي؟',
    answer: 'القصاص والدية',
    explanation: 'القصاص حق للمجني عليه وأوليائه، فيحق لهم العفو أو المطالبة بالدية.',
  },
  {
    prompt: 'أي نوع من العقوبات متروك تقديرها نوعاً ومقداراً لاجتهاد القاضي وفق المصلحة؟',
    answer: 'التعزير',
    explanation: 'التعزير غير مقدر شرعاً، ويترك للقاضي تقدير الجزاء الأنسب للردع والإصلاح.',
  },
  {
    prompt: 'ما العقوبة الواجبة في القتل الخطأ والجنايات غير العمدية؟',
    answer: 'القصاص والدية',
    explanation: 'تجب الدية المسلّمة مع الكفارة، ولا قصاص في الخطأ إطلاقاً.',
  },
  {
    prompt: 'في أي عقوبة يكون الحق الغالب هو حق المجني عليه وأوليائه؟',
    answer: 'القصاص والدية',
    explanation: 'حق الآدمي هو الغالب في القصاص والدية، لذلك يملك العفو فيه.',
  },
  {
    prompt: 'عقوبات كالحبس أو الغرامة المالية أو التوبيخ تندرج تحت باب:',
    answer: 'التعزير',
    explanation: 'هذه العقوبات تعزيرية يختارها القاضي بحسب جسامة المخالفة وظروفها.',
  },
];

function ComparisonActivity({ onComplete }: { onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const choices = ['الحدود', 'القصاص والدية', 'التعزير'];
  const current = comparisonQuestions[index];

  function check() {
    if (!current || !choice || checked !== null) return;
    const correct = choice === current.answer;
    setChecked(correct);
    if (correct) setScore((value) => value + 1);
  }

  function next() {
    if (index === comparisonQuestions.length - 1) {
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
        <p>النتيجة: <strong><bdi>{score}</bdi> من <bdi>{comparisonQuestions.length}</bdi></strong> إجابة صحيحة</p>
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
      <ResponsiveTable caption="جدول مقارنة أنواع العقوبات في الإسلام" headers={comparisonHeaders} rows={comparisonRows} />

      <section className="comparison-question">
        <div className="activity-step__meta">
          <span>السؤال <bdi>{index + 1}</bdi> من <bdi>{comparisonQuestions.length}</bdi></span>
          <div className="step-dots" aria-hidden="true">
            {comparisonQuestions.map((_, i) => (
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
              {index === comparisonQuestions.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'} <span aria-hidden="true">←</span>
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
  const isFlashcardsDone = progress.masteredFlashcardIds.length >= 6 || progress.completedSections.includes('flashcards');
  const isInteractiveDone = progress.completedSections.includes('activity-interactive');
  const isAssessmentDone = progress.latestQuizScore !== undefined || progress.completedSections.includes('bac-practice');

  const completedHubCount = (isFlashcardsDone ? 1 : 0) + (isInteractiveDone ? 1 : 0) + (isAssessmentDone ? 1 : 0);

  function handleCompleteInteractive() {
    markSectionComplete('activity-interactive');
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
                <FastClassifyActivity key="fast-classify" onComplete={handleCompleteInteractive} />
              )}
              {activeActivityTab === 'compare' && (
                <ComparisonActivity key="compare-diff" onComplete={handleCompleteInteractive} />
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
                <span>اختبر نفسك (20 سؤالاً)</span>
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
                {progress.completedSections.includes('bac-practice') && (
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
