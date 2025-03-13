'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomSelector } from '@/customHooks/customSelector';
import { useDispatch } from 'react-redux';
import { deleteTestCaseAction, getAllTestCasesOfBridgeAction, runTestCaseAction } from '@/store/action/testCasesAction';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

export const runtime = 'edge';

function TestCases({ params }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isloading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const searchParams = useSearchParams();
  const [selectedBridge, setSelectedBridge] = useState(params?.id || '');
  const [selectedVersion, setSelectedVersion] = useState(searchParams.get('version') || '');
  // const [filterBridges, setFilterBridges] = useState("");

  const allBridges = useCustomSelector((state) => state.bridgeReducer.org[params.org_id]?.orgs || []).slice().reverse();
  const { testCases } = useCustomSelector((state) => ({
    testCases: state.testCasesReducer?.testCases || {},
  }));

  const selectedBridgeTestCases = useMemo(() => {
    return testCases?.[selectedBridge] || [];
  }, [selectedBridge, testCases]);

  const versions = useMemo(() => {
    return allBridges.find((bridge) => bridge?._id === selectedBridge)?.versions || [];
  }, [selectedBridge, allBridges]);

  // useEffect(() => {
  //   if (selectedBridge) {
  //     router.replace(`?id=${selectedBridge}`);
  //     dispatch(getAllTestCasesOfBridgeAction({ bridgeId: selectedBridge }));
  //   }
  // }, [selectedBridge, router]);

  useEffect(() => {
    if (selectedVersion) {
      router.replace(`?version=${selectedVersion}`);
    }
  }, [selectedVersion, router]);

  const handleRunTestCase = () => {
    setIsLoading(true);
    dispatch(runTestCaseAction({ versionId: selectedVersion, bridgeId: selectedBridge }))
      .then(() => { dispatch(getAllTestCasesOfBridgeAction({ bridgeId: selectedBridge })); setIsLoading(false); });
  }


  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Test Cases</h1>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            {/* <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  Select Bridge 
                </span>
              </label>
              <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-start">
                  {selectedBridge ? allBridges.find(b => b._id === selectedBridge)?.name : <>Select a Bridge <ChevronDown className="w-4 h-4" /></>}
                </div>
                <div className="dropdown-content bg-base-200 p-2 shadow rounded-box w-96 max-h-96 overflow-y-auto overflow-x-hidden z-[1000] relative">
                  <input
                    type="text"
                    placeholder="Search bridges..."
                    className="input input-bordered w-full sticky top-0 z-10"
                    value={filterBridges}
                    onChange={(e) => setFilterBridges(e.target.value)}
                  />
                  <ul className="menu menu-sm pt-3">  
                    {allBridges
                      .filter(bridge => 
                        bridge?.name.toLowerCase().includes(filterBridges.toLowerCase())
                      )
                      .map((bridge) => (
                        <li key={bridge._id}>
                          <button 
                            className={`w-full text-left p-2 rounded ${
                              bridge._id === selectedBridge 
                                ? 'bg-primary text-primary-content' 
                                : 'hover:bg-base-300'
                            }`}
                            onClick={() => {
                              setSelectedBridge(bridge._id);
                              setSelectedVersion('');
                            }}
                            aria-selected={bridge._id === selectedBridge}
                          >
                            {bridge.name}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div> 
            */}

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
                {selectedBridge && versions?.map((version, index) => (
                  <option key={index} value={version}>
                    Version {index + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="btn bg-primary text-white disabled:bg-gray-300 disabled:text-gray-500"
            onClick={handleRunTestCase}
            disabled={!selectedBridge || !selectedVersion || isloading}
          >
            Run Test Case
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Case Details</h2>
        <div className="overflow-x-auto">
          {/* <table className="table table-auto w-full">
            <thead>
              <tr>
                <th className=""></th>
                <th className="">User Input</th>
                <th className="">Expected Output</th>
                <th className="">Modal Answer</th>
                {versions.map((version, index) => (
                  <th key={index} className="">{`V ${index + 1}`}</th>
                ))}
                <th className="">Delete</th>
              </tr>
            </thead>
            <tbody>
              {selectedBridgeTestCases.map((testCase, index) => {
                const lastUserMessage = testCase.conversation
                  .filter(message => message.role === 'user')
                  .pop()?.content || 'N/A';

                const expectedOutput = testCase.expected.tool_calls
                  ? JSON.stringify(testCase.expected.tool_calls)
                  : testCase.expected.response || 'N/A';

                const handleDelete = (id) => {
                  dispatch(deleteTestCaseAction({ testCaseId: id, bridgeId: selectedBridge }));
                };

                return (
                  <tr key={index}>
                    <td className="overflow-hidden max-w-1">{index + 1}</td>
                    <td className="overflow-hidden whitespace-nowrap overflow-ellipsis">{lastUserMessage}</td>
                    <td className="max-w-xs overflow-hidden whitespace-nowrap overflow-ellipsis">{expectedOutput}</td>
                    {(() => {
                      const testCaseVersionArray = testCase?.version_history?.[selectedVersion];
                      const model_output = JSON.stringify(testCaseVersionArray?.[testCaseVersionArray.length - 1]?.model_output);
                      return (
                        <td className="overflow-hidden max-w-56 overflow-ellipsis whitespace-nowrap" data-tip={model_output || 'N/A'}>
                          <div className="tooltip tooltip-left z-[999999]" data-tip={model_output || 'N/A'}>
                            {model_output || 'N/A'}
                          </div>
                        </td>
                      );
                    })()}

                    {versions.map((version, versionIndex) => {
                      const testCaseVersionArray = testCase?.version_history?.[version];
                      const versionScore = testCaseVersionArray?.[testCaseVersionArray.length - 1]?.score;
                      return (
                        <td key={versionIndex} className="max-w-10 whitespace-nowrap overflow-hidden overflow-ellipsis">{versionScore || 'N/A'}</td>
                      )
                    })}
                    <td className="">
                      <button
                        onClick={() => handleDelete(testCase?._id)}
                      >
                        <Trash2 color='red' />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table> */}
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
                  <th className="p-3 text-left text-sm font-medium text-gray-700 border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedBridgeTestCases.map((testCase, index) => {
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
                        <td className="p-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(deleteTestCaseAction({ testCaseId: testCase?._id, bridgeId: selectedBridge }));
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
                                <div className="p-3 bg-white rounded-md shadow-sm text-sm text-gray-600 overflow-auto max-h-40">
                                  {lastUserMessage}
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Expected Output</h3>
                                <div className="p-3 bg-white rounded-md shadow-sm text-sm text-gray-600 whitespace-pre-wrap overflow-auto max-h-40">
                                  {expectedOutput}
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">Model Answer</h3>
                                <div className="p-3 bg-white rounded-md shadow-sm text-sm text-gray-600 whitespace-pre-wrap overflow-auto max-h-40">
                                  {model_output || 'N/A'}
                                </div>
                              </div>
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestCases;



// "use client";
// import { Trash } from "lucide-react";
// import React, { useState, useCallback, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import {
//   updateBridgeAction,
//   getTestcasesScroreAction,
// } from "@/store/action/bridgeAction";
// import { useParams, useSearchParams } from "next/navigation";
// import { useCustomSelector } from "@/customHooks/customSelector";

// export const runtime = 'edge';

// function Testcase() {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const version = searchParams.get("version");

//   const { bridge_testcases } = useCustomSelector((state) => ({
//     bridge_testcases:
//       state?.bridgeReducer?.allBridgesMap?.[params?.id]?.expected_qna,
//   }));

//   const [isGeneratingScore, setIsGeneratingScore] = useState(false);
//   const [newTestCaseData, setNewTestCaseData] = useState(bridge_testcases);

//   const handleCreateTestcase = async () => {
//     setIsGeneratingScore(true);
//     try {
//       const totalData = await dispatch(getTestcasesScroreAction(version));

//       const cleanedTestCases = totalData?.comparison_score?.map(
//         ({
//           question,
//           expected_answer,
//           answer,
//           model_answer,
//           comparison_score,
//         }) => {
//           const prevTestCase =
//             newTestCaseData?.find?.((tc) => tc.question === question) || {};
//           return {
//             question,
//             answer: expected_answer || answer,
//             model_answer,
//             prev_comparison_score: prevTestCase?.comparison_score || null,
//             comparison_score,
//           };
//         }
//       );

//       setNewTestCaseData(cleanedTestCases);
//     } finally {
//       setIsGeneratingScore(false);
//     }
//   };

//   const dispatch = useDispatch();
//   const [isTestCasesEdited, setIsTestCasesEdited] = useState(false);
//   const handleRemoveTestCase = (index) => {
//     setNewTestCaseData((newTestCaseData || []).filter((_, i) => i !== index));
//     setIsTestCasesEdited(false);
//   };

//   const handleTestCaseChange = (index, field, value) => {
//     setNewTestCaseData(
//       (newTestCaseData || []).map((testCase, i) =>
//         i === index ? { ...testCase, [field]: value } : testCase
//       )
//     );
//     setIsTestCasesEdited(true);
//   };

//   const handleAddTestCase = () => {
//     setNewTestCaseData([
//       ...(newTestCaseData || []),
//       {
//         question: "",
//         answer: "",
//         model_answer: null,
//         comparison_score: null,
//         prev_comparison_score: null,
//       },
//     ]);
//     setIsTestCasesEdited(true);
//   };

//   const handleSaveTestCases = (testCaseData) => {
//     const cleanedTestCases =
//       (testCaseData?.length > 0 ? testCaseData : newTestCaseData || [])
//         ?.filter(({ question, answer }) => question && answer)
//         ?.map(({ question, answer, comparison_score }) => ({
//           question,
//           answer,
//           comparison_score,
//         })) || [];

//     const dataToSend = { expected_qna: cleanedTestCases || [] };
//     if (cleanedTestCases.length > 0) {
//       dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend }));
//     }
//     setIsTestCasesEdited(false);
//   };

//   const handleGenerateScore = useCallback(async () => {
//     setIsGeneratingScore(true);
//     try {
//       const totalData = await dispatch(getTestcasesScroreAction(version));
//       const cleanedTestCases = totalData?.comparison_score?.map(
//         ({
//           question,
//           expected_answer,
//           model_answer,
//           answer,
//           comparison_score,
//         }) => {
//           const prevTestCase = bridge_testcases?.find(
//             (tc) => tc.question === question
//           );
//           return {
//             question,
//             answer: expected_answer || answer,
//             model_answer,
//             prev_comparison_score: prevTestCase?.comparison_score || null,
//             comparison_score,
//           };
//         }
//       );
//       setNewTestCaseData(cleanedTestCases);
//       handleSaveTestCases(cleanedTestCases);
//       setIsTestCasesEdited(false);
//     } finally {
//       setIsGeneratingScore(false);
//     }
//   }, [dispatch, params?.version, newTestCaseData, bridge_testcases]);

//   useEffect(() => {
//     handleCreateTestcase()
//   }, [])

//   return (
//     <div className="w-screen h-full">
//       <div className="relative overflow-y-hidden">
//         {isGeneratingScore && (
//           <div className="absolute inset-0 bg-base-100/90 flex items-center justify-center rounded-lg z-[999999]">
//             <div className="text-center space-y-4">
//               <div className="loading loading-ring loading-lg"></div>
//               <p className="text-lg font-medium">
//                 {newTestCaseData?.length === 0
//                   ? "Generating Test Case..."
//                   : "Running Test Cases..."}
//               </p>
//             </div>
//           </div>
//         )}

//         <div className="bg-base-200 p-4 rounded-lg">
//           <div className=" overflow-y-auto space-y-4">
//             {newTestCaseData?.length > 0 && (
//               <div>
//                 <h4 className="font-semibold mb-2">Existing Test Cases</h4>
//                 <div className="space-y-4">
//                   {newTestCaseData.map((testCase, index) => (
//                     <div key={index} className="bg-base-100 p-4 rounded-lg">
//                       <div className="flex justify-between items-start mb-2">
//                         <h4 className="font-medium">Test Case #{index + 1}</h4>
//                         <button
//                           className="btn btn-ghost btn-xs text-error"
//                           onClick={() => handleRemoveTestCase(index)}
//                           disabled={isGeneratingScore}
//                         >
//                           <Trash size={14} />
//                         </button>
//                       </div>
//                       <div className="flex gap-4 items-start">
//                         <div className="flex-1 space-y-1">
//                           <label className="block text-sm font-medium">
//                             Question
//                           </label>
//                           <input
//                             type="text"
//                             value={testCase?.question || ""}
//                             onChange={(e) =>
//                               handleTestCaseChange(
//                                 index,
//                                 "question",
//                                 e.target.value
//                               )
//                             }
//                             className="input input-bordered w-full min-h-[120px]"
//                             placeholder="Enter question"
//                             disabled={isGeneratingScore}
//                           />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <label className="block text-sm font-medium">
//                             Expected Answer
//                           </label>
//                           <textarea
//                             value={
//                               testCase?.answer ||
//                               testCase?.expected_answers ||
//                               ""
//                             }
//                             onChange={(e) =>
//                               handleTestCaseChange(
//                                 index,
//                                 "answer",
//                                 e.target.value
//                               )
//                             }
//                             className="textarea textarea-bordered w-full min-h-[120px]"
//                             placeholder="Enter model answer"
//                             disabled={isGeneratingScore}
//                           />
//                         </div>
//                         {testCase?.model_answer && (
//                           <div className="flex-1 space-y-1">
//                             <label className="block text-sm font-medium">
//                               Model Answer
//                             </label>
//                             <textarea
//                               value={testCase?.model_answer || ""}
//                               onChange={(e) =>
//                                 handleTestCaseChange(
//                                   index,
//                                   "model_answer",
//                                   e.target.value
//                                 )
//                               }
//                               className="textarea textarea-bordered w-full min-h-[120px]"
//                               placeholder="Enter model answer"
//                               disabled
//                             />
//                           </div>
//                         )}
//                         {testCase?.prev_comparison_score && (
//                           <div className="w-32 space-y-1">
//                             <label className="block text-sm font-medium">
//                               Previous Score
//                             </label>
//                             <div
//                               className="radial-progress text-primary"
//                               style={{
//                                 "--value": testCase?.prev_comparison_score
//                                   ? Math.round(
//                                     testCase.prev_comparison_score * 100
//                                   )
//                                   : 0,
//                               }}
//                               role="progressbar"
//                             >
//                               {testCase?.prev_comparison_score
//                                 ? `${Math.round(
//                                   testCase.prev_comparison_score * 100
//                                 )}%`
//                                 : "N/A"}
//                             </div>
//                           </div>
//                         )}
//                         {testCase?.comparison_score && (
//                           <div className="w-32 space-y-1">
//                             <label className="block text-sm font-medium">
//                               {testCase?.prev_comparison_score
//                                 ? "Current Score"
//                                 : "Score"}
//                             </label>
//                             <div
//                               className="radial-progress text-primary"
//                               style={{
//                                 "--value": testCase?.comparison_score
//                                   ? Math.round(testCase.comparison_score * 100)
//                                   : 0,
//                               }}
//                               role="progressbar"
//                             >
//                               {testCase?.comparison_score
//                                 ? `${Math.round(
//                                   testCase.comparison_score * 100
//                                 )}%`
//                                 : "N/A"}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="mt-4 flex justify-between items-center">
//             <button
//               className={`btn btn-ghost btn-sm ${isGeneratingScore ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               onClick={handleAddTestCase}
//               disabled={isGeneratingScore}
//             >
//               Add New Test Case
//             </button>

//             {isTestCasesEdited ? (
//               <button className="btn" onClick={handleSaveTestCases}>
//                 Save Test Cases
//               </button>
//             ) :
//               <button className="btn" onClick={handleGenerateScore}>
//                 Run Test Case
//               </button>
//             }
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Testcase;
