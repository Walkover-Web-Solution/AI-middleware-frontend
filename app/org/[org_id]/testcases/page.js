"use client";
import React, { useEffect, useState } from "react";
import { Trash2, Edit } from "lucide-react";
import { useCustomSelector } from "@/customHooks/customSelector";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

const Testcases = () => {
  const [testCases, setTestCases] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [question, setQuestion] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [selectedBridge, setSelectedBridge] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [sidebarText, setSidebarText] = useState("");
  const [selectedFunctions, setSelectedFunctions] = useState([]);
  const [functionInput, setFunctionInput] = useState("");
  const [runResults, setRunResults] = useState({});
  const [scores, setScores] = useState({});
  const [editingTestCaseId, setEditingTestCaseId] = useState(null);

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const path = pathName.split("?")[0].split("/");

  const allBridges = useCustomSelector(
    (state) => state.bridgeReducer.org[params.org_id]?.orgs || []
  )
    .slice()
    .reverse();
  

  const bridgeOptions = allBridges.map((bridge) => bridge.name);
  const versionOptions = allBridges.flatMap((bridge) => bridge.versions);
  const availableFunctions = [
    "Function 1",
    "Function 2",
    "Function 3",
    "Function 4",
  ];

  useEffect(() => {
    const currentBridge = params.id;
    const selectedBridgeName = allBridges.find((bridge) => bridge._id === currentBridge)
    if (selectedBridgeName) {
      setSelectedBridge(selectedBridgeName.name);
    }
  }, [params.id]);

  useEffect(() => {
    const bridgeIdFromUrl = params?.bridgeId;
    if (bridgeIdFromUrl) setSelectedBridge(bridgeIdFromUrl);

    const versionFromQuery = searchParams.get("version");
    if (versionFromQuery) setSelectedVersionId(versionFromQuery);
  }, [searchParams]);

  const handleBridgeChange = (e) => {
    const newBridge = e.target.value;
    setSelectedBridge(newBridge);
    const selectedBridgeId = allBridges.find((bridge) => bridge.name === newBridge)
    router.push(
      `/org/${path[2]}/testcases?id=${selectedBridgeId._id}&version=${selectedVersionId}`
    );
  };

  const handleVersionChange = (e) => {
    const newVersionId = e.target.value;
    setSelectedVersionId(newVersionId);
    const id = searchParams.get('id')
    router.push(
      `/org/${path[2]}/testcases?id=${id}&version=${newVersionId}`
    )
  };

  const handleAddTestCase = () => {
    setShowAddForm(true);
    setEditingTestCaseId(null);
    setQuestion("");
    setExpectedOutput("");
  };

  const handleEditTestCase = (id) => {
    const testCase = testCases.find((tc) => tc.id === id);
    if (testCase) {
      setEditingTestCaseId(id);
      setQuestion(testCase.question);
      setExpectedOutput(testCase.expectedOutput);
      setShowAddForm(true);
    }
  };

  const handleSaveTestCase = () => {
    if (question && expectedOutput) {
      if (editingTestCaseId) {
        const updatedTestCases = testCases.map((tc) =>
          tc.id === editingTestCaseId ? { ...tc, question, expectedOutput } : tc
        );
        setTestCases(updatedTestCases);
      } else {
        const newTestCase = {
          id: Date.now(),
          question,
          expectedOutput,
          modelAnswer: "",
          score: 0,
        };
        setTestCases([...testCases, newTestCase]);
      }

      setQuestion("");
      setExpectedOutput("");
      setShowAddForm(false);
      setEditingTestCaseId(null);
    }
  };

  const handleRunTestCases = () => {
    const results = {};
    const newScores = {};

    testCases.forEach((testCase) => {
      results[testCase.id] = "Model answer";
      newScores[testCase.id] = 1;
    });

    setRunResults(results);
    setScores(newScores);
  };

  const handleDeleteTestCase = (id) => {
    setTestCases(testCases.filter((testCase) => testCase.id !== id));
    const newResults = { ...runResults };
    const newScores = { ...scores };
    delete newResults[id];
    delete newScores[id];
    setRunResults(newResults);
    setScores(newScores);
  };

  const handleSaveSidebarText = () => {
    if (selectedOption === "functionCall") {
      try {
        JSON.parse(functionInput);
        setExpectedOutput(functionInput);
      } catch (e) {
        alert("Please enter valid JSON");
        return;
      }
    } else {
      setExpectedOutput(sidebarText);
    }
    setSidebarText("");
    setFunctionInput("");
    setSelectedFunctions([]);
    setShowSidebar(false);
    setSelectedOption(null);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setSidebarText("");
    setFunctionInput("");
  };

  const handleAddFunction = (func) => {
    if (!selectedFunctions.includes(func)) {
      setSelectedFunctions([...selectedFunctions, func]);
    }
  };

  const handleRemoveFunction = (func) => {
    setSelectedFunctions(selectedFunctions.filter((f) => f !== func));
  };

  const isValidJson = (text) => {
    try {
      JSON.parse(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="p-4 bg-base-200 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Test Cases</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Bridge ID</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedBridge}
              onChange={handleBridgeChange} // Pass the event, not `e.target.value`
            >
              <option value="" disabled>
                Select Bridge ID
              </option>
              {bridgeOptions.map((bridge, index) => (
                <option key={index} value={bridge}>
                  {bridge}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Version ID</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedVersionId}
              onChange={handleVersionChange} // Pass the event, not `e.target.value`
            >
              <option value="" disabled>
                Select Version ID
              </option>
              {versionOptions.map((version, index) => (
                <option key={index} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          {testCases.length > 0 && (
            <button
              className="btn btn-primary mr-2"
              onClick={handleRunTestCases}
            >
              Run Test Cases
            </button>
          )}
          <button className="btn btn-outline" onClick={handleAddTestCase}>
            Add Test Case
          </button>
        </div>
      </div>

      {/* Test cases list */}
      {testCases.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Test Cases:</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Expected Output</th>
                  {Object.keys(runResults).length > 0 && <th>Model Answer</th>}
                  {Object.keys(scores).length > 0 && <th>Score</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {testCases.map((testCase) => (
                  <tr key={testCase.id} className="hover">
                    <td className="whitespace-normal max-w-xs">
                      {testCase.question}
                    </td>
                    <td className="whitespace-normal max-w-xs">
                      {testCase.expectedOutput}
                    </td>
                    {Object.keys(runResults).length > 0 && (
                      <td className="whitespace-normal max-w-xs">
                        {runResults[testCase.id] || "Not run yet"}
                      </td>
                    )}
                    {Object.keys(scores).length > 0 && (
                      <td>
                        {scores[testCase.id] !== undefined
                          ? `${scores[testCase.id]}%`
                          : "1%"}
                      </td>
                    )}
                    <td>
                      <div className="flex">
                        <button
                          className="btn btn-ghost btn-sm mr-1"
                          onClick={() => handleDeleteTestCase(testCase.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditTestCase(testCase.id)}
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Test Case Form */}
      {showAddForm && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title">
                {editingTestCaseId ? "Edit Test Case" : "Add New Test Case"}
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTestCaseId(null);
                  setQuestion("");
                  setExpectedOutput("");
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex flex-row gap-4 overflow-x-auto pb-2">
              <div className="form-control w-full min-w-64">
                <label className="label">
                  <span className="label-text">Question</span>
                </label>
                <textarea
                  placeholder="Enter your question"
                  className="textarea textarea-bordered w-full h-32"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div className="form-control w-full min-w-64">
                <label className="label">
                  <span className="label-text">Expected Output</span>
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Click to open sidebar"
                    className="textarea textarea-bordered w-full h-32 cursor-pointer"
                    value={expectedOutput}
                    onClick={() => setShowSidebar(true)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="card-actions justify-end mt-4">
              <button
                className="btn btn-primary"
                onClick={handleSaveTestCase}
                disabled={!question || !expectedOutput}
              >
                {editingTestCaseId ? "Update Test Case" : "Save Test Case"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 flex z-[120]">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setShowSidebar(false)}
          ></div>
          <div className="relative w-96 max-w-lg bg-base-100 h-full shadow-xl p-4 ml-auto overflow-y-auto">
            <button
              className="btn btn-sm btn-circle absolute right-4 top-4"
              onClick={() => setShowSidebar(false)}
            >
              ✕
            </button>

            <h3 className="text-lg font-bold mt-6 mb-2">Current Question:</h3>
            <div className="p-3 bg-base-200 rounded-lg mb-6 whitespace-normal">
              {question || "No question entered yet"}
            </div>

            <h3 className="text-lg font-bold mb-4">Select Output Type</h3>
            <div className="flex flex-col gap-4 mb-6">
              <div
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedOption === "functionCall"
                    ? "border-primary bg-primary/10"
                    : "border-base-300"
                }`}
                onClick={() => handleOptionSelect("functionCall")}
              >
                Function Call
              </div>
              <div
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedOption === "rawText"
                    ? "border-primary bg-primary/10"
                    : "border-base-300"
                }`}
                onClick={() => handleOptionSelect("rawText")}
              >
                Raw Text
              </div>
            </div>

            {selectedOption === "functionCall" && (
              <div className="mt-4">
                <label className="label">
                  <span className="label-text font-semibold">
                    Choose Functions:
                  </span>
                </label>
                <select
                  className="select select-bordered w-full mb-4"
                  onChange={(e) => handleAddFunction(e.target.value)}
                  value=""
                >
                  <option value="" disabled>
                    Select a function
                  </option>
                  {availableFunctions.map((func, index) => (
                    <option key={index} value={func}>
                      {func}
                    </option>
                  ))}
                </select>

                {selectedFunctions.length > 0 && (
                  <div className="mb-4">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Selected Functions:
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedFunctions.map((func, index) => (
                        <div
                          key={index}
                          className="badge badge-primary badge-lg gap-2"
                        >
                          {func}
                          <button onClick={() => handleRemoveFunction(func)}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="label">
                  <span className="label-text font-semibold">JSON Input:</span>
                </label>
                <textarea
                  className={`textarea textarea-bordered w-full h-32 font-mono ${
                    !isValidJson(functionInput) && functionInput
                      ? "textarea-error"
                      : ""
                  }`}
                  value={functionInput}
                  onChange={(e) => setFunctionInput(e.target.value)}
                  placeholder='{"key": "value"}'
                ></textarea>
                {functionInput && !isValidJson(functionInput) && (
                  <p className="text-error text-sm mt-1">
                    Please enter valid JSON
                  </p>
                )}
              </div>
            )}

            {selectedOption === "rawText" && (
              <div className="mt-4">
                <label className="label">
                  <span className="label-text font-semibold">
                    Enter Expected Output:
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-64"
                  value={sidebarText}
                  onChange={(e) => setSidebarText(e.target.value)}
                  placeholder="Type your expected output here"
                ></textarea>
              </div>
            )}

            {selectedOption && (
              <button
                className="btn btn-primary w-full mt-6"
                onClick={handleSaveSidebarText}
                disabled={
                  (selectedOption === "functionCall" &&
                    (!functionInput || !isValidJson(functionInput))) ||
                  (selectedOption === "rawText" && !sidebarText.trim())
                }
              >
                Save
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Testcases;
