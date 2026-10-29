import { studentPracticeQuestions } from '../data';
import { PageHeading } from '../components/PageHeading';

export function BacPage({ embedded }: { embedded?: boolean } = {}) {
  return (
    <div className={`bac-page${embedded ? ' bac-page--embedded' : ' page-wrap inner-page'}`}>
      {!embedded && (
        <PageHeading
          eyebrow="مراجعة تطبيقية"
          title="تدرّب على أسئلة الوحدة"
          description="حاول الإجابة بنفسك، ثم افتح الإجابة النموذجية للمراجعة."
          action={<button className="button button--outline print-button" type="button" onClick={() => window.print()}>طباعة الصفحة <span aria-hidden="true">⎙</span></button>}
        />
      )}
      <div className="practice-overview"><span className="practice-overview__count"><bdi>{studentPracticeQuestions.length}</bdi> تطبيقًا</span><p>ابدأ بما تعرفه، ثم راجع النقاط التي تحتاج إلى تثبيت.</p></div>
      <section className="practice-list" aria-label="أسئلة وتطبيقات الوحدة">
        {studentPracticeQuestions.map((question, index) => (
          <article className="practice-card" key={question.id}>
            <header className="practice-card__header">
              <span className="practice-card__number"><bdi>{String(index + 1).padStart(2, '0')}</bdi></span>
              <div><p className="eyebrow">سؤال للتطبيق</p><h2>تطبيق {index + 1}</h2></div>
            </header>
            <div className="practice-card__body">
              {question.passage && <blockquote className="practice-passage"><p>{question.passage}</p></blockquote>}
              <p className="practice-prompt">{question.prompt}</p>
              <details className="practice-answer">
                <summary>اعرض الإجابة النموذجية</summary>
                <ol>{question.modelAnswer.map((point) => <li key={point}>{point}</li>)}</ol>
              </details>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
