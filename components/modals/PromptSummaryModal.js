import { useCustomSelector } from '@/customHooks/customSelector';
import { genrateSummaryAction, updateBridgeAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { PencilIcon } from '@/components/Icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Modal from '../UI/Modal';

const PromptSummaryModal = ({ modalType, params, searchParams, autoGenerateSummary = false, setAutoGenerateSummary=()=>{} }) => {
    const dispatch = useDispatch();
    const { bridge_summary, prompt } = useCustomSelector((state) => ({
        bridge_summary: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridge_summary,
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.prompt || "",
    }));
    const [summary, setSummary] = useState(bridge_summary || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const textareaRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setSummary(bridge_summary);
    }, [bridge_summary, params, searchParams]);

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
            const result = await dispatch(genrateSummaryAction({ versionId: searchParams?.version }));
            if (result) {
                setSummary(result);
                setAutoGenerateSummary(false); // Reset the flag

            }
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [dispatch, params, prompt, searchParams]);
    const handleClose=()=>{
        closeModal(modalType); 
        setErrorMessage("");
        setSummary(bridge_summary)
        setAutoGenerateSummary(false); // Reset the flag

    }
    const handleSaveSummary = useCallback(() => {
        const newValue = textareaRef.current?.value || summary || "";
        const dataToSend = { bridge_summary: newValue };
        setSummary(newValue);
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend })).then((data) => {
            if (data.success) {
                closeModal(modalType);
                toast.success('Summary updated successfully');
            }
        });
        setIsEditing(false);
    }, [dispatch, params.id, summary]);

    const renderSummaryViewer = () => (
        <div className="space-y-2">
            <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-base-content min-h-16 max-h-96 overflow-y-auto">{summary}</p>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)} disabled={isGeneratingSummary}>
                        <PencilIcon size={16} />
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSummaryEditor = () => (
        <div className="space-y-2">
            <textarea
                ref={textareaRef}
                value={summary}
                onChange={(e)=>setSummary(e.target.value)}
                className="textarea bg-white dark:bg-black/15 textarea-bordered w-full min-h-96 resize-y focus:border-primary caret-base-content p-2"
            />
            <button className="btn btn-ghost btn-sm" onClick={() => { setIsEditing(false); setSummary(bridge_summary) }}>
                Cancel
            </button>
        </div>
    );

    return (
        <Modal MODAL_ID={modalType}>
            <div className="modal-box w-11/12 max-w-5xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Prompt Summary</h3>
                    {!autoGenerateSummary && (
                    <button
                        className={`btn btn-ghost btn-sm ${isGeneratingSummary ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                    >   
                        <span className="capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                            {isGeneratingSummary ? 'Generating Summary...' : 'Generate New Summary'}
                        </span>
                    </button>
                    )}
                </div>
                {errorMessage && <span className="text-red-500">{errorMessage}</span>}
                <div className="space-y-2">
                    {isEditing ? (
                        renderSummaryEditor()
                    ) : summary ? (
                        renderSummaryViewer()
                    ) : (
                        autoGenerateSummary && prompt.trim() !== "" ? (
                            <div className="bg-base-200 p-4 rounded-lg">
                                <p className="text-base-content text-center">generating summary...</p>
                            </div>
                        ) : (
                            <div className="bg-base-200 p-4 rounded-lg">
                                <p className="text-base-content text-center">No summary generated yet</p>
                            </div>
                        )
                    )}
                </div>
                <div className="modal-action">
                    <div className="flex gap-2">
                        <button className="btn btn-sm" onClick={() => {handleClose()}}>Close</button>
                        <button
                            className="btn btn-primary btn-sm"
                            disabled={isGeneratingSummary || bridge_summary === summary}
                            onClick={handleSaveSummary}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default PromptSummaryModal;
