import React, { useState, useEffect } from 'react';
import { Play, Clock, AlertCircle, Eye, EyeOff, History, ChevronDown, ChevronRight, TrashIcon } from 'lucide-react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { useDispatch } from 'react-redux';
import { deleteTestCaseAction, getAllTestCasesOfBridgeAction, runTestCaseAction } from '@/store/action/testCasesAction';


const TestCaseSidebar = ({ params, resolvedParams, onTestCaseClick }) => {
  const [runningTests, setRunningTests] = useState(new Set());
  const [expandedTests, setExpandedTests] = useState(new Set());
  const [expandedVersions, setExpandedVersions] = useState({});
  const [selectedVersion, setSelectedVersion] = useState('');
  const dispatch = useDispatch();

  const { testCases, isFirstTestcase, versions } = useCustomSelector((state) => ({
    testCases: state?.testCasesReducer?.testCases?.[params?.id] || [],
    isFirstTestcase: state?.userDetailsReducer?.userDetails?.meta?.onboarding?.TestCasesSetup || false,
    versions: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || [],
  }));

  useEffect(() => {
    dispatch(getAllTestCasesOfBridgeAction({ bridgeId: params?.id }));
  }, [])
  const runSingleTest = async (testId) => {
    setRunningTests(prev => new Set([...prev, testId]));
    try {
      await dispatch(runTestCaseAction({ versionId: resolvedParams?.version, bridgeId: params?.id, testcase_id: testId }));
      await dispatch(getAllTestCasesOfBridgeAction({ bridgeId: params?.id }));
    } catch (error) {
      console.error('Error running test case:', error);
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const runAllTests = async () => {
    const testIds = Array.isArray(testCases) ? testCases.map(test => test._id) : [];
    setRunningTests(new Set(testIds));
    await dispatch(runTestCaseAction({ versionId: resolvedParams?.version, bridgeId: params?.id }));
    await dispatch(getAllTestCasesOfBridgeAction({ bridgeId: params?.id }));
    setRunningTests(new Set());
  }

  const handleDeleteTestCase = async (testId) => {
    try {
      await dispatch(deleteTestCaseAction({ bridgeId: params?.id, testCaseId: testId }));
      await dispatch(getAllTestCasesOfBridgeAction({ bridgeId: params?.id }));
    } catch (error) {
      console.error('Error deleting test case:', error);
    }
  }

  const toggleExpanded = (testId) => {
    setExpandedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      return newSet;
    });
  };

  const toggleVersionHistory = (testId) => {
    setExpandedVersions(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const handleTestCaseClick = (testCase) => {
    if (onTestCaseClick && testCase.conversation) {
      onTestCaseClick(testCase.conversation, testCase.expected);
    }
  };

  useEffect(() => {
    if (versions && versions.length > 0 && !selectedVersion) {
      setSelectedVersion(versions[0]);
    }
  }, [versions]);

  const getCurrentVersionScore = (testCase) => {
    if (!testCase?.version_history || !resolvedParams?.version) return null;

    const versionHistory = testCase.version_history[resolvedParams.version];
    if (!versionHistory || versionHistory.length === 0) return null;

    const latestRun = versionHistory[versionHistory.length - 1];
    return latestRun?.score !== undefined ? latestRun.score : null;
  };

  const getStatusIcon = (testId) => {
    if (runningTests.has(testId)) {
      return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusColor = (testId) => {
    if (runningTests.has(testId)) return 'border-yellow-200 bg-yellow-50 text-black/70';
  };
  const testCaseArray = Array.isArray(testCases) ? testCases : [];
  return (
    <div className="bg-base-100 h-full overflow-y-auto border-r border-base-content/20">
      <div className="p-4 border-b border-base-content/20">
        <h2 className="text-lg font-semibold text-base-content">Test Cases</h2>
        <p className="text-sm text-base-content mt-1">
          Manage and execute test batches ({testCaseArray.length} tests)
        </p>
        {isFirstTestcase && (
          <div className="mt-2 p-2 bg-base-200 border border-base-content/20 rounded-md">
            <p className="text-xs text-base-primary">Welcome! This is your first test case setup.</p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {testCaseArray.length === 0 ? (
          <div className="text-center py-8 text-base-content">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-base-content" />
            <p className="text-sm">No test cases available</p>
          </div>
        ) : (
          testCaseArray.map((testCase, index) => {
            const isExpanded = expandedTests.has(testCase._id);
            return (
              <div
                key={testCase._id}
                className={`border rounded-lg p-3 transition-all duration-200 cursor-pointer hover:bg-base-200/50 hover:border-primary/50 ${getStatusColor(testCase._id)}`}
                onClick={() => handleTestCaseClick(testCase)}
                title="Click to load this test case conversation into chat"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-2">
                    {runningTests.has(testCase._id) ?
                      <Clock className="w-4 h-4 text-yellow-500 animate-spin" /> :
                      getStatusIcon(testCase._id)}
                    <span className="font-medium text-sm">
                      <span className="font-medium">Input:</span> {testCase.conversation?.[0]?.content || 'No input'}
                    </span>
                    <span className="text-xs text-primary/70 ml-2">Click to load</span>

                    {/* Current version score display */}
                    {!runningTests.has(testCase._id) && (
                      <>
                        {getCurrentVersionScore(testCase) !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCurrentVersionScore(testCase) >= 0.7 ? 'bg-green-100 text-green-800' : getCurrentVersionScore(testCase) >= 0.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {(getCurrentVersionScore(testCase) * 100).toFixed(0)}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(testCase._id);
                      }}
                      className="p-1 hover:bg-base-300 rounded hover:text-base-content"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runSingleTest(testCase._id);
                      }}
                      disabled={runningTests.has(testCase._id)}
                      className={runningTests.has(testCase._id) ? 'bg-transparent' : 'p-1.5 rounded hover:bg-success disabled:opacity-50 disabled:cursor-not-allowed relative bg-success/80'}
                      title="Run Test"
                    >
                      {runningTests.has(testCase._id) ? (
                        <span className="loading loading-spinner loading-xs text-base-content p-0"></span>
                      ) : (
                        <Play className="w-3 h-3 text-base-content" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTestCase(testCase._id);
                      }}
                      className="p-1 hover:bg-base-300 rounded hover:text-base-content"
                      title="Delete Test"
                    >
                      <TrashIcon className="w-4 h-4 text-error/80 hover:text-error" />
                    </button>
                  </div>
                </div>

                {/* Test Preview */}
                <div className="text-xs mb-2">
                  <p className="">
                    <span className="font-bold">Expected:</span> {testCase.expected?.response || 'No input'}
                  </p>
                  <p className="mt-1">
                    <span className="font-bold">Model Response:</span> {testCase?.version_history?.[resolvedParams.version]?.[testCase?.version_history?.[resolvedParams.version].length - 1]?.model_output}
                  </p>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-base-100 rounded">
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-base-content">Expected Response:</span>
                        <div className="mt-1 p-2 bg-base-100 rounded max-h-20 overflow-y-auto">
                          <p className="text-base-content text-xs">{testCase.expected?.response}</p>
                        </div>
                      </div>

                      <div>
                        <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                          {testCase.conversation?.map((msg, idx) => (
                            <div key={idx} className="p-2 bg-base-100 rounded">
                              <span className="font-medium text-base-content">{msg.role}:</span>
                              <p className="text-base-content text-xs mt-1">
                                {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Version History Section */}
                      {testCase.version_history && Object.keys(testCase.version_history).length > 0 && (
                        <div>
                          <div
                            className="flex items-center justify-between cursor-pointer py-1"
                            onClick={() => toggleVersionHistory(testCase._id)}
                          >
                            <div className="flex items-center">
                              <History className="w-3 h-3 mr-1 text-base-content" />
                              <span className="font-medium text-base-content">Run History</span>
                            </div>
                            {expandedVersions[testCase._id] ?
                              <ChevronDown className="w-3 h-3 text-base-content" /> :
                              <ChevronRight className="w-3 h-3 text-base-content" />
                            }
                          </div>

                          {expandedVersions[testCase._id] && (
                            <div className="mt-2 border border-base-content/20 rounded overflow-hidden">
                              <table className="w-full text-xs">
                                <thead className="bg-base-200">
                                  <tr>
                                    <th className="p-2 text-left">Version</th>
                                    <th className="p-2 text-left">Model</th>
                                    <th className="p-2 text-left">Score</th>
                                    <th className="p-2 text-left">Last Run</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(testCase.version_history).map(([versionId, runs]) => {
                                    const latestRun = runs[runs.length - 1];
                                    const versionIndex = versions.findIndex(v => v === versionId) + 1;
                                    return (
                                      <tr key={versionId} className="border-t border-base-content/20">
                                        <td className="p-2">V{versionIndex || '?'}</td>
                                        <td className="p-2">{latestRun?.metadata?.model || 'N/A'}</td>
                                        <td className="p-2">
                                          {latestRun?.score !== undefined ?
                                            `${(latestRun.score * 100).toFixed(2)}%` :
                                            'N/A'}
                                        </td>
                                        <td className="p-2">
                                          {latestRun?.created_at ?
                                            new Date(latestRun.created_at).toLocaleString() :
                                            'N/A'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-base-content/20 mt-auto">
        <button
          className="w-full bg-blue-500 text-base-100 py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200"
          onClick={runAllTests}
          disabled={testCaseArray.length === 0 || runningTests.size > 0}
        >
          {runningTests.size > 0 ? (
            <div className="flex items-center justify-center">
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              <span>Running {runningTests.size}/{testCaseArray.length} Tests...</span>
            </div>
          ) : 'Run All Test Cases'}
        </button>
      </div>
    </div>
  );
};

export default TestCaseSidebar;