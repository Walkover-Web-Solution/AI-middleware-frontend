'use client'
import { MODAL_TYPE } from '@/utils/enums';
import { Trash, X } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateBridgeAction, getTestcasesScoreAction, getTestcasesScroreAction } from '@/store/action/bridgeAction';
import { useCustomSelector } from '@/customHooks/customSelector';
import { closeModal } from '@/utils/utility';

function TestcaseModal({ params }) {
    console.log(params);

    const dispatch = useDispatch();
    const { bridge_testcases } = useCustomSelector((state) => ({
        bridge_testcases: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.expected_qna
    }));

    const [newTestCaseData, setNewTestCaseData] = useState([]);
    const [isTestCasesEdited, setIsTestCasesEdited] = useState(true);
    const [isGeneratingScore, setIsGeneratingScore] = useState(false);
    const [testCases, setTestCases] = useState(bridge_testcases || []);

    const handleRemoveTestCase = (index) => {
        setTestCases((testCases || []).filter((_, i) => i !== index));
        setIsTestCasesEdited(true);
    };

    const handleTestCaseChange = (index, field, value) => {
        setTestCases((testCases || []).map((testCase, i) =>
            i === index ? { ...testCase, [field]: value } : testCase
        ));
    };

    const handleNewTestCaseChange = (index, field, value) => {
        setNewTestCaseData((newTestCaseData || []).map((testCase, i) =>
            i === index ? { ...testCase, [field]: value } : testCase
        ));
        setIsTestCasesEdited(true);
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

    const handleGenerateScore = useCallback(async () => {
        setIsGeneratingScore(true);
        try {
            const totalData = await dispatch(getTestcasesScroreAction(params?.version));
            setNewTestCaseData(totalData?.comparison_score || []);
            setIsTestCasesEdited(false);
        } finally {
            setIsGeneratingScore(false);
        }
    }, [dispatch, params?.version]);

    const handleAddTestCase = () => {
        setTestCases([...(testCases || []), { question: '', expected_answers: '' }]);
        setIsTestCasesEdited(true); // Set the edited flag to true
    };

    return (
        <div>
            <dialog id={MODAL_TYPE.TESTCASE_MODAL} className="modal">
                <div className="modal-box min-w-[90vw]">
                    <div className=' flex justify-between'>
                        <h3 className="font-bold text-lg mb-4">Test Cases Management</h3>
                        <button classname='btn rounded-full' onClick={() => closeModal(MODAL_TYPE.TESTCASE_MODAL)}><X /></button>

                    </div>

                    <div className="mt-4 bg-base-200 p-4 rounded-lg">
                        <div className="max-h-[70vh] overflow-y-auto space-y-4">
                            {testCases?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Existing Test Cases</h4>
                                    <div className="space-y-4">
                                        {testCases.map((testCase, index) => (
                                            <div key={index} className="bg-base-100 p-4 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium">Test Case #{index + 1}</h4>
                                                    <button
                                                        className="btn btn-ghost btn-xs text-error"
                                                        onClick={() => handleRemoveTestCase(index)}
                                                        disabled={isGeneratingScore}
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <div className="flex-1 space-y-1">
                                                        <label className="block text-sm font-medium">Question</label>
                                                        <input
                                                            type="text"
                                                            value={testCase?.question || ""}
                                                            onChange={(e) => handleTestCaseChange(index, 'question', e.target.value)}
                                                            className="input input-bordered w-full min-h-[120px]"
                                                            placeholder="Enter question"
                                                            disabled={isGeneratingScore}
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <label className="block text-sm font-medium">Answer</label>
                                                        <textarea
                                                            value={testCase?.answer || ""}
                                                            onChange={(e) => handleTestCaseChange(index, 'model_answer', e.target.value)}
                                                            className="textarea textarea-bordered w-full min-h-[120px]"
                                                            placeholder="Enter model answer"
                                                            disabled={isGeneratingScore}
                                                        />
                                                    </div>
                                                    {testCase?.comparison_score && <div className="w-32 space-y-1">
                                                        <label className="block text-sm font-medium">Score</label>
                                                        <div className="radial-progress text-primary"
                                                            style={{ "--value": testCase?.comparison_score ? Math.round(testCase.comparison_score * 100) : 0 }}
                                                            role="progressbar">
                                                            {testCase?.comparison_score ? `${Math.round(testCase.comparison_score * 100)}%` : 'N/A'}
                                                        </div>
                                                    </div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {newTestCaseData.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2">New Test Cases</h4>
                                    {newTestCaseData.map((testCase, index) => (
                                        <div key={index} className="bg-base-100 p-4 rounded-lg">
                                            <div className="flex gap-4 items-start">
                                                <div className="flex-1 space-y-1">
                                                    <label className="block text-sm font-medium">Question</label>
                                                    <input
                                                        type="text"
                                                        value={testCase?.question || ""}
                                                        onChange={(e) => handleNewTestCaseChange(index, 'question', e.target.value)}
                                                        className="input input-bordered w-full min-h-[120px]"
                                                        placeholder="Enter question"
                                                        disabled={isGeneratingScore}
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <label className="block text-sm font-medium">Expected Answer</label>
                                                    <textarea
                                                        value={testCase?.expected_answers || ""}
                                                        onChange={(e) => handleNewTestCaseChange(index, 'expected_answers', e.target.value)}
                                                        className="textarea textarea-bordered w-full min-h-[120px]"
                                                        placeholder="Enter expected answer"
                                                        disabled={isGeneratingScore}
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <label className="block text-sm font-medium">Expected Answer</label>
                                                    <textarea
                                                        value={testCase?.model_answer || ""}
                                                        onChange={(e) => handleNewTestCaseChange(index, 'expected_answers', e.target.value)}
                                                        className="textarea textarea-bordered w-full min-h-[120px]"
                                                        placeholder="Enter expected answer"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="w-32 space-y-1">
                                                    <label className="block text-sm font-medium">Score</label>
                                                    <div className="radial-progress text-primary"
                                                        style={{ "--value": testCase?.comparison_score ? Math.round(testCase.comparison_score * 100) : 0 }}
                                                        role="progressbar">
                                                        {testCase?.comparison_score ? `${Math.round(testCase.comparison_score * 100)}%` : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <button
                                className={`btn btn-ghost btn-sm ${isGeneratingScore ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleAddTestCase}
                                disabled={isGeneratingScore || !isTestCasesEdited}
                            >
                                Add New Test Case
                            </button>
                            <button className='btn' onClick={handleGenerateScore}>Run Test Case</button>
                        </div>
                    </div>
                </div>
            </dialog>
        </div>
    )
}

export default TestcaseModal;