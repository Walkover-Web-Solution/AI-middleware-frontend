import { useCustomSelector } from '@/customHooks/customSelector';
import { genrateSummaryAction, getTestcasesScroreAction, publishBridgeVersionAction, updateBridgeAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal, openModal } from '@/utils/utility';
import { Pencil, ChevronDown, ChevronUp, Plus, Trash } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TestcaseModal from './testcaseModal';

function PublishBridgeVersionModal({ params }) {
    const dispatch = useDispatch();
    const { bridge_summary, bridge_testcases } = useCustomSelector((state) => ({
        bridge_summary: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridge_summary,
        bridge_testcases: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.expected_qna
    }));
    
    const [summary, setSummary] = useState(bridge_summary || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isTestCasesOpen, setIsTestCasesOpen] = useState(false);
    const [isGeneratingScore, setIsGeneratingScore] = useState(false);
    const [newTestCaseData, setNewTestCaseData] = useState(bridge_testcases)

    useEffect(() => {
        setSummary(bridge_summary || "");
        setIsAccordionOpen(false);
        setIsTestCasesOpen(false);
    }, [bridge_summary, params, bridge_testcases]);

    const handleCloseModal = useCallback((e) => {
        e?.preventDefault();
        closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
    }, []);

    const handlePublishBridge = useCallback(async () => {
        await dispatch(publishBridgeVersionAction({
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

    const handleCreateTestcase = async () => {
        setIsGeneratingScore(true);
        try {
            const totalData = await dispatch(getTestcasesScroreAction(params?.version));
            const cleanedTestCases = totalData?.comparison_score?.map(({ question, expected_answer, answer, model_answer, comparison_score }) => {
                const prevTestCase = newTestCaseData?.find(tc => tc.question === question);
                return {
                    question,
                    answer: expected_answer || answer,
                    model_answer,
                    prev_comparison_score: prevTestCase?.comparison_score || null,
                    comparison_score
                };
            });
            setNewTestCaseData(cleanedTestCases);
            const expected_qna = cleanedTestCases?.map(({ question, answer, comparison_score }) => ({
                question,
                answer,
                comparison_score
            }));
            expected_qna && dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend: { expected_qna } }));
        } finally {
            setIsGeneratingScore(false);
        }
    }

    const handleSaveSummary = useCallback(() => {
        const dataToSend = { bridge_summary: summary };
        dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend }));
        setIsEditing(false);
    }, [dispatch, params?.id, summary]);

    const renderSummaryEditor = () => (
        <div className="space-y-2">
            <textarea
                value={summary || ""}
                onChange={(e) => setSummary(e?.target?.value || "")}
                className="textarea textarea-bordered w-full h-32 overflow-y-auto"
            />
            <div className="flex gap-2">
                <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveSummary}
                    disabled={isGeneratingSummary || isGeneratingScore}
                >
                    Save Summary
                </button>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isGeneratingSummary || isGeneratingScore}
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    const renderSummaryViewer = () => (
        <div className="space-y-2">
            <div className="bg-base-200 p-4 rounded-lg ">
                <p className="text-base-content min_h-16 max-h-52 overflow-y-auto">{summary}</p>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setIsEditing(true)}
                        disabled={isGeneratingSummary}
                    >
                        <Pencil size={16} />
                        Edit
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleSaveSummary}
                        disabled={isGeneratingSummary}
                    >
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

                <div className="mt-4">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setIsTestCasesOpen(!isTestCasesOpen)}
                    >
                        <h4 className="font-semibold">Test Cases</h4>
                        {isTestCasesOpen ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isTestCasesOpen ? 'max-h-[800px]' : 'max-h-0'}`}>
                        <button className='btn btn-ghost btn-sm w-full' onClick={() => { handleCreateTestcase(); openModal(MODAL_TYPE?.TESTCASE_MODAL); }}>
                            <span className="capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                                {!bridge_testcases ? <span>Generate Test Case</span> : <span>Run Test Cases</span>}
                            </span>
                        </button>
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
            <TestcaseModal params={params} isGeneratingScore={isGeneratingScore} setIsGeneratingScore={setIsGeneratingScore} bridge_testcases={bridge_testcases} setNewTestCaseData={setNewTestCaseData} newTestCaseData={newTestCaseData} />
        </dialog>
    );
}

export default PublishBridgeVersionModal;