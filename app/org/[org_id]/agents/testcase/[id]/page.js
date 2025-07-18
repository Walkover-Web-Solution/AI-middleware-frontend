'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomSelector } from '@/customHooks/customSelector';
import { useDispatch } from 'react-redux';
import { deleteTestCaseAction, getAllTestCasesOfBridgeAction, runTestCaseAction, updateTestCaseAction } from '@/store/action/testCasesAction';
import { PencilIcon, PlayIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon } from '@/components/Icons';
import OnBoarding from '@/components/OnBoarding';
import TutorialSuggestionToast from '@/components/tutorialSuggestoinToast';
import { ONBOARDING_VIDEOS } from '@/utils/enums';

export const runtime = 'edge';

function TestCases({ params }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isloading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editUserInput, setEditUserInput] = useState('');
  const [editExpectedOutput, setEditExpectedOutput] = useState('');
  const searchParams = useSearchParams();
  const bridgeVersion = searchParams.get('version');
  const [selectedVersion, setSelectedVersion] = useState(searchParams.get('versionId') || '');

  const allBridges = useCustomSelector((state) => state.bridgeReducer.org[params.org_id]?.orgs || []).slice().reverse();
  const { testCases,isFirstTestcase } = useCustomSelector((state) => ({
    testCases: state.testCasesReducer?.testCases?.[params?.id] || {},
     isFirstTestcase: state.userDetailsReducer.userDetails?.meta?.onboarding?.TestCasesSetup || "",
  }));
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: isFirstTestcase
  });
  const versions = useMemo(() => {
    return allBridges.find((bridge) => bridge?._id === params?.id)?.versions || [];
  }, [allBridges, params?.id]);

  useEffect(() => {
    dispatch(getAllTestCasesOfBridgeAction({ bridgeId: params?.id }));
  }, [])

  useEffect(() => {
    if (selectedVersion) {
      router.push(`?version=${bridgeVersion}&versionId=${selectedVersion}`);
    }
  }, [selectedVersion, router]);

  const handleRunTestCase = (versionId) => {
    setIsLoading(true);
    dispatch(runTestCaseAction({ versionId, bridgeId: params?.id }))
      .then(() => { dispatch(getAllTestCasesOfBridgeAction({ bridgeId: params?.id })); setIsLoading(false); setSelectedVersion(versionId) });
    router.push(`?version=${bridgeVersion}&versionId=${versionId}`);
  }

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEditClick = (e, index, testCase) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditUserInput(testCase.conversation[testCase.conversation.length - 1]?.content || '');
    setEditExpectedOutput(testCase.expected.tool_calls
      ? JSON.stringify(testCase.expected.tool_calls)
      : testCase.expected.response || '');
  };

  const handleSaveEdit = (e, testCase) => {
    e.stopPropagation();
    const updatedTestCase = {
      ...testCase,
      conversation: testCase.conversation.map((message, i) =>
        i === testCase.conversation.length - 1 && message.role === 'user'
          ? { ...message, content: editUserInput }
          : message
      ),
      expected: testCase.type === 'function'
        ? { tool_calls: JSON.parse(editExpectedOutput) }
        : { response: editExpectedOutput }
    };
    dispatch(updateTestCaseAction({ bridge_id: params?.id, dataToUpdate: updatedTestCase }))
    setEditingIndex(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Test Cases</h1>
            <p className="text-gray-700 text-sm leading-relaxed ">
              Test cases are used to compare outputs from different versions with varying prompts and models. You can create test cases from chat history and choose a comparison type - Exact, AI, or Cosine to measure accuracy.
            </p>
            <a href="https://blog.gtwy.ai/features/testcases?source=single"
              className="inline-flex mb-4 items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors font-medium group"
              target="_blank"
              rel="noopener noreferrer">
              <span>Learn more</span>
               <ExternalLinkIcon size={16}/>
            </a>
              {tutorialState?.showSuggestion && <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"TestCasesSetup"} TutorialDetails={"TestCases Creation"} />}
      {tutorialState?.showTutorial && (
        <OnBoarding
          setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))}
          video={ONBOARDING_VIDEOS.TestCases}
          flagKey={"TestCasesSetup"}
        />
      )}
          <div className="overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 p-3 text-left text-sm font-medium text-gray-700 border-b">#</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700 border-b">User Input</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700 border-b">Expected Output</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700 border-b">Model Answer</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700 border-b">Matching Type</th>
                  {versions.map((version, index) => (
                    <th key={index} className={`p-3 text-left text-sm font-medium text-gray-700 border-b ${version === selectedVersion ? 'relative after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-green-500 after:rounded-full' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className="tooltip tooltip-left" data-tip="Run Test Case">
                          <button
                            className="btn btn-xs btn-circle bg-white border border-gray-200 hover:bg-primary hover:border-primary hover:text-white disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400"
                            onClick={() => handleRunTestCase(version)}
                            disabled={!params?.id || isloading}
                          >
                            <PlayIcon size={12} />
                          </button>
                        </div>
                        <span className={`font-medium text-gray-800 `}>
                          {`V${index + 1}`}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 w-full">
                {Array.isArray(testCases) ? testCases.map((testCase, index) => {
                  const lastUserMessage = testCase.conversation
                    .filter(message => message.role === 'user')
                    .pop()?.content || 'N/A';

                  const expectedOutput = testCase.expected.tool_calls
                    ? JSON.stringify(testCase.expected.tool_calls)
                    : testCase.expected.response || 'N/A';

                  const testCaseVersionArray = testCase?.version_history?.[selectedVersion];
                  const model_output = JSON.stringify(testCaseVersionArray?.[testCaseVersionArray.length - 1]?.model_output);

                  const isExpanded = expandedRows[index] || false;

                  return (
                    <React.Fragment key={index}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => toggleRow(index)}
                      >
                        <td className="p-2 font-medium text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-500">
                              {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                            </span>
                            <span>{index + 1}</span>
                          </div>
                        </td>
                        <td className="p-3 max-w-xs truncate" title={lastUserMessage}>
                          {lastUserMessage.substring(0, 30)}{lastUserMessage.length > 30 ? '...' : ''}
                        </td>
                        <td className="p-3 max-w-xs truncate" title={expectedOutput}>
                          {expectedOutput.substring(0, 30)}{expectedOutput.length > 30 ? '...' : ''}
                        </td>
                        <td className="p-3 max-w-xs truncate" title={model_output}>
                          {model_output ? model_output.substring(0, 30) + (model_output.length > 30 ? '...' : '') : 'N/A'}
                        </td>
                        <td className="p-3 max-w-xs truncate" title={testCase?.matching_type}> {testCase?.matching_type}</td>
                        {versions.map((version, versionIndex) => {
                          const versionArray = testCase?.version_history?.[version];
                          const versionScore = versionArray?.[versionArray.length - 1]?.score;
                          return (
                            <td key={versionIndex} className="p-3 truncate max-w-20">
                              {versionScore ? `${(versionScore * 100).toFixed(2)}%` : 'N/A'}
                            </td>
                          );
                        })}
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={versions.length + 5} className="p-4 bg-gray-50">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">User Input</h3>
                                {editingIndex === index ? (
                                  <textarea
                                    value={editUserInput}
                                    onChange={(e) => setEditUserInput(e.target.value)}
                                    className="w-full p-3 bg-white min-h-20 rounded-md shadow-sm text-sm text-gray-600"
                                  />
                                ) : (
                                  <div className="p-3 bg-white rounded-md shadow-sm text-sm text-gray-600 overflow-auto max-h-40">
                                    {lastUserMessage}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Expected Output</h3>
                                {editingIndex === index ? (
                                  <textarea
                                    value={editExpectedOutput}
                                    onChange={(e) => setEditExpectedOutput(e.target.value)}
                                    className="w-full p-3 min-h-20 bg-white rounded-md shadow-sm text-sm text-gray-600"
                                  />
                                ) : (
                                  <div className="p-3 bg-white rounded-md shadow-sm text-sm text-gray-600 whitespace-pre-wrap overflow-auto max-h-40">
                                    {expectedOutput}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Model Answer</h3>
                                <div className="p-3 bg-white rounded-md shadow-sm text-sm text-gray-600 whitespace-pre-wrap overflow-auto max-h-40">
                                  {model_output || 'N/A'}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {editingIndex === index ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveEdit(e, testCase);
                                      }}
                                      className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm flex items-center gap-1.5 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingIndex(null);
                                      }}
                                      className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm flex items-center gap-1.5 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(e, index, testCase);
                                    }}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm flex items-center gap-1.5 transition-colors"
                                  >
                                    <PencilIcon className="w-4 h-4" /> Edit
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(deleteTestCaseAction({ testCaseId: testCase?._id, bridgeId: params?.id }));
                                  }}
                                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm flex items-center gap-1.5 transition-colors"
                                >
                                  <TrashIcon className="w-4 h-4" /> Delete
                                </button>
                              </div>

                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Version Scores</h3>
                                <div className="flex flex-wrap gap-2">
                                  {versions.map((version, versionIndex) => {
                                    const versionArray = testCase?.version_history?.[version];
                                    const versionScore = versionArray?.[versionArray.length - 1]?.score;
                                    const progressValue = versionScore ? Math.round(versionScore * 100) : 0;
                                    const lastRun = versionArray?.[versionArray.length - 1]?.created_at;
                                    return (
                                      <div
                                        key={versionIndex}
                                        className="flex flex-col gap-2 px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span>V{versionIndex + 1}:</span>
                                          <div className="radial-progress text-primary"
                                            style={{ "--value": progressValue, "--size": "3rem", "--thickness": "3px" }}
                                            role="progressbar">
                                            {progressValue}%
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Last run: {lastRun ? new Date(lastRun).toLocaleString() : '-'}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                }) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestCases;