import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { unitContent } from '../data';
import { PageHeading } from '../components/PageHeading';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { Feedback } from '../components/Feedback';
import { FlashcardsPage } from './FlashcardsPage';
import { QuizPage } from './QuizPage';
import { BacPage } from './BacPage';

type ActivityTab = 'classify' | 'match' | 'compare' | 'fill';
type ClassificationItem = { prompt: string; answer: 'وقائي' | 'علاجي/عقابي'; explanation: string };
type FillBlankItem = { before: string; after?: string; answer: string; acceptedAnswers?: string[]; explanation: string };

const prevention = unitContent.fullUnitText.section_2_preventive_method;
const penaltyGroups = unitContent.fullUnitText.section_3_curative_method_penalties.types_of_penalties;
const getGroup = (category: string) => penaltyGroups.find((group) => group.category === category);
const getDetail = (category: string, crime: string) => getGroup(category)?.crimes_and_details.find((detail) => detail.crime === crime);

const classificationItems: ClassificationItem[] = [
  { prompt: 'تقوية الإيمان والوازع الديني', answer: 'وقائي', explanation: prevention.means_1_strengthening_faith.explanation },
  { prompt: 'تطبيق الحدود بعد وقوع الجريمة', answer: 'علاجي/عقابي', explanation: getGroup('الحدود')?.definition ?? '' },
  { prompt: 'الحث على العبادات ومكارم الأخلاق', answer: 'وقائي', explanation: prevention.means_2_worship_and_ethics.explanation },
  { prompt: 'عقوبة القصاص في الجناية العمدية (أو الدية عند العفو)', answer: 'علاجي/عقابي', explanation: getGroup('القصاص')?.definition ?? '' },
  { prompt: 'استحضار مراقبة الله قبل الإقدام على الفعل', answer: 'وقائي', explanation: prevention.means_1_strengthening_faith.explanation },
  { prompt: 'التعزير في الجرائم التي لا حدّ مقدّرًا فيها', answer: 'علاجي/عقابي', explanation: getGroup('التعزير')?.definition ?? '' },
  { prompt: 'العبادات التي تزكي النفس وتنهى عن الفحشاء والمنكر', answer: 'وقائي', explanation: prevention.means_2_worship_and_ethics.explanation },
  { prompt: 'عقوبة السرقة بعد وقوعها', answer: 'علاجي/عقابي', explanation: getDetail('الحدود', 'السرقة')?.penalty ?? '' },
  { prompt: 'تقوية الوازع الديني في سلوك الفرد', answer: 'وقائي', explanation: prevention.means_1_strengthening_faith.explanation },
  { prompt: 'ردع الجريمة بعقوبة يقدّرها القاضي بحسب المصلحة', answer: 'علاجي/عقابي', explanation: getGroup('التعزير')?.definition ?? '' },
  { prompt: 'الحث على الصلاة ومكارم الأخلاق', answer: 'وقائي', explanation: prevention.means_2_worship_and_ethics.explanation },
  { prompt: 'القصاص في القتل العمد والجناية العمدية', answer: 'علاجي/عقابي', explanation: getDetail('القصاص', 'القتل العمد والجناية العمدية')?.penalty ?? '' },
];

const matchRows = [
  { crime: 'السرقة', category: 'الحدود', explanation: getDetail('الحدود', 'السرقة')?.penalty ?? '' },
  { crime: 'القذف', category: 'الحدود', explanation: getDetail('الحدود', 'القذف')?.penalty ?? '' },
  { crime: 'الحرابة', category: 'الحدود', explanation: getDetail('الحدود', 'الحرابة')?.penalty ?? '' },
  { crime: 'الزنا', category: 'الحدود', explanation: getDetail('الحدود', 'الزنا')?.penalty ?? '' },
  { crime: 'القتل العمد والجناية العمدية', category: 'القصاص', explanation: 'العقوبة الأصلية: القصاص بالمماثلة، وتجب الدية إذا عفا الأولياء.' },
  { crime: 'القتل الخطأ والجناية الخطأ', category: 'الدية', explanation: 'العقوبة الواجبة في القتل الخطأ هي الدية المسلمة مع الكفارة الشرعية (بديلة عن القصاص، ولا قصاص في الخطأ إطلاقاً).' },
  { crime: 'الرشوة والتزوير', category: 'التعزير', explanation: getGroup('التعزير')?.definition ?? '' },
  { crime: 'احتكار الأسعار ومخالفة المرور', category: 'التعزير', explanation: getGroup('التعزير')?.definition ?? '' },
];

const fillBlankItems: FillBlankItem[] = [
  { before: 'الجريمة هي محظورات شرعية زجر عنها الله بحد أو قصاص أو ', after: '.', answer: 'تعزير', acceptedAnswers: ['التعزير'], explanation: 'يكتمل التعريف بذكر التعزير.' },
  { before: 'يعمل المنهج الوقائي ', after: ' وقوع الجريمة.', answer: 'قبل', acceptedAnswers: ['قبيل'], explanation: 'يرتبط المنهج الوقائي بما يسبق وقوع الجريمة.' },
  { before: 'يُطبّق المنهج العلاجي/العقابي ', after: ' وقوع الجريمة.', answer: 'بعد', acceptedAnswers: ['عقب', 'إثر'], explanation: 'يرتبط المنهج العلاجي بما يأتي بعد وقوع الجريمة.' },
  { before: 'من وسائل المنهج الوقائي: تقوية الإيمان والوازع ', after: '.', answer: 'الديني', acceptedAnswers: ['الإيماني'], explanation: 'هذه إحدى وسيلتي المنهج الوقائي.' },
  { before: 'من وسائل المنهج الوقائي الحث على العبادات ومكارم ', after: '.', answer: 'الأخلاق', acceptedAnswers: ['الخلق'], explanation: 'هذه هي الوسيلة الوقائية الثانية المذكورة.' },
  { before: 'المقصد من حد السرقة هو حفظ ', after: '.', answer: 'المال', acceptedAnswers: ['الأموال'], explanation: 'يرتبط حد السرقة بمقصد حفظ المال.' },
  { before: 'المقصد من حد شرب الخمر هو حفظ ', after: '.', answer: 'العقل', explanation: 'يرتبط هذا المقصد بحفظ العقل.' },
  { before: 'العقوبة غير المقدّرة شرعًا التي يقدّرها القاضي هي ', after: '.', answer: 'التعزير', acceptedAnswers: ['تعزير'], explanation: 'التعزير غير مقدّر ويترك تقديره للقاضي بحسب المصلحة.' },
  { before: 'العقوبة التي تكون بالمماثلة في النفس وما دونها هي ', after: '.', answer: 'القصاص', acceptedAnswers: ['قصاص'], explanation: 'القصاص معاقبة الجاني بمثل ما فعل.' },
  { before: 'من أنواع العقوبات المقدّرة شرعًا: ', after: '.', answer: 'الحدود', acceptedAnswers: ['حدود', 'الحد'], explanation: 'الحدود نوع من أنواع العقوبات المذكورة.' },
  { before: 'من مقاصد التشريع حفظ الكليات ', after: '.', answer: 'الخمس', acceptedAnswers: ['خمس'], explanation: 'تُذكر الكليات الخمس ضمن مقاصد التشريع.' },
  { before: 'الجرائم التي لا حدّ مقدّرًا فيها تدخل ضمن جرائم ', after: '.', answer: 'التعزير', acceptedAnswers: ['تعزيرية'], explanation: 'يرتبط التعزير بالجرائم التي لا حدّ مقدّرًا فيها.' },
];

const tabs: { id: ActivityTab; label: string; number: string; description: string }[] = [
  { id: 'classify', label: 'التصنيف', number: '01', description: 'ميّز بين المنهج الوقائي والمنهج العلاجي/العقابي.' },
  { id: 'match', label: 'المطابقة', number: '02', description: 'اربط كل مثال بنوع العقوبة المناسب.' },
  { id: 'compare', label: 'المقارنة', number: '03', description: 'قارن بين أنواع العقوبات ثم أجب عن سبعة أسئلة قصيرة.' },
  { id: 'fill', label: 'أكمل الفراغ', number: '04', description: 'استرجع الكلمات الأساسية؛ وتُقبل مرادفات قريبة في بعض الإجابات.' },
];

function ClassificationActivity() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const current = classificationItems[index];
  const baseChoices = ['وقائي', 'علاجي/عقابي'];
  const choices = index % 4 < 2 ? baseChoices : [...baseChoices].reverse();

  function check() {
    if (!current || !choice || checked !== null) return;
    const correct = choice === current.answer;
    setChecked(correct);
    if (correct) setScore((value) => value + 1);
  }

  function next() {
    if (index === classificationItems.length - 1) setFinished(true);
    else { setIndex((value) => value + 1); setChoice(null); setChecked(null); }
  }

  function retry() { setIndex(0); setChoice(null); setChecked(null); setFinished(false); setScore(0); }

  if (finished) return (
    <div className="activity-result" role="status">
      <span className="result-seal" aria-hidden="true">✓</span><p className="eyebrow">اكتمل التصنيف</p><h3>أحسنت، انتهيت من الأمثلة</h3><p>إجابات صحيحة: <strong><bdi>{score}</bdi> من <bdi>{classificationItems.length}</bdi></strong></p><button className="button button--outline" type="button" onClick={retry}>أعد النشاط</button>
    </div>
  );
  if (!current) return null;

  return (
    <div className="activity-step">
      <div className="activity-step__meta"><span>المثال <bdi>{index + 1}</bdi> من <bdi>{classificationItems.length}</bdi></span><div className="step-dots" aria-hidden="true">{classificationItems.map((item, i) => <i className={i <= index ? 'step-dots__active' : ''} key={item.prompt} />)}</div></div>
      <div className="classification-prompt"><p className="eyebrow">صنّف المثال</p><h3>{current.prompt}</h3></div>
      <fieldset className="choice-fieldset"><legend>هل المثال من المنهج الوقائي أم العلاجي/العقابي؟</legend><div className="choice-grid">
        {choices.map((value) => <button key={value} className={`choice-button${choice === value ? ' choice-button--selected' : ''}`} type="button" aria-pressed={choice === value} disabled={checked !== null} onClick={() => setChoice(value)}><span className="choice-button__bullet" aria-hidden="true">{choice === value ? '✓' : ''}</span>المنهج {value}</button>)}
      </div></fieldset>
      {checked !== null && <Feedback correct={checked} title={checked ? 'تصنيف صحيح' : `الإجابة: المنهج ${current.answer}`}>{current.explanation}</Feedback>}
      <div className="activity-controls"><button className="button button--navy" type="button" onClick={check} disabled={!choice || checked !== null}>تأكيد التصنيف</button>{checked !== null && <button className="button button--copper" type="button" onClick={next}>{index === classificationItems.length - 1 ? 'عرض النتيجة' : 'المثال التالي'} <span aria-hidden="true">←</span></button>}</div>
    </div>
  );
}

function MatchingActivity() {
  const choices = useMemo(() => ['الحدود', 'القصاص', 'الدية', 'التعزير'], []);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const correct = matchRows.filter((row) => answers[row.crime] === row.category).length;

  function retry() { setAnswers({}); setSubmitted(false); }

  return (
    <div className="matching-activity">
      <p className="activity-instruction">اختر نوع العقوبة المناسب لكل مثال، ثم تحقّق من إجاباتك.</p>
      <div className="match-list">
        {matchRows.map((row, index) => {
          const offset = index % choices.length;
          const orderedChoices = [...choices.slice(offset), ...choices.slice(0, offset)];
          return (
            <div className={`match-row${submitted ? answers[row.crime] === row.category ? ' match-row--correct' : ' match-row--incorrect' : ''}`} key={row.crime}>
              <span className="match-row__number"><bdi>{String(index + 1).padStart(2, '0')}</bdi></span>
              <strong>{row.crime}</strong>
              <label className="select-wrap"><span className="sr-only">اختر نوع عقوبة: {row.crime}</span><select value={answers[row.crime] ?? ''} disabled={submitted} onChange={(event) => setAnswers((current) => ({ ...current, [row.crime]: event.target.value }))}><option value="">اختر نوع العقوبة</option>{orderedChoices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}</select></label>
              {submitted && <div className="match-row__feedback"><span aria-hidden="true">{answers[row.crime] === row.category ? '✓' : '!'}</span><span>{answers[row.crime] === row.category ? row.explanation : `التصنيف الصحيح: ${row.category}. ${row.explanation}`}</span></div>}
            </div>
          );
        })}
      </div>
      <div className="activity-controls">{!submitted ? <button className="button button--navy" type="button" disabled={matchRows.some((row) => !answers[row.crime])} onClick={() => setSubmitted(true)}>تحقّق من المطابقة</button> : <><p className="score-inline">النتيجة: <strong><bdi>{correct}</bdi> من <bdi>{matchRows.length}</bdi></strong></p><button className="button button--outline" type="button" onClick={retry}>أعد النشاط</button></>}</div>
    </div>
  );
}

function ComparisonActivity() {
  const comparison = unitContent.bac.predicted_practice_tables.comparison_table_penalties;
  const headers = comparison.headers;
  const choices = headers.slice(1);
  const getCell = (dimension: string, categoryIndex: number) => comparison.rows.find((row) => row[0] === dimension)?.[categoryIndex] ?? '';
  const questions = [
    { prompt: `أي نوع وُصف في «التقدير والضبط» بأنه: «${getCell('التقدير والضبط', 3)}»؟`, answer: headers[3] ?? 'التعزير', explanation: `تظهر العبارة في عمود ${headers[3] ?? 'التعزير'} ضمن صف «التقدير والضبط».` },
    { prompt: `أي نوع وُصف في «التقدير والضبط» بأنه: «${getCell('التقدير والضبط', 1)}»؟`, answer: headers[1] ?? 'الحدود', explanation: `تظهر العبارة في عمود ${headers[1] ?? 'الحدود'} ضمن صف «التقدير والضبط».` },
    { prompt: `أي نوع وُصف في «التقدير والضبط» بأنه: «${getCell('التقدير والضبط', 2)}»؟`, answer: headers[2] ?? 'القصاص', explanation: `تظهر العبارة في عمود ${headers[2] ?? 'القصاص'} ضمن صف «التقدير والضبط».` },
    { prompt: `في أي نوع وردت إمكانية العفو «${getCell('إمكانية العفو', 1)}»؟`, answer: headers[1] ?? 'الحدود', explanation: `تظهر هذه العبارة في عمود ${headers[1] ?? 'الحدود'} ضمن صف «إمكانية العفو».` },
    { prompt: `في أي نوع يقبل العفو والدية من الأولياء؟`, answer: headers[2] ?? 'القصاص', explanation: `يذكر صف «إمكانية العفو» قبول العفو والدية من الأولياء في عمود ${headers[2] ?? 'القصاص'}.` },
    { prompt: `في أي نوع يقبل العفو حسب المصلحة الشرعية؟`, answer: headers[3] ?? 'التعزير', explanation: `يذكر صف «إمكانية العفو» قبول العفو حسب المصلحة الشرعية في عمود ${headers[3] ?? 'التعزير'}.` },
    { prompt: `في أي نوع يكون الحق الغالب «${getCell('الحق الغالب', 2)}»؟`, answer: headers[2] ?? 'القصاص', explanation: `تظهر هذه العبارة في عمود ${headers[2] ?? 'القصاص'} ضمن صف «الحق الغالب».` },
  ];
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const current = questions[index];
  const orderedChoices = [...choices.slice(index % choices.length), ...choices.slice(0, index % choices.length)];

  function checkAnswer() {
    if (!current || !choice || checked !== null) return;
    const correct = choice === current.answer;
    setChecked(correct);
    if (correct) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (index === questions.length - 1) setFinished(true);
    else { setIndex((value) => value + 1); setChoice(''); setChecked(null); }
  }

  function retry() { setIndex(0); setChoice(''); setChecked(null); setScore(0); setFinished(false); }

  if (finished) return <div className="activity-result" role="status"><span className="result-seal" aria-hidden="true">✓</span><p className="eyebrow">اكتملت المقارنة</p><h3>أحسنت، أنهيت أسئلة المقارنة</h3><p>إجابات صحيحة: <strong><bdi>{score}</bdi> من <bdi>{questions.length}</bdi></strong></p><button className="button button--outline" type="button" onClick={retry}>أعد المقارنة</button></div>;
  if (!current) return null;

  return (
    <div className="comparison-activity">
      <p className="activity-instruction">قارن بين الأنواع، ثم أجب عن الأسئلة السبعة واحدًا تلو الآخر.</p>
      <ResponsiveTable caption="جدول مقارنة أنواع العقوبات" headers={headers} rows={comparison.rows} />
      <section className="comparison-question">
        <div className="activity-step__meta"><span>السؤال <bdi>{index + 1}</bdi> من <bdi>{questions.length}</bdi></span><div className="step-dots" aria-hidden="true">{questions.map((question, questionIndex) => <i className={questionIndex <= index ? 'step-dots__active' : ''} key={question.prompt} />)}</div></div>
        <p className="eyebrow">سؤال تطبيق</p><h3>{current.prompt}</h3>
        <fieldset className="choice-fieldset"><legend>اختر الإجابة</legend><div className="choice-grid">{orderedChoices.map((item) => <button type="button" key={item} className={`choice-button${choice === item ? ' choice-button--selected' : ''}`} aria-pressed={choice === item} disabled={checked !== null} onClick={() => setChoice(item)}><span className="choice-button__bullet" aria-hidden="true">{choice === item ? '✓' : ''}</span>{item}</button>)}</div></fieldset>
        {checked !== null && <Feedback correct={checked} title={checked ? 'إجابة صحيحة' : `الإجابة: ${current.answer}`}>{current.explanation}</Feedback>}
        <div className="activity-controls">{checked === null ? <button className="button button--navy" type="button" disabled={!choice} onClick={checkAnswer}>تحقّق من الإجابة</button> : <button className="button button--copper" type="button" onClick={nextQuestion}>{index === questions.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'} <span aria-hidden="true">←</span></button>}</div>
      </section>
    </div>
  );
}

function normalizeArabicAnswer(value: string) {
  return value.normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{Script=Arabic}\p{Number}]/gu, '')
    .trim();
}

function FillBlankActivity() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const current = fillBlankItems[index];
  const correct = current ? [current.answer, ...(current.acceptedAnswers ?? [])].some((candidate) => normalizeArabicAnswer(answer) === normalizeArabicAnswer(candidate)) : false;

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || checked !== null || !answer.trim()) return;
    setChecked(correct);
    if (correct) setScore((value) => value + 1);
  }

  function next() {
    if (index === fillBlankItems.length - 1) setFinished(true);
    else { setIndex((value) => value + 1); setAnswer(''); setChecked(null); }
  }

  function retry() { setIndex(0); setAnswer(''); setChecked(null); setScore(0); setFinished(false); }

  if (finished) return <div className="activity-result" role="status"><span className="result-seal" aria-hidden="true">✓</span><p className="eyebrow">اكتمل التدريب</p><h3>أحسنت، أنهيت إكمال الفراغات</h3><p>إجابات صحيحة: <strong><bdi>{score}</bdi> من <bdi>{fillBlankItems.length}</bdi></strong></p><button className="button button--outline" type="button" onClick={retry}>أعد النشاط</button></div>;
  if (!current) return null;

  return (
    <div className="fill-blank-activity">
      <div className="activity-step__meta"><span>السؤال <bdi>{index + 1}</bdi> من <bdi>{fillBlankItems.length}</bdi></span><div className="step-dots" aria-hidden="true">{fillBlankItems.map((_, i) => <i className={i <= index ? 'step-dots__active' : ''} key={i} />)}</div></div>
      <form onSubmit={verify}>
        <label className="fill-blank-question" htmlFor="fill-blank-answer"><span className="eyebrow">أكمل الفراغ</span><span>{current.before}<span className="blank-mark" aria-hidden="true">ــــــــــــ</span>{current.after}</span></label>
        <div className="fill-blank-entry"><input id="fill-blank-answer" type="text" autoComplete="off" value={answer} disabled={checked !== null} onChange={(event) => setAnswer(event.target.value)} /><button className="button button--navy" type="submit" disabled={!answer.trim() || checked !== null}>تحقّق</button></div>
        <p className="fill-blank-guidance">تُقبل المرادفات القريبة حين تحافظ على معنى الجملة.</p>
      </form>
      {checked !== null && <Feedback correct={checked} title={checked ? 'إجابة صحيحة' : `الإجابة: ${current.answer}`}>{current.explanation}</Feedback>}
      {checked !== null && <div className="activity-controls"><button className="button button--copper" type="button" onClick={next}>{index === fillBlankItems.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'} <span aria-hidden="true">←</span></button></div>}
    </div>
  );
}

type HubTab = 'interactive' | 'flashcards' | 'quiz' | 'bac';

interface HubTabItem {
  id: HubTab;
  label: string;
  badge: string;
  icon: string;
  description: string;
}

const hubTabs: HubTabItem[] = [
  {
    id: 'interactive',
    label: 'الأنشطة التطبيقية',
    badge: '4 أنشطة',
    icon: '🎯',
    description: 'صنّف الأمثلة، وطابق العقوبات، وقارن بينها، وأكمل الفراغات مع التغذية الراجعة الفورية.',
  },
  {
    id: 'flashcards',
    label: 'البطاقات الذكية',
    badge: '20 بطاقة',
    icon: '🗂️',
    description: 'استرجاع نشط وسريع من الذاكرة مع إمكانية التقليب، والخلط، وتصنيف البطاقات المتقنة.',
  },
  {
    id: 'quiz',
    label: 'اختبر فهمك',
    badge: '20 سؤالاً',
    icon: '📝',
    description: 'تقويم ذاتي شامل بنمطي التدريب الفوري مع التفسير والتعليل، ونمط الاختبار الزمني مع النتيجة.',
  },
  {
    id: 'bac',
    label: 'تدريبات البكالوريا',
    badge: '7 تطبيقات',
    icon: '🎓',
    description: 'تطبيقات وأسئلة امتحانات البكالوريا الرسمية المنهجية مع كشف الإجابات النموذجية وسلم التنقيط.',
  },
];

export function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeHubTab: HubTab = (rawTab && ['interactive', 'flashcards', 'quiz', 'bac'].includes(rawTab))
    ? (rawTab as HubTab)
    : 'interactive';

  const [activeActivityTab, setActiveActivityTab] = useState<ActivityTab>('classify');

  function setHubTab(tab: HubTab) {
    setSearchParams({ tab });
  }

  const activeActivity = tabs.find((tab) => tab.id === activeActivityTab) ?? tabs[0]!;

  return (
    <div className="page-wrap inner-page activities-hub-page">
      <PageHeading
        eyebrow="التطبيق والممارسة والتقويم"
        title="الأنشطة والتقويم"
        description="مركز تطبيقي متكامل يجمع الأنشطة التفاعلية، البطاقات الذكية، اختبار الفهم، وتطبيقات البكالوريا في مكان واحد."
      />

      <nav className="hub-nav-tabs" role="tablist" aria-label="أقسام الأنشطة والتقويم">
        {hubTabs.map((hub) => (
          <button
            key={hub.id}
            role="tab"
            type="button"
            aria-selected={activeHubTab === hub.id}
            className={`hub-tab-btn ${activeHubTab === hub.id ? 'hub-tab-btn--active' : ''}`}
            onClick={() => setHubTab(hub.id)}
          >
            <span className="hub-tab-icon" aria-hidden="true">{hub.icon}</span>
            <span className="hub-tab-label">{hub.label}</span>
            <span className="hub-tab-badge">{hub.badge}</span>
          </button>
        ))}
      </nav>

      <div className="hub-tab-content">
        {activeHubTab === 'interactive' && (
          <section className="interactive-hub-section" aria-label="الأنشطة التطبيقية التفاعلية">
            <div className="activity-tabs" role="tablist" aria-label="أنواع الأنشطة">
              {tabs.map((tab) => (
                <button
                  id={`activity-tab-${tab.id}`}
                  key={tab.id}
                  role="tab"
                  tabIndex={activeActivityTab === tab.id ? 0 : -1}
                  aria-selected={activeActivityTab === tab.id}
                  aria-controls="activity-panel"
                  className={`activity-tab${activeActivityTab === tab.id ? ' activity-tab--active' : ''}`}
                  type="button"
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                      event.preventDefault();
                      const currentIndex = tabs.findIndex((item) => item.id === tab.id);
                      const direction = event.key === 'ArrowLeft' ? 1 : -1;
                      const nextTab = tabs[(currentIndex + direction + tabs.length) % tabs.length];
                      if (nextTab) {
                        setActiveActivityTab(nextTab.id);
                        document.getElementById(`activity-tab-${nextTab.id}`)?.focus();
                      }
                    }
                  }}
                  onClick={() => setActiveActivityTab(tab.id)}
                >
                  <span className="activity-tab__number"><bdi>{tab.number}</bdi></span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <section id="activity-panel" className="activity-panel" role="tabpanel" aria-labelledby={`activity-tab-${activeActivityTab}`}>
              <header className="activity-panel__heading">
                <p className="eyebrow">النشاط {activeActivity.number}</p>
                <h2 id="activity-heading">{activeActivity.label}</h2>
                <p>{activeActivity.description}</p>
              </header>
              {activeActivityTab === 'classify' && <ClassificationActivity key="classification" />}
              {activeActivityTab === 'match' && <MatchingActivity key="matching" />}
              {activeActivityTab === 'compare' && <ComparisonActivity key="comparison" />}
              {activeActivityTab === 'fill' && <FillBlankActivity key="fill" />}
            </section>
          </section>
        )}

        {activeHubTab === 'flashcards' && (
          <section className="hub-subpage-container" aria-label="البطاقات التعليمية">
            <FlashcardsPage embedded />
          </section>
        )}

        {activeHubTab === 'quiz' && (
          <section className="hub-subpage-container" aria-label="اختبر فهمك">
            <QuizPage embedded />
          </section>
        )}

        {activeHubTab === 'bac' && (
          <section className="hub-subpage-container" aria-label="تدريبات البكالوريا">
            <BacPage embedded />
          </section>
        )}
      </div>
    </div>
  );
}
