import { useRef } from 'react';
import { useProgress } from '../context/useProgress';

export function ResetProgressButton({ compact = false }: { compact?: boolean }) {
  const { resetProgress } = useProgress();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
    cancelRef.current?.focus();
  }

  function closeDialog() {
    dialogRef.current?.close();
    triggerRef.current?.focus();
  }

  function confirm() {
    resetProgress();
    closeDialog();
  }

  return (
    <>
      <button
        ref={triggerRef}
        className={compact ? 'button button--quiet button--small' : 'button button--outline'}
        type="button"
        onClick={openDialog}
      >
        إعادة ضبط التقدم
      </button>

      {/* Native dialog: backdrop styling is handled via ::backdrop pseudo-element by the CSS team */}
      <dialog
        ref={dialogRef}
        className="confirm-dialog"
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
        onClose={() => triggerRef.current?.focus()}
      >
        <p className="eyebrow">إدارة بيانات هذا الجهاز</p>
        <h2 id="reset-dialog-title">هل تريد مسح تقدمك؟</h2>
        <p id="reset-dialog-description">
          سيُمسح إنجاز المحاور ونتائج الاختبار وحالة البطاقات المحفوظة محليًا في هذا المتصفح. لا يمكن التراجع عن ذلك.
        </p>
        <div className="button-row">
          <button ref={cancelRef} className="button button--outline" type="button" onClick={closeDialog}>
            إلغاء
          </button>
          <button className="button button--danger" type="button" onClick={confirm}>
            نعم، امسح التقدم
          </button>
        </div>
      </dialog>
    </>
  );
}

