'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomSelector } from '@/customHooks/customSelector';
import { useDispatch } from 'react-redux';
import { deleteTestCaseAction, getAllTestCasesOfBridgeAction } from '@/store/action/testCasesAction';
import { Trash2 } from 'lucide-react';

function TestCases({ params }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedBridge, setSelectedBridge] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');

  const allBridges = useCustomSelector((state) => state.bridgeReducer.org[params.org_id]?.orgs || []).slice().reverse();
  const { testCases } = useCustomSelector((state) => ({
    testCases: state.testCasesReducer?.testCases || {},
  }));

  console.log(testCases,'testCases')

  const selectedBridgeTestCases = useMemo(() => {
    return testCases?.[selectedBridge] || [];
  }, [selectedBridge, testCases]);

  const versions = useMemo(() => {
    return allBridges.find((bridge) => bridge?._id === selectedBridge)?.versions || [];
  }, [selectedBridge, allBridges]);

  useEffect(() => {
    if (selectedBridge) {
      router.replace(`?id=${selectedBridge}`);
      dispatch(getAllTestCasesOfBridgeAction({ bridgeId: selectedBridge }));
    }
  }, [selectedBridge, router]);

  useEffect(() => {
    if (selectedVersion) {
      router.replace(`?id=${selectedBridge}&version=${selectedVersion}`);
    }
  }, [selectedVersion, router]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Test Cases</h1>
      <div className="flex gap-4">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Select Bridge</span>
          </label>
          <select
            className="select select-bordered"
            value={selectedBridge}
            onChange={(e) => setSelectedBridge(e.target.value)}
          >
            <option disabled value="">Select a Bridge</option>
            {allBridges.map((bridge) => (
              <option key={bridge._id} value={bridge._id}>
                {bridge?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Select Version</span>
          </label>
          <select
            className="select select-bordered"
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            disabled={!selectedBridge}
          >
            <option disabled value="">Select a Version</option>
            {selectedBridge && versions?.map((version, index) => (
              <option key={index} value={version}>
                {version}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Test Case Details</h2>
        <table className="table table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">User Input</th>
              <th className="px-4 py-2">Expected Output</th>
              <th className="px-4 py-2">Modal Answer</th>
              {versions.map((version, index) => (
                <th key={index} className="px-4 py-2">{`V ${index + 1}`}</th>
              ))}
              <th className="px-4 py-2">Delete</th>
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
                  <td className="px-4 py-2">{lastUserMessage}</td>
                  <td className="px-4 py-2">{expectedOutput}</td>
                  <td className="px-4 py-2">N/A</td>
                  {versions.map((version, versionIndex) => (
                    <td key={versionIndex} className="px-4 py-2">N/A</td>
                  ))}
                  <td className="px-4 py-2">
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
        </table>
      </div>
    </div>
  );
}

export default TestCases;