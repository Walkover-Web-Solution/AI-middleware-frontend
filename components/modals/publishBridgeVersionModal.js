import { useCustomSelector } from '@/customHooks/customSelector';
import { genrateSummaryAction, publishBridgeVersionAction, updateBridgeAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

function PublishBridgeVersionModal({ params }) {
    const dispatch = useDispatch();
    const {bridge_summary } = useCustomSelector((state) => ({
        bridge_summary : state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridge_summary
    }))
    const [summary, setSummary] = useState(bridge_summary || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    useEffect(()=>{
     setSummary(bridge_summary);
     setIsAccordionOpen(false);
    },[bridge_summary, params])

    const handleCloseModal = useCallback((e) => {
        e.preventDefault();
        closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
    }, []);

    const handlePublishBridge = useCallback(async () => {
        dispatch(publishBridgeVersionAction({ 
            bridgeId: params?.id, 
            versionId: params?.version, 
            orgId: params?.org_id 
        }));
        closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
    }, [dispatch, params]);

    const handleGenerateSummary = useCallback(async () => {
        setIsGeneratingSummary(true);
        try {
            const result = await dispatch(genrateSummaryAction({ versionId: params?.version }));
            if (result) {
                setSummary(result);
                setIsAccordionOpen(true);
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

    const renderSummaryEditor = () => (
        <div className="space-y-2">
            <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="textarea textarea-bordered w-full h-32"
            />
            <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={handleSaveSummary}>
                    Save Summary
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
                    Cancel
                </button>
            </div>
        </div>
    );

    const renderSummaryViewer = () => (
        <div className="space-y-2">
            <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-base-content">{summary}</p>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
                        <Pencil size={16} />
                        Edit
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleSaveSummary}>
                        Save
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

    return (
        <dialog id={MODAL_TYPE.PUBLISH_BRIDGE_VERSION} className="modal">
            <div className="modal-box w-11/12 max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Publish Bridge Version</h3>
                <p>Are you sure you want to publish this version? Keep in mind these points.</p>
                <ul className="list-disc ml-4 mt-3">
                    <li>Once published, the version will be available to all users.</li>
                    <li>Any changes made to the version will be reflected in the published version.</li>
                    <li>Once published, changes cannot be reverted.</li>
                </ul>

                <div className="mt-4">
                    <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                    >
                        <h4 className="font-semibold">Prompt Summary</h4>
                        {isAccordionOpen ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isAccordionOpen ? 'max-h-96' : 'max-h-0'}`}>
                        <div className="space-y-2 mt-2">
                            {summary ? (
                                <>
                                    {isEditing ? renderSummaryEditor() : renderSummaryViewer()}
                                </>
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
                </div>

                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn" onClick={handleCloseModal}>Close</button>
                        <button 
                            className="btn btn-primary ml-2" 
                            onClick={handlePublishBridge}
                            disabled={isGeneratingSummary}
                        >
                            Confirm Publish
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
}

export default PublishBridgeVersionModal;