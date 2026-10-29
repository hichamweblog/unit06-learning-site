import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { unitContent, type QuizQuestion } from '../data';
import { useProgress } from '../context/useProgress';
import { calculateQuizScore, shuffleItems, type AnswerMap } from '../lib/quiz';
import { PageHeading } from '../components/PageHeading';
import { Feedback } from '../components/Feedback';
import { Callout } from '../components/Callout';

export type QuizMode = 'practice' | 'exam';

function ModeSelection({ onStart }: { onStart: (mode: QuizMode, shuffled: boolean) => void }) {
  const [shuffled, setShuffled] = useState(false);
  return (
    <div className="quiz-start">
      <p className="eyebrow">بنك الأسئلة</p><h2>اختر طريقة المراجعة</h2>
      <div className="mode-grid">
        <button className="mode-card" type="button" onClick={() => onStart('practice', shuffled)}><span className="mode-card__icon" aria-hidden="true">↺</span><h3>تدرّب مع التغذية الراجعة</h3><p>أكّد إجابتك لتظهر الإجابة الصحيحة والتلميح والتفسير مباشرة.</p><span className="text-link">ابدأ التدريب <span aria-hidden="true">←</span></span></button>
        <button className="mode-card mode-card--copper" type="button" onClick={() => onStart('exam', shuffled)}><span className="mode-card__icon" aria-hidden="true">◎</span><h3>اختبر نفسك</h3><p>أجب عن الأسئلة، ثم اعرض الدرجة والتفسيرات بعد إنهاء المحاولة.</p><span className="text-link">ابدأ الاختبار <span aria-hidden="true">←</span></span></button>
      </div>
      <label className="shuffle-control"><input type="checkbox" checked={shuffled} onChange={(event) => setShuffled(event.target.checked)} /><span className="custom-check" aria-hidden="true">✓</span>خلط ترتيب الأسئلة</label>
      <div className="quiz-start__count">عدد أسئلة المراجعة: <strong><bdi>{unitContent.quiz.length}</bdi></strong></div>
    </div>
  );
}

function HintNote({ text, className = '' }: { text: string; className?: string }) {
  return (
    <p className={`hint-note${className ? ` ${className}` : ''}`}>
      <svg className="hint-note__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9.5 18h5M10.5 21h3M15.2 14.5c1.1-.9 1.8-2.2 1.8-3.7a5 5 0 1 0-10 0c0 1.5.7 2.8 1.8 3.7.8.7 1.2 1.6 1.2 2.5h4c0-.9.4-1.8 1.2-2.5Z" />
      </svg>
      <span><strong>التلميح:</strong> {text}</span>
    </p>
  );
}

function FinishDialog({ unanswered, onCancel, onConfirm }: { unanswered: number; onCancel: () => void; onConfirm: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      dialog?.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="finish-dialog-title"
      onClose={onCancel}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <p className="eyebrow">قبل عرض النتيجة</p>
      <h2 id="finish-dialog-title">إنهاء المحاولة؟</h2>
      <p>{unanswered > 0 ? <>لم تؤكد إجابة <strong><bdi>{unanswered}</bdi></strong> سؤالًا. ستظهر هذه الأسئلة في المراجعة بوصفها غير مجابة، ولن تُحتسب صحيحة.</> : 'تم تأكيد إجابات جميع الأسئلة.'}</p>
      <div className="button-row">
        <button className="button button--outline" type="button" onClick={onCancel}>العودة للأسئلة</button>
        <button className="button button--navy" type="button" onClick={onConfirm}>إنهاء وعرض النتيجة</button>
      </div>
    </dialog>
  );
}

function ResultView({ mode, questions, answers, elapsedTime, onRetry }: { mode: QuizMode; questions: QuizQuestion[]; answers: AnswerMap; elapsedTime?: number; onRetry: () => void }) {
  const score = calculateQuizScore(questions, answers);
  const incorrect = questions.filter((question) => score.wrongQuestionIds.includes(question.id));
  const correctQuestions = questions.filter((question) => !score.wrongQuestionIds.includes(question.id));
  const categories = new Map<string, { total: number; wrong: number }>();
  for (const question of questions) {
    const category = question.category ?? 'غير مصنف';
    const value = categories.get(category) ?? { total: 0, wrong: 0 };
    value.total += 1;
    if (score.wrongQuestionIds.includes(question.id)) value.wrong += 1;
    categories.set(category, value);
  }

  return (
    <section className="quiz-results" aria-labelledby="results-title" aria-live="polite">
      <div className="quiz-results__hero">
        <span className="result-seal" aria-hidden="true">{score.percent >= 70 ? '✓' : '↺'}</span>
        <p className="eyebrow">{mode === 'exam' ? 'نتيجة الاختبار' : 'ملخص التدريب'}</p>
        <h2 id="results-title">{score.correct} من {score.total} إجابة صحيحة</h2>
        <div className="score-ring" aria-label={`النتيجة ${score.percent} بالمئة`}><strong><bdi>{score.percent}%</bdi></strong><span>من 100</span></div>
        <p className="quiz-results__sub">
          أُجيب عن <bdi>{score.answered}</bdi> من <bdi>{score.total}</bdi> سؤالًا · غير مجاب: <bdi>{score.unanswered}</bdi>
          {mode === 'exam' && elapsedTime !== undefined && (
            <> · الوقت المستغرق: <bdi>{Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}</bdi></>
          )}
        </p>
      </div>
      <div className="quiz-results__body">
        <section className="category-review"><h3>موضوعات للمراجعة</h3><ul>{[...categories.entries()].map(([name, value]) => <li key={name}><span>{name}</span><span>{value.wrong === 0 ? 'مستوى المراجعة جيد' : `للمراجعة: ${value.wrong} من ${value.total}`}</span></li>)}</ul></section>
        <div className="review-errors"><div className="review-errors__heading"><div><p className="eyebrow">تغذية راجعة تفسيرية</p><h3>مراجعة الإجابات</h3></div><span className="review-errors__count"><bdi>{incorrect.length}</bdi> سؤال</span></div>
          {incorrect.length === 0 ? <div className="empty-success"><span aria-hidden="true">✦</span><p>أحسنت! لا توجد إجابات خاطئة أو أسئلة غير مجابة.</p></div> : incorrect.map((question) => <article className="review-card" key={question.id}><p className="review-card__number">السؤال <bdi>{question.id}</bdi>{question.category ? ` · ${question.category}` : ''}</p><h4>{question.question}</h4><p className="review-card__chosen">اختيارك: {answers[question.id]?.confirmed ? question.options.find((option) => option.id === answers[question.id]?.selectedOptionId)?.text ?? '—' : 'لم تجب عن هذا السؤال.'}</p><p className="review-card__answer"><strong>الإجابة الصحيحة:</strong> {question.correctAnswerText}</p><HintNote text={question.hint} className="review-card__hint" /><p>{question.explanation}</p></article>)}
          {correctQuestions.length > 0 && <details className="quiz-correct-review"><summary>أظهر تلميحات وتفسيرات الإجابات الصحيحة (<bdi>{correctQuestions.length}</bdi>)</summary><div>{correctQuestions.map((question) => <article className="review-card" key={question.id}><p className="review-card__number">السؤال <bdi>{question.id}</bdi>{question.category ? ` · ${question.category}` : ''}</p><h4>{question.question}</h4><p className="review-card__answer"><strong>الإجابة الصحيحة:</strong> {question.correctAnswerText}</p><HintNote text={question.hint} className="review-card__hint" /><p>{question.explanation}</p></article>)}</div></details>}
        </div>
      </div>
      <div className="button-row quiz-results__actions">
        <button className="button button--navy" type="button" onClick={onRetry}>أعد الاختبار</button>
        <button className="button button--outline quiz-print-btn" type="button" onClick={() => window.print()}>طباعة النتيجة <span aria-hidden="true">⎙</span></button>
        <Link className="button button--outline" to="/learn">راجع الدرس</Link>
        <Link className="button button--text" to="/flashcards">انتقل إلى البطاقات <span aria-hidden="true">←</span></Link>
      </div>
    </section>
  );
}

export function QuizPage({ embedded }: { embedded?: boolean } = {}) {
  const { recordQuizScore } = useProgress();
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finishDialog, setFinishDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const current = questions[index];
  const currentAnswer = current ? answers[current.id] : undefined;
  const stats = useMemo(() => calculateQuizScore(questions, answers), [questions, answers]);

  useEffect(() => {
    if (mode !== 'exam' || finished) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [mode, finished]);

  useEffect(() => {
    if (!mode || finished) return;
    const motionOk = !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const target = document.querySelector('.question-card') || document.querySelector('.quiz-workspace');
    if (target) {
      target.scrollIntoView({ behavior: motionOk ? 'smooth' : 'instant', block: 'start' });
    }
  }, [index, mode, finished]);

  function choose(optionId: string) {
    if (!current || currentAnswer?.confirmed) return;
    setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: { selectedOptionId: optionId, confirmed: false } }));
    setMessage('');
  }

  function confirmAnswer() {
    if (!current || !currentAnswer?.selectedOptionId) { setMessage('اختر إجابة أولًا، أو انتقل إلى سؤال آخر دون إجابة.'); return; }
    if (currentAnswer.confirmed) return;
    setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: { ...currentAnswers[current.id]!, confirmed: true } }));
    setMessage('');
  }

  useEffect(() => {
    if (!mode || finished || !current || finishDialog) return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target.getAttribute('type') !== 'radio') {
        return;
      }

      if (['1', '2', '3', '4'].includes(event.key)) {
        const optionIndex = parseInt(event.key, 10) - 1;
        if (current && current.options[optionIndex]) {
          event.preventDefault();
          choose(current.options[optionIndex].id);
        }
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!current) return;
        const currentIndex = current.options.findIndex((opt) => opt.id === currentAnswer?.selectedOptionId);
        const nextIndex = event.key === 'ArrowDown'
          ? (currentIndex + 1) % current.options.length
          : (currentIndex - 1 + current.options.length) % current.options.length;
        const target = current.options[nextIndex >= 0 ? nextIndex : 0];
        if (target) choose(target.id);
      } else if (event.key === 'Enter') {
        if (currentAnswer?.selectedOptionId && !currentAnswer.confirmed) {
          event.preventDefault();
          confirmAnswer();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, finished, current, currentAnswer, finishDialog]);

  function start(nextMode: QuizMode, shuffled: boolean) {
    const nextQuestions = shuffled ? shuffleItems(unitContent.quiz) : [...unitContent.quiz];
    setMode(nextMode); setQuestions(nextQuestions); setAnswers({}); setIndex(0); setFinished(false); setFinishDialog(false); setMessage(''); setTimer(0);
  }

  function finish() {
    const result = calculateQuizScore(questions, answers);
    recordQuizScore(result.percent);
    setFinished(true); setFinishDialog(false);
    const motionOk = !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    window.scrollTo({ top: 0, behavior: motionOk ? 'smooth' : 'instant' });
  }

  function restart() {
    setMode(null); setQuestions([]); setAnswers({}); setIndex(0); setFinished(false); setFinishDialog(false); setMessage(''); setTimer(0);
    const motionOk = !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    window.scrollTo({ top: 0, behavior: motionOk ? 'smooth' : 'instant' });
  }
  const isLast = index === questions.length - 1;

  return (
    <div className={`quiz-page${embedded ? ' quiz-page--embedded' : ' page-wrap inner-page'}`}>
      {!embedded && (
        <PageHeading
          eyebrow="تقويم ذاتي · 20 سؤالًا"
          title="اختبر فهمك"
          description="اختر وضع التدريب للحصول على تغذية راجعة بعد كل إجابة، أو اختبر نفسك ثم راجع النتيجة في النهاية."
        />
      )}
      {!mode && <ModeSelection onStart={start} />}
      {mode && !finished && current && (
        <section className="quiz-workspace" aria-labelledby="question-text">
          <div className="quiz-topline">
            <button className="button button--text button--small" type="button" onClick={restart}>← تغيير وضع الاختبار</button>
            {mode === 'exam' && <span className="quiz-timer"><bdi>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</bdi></span>}
            <span className={`mode-badge${mode === 'exam' ? ' mode-badge--exam' : ''}`}>{mode === 'exam' ? 'اختبر نفسك' : 'تدرب مع التفسير'}</span>
          </div>
          <div className="quiz-progress"><div className="quiz-progress__label"><span>السؤال <bdi>{index + 1}</bdi> من <bdi>{questions.length}</bdi></span><span>تم تأكيد <bdi>{stats.answered}</bdi> إجابة</span></div><div className="quiz-progress__track" role="progressbar" aria-label="تقدم الاختبار" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={stats.answered}><span style={{ width: `${(stats.answered / Math.max(questions.length, 1)) * 100}%` }} /></div></div>
          <article className="question-card"><div className="question-card__meta"><span className="question-card__no"><bdi>{String(index + 1).padStart(2, '0')}</bdi></span><div><p className="eyebrow">{current.category ?? 'سؤال للمراجعة'}</p>{current.bloomLevel && <span className="question-card__level">{current.bloomLevel}</span>}</div></div>
            <fieldset className="quiz-fieldset" disabled={currentAnswer?.confirmed}><legend id="question-text">{current.question}</legend><div className="quiz-options">{current.options.map((option) => (
              <label className={`quiz-option${currentAnswer?.selectedOptionId === option.id ? ' quiz-option--selected' : ''}${currentAnswer?.confirmed && option.id === current.correctOptionId ? ' quiz-option--correct' : ''}${currentAnswer?.confirmed && currentAnswer.selectedOptionId === option.id && option.id !== current.correctOptionId ? ' quiz-option--wrong' : ''}`} key={option.id}>
                <input type="radio" name={`question-${current.id}`} value={option.id} checked={currentAnswer?.selectedOptionId === option.id} onChange={() => choose(option.id)} />
                <span className="quiz-option__indicator" aria-hidden="true">{currentAnswer?.confirmed && option.id === current.correctOptionId ? '✓' : ''}</span><span>{option.text}</span>
              </label>
            ))}</div></fieldset>
            {message && <p className="inline-message" role="alert">{message}</p>}
            {currentAnswer?.confirmed && mode === 'practice' && <div className="quiz-feedback-stack"><Feedback correct={currentAnswer.selectedOptionId === current.correctOptionId} title={currentAnswer.selectedOptionId === current.correctOptionId ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}><p><strong>الإجابة الصحيحة:</strong> {current.correctAnswerText}</p><HintNote text={current.hint} /><p>{current.explanation}</p></Feedback></div>}
            {currentAnswer?.confirmed && mode === 'exam' && <p className="answer-locked-note" role="status">تم حفظ اختيارك لهذه المحاولة. ستظهر التغذية الراجعة بعد إنهاء الاختبار.</p>}
            <div className="question-actions"><button className="button button--outline" type="button" disabled={index === 0} onClick={() => { setIndex((value) => value - 1); setMessage(''); }}>السؤال السابق</button><div className="question-actions__center">{!currentAnswer?.confirmed ? <button className="button button--navy" type="button" onClick={confirmAnswer}>تأكيد الإجابة</button> : <span className="confirmed-indicator">✓ تم التأكيد</span>}</div>{isLast ? <button className="button button--copper" type="button" onClick={() => setFinishDialog(true)}>إنهاء المحاولة</button> : <button className="button button--navy" type="button" onClick={() => { setIndex((value) => value + 1); setMessage(''); }}>السؤال التالي <span aria-hidden="true">←</span></button>}</div>
            <p className="keyboard-hint">استخدم الأرقام 1-4 للاختيار، و Enter للتأكيد</p>
          </article>
          <div className="quiz-question-nav" aria-label="الانتقال إلى سؤال"><span>انتقل إلى:</span>{questions.map((question, questionIndex) => <button key={question.id} type="button" aria-label={`السؤال ${questionIndex + 1}${answers[question.id]?.confirmed ? '، تمت الإجابة' : '، لم يجب'}`} aria-current={questionIndex === index ? 'step' : undefined} className={`${questionIndex === index ? 'quiz-question-nav__active' : ''}${answers[question.id]?.confirmed ? ' quiz-question-nav__answered' : ''}`} onClick={() => { setIndex(questionIndex); setMessage(''); }}><bdi>{questionIndex + 1}</bdi></button>)}</div>
          <Callout title="ما زال بإمكانك ترك سؤال بلا إجابة" tone="info"><p>لا تُحتسب الإجابة قبل الضغط على «تأكيد الإجابة». الأسئلة غير المؤكدة تُعرض في النتيجة بوضوح ولا تُحسب صحيحة.</p></Callout>
        </section>
      )}
      {finished && mode && <ResultView mode={mode} questions={questions} answers={answers} elapsedTime={timer} onRetry={restart} />}
      {finishDialog && <FinishDialog unanswered={questions.length - stats.answered} onCancel={() => setFinishDialog(false)} onConfirm={finish} />}
    </div>
  );
}
