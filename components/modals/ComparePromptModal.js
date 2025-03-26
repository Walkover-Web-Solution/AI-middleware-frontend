import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { useEffect, useState } from 'react';
import { diffWords } from 'diff';

const ComparePromptModal = ({ reduxPrompt, pulblishedPrompt }) => {
  const [diffResult, setDiffResult] = useState([]);

  useEffect(() => {
    const generateDiff = () => {
      const diff = diffWords(pulblishedPrompt || '', reduxPrompt || '');
      setDiffResult(diff);
    };

    generateDiff();
  }, [reduxPrompt, pulblishedPrompt]);

  const renderDiff = () => {
    return diffResult.map((part, index) => {
      const color = part.added ? 'bg-green-100' : part.removed ? 'bg-red-100' : 'bg-transparent';
      return (
        <span key={index} className={color}>
          {part.value}
        </span>
      );
    });
  };

  return (
    <dialog id={MODAL_TYPE?.COMPARE_PROMPT_MODAL} className="modal">
      <div className="modal-box w-full max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl">Prompt Comparison</h3>
          <button 
            className="btn btn-sm btn-ghost"
            onClick={() => closeModal(MODAL_TYPE?.COMPARE_PROMPT_MODAL)}
          >
            ✕
          </button>
        </div>
        <div className="mt-2 max-h-[70vh] overflow-y-auto p-2 border rounded">
          <pre className="whitespace-pre-wrap">
            {renderDiff()}
          </pre>
        </div>

        <div className="modal-action mt-4">
          <button 
            className="btn btn-sm"
            onClick={() => closeModal(MODAL_TYPE?.COMPARE_PROMPT_MODAL)}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ComparePromptModal;
