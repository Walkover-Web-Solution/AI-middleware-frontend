"use client";
import { Trash } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  updateBridgeAction,
  getTestcasesScroreAction,
} from "@/store/action/bridgeAction";
import { useParams, useSearchParams } from "next/navigation";
import { useCustomSelector } from "@/customHooks/customSelector";

function Testcase() {
  const params = useParams();
  const searchParams = useSearchParams();
  const version = searchParams.get("version");

  const { bridge_testcases } = useCustomSelector((state) => ({
    bridge_testcases:
      state?.bridgeReducer?.allBridgesMap?.[params?.id]?.expected_qna,
  }));

  const [isGeneratingScore, setIsGeneratingScore] = useState(false);
  const [newTestCaseData, setNewTestCaseData] = useState(bridge_testcases);

  const handleCreateTestcase = async () => {
    setIsGeneratingScore(true);
    try {
      const totalData = await dispatch(getTestcasesScroreAction(version));

      const cleanedTestCases = totalData?.comparison_score?.map(
        ({
          question,
          expected_answer,
          answer,
          model_answer,
          comparison_score,
        }) => {
          const prevTestCase =
            newTestCaseData?.find?.((tc) => tc.question === question) || {};
          return {
            question,
            answer: expected_answer || answer,
            model_answer,
            prev_comparison_score: prevTestCase?.comparison_score || null,
            comparison_score,
          };
        }
      );

      setNewTestCaseData(cleanedTestCases);
    } finally {
      setIsGeneratingScore(false);
    }
  };

  const dispatch = useDispatch();
  const [isTestCasesEdited, setIsTestCasesEdited] = useState(false);
  const handleRemoveTestCase = (index) => {
    setNewTestCaseData((newTestCaseData || []).filter((_, i) => i !== index));
    setIsTestCasesEdited(false);
  };

  const handleTestCaseChange = (index, field, value) => {
    setNewTestCaseData(
      (newTestCaseData || []).map((testCase, i) =>
        i === index ? { ...testCase, [field]: value } : testCase
      )
    );
    setIsTestCasesEdited(true);
  };

  const handleAddTestCase = () => {
    setNewTestCaseData([
      ...(newTestCaseData || []),
      {
        question: "",
        answer: "",
        model_answer: null,
        comparison_score: null,
        prev_comparison_score: null,
      },
    ]);
    setIsTestCasesEdited(true);
  };

  const handleSaveTestCases = (testCaseData) => {
    const cleanedTestCases =
      (testCaseData?.length > 0 ? testCaseData : newTestCaseData || [])
        ?.filter(({ question, answer }) => question && answer)
        ?.map(({ question, answer, comparison_score }) => ({
          question,
          answer,
          comparison_score,
        })) || [];

    const dataToSend = { expected_qna: cleanedTestCases || [] };
    if (cleanedTestCases.length > 0) {
      dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend }));
    }
    setIsTestCasesEdited(false);
  };

  const handleGenerateScore = useCallback(async () => {
    setIsGeneratingScore(true);
    try {
      const totalData = await dispatch(getTestcasesScroreAction(version));
      const cleanedTestCases = totalData?.comparison_score?.map(
        ({
          question,
          expected_answer,
          model_answer,
          answer,
          comparison_score,
        }) => {
          const prevTestCase = bridge_testcases?.find(
            (tc) => tc.question === question
          );
          return {
            question,
            answer: expected_answer || answer,
            model_answer,
            prev_comparison_score: prevTestCase?.comparison_score || null,
            comparison_score,
          };
        }
      );
      setNewTestCaseData(cleanedTestCases);
      handleSaveTestCases(cleanedTestCases);
      setIsTestCasesEdited(false);
    } finally {
      setIsGeneratingScore(false);
    }
  }, [dispatch, params?.version, newTestCaseData, bridge_testcases]);

  useEffect(()=>{
    handleCreateTestcase()
  },[])

  return (
    <div className="w-screen h-full">
      <div className="relative overflow-y-hidden">
        {isGeneratingScore && (
          <div className="absolute inset-0 bg-base-100/90 flex items-center justify-center rounded-lg z-[999999]">
            <div className="text-center space-y-4">
              <div className="loading loading-ring loading-lg"></div>
              <p className="text-lg font-medium">
                {newTestCaseData?.length === 0
                  ? "Generating Test Case..."
                  : "Running Test Cases..."}
              </p>
            </div>
          </div>
        )}

        <div className="bg-base-200 p-4 rounded-lg">
          <div className=" overflow-y-auto space-y-4">
            {newTestCaseData?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Existing Test Cases</h4>
                <div className="space-y-4">
                  {newTestCaseData.map((testCase, index) => (
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
                          <label className="block text-sm font-medium">
                            Question
                          </label>
                          <input
                            type="text"
                            value={testCase?.question || ""}
                            onChange={(e) =>
                              handleTestCaseChange(
                                index,
                                "question",
                                e.target.value
                              )
                            }
                            className="input input-bordered w-full min-h-[120px]"
                            placeholder="Enter question"
                            disabled={isGeneratingScore}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="block text-sm font-medium">
                            Expected Answer
                          </label>
                          <textarea
                            value={
                              testCase?.answer ||
                              testCase?.expected_answers ||
                              ""
                            }
                            onChange={(e) =>
                              handleTestCaseChange(
                                index,
                                "answer",
                                e.target.value
                              )
                            }
                            className="textarea textarea-bordered w-full min-h-[120px]"
                            placeholder="Enter model answer"
                            disabled={isGeneratingScore}
                          />
                        </div>
                        {testCase?.model_answer && (
                          <div className="flex-1 space-y-1">
                            <label className="block text-sm font-medium">
                              Model Answer
                            </label>
                            <textarea
                              value={testCase?.model_answer || ""}
                              onChange={(e) =>
                                handleTestCaseChange(
                                  index,
                                  "model_answer",
                                  e.target.value
                                )
                              }
                              className="textarea textarea-bordered w-full min-h-[120px]"
                              placeholder="Enter model answer"
                              disabled
                            />
                          </div>
                        )}
                        {testCase?.prev_comparison_score && (
                          <div className="w-32 space-y-1">
                            <label className="block text-sm font-medium">
                              Previous Score
                            </label>
                            <div
                              className="radial-progress text-primary"
                              style={{
                                "--value": testCase?.prev_comparison_score
                                  ? Math.round(
                                      testCase.prev_comparison_score * 100
                                    )
                                  : 0,
                              }}
                              role="progressbar"
                            >
                              {testCase?.prev_comparison_score
                                ? `${Math.round(
                                    testCase.prev_comparison_score * 100
                                  )}%`
                                : "N/A"}
                            </div>
                          </div>
                        )}
                        {testCase?.comparison_score && (
                          <div className="w-32 space-y-1">
                            <label className="block text-sm font-medium">
                              {testCase?.prev_comparison_score
                                ? "Current Score"
                                : "Score"}
                            </label>
                            <div
                              className="radial-progress text-primary"
                              style={{
                                "--value": testCase?.comparison_score
                                  ? Math.round(testCase.comparison_score * 100)
                                  : 0,
                              }}
                              role="progressbar"
                            >
                              {testCase?.comparison_score
                                ? `${Math.round(
                                    testCase.comparison_score * 100
                                  )}%`
                                : "N/A"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              className={`btn btn-ghost btn-sm ${
                isGeneratingScore ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleAddTestCase}
              disabled={isGeneratingScore}
            >
              Add New Test Case
            </button>

            {isTestCasesEdited ? (
              <button className="btn" onClick={handleSaveTestCases}>
                Save Test Cases
              </button>
            ) :
              <button className="btn" onClick={handleGenerateScore}>
                Run Test Case
              </button>
           }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testcase;
