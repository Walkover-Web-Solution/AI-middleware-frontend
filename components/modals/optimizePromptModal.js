import { optimizePromptApi } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { optimizePromptReducer } from '@/store/reducer/bridgeReducer';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { CopyIcon, RedoIcon, UndoIcon } from '@/components/Icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import ComparisonCheck from '@/utils/comparisonCheck';
import Canvas from '../Canvas';

function OptmizePromptModal({ savePrompt, setPrompt, params, messages, setMessages }) {
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedPrompt, setStreamedPrompt] = useState("");

  useEffect(() => {
    setPromptRequirement(prompt);
    setNewPrompt(optimizePromptHistory[optimizePromptHistory?.length - 1]);
  }, [prompt]);

  useEffect(() => {
    setPromptHistory(optimizePromptHistory);
    setCurrentIndex(optimizePromptHistory.length);
  }, [optimizePromptHistory]);

  const diffData = useMemo(() => {
    const displayPrompt = isStreaming ? streamedPrompt : newPrompt;
    if (!displayPrompt) return [];
    return createDiff(promptRequirement, displayPrompt);
  }, [promptRequirement, newPrompt, streamedPrompt, isStreaming]);

  const OptimizePrompt = async (instructionText) => {
    setLoading(true);
    setStreamedPrompt(""); // Clear streamed content

    try {
      const response = await optimizePromptApi({
        query: instructionText,
        bridge_id: params.id,
        version_id: params.version,
      });

      const result = typeof response === 'string' ? JSON.parse(response) : response?.data ?? response;
      const updatedPrompt = result?.updated || result?.description || result;

      setLoading(false);

      // Start streaming the prompt
      simulateStreaming(updatedPrompt, setStreamedPrompt, setIsStreaming, () => {
        setNewPrompt(updatedPrompt);
        dispatch(optimizePromptReducer({ bridgeId: params.id, prompt: updatedPrompt }));
      });

      return result;
    } catch (error) {
      setLoading(false);
      return "Failed to optimize prompt.";
    }
  };

  const handleInsert = () => {
    const promptToInsert = isStreaming ? streamedPrompt : newPrompt;
    if (promptToInsert) {
      // Create a synthetic event object to match savePrompt's expected format
      const syntheticEvent = {
        target: { value: promptToInsert }
      };
      setPrompt(promptToInsert); // Update local state immediately
      savePrompt(syntheticEvent);
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setErrorMessage("");
    setNewPrompt("");
    setStreamedPrompt("");
    setIsStreaming(false);
    setDiff(false);
    closeModal(MODAL_TYPE.OPTIMIZE_PROMPT);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setNewPrompt(promptHistory[currentIndex - 1]);
      setStreamedPrompt("");
      setIsStreaming(false);
    }
  };

  const handleRedo = () => {
    if (currentIndex < promptHistory.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setNewPrompt(promptHistory[currentIndex + 1]);
      setStreamedPrompt("");
      setIsStreaming(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = isStreaming ? streamedPrompt : newPrompt;
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy Prompt"), 2000);
    navigator.clipboard.writeText(textToCopy);
  };

  // Get the current prompt to display (streaming or final)
  const displayPrompt = isStreaming ? streamedPrompt : newPrompt;

  return (
    <dialog id={MODAL_TYPE.OPTIMIZE_PROMPT} className="modal">
      <div className="modal-box max-w-[100rem] bg-white flex flex-col">
        {/* Fixed Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg">Improve prompt</h3>
          <button
            className={`btn btn-sm right-20 mr-0 btn-primary`}
            onClick={() => setDiff(prev => !prev)}
            type="button"
          >
            {diff ? "Instructions" : "Show Diff"}
          </button>
        </div>

        <div className='flex h-full overflow-auto gap-3 w-full max-h-[700px]'>
          <div className='w-full h-full'>
            {!diff ? (
              <>
                <Canvas
                  OptimizePrompt={OptimizePrompt}
                  messages={messages}
                  setMessages={setMessages}
                />
                {errorMessage && <span className="text-red-500">{errorMessage}</span>}
              </>
            ) : (
              <ComparisonCheck diffData={diffData} isStreaming={isStreaming} handleUndo={handleUndo} handleRedo={handleRedo} copyToClipboard={copyToClipboard} copyText={copyText} currentIndex={currentIndex} promptHistory={promptHistory} displayPrompt={displayPrompt} errorMessage={errorMessage} key="prompt"/>
            )}
          </div>

          {!diff && (displayPrompt || isStreaming) ? (
            <div className='w-full h-full pt-3'>
              <div className='flex justify-between'>
                <div className="label">
                  <span className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                    AI generated prompt
                    {isStreaming && (
                      <span className="ml-2 text-sm text-gray-500 animate-pulse">
                        ✨ Generating...
                      </span>
                    )}
                  </span>
                </div>
                <div className="label gap-2">
                  <div className="tooltip cursor-pointer" data-tip="Previous Prompt">
                    <UndoIcon onClick={handleUndo} className={!currentIndex && "opacity-50 pointer-events-none"} />
                  </div>
                  <div className="tooltip tooltip-left cursor-pointer" data-tip="Next Prompt">
                    <RedoIcon onClick={handleRedo} />
                  </div>
                  <div className="tooltip tooltip-left cursor-pointer" data-tip={copyText || "Copy Prompt"}>
                    <CopyIcon onClick={copyToClipboard} size={20} />
                  </div>
                </div>
              </div>
              <div className="relative">
                <textarea
                  className="textarea textarea-bordered border mt-3 focus:border-primary caret-black p-2 w-full"
                  style={{ height: "60vh", width: "100%" }}
                  value={displayPrompt}
                  onChange={(e) => {
                    if (!isStreaming) {
                      setNewPrompt(e.target.value);
                    }
                  }}
                  readOnly={isStreaming}
                />
                {isStreaming && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white px-2 py-1 rounded-md shadow-sm border">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-600">Streaming</span>
                  </div>
                )}
              </div>
            </div>
          ) : !diff && (
            <div className='w-full h-full flex flex-col min-h-0'>
              <div className="flex-1 min-h-0">
                <textarea
                  className="textarea textarea-bordered border focus:border-primary caret-black p-2 w-full h-full resize-none"
                  value={prompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="modal-action mt-4 flex-shrink-0">
          <form method="dialog" className='flex gap-2'>
            <button
              className="btn"
              onClick={handleCloseModal}
              disabled={isStreaming}
            >
              Close
            </button>
            <button
              type='button'
              className="btn btn-primary"
              disabled={loading || isStreaming || !displayPrompt}
              onClick={handleInsert}
            >
              {(loading || isStreaming) && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              Apply
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

export default React.memo(OptmizePromptModal);