import { useCustomSelector } from '@/customHooks/customSelector';
import { genrateSummaryAction, updateBridgeAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { PencilIcon } from '@/components/Icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const PromptSummaryModal = ({ params }) => {
    const dispatch = useDispatch();
    const { bridge_summary, prompt } = useCustomSelector((state) => ({
        bridge_summary: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridge_summary,
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.prompt || "",
    }));
    const [summary, setSummary] = useState(bridge_summary || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const textareaRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setSummary(bridge_summary);
    }, [bridge_summary, params]);

    const handleGenerateSummary = useCallback(async () => {
        if(prompt.trim() === "")
        {
            setErrorMessage("Prompt is required")
            return 
        }
        setIsGeneratingSummary(true);
        try {
            const result = await dispatch(genrateSummaryAction({ versionId: params?.version }));
            if (result) {
                setSummary(result);
            }
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [dispatch, params, prompt]);

    const handleSaveSummary = useCallback(() => {
        const newValue = textareaRef.current?.value || summary || "";
        const dataToSend = { bridge_summary: newValue };
        setSummary(newValue);
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend })).then((data) => {
            if (data.success) {
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
                className="textarea textarea-bordered w-full min-h-96 resize-y focus:border-primary caret-black p-2"
            />
            <button className="btn btn-ghost btn-sm" onClick={() => { setIsEditing(false); }}>
                Cancel
            </button>
        </div>
    );

    return (
        <dialog id={MODAL_TYPE.PROMPT_SUMMARY} className="modal">
            <div className="modal-box w-11/12 max-w-5xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Prompt Summary</h3>
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
                {errorMessage && <span className="text-red-500">{errorMessage}</span>}
                <div className="space-y-2">
                    {isEditing ? (
                        renderSummaryEditor()
                    ) : summary ? (
                        renderSummaryViewer()
                    ) : (
                        <div className="bg-base-200 p-4 rounded-lg">
                            <p className="text-base-content text-center">No summary generated yet</p>
                        </div>
                    )}
                </div>
                <div className="modal-action">
                    <div className="flex gap-2">
                        <button className="btn" onClick={() => {closeModal(MODAL_TYPE.PROMPT_SUMMARY); setErrorMessage("")}}>Close</button>
                        <button
                            className="btn btn-primary"
                            disabled={isGeneratingSummary || bridge_summary === summary}
                            onClick={handleSaveSummary}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
}

export default PromptSummaryModal;
