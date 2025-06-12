import { optimizeSchemaApi } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal, createDiff, simulateStreaming } from "@/utils/utility";
import { Copy, Redo, Undo } from 'lucide-react';
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";

import ComparisonCheck from "@/utils/comparisonCheck";
import Canvas from "../Canvas";

function JsonSchemaModal({ params }) {
  const [diff, setDiff] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedSchema, setStreamedSchema] = useState("");
  const [copyText, setCopyText] = useState("Copy Schema");
  const [loading, setLoading] = useState(false);
  const [newJsonSchema, setNewJsonSchema] = useState("");
  const dispatch = useDispatch();

  const { json_schema } = useCustomSelector((state) => ({
    json_schema:
      state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[
        params?.version
      ]?.configuration?.response_type?.json_schema,
  }));

  const [jsonSchemaRequirenments, setJsonSchemaRequirenments] = useState(
    typeof json_schema === "object"
      ? JSON.stringify(json_schema, null, 4)
      : json_schema
  );
  
  useEffect(() => {
    setJsonSchemaRequirenments(
      typeof json_schema === "object"
        ? JSON.stringify(json_schema, null, 4)
        : json_schema
    );
  }, [json_schema]);

  // Calculate diff between original and new schema
  const diffData = useMemo(() => {
    const displaySchema = isStreaming ? streamedSchema : newJsonSchema;
    if (!displaySchema) return [];
    return createDiff(jsonSchemaRequirenments, displaySchema);
  }, [jsonSchemaRequirenments, newJsonSchema, streamedSchema, isStreaming]);

  const optimizeSchema = async (instructionText) => {
    setLoading(true);

    try {
      const result = await optimizeSchemaApi({
        data: {
          query: instructionText,
          json_schema: jsonSchemaRequirenments,
        },
      });
      const parsedResult = JSON.stringify(result.updated, undefined, 4);

      // Use streaming to display the result
      simulateStreaming(parsedResult, setStreamedSchema, setIsStreaming, () => {
        setNewJsonSchema(parsedResult);
      });

      return result;
    } catch (error) {
      console.error("Optimization Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = (e) => {
    e.preventDefault();
    setNewJsonSchema("");
    setStreamedSchema("");
    setIsStreaming(false);
    setMessages([]);
    setDiff(false);
    closeModal(MODAL_TYPE.JSON_SCHEMA);
  };

  const handleFinalize = async () => {
    try {
      const schemaToApply = isStreaming ? streamedSchema : newJsonSchema;
      await dispatch(
        updateBridgeVersionAction({
          bridgeId: params.id,
          versionId: params.version,
          dataToSend: {
            configuration: {
              response_type: {
                type: "json_schema",
                json_schema: JSON.parse(schemaToApply),
              },
            },
          },
        })
      );
      setLoading(false);
      handleCloseModal({ preventDefault: () => { } });
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = isStreaming ? streamedSchema : newJsonSchema;
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy Schema"), 2000);
    navigator.clipboard.writeText(textToCopy);
  };

  // Determine what to display in the AI Generated Schema textarea
  const getSchemaDisplayValue = () => {
    if (isStreaming) {
      return streamedSchema;
    }
    if (newJsonSchema) {
      return newJsonSchema;
    }
    return jsonSchemaRequirenments;
  };

  const displaySchema = isStreaming ? streamedSchema : newJsonSchema;

  return (
    <dialog id={MODAL_TYPE.JSON_SCHEMA} className="modal">
      <div className="modal-box w-full max-w-[100rem] bg-white overflow-hidden">
        <div className="flex justify-between items-center mb-0">
          <h3 className="font-bold text-lg mb-4">Improve Json Schema</h3>
          <button
            className={`btn btn-sm right-20 mr-0 btn-primary`}
            onClick={() => setDiff(prev => !prev)}
            type="button"
          >
            {diff ? "Instructions" : "Show Diff"}
          </button>
        </div>

        <div className="flex gap-3 overflow-hidden w-full">
          <div className="w-full">
            {!diff ? (
              <>
                <Canvas
                  OptimizePrompt={optimizeSchema}
                  messages={messages}
                  setMessages={setMessages}
                />
              </>
            ) : (
              <ComparisonCheck diffData={diffData} isStreaming={isStreaming} displayPrompt={displaySchema} key="jsonSchema"/>
            )}
          </div>

          {!diff && (
            <div className="w-full pt-3">
              <div className="flex justify-between items-center">
                <div className="label">
                  <span className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                    AI Generated Schema
                    {isStreaming && (
                      <span className="ml-2 text-sm text-gray-500 animate-pulse">
                        ✨ Generating...
                      </span>
                    )}
                  </span>
                </div>
                {displaySchema && (
                  <div className="label gap-2">
                    <div className="tooltip tooltip-left cursor-pointer" data-tip={copyText}>
                      <Copy
                        onClick={copyToClipboard}
                        size={20}
                        className={`${(!displaySchema || isStreaming) ? "opacity-50 pointer-events-none" : ""}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <textarea
                  className={`textarea textarea-bordered border ${newJsonSchema === "" && !loading ? 'mt-0' : 'mt-3'} w-full min-h-96 resize-y focus:border-primary caret-black p-2 font-mono text-sm`}
                  style={{ height: "60vh", width: "100%" }}
                  value={getSchemaDisplayValue()}
                  onChange={(e) => {
                    if (!isStreaming) {
                      setNewJsonSchema(e.target.value);
                    }
                  }}
                  readOnly={isStreaming}
                />
                {isStreaming && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white px-2 py-1 rounded-md shadow-sm border">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-600">Streaming</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-action mt-1">
          <form method="dialog" className="flex gap-2" onSubmit={(e) => {
            e.preventDefault()
            handleFinalize()
          }}>
            <button className="btn" onClick={(e) => {
              e.preventDefault();
              handleCloseModal(e);
            }}>
              Close
            </button>
            <button
              className="btn btn-primary ml-2"
              disabled={loading || isStreaming || !displaySchema}
              type="submit"
            >
              {loading && <span className="loading loading-spinner loading-sm"></span>}
              Apply
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

export default React.memo(JsonSchemaModal);