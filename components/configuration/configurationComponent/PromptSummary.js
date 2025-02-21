import { CircleX, Pencil } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { genrateSummaryAction, updateBridgeAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';

const PromptSummary = ({ params }) => {
    const dispatch = useDispatch();
    const { bridge_summary } = useCustomSelector((state) => ({
        bridge_summary: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridge_summary
    }));
    const [summary, setSummary] = useState(bridge_summary || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        setSummary(bridge_summary);
    }, [bridge_summary, params]);

    const handleGenerateSummary = useCallback(async () => {
        setIsGeneratingSummary(true);
        try {
            const result = await dispatch(genrateSummaryAction({ versionId: params?.version }));
            if (result) {
                setSummary(result);
            }
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [dispatch, params]);

    const handleSaveSummary = useCallback(() => {
        const dataToSend = { bridge_summary: summary };
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend }));
        setIsEditing(false);
    }, [dispatch, params.id, summary]);

    const renderSummaryViewer = () => (
        <div className="space-y-2">
            <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-base-content min-h-16 max-h-52 overflow-y-auto">{summary}</p>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)} disabled={isGeneratingSummary}>
                        <Pencil size={16} />
                        Edit
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleSaveSummary} disabled={isGeneratingSummary}>
                        Save Summary
                    </button>
                </div>
                <button
                    className={`btn btn-ghost btn-sm ${isGeneratingSummary ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                >
                    <span className="capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                        {isGeneratingSummary ? 'Generating...' : 'Generate New Summary'}
                    </span>
                </button>
            </div>
        </div>
    );

    const renderSummaryEditor = () => (
        <div className="space-y-2">
            <textarea
                ref={textareaRef}
                defaultValue={summary}
                key={summary}
                className="textarea textarea-bordered w-full h-32"
            />
            <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => {
                    const newValue = textareaRef.current?.value || "";
                    setSummary(newValue);
                    setIsEditing(false);
                }}>
                    Save
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => {setIsEditing(false);}}>
                    Cancel
                </button>
            </div>
        </div>
    );

    return (
        <>
            <dialog id={MODAL_TYPE.PROMPT_SUMMARY} className="modal">
                <div className="modal-box w-11/12 max-w-2xl relative">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-6 top-6"><CircleX /></button>
                    </form>
                    <h3 className="font-bold text-lg mb-4">Prompt Summary</h3>
                    <div className="space-y-2">
                        {isEditing ? (
                            renderSummaryEditor()
                        ) : summary ? (
                            renderSummaryViewer()
                        ) : (
                            <button
                                className={`btn btn-ghost btn-sm w-full ${isGeneratingSummary ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleGenerateSummary}
                                disabled={isGeneratingSummary}
                            >
                                <span className="capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                                    {isGeneratingSummary ? 'Generating Summary...' : 'Generate Prompt Summary'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default PromptSummary;
