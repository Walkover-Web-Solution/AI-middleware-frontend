// 'use client';
// import React, { useState, useEffect, useMemo } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useCustomSelector } from '@/customHooks/customSelector';
// import { useDispatch } from 'react-redux';
// import { deleteTestCaseAction, getAllTestCasesOfBridgeAction, runTestCaseAction } from '@/store/action/testCasesAction';
// import { ChevronDown, Trash2 } from 'lucide-react';

// export const runtime = 'edge';

// function TestCases({ params }) {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const [isloading, setIsLoading] = useState(false);
//   const [expandedRows, setExpandedRows] = useState({});

//   const searchParams = useSearchParams();
//   const [selectedBridge, setSelectedBridge] = useState(searchParams.get('id') || '');
//   const [selectedVersion, setSelectedVersion] = useState(searchParams.get('version') || '');
//   // const [filterBridges, setFilterBridges] = useState("");

//   const allBridges = useCustomSelector((state) => state.bridgeReducer.org[params.org_id]?.orgs || []).slice().reverse();
//   const { testCases } = useCustomSelector((state) => ({
//     testCases: state.testCasesReducer?.testCases || {},
//   }));

//   const selectedBridgeTestCases = useMemo(() => {
//     return testCases?.[selectedBridge] || [];
//   }, [selectedBridge, testCases]);

//   const versions = useMemo(() => {
//     return allBridges.find((bridge) => bridge?._id === selectedBridge)?.versions || [];
//   }, [selectedBridge, allBridges]);

//   useEffect(() => {
//     if (selectedBridge) {
//       router.replace(`?id=${selectedBridge}`);
//       dispatch(getAllTestCasesOfBridgeAction({ bridgeId: selectedBridge }));
//     }
//   }, [selectedBridge, router]);

//   useEffect(() => {
//     if (selectedVersion) {
//       router.replace(`?id=${selectedBridge}&version=${selectedVersion}`);
//     }
//   }, [selectedVersion, router]);

//   const handleRunTestCase = () => {
//     setIsLoading(true);
//     dispatch(runTestCaseAction({ versionId: selectedVersion, bridgeId: selectedBridge }))
//       .then(() => { dispatch(getAllTestCasesOfBridgeAction({ bridgeId: selectedBridge })); setIsLoading(false); });
//   }


//   const toggleRow = (index) => {
//     setExpandedRows(prev => ({
//       ...prev,
//       [index]: !prev[index]
//     }));
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">Test Cases</h1>
//       <div className='flex justify-between items-center'>
//         <div className="flex gap-4">
//           {/* <div className="form-control w-full max-w-xs">
//             <label className="label">
//               <span className="label-text flex items-center gap-2">
//                 Select Bridge 
//               </span>
//             </label>
//             <div className="dropdown">
//               <div tabIndex={0} role="button" className="btn btn-outline w-full justify-start">
//                 {selectedBridge ? allBridges.find(b => b._id === selectedBridge)?.name : <>Select a Bridge <ChevronDown className="w-4 h-4" /></>}
//               </div>
//               <div className="dropdown-content bg-base-200 p-2 shadow rounded-box w-96 max-h-96 overflow-y-auto overflow-x-hidden z-[1000] relative">
//                 <input
//                   type="text"
//                   placeholder="Search bridges..."
//                   className="input input-bordered w-full sticky top-0 z-10"
//                   value={filterBridges}
//                   onChange={(e) => setFilterBridges(e.target.value)}
//                 />
//                 <ul className="menu menu-sm pt-3">  
//                   {allBridges
//                     .filter(bridge => 
//                       bridge?.name.toLowerCase().includes(filterBridges.toLowerCase())
//                     )
//                     .map((bridge) => (
//                       <li key={bridge._id}>
//                         <button 
//                           className={`w-full text-left p-2 rounded ${
//                             bridge._id === selectedBridge 
//                               ? 'bg-primary text-primary-content' 
//                               : 'hover:bg-base-300'
//                           }`}
//                           onClick={() => {
//                             setSelectedBridge(bridge._id);
//                             setSelectedVersion('');
//                           }}
//                           aria-selected={bridge._id === selectedBridge}
//                         >
//                           {bridge.name}
//                         </button>
//                       </li>
//                     ))}
//                 </ul>
//               </div>
//             </div>
//           </div> 
//           */}

//           <div className="form-control w-full max-w-xs">
//             <label className="label">
//               <span className="label-text">Select Version</span>
//             </label>
//             <select
//               className="select select-bordered"
//               value={selectedVersion}
//               onChange={(e) => setSelectedVersion(e.target.value)}
//             >
//               <option disabled value="">Select a Version</option>
//               {selectedBridge && versions?.map((version, index) => (
//                 <option key={index} value={version}>
//                   version {index + 1}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//         <button className='btn btn-primary' onClick={handleRunTestCase} disabled={!selectedBridge || !selectedVersion || isloading}>
//           Run Test Case
//         </button>
//       </div>

//       <div className="mt-4">
//         <h2 className="text-lg font-semibold mb-2">Test Case Details</h2>
//         <div className="overflow-x-auto">
//           {/* <table className="table table-auto w-full">
//             <thead>
//               <tr>
//                 <th className=""></th>
//                 <th className="">User Input</th>
//                 <th className="">Expected Output</th>
//                 <th className="">Modal Answer</th>
//                 {versions.map((version, index) => (
//                   <th key={index} className="">{`V ${index + 1}`}</th>
//                 ))}
//                 <th className="">Delete</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedBridgeTestCases.map((testCase, index) => {
//                 const lastUserMessage = testCase.conversation
//                   .filter(message => message.role === 'user')
//                   .pop()?.content || 'N/A';

//                 const expectedOutput = testCase.expected.tool_calls
//                   ? JSON.stringify(testCase.expected.tool_calls)
//                   : testCase.expected.response || 'N/A';

//                 const handleDelete = (id) => {
//                   dispatch(deleteTestCaseAction({ testCaseId: id, bridgeId: selectedBridge }));
//                 };

//                 return (
//                   <tr key={index}>
//                     <td className="overflow-hidden max-w-1">{index + 1}</td>
//                     <td className="overflow-hidden whitespace-nowrap overflow-ellipsis">{lastUserMessage}</td>
//                     <td className="max-w-xs overflow-hidden whitespace-nowrap overflow-ellipsis">{expectedOutput}</td>
//                     {(() => {
//                       const testCaseVersionArray = testCase?.version_history?.[selectedVersion];
//                       const model_output = JSON.stringify(testCaseVersionArray?.[testCaseVersionArray.length - 1]?.model_output);
//                       return (
//                         <td className="overflow-hidden max-w-56 overflow-ellipsis whitespace-nowrap" data-tip={model_output || 'N/A'}>
//                           <div className="tooltip tooltip-left z-[999999]" data-tip={model_output || 'N/A'}>
//                             {model_output || 'N/A'}
//                           </div>
//                         </td>
//                       );
//                     })()}

//                     {versions.map((version, versionIndex) => {
//                       const testCaseVersionArray = testCase?.version_history?.[version];
//                       const versionScore = testCaseVersionArray?.[testCaseVersionArray.length - 1]?.score;
//                       return (
//                         <td key={versionIndex} className="max-w-10 whitespace-nowrap overflow-hidden overflow-ellipsis">{versionScore || 'N/A'}</td>
//                       )
//                     })}
//                     <td className="">
//                       <button
//                         onClick={() => handleDelete(testCase?._id)}
//                       >
//                         <Trash2 color='red' />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table> */}
//           <table className="table table-auto w-full">
//             <thead>
//               <tr>
//                 <th className="w-8"></th>
//                 <th className="">User Input</th>
//                 <th className="">Expected Output</th>
//                 <th className="">Modal Answer</th>
//                 {versions.map((version, index) => (
//                   <th key={index} className="">{`V ${index + 1}`}</th>
//                 ))}
//                 <th className="">Delete</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedBridgeTestCases.map((testCase, index) => {
//                 const lastUserMessage = testCase.conversation
//                   .filter(message => message.role === 'user')
//                   .pop()?.content || 'N/A';

//                 const expectedOutput = testCase.expected.tool_calls
//                   ? JSON.stringify(testCase.expected.tool_calls)
//                   : testCase.expected.response || 'N/A';

//                 const testCaseVersionArray = testCase?.version_history?.[selectedVersion];
//                 const model_output = JSON.stringify(testCaseVersionArray?.[testCaseVersionArray.length - 1]?.model_output);

//                 const isExpanded = expandedRows[index] || false;

//                 return (
//                   <React.Fragment key={index}>
//                     <tr className="hover cursor-pointer" onClick={() => toggleRow(index)}>
//                       <td className="font-medium">
//                         {index + 1}
//                         <span className="ml-2">
//                           {isExpanded ? '▼' : '▶'}
//                         </span>
//                       </td>
//                       <td className="max-w-xs overflow-hidden whitespace-nowrap overflow-ellipsis">
//                         {lastUserMessage.substring(0, 30)}{lastUserMessage.length > 30 ? '...' : ''}
//                       </td>
//                       <td className="max-w-xs overflow-hidden whitespace-nowrap overflow-ellipsis">
//                         {expectedOutput.substring(0, 30)}{expectedOutput.length > 30 ? '...' : ''}
//                       </td>
//                       <td className="max-w-xs overflow-hidden whitespace-nowrap overflow-ellipsis">
//                         {model_output ? model_output.substring(0, 30) + (model_output.length > 30 ? '...' : '') : 'N/A'}
//                       </td>
//                       {versions.map((version, versionIndex) => {
//                         const versionArray = testCase?.version_history?.[version];
//                         const versionScore = versionArray?.[versionArray.length - 1]?.score;
//                         return (
//                           <td key={versionIndex} className="overflow-hidden overflow-ellipsis whitespace-nowrap max-w-20">{versionScore || 'N/A'}</td>
//                         );
//                       })}
//                       <td>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             dispatch(deleteTestCaseAction({ testCaseId: testCase?._id, bridgeId: selectedBridge }));
//                           }}
//                         >
//                           <Trash2 color="red" size={16} />
//                         </button>
//                       </td>
//                     </tr>
//                     {isExpanded && (
//                       <tr className="bg-base-200">
//                         <td colSpan={versions.length + 5} className="p-4">
//                           <div className="grid grid-cols-1 gap-4">
//                             <div>
//                               <h3 className="font-bold">User Input:</h3>
//                               <div className="p-2 bg-base-100 rounded mt-1 overflow-auto max-h-40">{lastUserMessage}</div>
//                             </div>
//                             <div>
//                               <h3 className="font-bold">Expected Output:</h3>
//                               <div className="p-2 bg-base-100 rounded mt-1 overflow-auto max-h-40 whitespace-pre-wrap">{expectedOutput}</div>
//                             </div>
//                             <div>
//                               <h3 className="font-bold">Modal Answer:</h3>
//                               <div className="p-2 bg-base-100 rounded mt-1 overflow-auto max-h-40 whitespace-pre-wrap">{model_output || 'N/A'}</div>
//                             </div>
//                             <div>
//                               <h3 className="font-bold">Version Scores:</h3>
//                               <div className="flex flex-wrap gap-4 mt-2">
//                                 {versions.map((version, versionIndex) => {
//                                   const versionArray = testCase?.version_history?.[version];
//                                   const versionScore = versionArray?.[versionArray.length - 1]?.score;
//                                   return (
//                                     <div key={versionIndex} className="badge badge-lg">
//                                       V{versionIndex + 1}: {versionScore || 'N/A'}
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default TestCases;