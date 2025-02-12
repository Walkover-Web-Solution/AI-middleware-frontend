import { useCustomSelector } from '@/customHooks/customSelector';
import { genrateSummaryAction, getTestcasesScroreAction, publishBridgeVersionAction, updateBridgeAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { Pencil, ChevronDown, ChevronUp, Plus, Trash } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

function PublishBridgeVersionModal({ params }) {
    const dispatch = useDispatch();
    const { bridge_summary, bridge_testcases } = useCustomSelector((state) => ({
        bridge_summary: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridge_summary,
        bridge_testcases: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.expected_qna
    }));
    
    const [summary, setSummary] = useState(bridge_summary || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isGeneratingScore, setIsGeneratingScore] = useState(false);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [testCases, setTestCases] = useState(bridge_testcases || []);
    const [isTestCasesOpen, setIsTestCasesOpen] = useState(false);
    const [newTestCaseData, setnewTestCaseData] = useState([]);
    
    // State to track if there are any changes in test cases or score details
    const [isTestCasesEdited, setIsTestCasesEdited] = useState(true);

    useEffect(() => {
        setSummary(bridge_summary || "");
        setIsAccordionOpen(false);
        setIsTestCasesOpen(false);
        setIsTestCasesEdited(true);  // Reset when data is loaded
        setnewTestCaseData([]);
        setTestCases(bridge_testcases);
    }, [bridge_summary, params, bridge_testcases]);

    const handleCloseModal = useCallback((e) => {
        e?.preventDefault();
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

    const handleGenerateScore = useCallback(async () => {
        setIsGeneratingScore(true);
        try {
            const totalData = await dispatch(getTestcasesScroreAction(params?.version));
            setnewTestCaseData(totalData?.comparison_score || []);
            setIsTestCasesEdited(false);
        } finally {
            setIsGeneratingScore(false);

        }
        
    }, [dispatch, params?.version]);

    const handleSaveSummary = useCallback(() => {
        const dataToSend = { bridge_summary: summary };
        dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend }));
        setIsEditing(false);
    }, [dispatch, params?.id, summary]);

    // const handleAddTestCase = () => {
    //     setTestCases([...(testCases || []), { question: '', expected_answers: '' }]);
    //     setIsTestCasesEdited(true); // Set the edited flag to true
    // };

    const handleRemoveTestCase = (index) => {
        setTestCases((testCases || [])?.filter((_, i) => i !== index));
        setIsTestCasesEdited(true); // Set the edited flag to true
    };

    const handleTestCaseChange = (index, field, value) => {
        setTestCases((testCases || [])?.map((testCase, i) =>
            i === index ? { ...testCase, [field]: value } : testCase
        ));
    };

    const handleNewTestCaseChange = (index, field, value) => {
        setnewTestCaseData((newTestCaseData || [])?.map((testCase, i) =>
            i === index ? { ...testCase, [field]: value } : testCase
        ));
        setIsTestCasesEdited(true); // Set the edited flag to true
    };

    const handleSaveTestCases = () => {
        const cleanedTestCases = newTestCaseData.map(({ question, expected_answers, comparison_score }) => ({
            question,
            answer: expected_answers,
            comparison_score
        }));
        const dataToSend = { expected_qna: cleanedTestCases };
        dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend }));
    };

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
                        disabled={isGeneratingSummary || isGeneratingScore}
                    >
                        <Pencil size={16} />
                        Edit
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleSaveSummary}
                        disabled={isGeneratingSummary || isGeneratingScore}
                    >
                        Save
                    </button>
                </div>
                <button
                    className={`btn btn-ghost btn-sm ${isGeneratingSummary ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary || isGeneratingScore}
                >
                    <span className="capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                        {isGeneratingSummary ? 'Generating...' : 'Generate New Summary'}
                    </span>
                </button>
            </div>
        </div>
    );

    const renderTestCases = () => {
        return (
            <div className="mt-4 bg-base-200 p-4 rounded-lg">
                <div className="max-h-96 overflow-y-auto space-y-4">
                    {testCases?.length > 0 && (
                        <>
                            <div>
                                <h4 className="font-semibold mb-2">Previous Test Cases</h4>
                                <div className="space-y-4">
                                    {testCases?.map((testCase, index) => (
                                        <div key={index} className="bg-base-100 p-4 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-medium">Test Case #{index + 1}</h4>
                                                <button
                                                    className="btn btn-ghost btn-xs text-error"
                                                    onClick={() => handleRemoveTestCase(index)}
                                                    disabled={isGeneratingSummary || isGeneratingScore || newTestCaseData.length > 0}
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium">Question</label>
                                                <input
                                                    type="text"
                                                    value={testCase?.question || ""}
                                                    onChange={(e) => handleTestCaseChange(index, 'question', e?.target?.value || "")}
                                                    className="input input-bordered w-full"
                                                    placeholder="Enter question"
                                                    disabled={isGeneratingSummary || isGeneratingScore || newTestCaseData.length > 0}
                                                />
                                                <label className="block text-sm font-medium">Answer</label>
                                                <textarea
                                                    value={testCase?.answer || ""}
                                                    onChange={(e) => handleTestCaseChange(index, 'model_answer', e?.target?.value || "")}
                                                    className="textarea textarea-bordered w-full min-h-28"
                                                    placeholder="Enter model answer"
                                                    disabled={isGeneratingSummary || isGeneratingScore || newTestCaseData.length > 0}
                                                />
                                            </div>
                                            <div className="mt-4 flex gap-6">
                                                <label className="block text-sm font-medium text-gray-700">Comparison Score :</label>
                                                <div className="radial-progress text-success text-xs" style={{ "--value": (testCase?.comparison_score || 0) * 100, "--size": "4rem", "--thickness": "8px" }} role="progressbar">
                                                    {((testCase?.comparison_score || 0) * 100).toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {newTestCaseData.length > 0 && (
                        <>
                            <div className="my-4 border-t border-gray-300"></div>
                            <div>
                                <h4 className="font-semibold mb-2">New Test Cases</h4>
                                {newTestCaseData?.map((testCase, index) => (
                                    <div key={index} className="bg-base-100 p-4 rounded-lg">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Question</label>
                                            <input
                                                type="text"
                                                value={testCase?.question || ""}
                                                onChange={(e) => handleNewTestCaseChange(index, 'question', e?.target?.value || "")}
                                                className="input input-bordered w-full"
                                                placeholder="Enter question"
                                                disabled={isGeneratingSummary || isGeneratingScore}
                                            />
                                            <label className="block text-sm font-medium">Expected Answer</label>
                                            <textarea
                                                value={testCase?.expected_answers || ""}
                                                onChange={(e) => handleNewTestCaseChange(index, 'expected_answers', e?.target?.value || "")}
                                                className="textarea textarea-bordered w-full min-h-28"
                                                placeholder="Enter expected answer"
                                                disabled={isGeneratingSummary || isGeneratingScore}
                                            />
                                            <label className="block text-sm font-medium">Model Answer</label>
                                            <textarea
                                                value={testCase?.model_answer || ""}
                                                onChange={(e) => handleNewTestCaseChange(index, 'model_answer', e?.target?.value || "")}
                                                className="textarea textarea-bordered w-full min-h-28"
                                                placeholder="Enter model answer"
                                                disabled={isGeneratingSummary || isGeneratingScore}
                                            />
                                        </div>
                                        <div className="mt-4 flex items-start">
                                            <label className="block text-sm font-medium text-gray-700">Comparison Score :</label>
                                            <div className="radial-progress text-success text-xs" style={{ "--value": (testCase?.comparison_score || 0) * 100, "--size": "6rem", "--thickness": "8px" }} role="progressbar">
                                                {((testCase?.comparison_score || 0) * 100).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
        
                    {/* <button
                        className="btn btn-ghost btn-sm w-full"
                        onClick={handleAddTestCase}
                        disabled={isGeneratingSummary || isGeneratingScore}
                    >
                        <Plus size={16} />
                        Add Test Case
                    </button> */}
                </div>

                <div className="mt-4 flex justify-between items-center">
                    {(!testCases || testCases?.length === 0) && (!newTestCaseData || newTestCaseData.length === 0) ? (
                        <div className="w-full flex justify-center">
                            <button
                                className={`btn btn-ghost btn-sm ${isGeneratingScore ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleGenerateScore}
                                disabled={isGeneratingScore || (newTestCaseData?.length > 0 && !isTestCasesEdited)}
                            >
                                <span className="capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                                    {isGeneratingScore ? 'Generating...' : 'Generate Test Cases'}
                                </span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                className={`btn btn-ghost btn-sm ${isGeneratingScore ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleGenerateScore}
                                disabled={isGeneratingScore || !isTestCasesEdited}
                            >
                                <span className="capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                                    {isGeneratingScore ? 'Generating...' : 'Generate Test Cases'}
                                </span>
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleSaveTestCases}
                                disabled={isGeneratingScore}
                            >
                                Save Test Cases
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

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
                        {renderTestCases()}
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