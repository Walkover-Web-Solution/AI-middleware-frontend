import { optimizePromptApi } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { optimizePromptReducer } from '@/store/reducer/bridgeReducer';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { Copy, Redo, Undo } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PromptCanvas from '../PromptCanvas';

function OptmizePromptModal({ params }) {
  const dispatch = useDispatch();
  const { prompt, optimizePromptHistory } = useCustomSelector((state) => ({
    prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.prompt || "",
    optimizePromptHistory: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.optimizePromptHistory || [],
  }));

  const [diff, setDiff] = useState(false);
  const [promptRequirement, setPromptRequirement] = useState(prompt);
  const [loading, setLoading] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [promptHistory, setPromptHistory] = useState(optimizePromptHistory);
  const [currentIndex, setCurrentIndex] = useState(optimizePromptHistory.length);
  const [copyText, setCopyText] = useState("Copy Prompt");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setPromptRequirement(prompt);
  }, [prompt]);

  useEffect(() => {
    setPromptHistory(optimizePromptHistory);
    setCurrentIndex(optimizePromptHistory.length);
  }, [optimizePromptHistory]);

  const OptimizePrompt = async (instructionText) => {
    if (!promptRequirement.trim()) {
      setErrorMessage("Prompt is required");
      return "Prompt requirement is empty.";
    }
    setLoading(true);
    try {
      const response = await optimizePromptApi({
        query: instructionText,
        bridge_id: params.id,
        version_id: params.version,
      });
        const result =
       typeof response === 'string' ? JSON.parse(response) : response?.data ?? response;
       const updatedPrompt = result.updated || result;
      setNewPrompt(updatedPrompt);
      dispatch(optimizePromptReducer({ bridgeId: params.id, prompt: updatedPrompt }));
      return result;
    } catch (error) {
      return "Failed to optimize prompt.";
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = (e) => {
    setErrorMessage("");
    e.preventDefault();
    setNewPrompt("");
    closeModal(MODAL_TYPE.OPTIMIZE_PROMPT);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setNewPrompt(promptHistory[currentIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentIndex < promptHistory.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setNewPrompt(promptHistory[currentIndex + 1]);
    }
  };

  const copyToClipboard = () => {
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy Prompt"), 2000);
    navigator.clipboard.writeText(newPrompt);
  };

  return (
    <dialog id={MODAL_TYPE.OPTIMIZE_PROMPT} className="modal">
      <div className="modal-box w-11/12 max-w-7xl bg-white">
       <div className="flex justify-between items-center mb-4">
         <h3 className="font-bold text-lg">Improve prompt</h3>
      <button
           className={`btn btn-sm btn-primary"}`}
           onClick={() => setDiff(prev => !prev)}
           type="button"
        >
    {diff ? "instructions" : "Show Diff"}
  </button>
</div>

        <div className='flex gap-3 w-full'>
          <div className='w-full'>
            {!diff ? (
              <PromptCanvas OptimizePrompt={OptimizePrompt} />
            ) : (
              <>
                <div className="label">
                  <span className="label-text">Current Prompt or Requirement</span>
                </div>
                <textarea
                  className="textarea textarea-bordered border w-full h-[60vh] focus:border-primary caret-black p-2"
                  key={promptRequirement}
                  defaultValue={promptRequirement}
                  onBlur={(e) => setPromptRequirement(e.target.value)}
                  readOnly
                />
                {errorMessage && <span className="text-red-500">{errorMessage}</span>}
              </>
            )}
          </div>

          {newPrompt ? (
            <div className='w-full'>
              <div className='flex justify-between'>
                <div className="label">
                  <span className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">AI generated prompt</span>
                </div>
                <div className="label gap-2">
                  <div className="tooltip cursor-pointer" data-tip="Previous Prompt">
                    <Undo onClick={handleUndo} className={!currentIndex && "opacity-50 pointer-events-none"} />
                  </div>
                  <div className="tooltip tooltip-left cursor-pointer" data-tip="Next Prompt">
                    <Redo onClick={handleRedo} />
                  </div>
                  <div className="tooltip tooltip-left cursor-pointer" data-tip={copyText}>
                    <Copy onClick={copyToClipboard} size={20} />
                  </div>
                </div>
              </div>
              <textarea
                className="textarea textarea-bordered border w-full min-h-96 resize-y focus:border-primary caret-black p-2"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
              />
            </div>
          ) : (
            <div className='w-full flex items-center justify-center'>
              <div className="w-full min-h-96 flex items-center justify-center text-gray-500">
                Click "Improve" to generate an AI prompt
              </div>
            </div>
          )}
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={handleCloseModal}>Close</button>
            <button className="btn btn-primary ml-2" disabled={loading} onClick={(e) => OptimizePrompt("Improve the current prompt")}>
              {loading && <span className="loading loading-spinner"></span>}Improve
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

export default React.memo(OptmizePromptModal);
