'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomSelector } from '@/customHooks/customSelector';
import { useDispatch } from 'react-redux';
import { deleteTestCaseAction, getAllTestCasesOfBridgeAction, runTestCaseAction, updateTestCaseAction } from '@/store/action/testCasesAction';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';

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
  const { testCases } = useCustomSelector((state) => ({
    testCases: state.testCasesReducer?.testCases?.[params?.id] || {},
  }));

  const versions = useMemo(() => {
    return allBridges.find((bridge) => bridge?._id === params?.id)?.versions || [];
  }, [allBridges]);

  useEffect(() => {
    dispatch(getAllTestCasesOfBridgeAction({ bridgeId: params?.id }));
  }, [])

  useEffect(() => {
    if (selectedVersion) {
      router.replace(`?version=${bridgeVersion}&versionId=${selectedVersion}`);
    }
  }, [selectedVersion, router]);

  const handleRunTestCase = () => {
    setIsLoading(true);
    dispatch(runTestCaseAction({ versionId: selectedVersion, bridgeId: params?.id }))
      .then(() => { dispatch(getAllTestCasesOfBridgeAction({ bridgeId: params?.id })); setIsLoading(false); });
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
    setEditUserInput(testCase.conversation.find(message => message.role === 'user')?.content || '');
    setEditExpectedOutput(testCase.expected.tool_calls
      ? JSON.stringify(testCase.expected.tool_calls)
      : testCase.expected.response || '');
  };

  const handleSaveEdit = (e, testCase) => {
    e.stopPropagation();
    const updatedTestCase = {
      ...testCase,
      conversation: testCase.conversation.map(message =>
        message.role === 'user'
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Test Cases</h1>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text text-gray-700">Select Version</span>
              </label>
              <select
                className="select select-bordered w-full bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
              >
                <option disabled value="">Select a Version</option>
                {params?.id && versions?.map((version, index) => (
                  <option key={index} value={version}>
                    Version {index + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="btn bg-primary text-white disabled:bg-gray-300 disabled:text-gray-500 hover:bg-primary"
            onClick={handleRunTestCase}
            disabled={!params?.id || !selectedVersion || isloading}
          >
            Run Test Case
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Case Details</h2>
        <div className="overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 p-3 text-left text-sm font-medium text-gray-700 border-b">#</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700 border-b">User Input</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700 border-b">Expected Output</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700 border-b">Model Answer</th>
                  {versions.map((version, index) => (
                    <th key={index} className="p-3 text-left text-sm font-medium text-gray-700 border-b">{`V${index + 1}`}</th>
                  ))}
                  <th className="p-3 text-left text-sm font-medium text-gray-极700 border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
                        <td className="p极2 font-medium text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-500">
                              {isExpanded ? <ChevronDown /> : <ChevronRight />}
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
                        {versions.map((version, versionIndex) => {
                          const versionArray = testCase?.version_history?.[version];
                          const versionScore = versionArray?.[versionArray.length - 1]?.score;
                          return (
                            <td key={versionIndex} className="p-3 truncate max-w-20">
                              {versionScore || 'N/A'}
                            </td>
                          );
                        })}
                        <td className="p-3 flex gap-2">
                          {isExpanded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(e, index, testCase);
                              }}
                              className="text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(deleteTestCaseAction({ testCaseId: testCase?._id, bridgeId: params?.id }));
                            }}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
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
                              {editingIndex === index && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveEdit(e, testCase);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingIndex(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Version Scores</h3>
                                <div className="flex flex-wrap gap-2">
                                  {versions.map((version, versionIndex) => {
                                    const versionArray = testCase?.version_history?.[version];
                                    const versionScore = versionArray?.[versionArray.length - 1]?.score;
                                    return (
                                      <div
                                        key={versionIndex}
                                        className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200"
                                      >
                                        V{versionIndex + 1}: {versionScore || 'N/A'}
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