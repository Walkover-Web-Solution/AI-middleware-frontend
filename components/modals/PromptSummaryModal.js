import { useCustomSelector } from '@/customHooks/customSelector';
import { genrateSummaryAction, updateBridgeAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Modal from '../UI/Modal';

// Reusable Agent Summary Content Component
export const AgentSummaryContent = ({ params, autoGenerateSummary = false, setAutoGenerateSummary = () => {}, showTitle = true, showButtons = true, onSave = () => {}, isMandatory = false, showValidationError = false, prompt, versionId }) => {
    const dispatch = useDispatch();
    const { bridge_summary } = useCustomSelector((state) => ({
        bridge_summary: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridge_summary,
    }));
    const [summary, setSummary] = useState(bridge_summary || "");
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const textareaRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setSummary(bridge_summary);
    }, [bridge_summary, params, versionId]);

    // Auto-generate summary when flag is true
    useEffect(() => {
        if (autoGenerateSummary && setAutoGenerateSummary) {
            handleGenerateSummary();
        }
    }, [autoGenerateSummary, setAutoGenerateSummary]);
    const handleGenerateSummary = useCallback(async () => {
        if(prompt.trim() === "")
        {
            setErrorMessage("Prompt is required")
            return 
        }
        setIsGeneratingSummary(true);
        try {
            const result = await dispatch(genrateSummaryAction({ versionId: versionId }));
            if (result) {
                setSummary(result);
                setAutoGenerateSummary(false); // Reset the flag
            }
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [dispatch, params, prompt, versionId]);
    const handleClose=()=>{
        closeModal(modalType); 
        setErrorMessage("");
        setSummary(bridge_summary)
        setAutoGenerateSummary(false); // Reset the flag

    }
    const handleSaveSummary = useCallback(() => {
        const newValue = summary || "";
        const dataToSend = { bridge_summary: newValue };
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend })).then((data) => {
            if (data.success) {
                onSave(newValue); // Call the callback for external handling
            }
        });
    }, [dispatch, params.id, summary, onSave]);

    return (
        <div className="space-y-4">
            {(showTitle || showButtons) && (
                <div className="flex justify-between items-center">
                    {showTitle && (
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            Agent Summary
                            {isMandatory && <span className="text-red-500">*</span>}
                        </h3>
                    )}
                    {showButtons && (
                        <div className="flex gap-2">
                            <button
                                className={`btn btn-ghost btn-sm ${isGeneratingSummary ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleGenerateSummary}
                                disabled={isGeneratingSummary}
                            >   
                                <span className="capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                                    {isGeneratingSummary ? 'Generating Summary...' : 'Generate New Summary'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {errorMessage && <span className="text-red-500 text-sm block">{errorMessage}</span>}
            {showValidationError && (!summary || summary.trim() === "") && (
                <span className="text-red-500 text-sm block">Summary is required before publishing</span>
            )}
            
            <div className="space-y-2">
                <textarea
                    ref={textareaRef}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className={`textarea bg-white dark:bg-black/15 textarea-bordered w-full min-h-32 resize-y focus:border-primary caret-base-content p-2 ${
                        showValidationError && (!summary || summary.trim() === "") ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="Enter agent summary..."
                    disabled={isGeneratingSummary}
                />
                <div className="flex gap-2">
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={handleSaveSummary}
                        disabled={isGeneratingSummary || bridge_summary === summary}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// Original Modal Component
const PromptSummaryModal = ({ modalType, params, autoGenerateSummary = false, setAutoGenerateSummary = () => {} }) => {
    const handleClose = () => {
        closeModal(modalType); 
        setAutoGenerateSummary(false);
    };

    return (
        <Modal MODAL_ID={modalType}>
            <div className="modal-box w-11/12 max-w-5xl">
                <AgentSummaryContent 
                    params={params}
                    autoGenerateSummary={autoGenerateSummary}
                    setAutoGenerateSummary={setAutoGenerateSummary}
                    showTitle={true}
                    onSave={() => closeModal(modalType)}
                />
                <div className="modal-action">
                    <button className="btn btn-sm" onClick={handleClose}>Close</button>
                </div>
            </div>
        </Modal>
    );
};

export default PromptSummaryModal;
