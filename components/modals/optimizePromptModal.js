// OptimizePromptModal.jsx
import { optimizePromptApi } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { optimizePromptReducer } from '@/store/reducer/bridgeReducer';
import { MODAL_TYPE } from '@/utils/enums';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import OptimiseBaseModal from './OptimiseBaseModal';

function OptimizePromptModal({ savePrompt, setPrompt, params, messages, setMessages }) {
  const dispatch = useDispatch();
  const { prompt, optimizePromptHistory } = useCustomSelector((state) => ({
    prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.prompt || "",
    optimizePromptHistory: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.optimizePromptHistory || [],
  }));

  const [promptHistory, setPromptHistory] = useState(optimizePromptHistory);
  const [currentIndex, setCurrentIndex] = useState(optimizePromptHistory.length);

  useEffect(() => {
    setPromptHistory(optimizePromptHistory);
    setCurrentIndex(optimizePromptHistory.length);
  }, [optimizePromptHistory]);

  const handleOptimizeApi = async (instructionText, params) => {
    const response = await optimizePromptApi({
      query: instructionText,
      bridge_id: params.id,
      version_id: params.version,
    });

    const result = typeof response === 'string' ? JSON.parse(response) : response?.data ?? response;
    dispatch(optimizePromptReducer({ bridgeId: params.id, prompt: result?.updated }));
    return result;
  };

  const handleApply = async (promptToInsert) => {
    console.log(promptToInsert);
    savePrompt(promptToInsert);
    setPrompt(promptToInsert);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return promptHistory[currentIndex - 1];
    }
  };

  const handleRedo = () => {
    if (currentIndex < promptHistory.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return promptHistory[currentIndex + 1];
    }
  };

  return (
    <OptimiseBaseModal
      modalType={MODAL_TYPE.OPTIMIZE_PROMPT}
      title="Improve prompt"
      contentLabel="Prompt"
      content={prompt}
      optimizeApi={handleOptimizeApi}
      onApply={handleApply}
      params={params}
      messages={messages}
      setMessages={setMessages}
      showHistory={true}
      history={promptHistory}
      currentIndex={currentIndex}
      onUndo={handleUndo}
      onRedo={handleRedo}
    />
  );
}

export default React.memo(OptimizePromptModal);