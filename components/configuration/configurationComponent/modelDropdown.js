import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";

const ModelDropdown = ({ params }) => {
  const dispatch = useDispatch();
  const [modelDescription, setModelDescription] = useState("");
  const [specificationData, setSpecificationData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  const { model, fineTuneModel, modelType, modelsList, bridgeType } =
    useCustomSelector((state) => ({
      model:
        state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[
          params?.version
        ]?.configuration?.model,
      fineTuneModel:
        state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[
          params?.version
        ]?.configuration?.fine_tune_model?.current_model,
      modelType:
        state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[
          params?.version
        ]?.configuration?.type,
      modelsList:
        state?.modelReducer?.serviceModels[
          state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[
            params?.version
          ]?.service
        ],
      bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    }));

  const handleModel = (e) => {
    const selectedModel = e.target.value.split("|")[1];
    const selectedModelType = e.target.selectedOptions[0].parentNode.label;
    dispatch(
      updateBridgeVersionAction({
        bridgeId: params.id,
        versionId: params.version,
        dataToSend: {
          configuration: { model: selectedModel, type: selectedModelType },
        },
      })
    );
  };

  const handleFinetuneModelChange = (e) => {
    const selectedFineTunedModel = e.target.value;
    dispatch(
      updateBridgeVersionAction({
        bridgeId: params.id,
        versionId: params.version,
        dataToSend: {
          configuration: {
            fine_tune_model: { current_model: selectedFineTunedModel },
          },
        },
      })
    );
  };

  const handleModelHover = (e, description, specification) => {
    const rect = e.target.getBoundingClientRect();

    let posX = rect.right + 10;
    let posY = rect.top;

    setModelDescription(
      description || "No description available for this model"
    );
    setSpecificationData(specification || null);

    setTooltipPosition({ x: posX, y: posY });
    setShowTooltip(true);
  };

  useEffect(() => {
    if (showTooltip && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let updatedX = tooltipPosition.x;
      let updatedY = tooltipPosition.y;

      if (tooltipPosition.x + tooltipRect.width > viewportWidth) {
        updatedX = viewportWidth - tooltipRect.width - 10;
      }

      if (tooltipPosition.y + tooltipRect.height > viewportHeight) {
        updatedY = viewportHeight - tooltipRect.height - 10;
      }

      if (updatedX !== tooltipPosition.x || updatedY !== tooltipPosition.y) {
        setTooltipPosition({ x: updatedX, y: updatedY });
      }
    }
  }, [showTooltip, tooltipPosition]);

  const handleModelLeave = () => {
    setShowTooltip(false);
  };

  const formatCost = (cost) => {
    return `$${(cost / 1000000).toFixed(6)} per 1M tokens`;
  };

  const hasContent = (data) => {
    if (!data) return false;
    if (Array.isArray(data))
      return data.some((item) => item && item.trim() !== "");
    if (typeof data === "string") return data.trim() !== "";
    return false;
  };

  const safeMap = (arr, callback) => {
    if (!arr) return null;
    if (!Array.isArray(arr)) {
      return arr && arr.trim() !== "" ? callback(arr, 0) : null;
    }
    return arr.filter((item) => item && item.trim() !== "").map(callback);
  };

  return (
    <>
      <div className="w-full flex-col space-y-4">
        {/* First Dropdown */}
        <div className="w-full max-w-xs">
          <div className="label">
            <span className="label-text font-medium">Model</span>
          </div>
          <div className="dropdown dropdown-bottom w-full">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-sm btn-bordered w-full justify-between"
            >
              {model || "Select a Model"}
            </div>
            <ul
              tabIndex={5}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full max-h-64 overflow-y-auto flex-row"
            >
              <li className="disabled w-full">
                <a>Select a Model</a>
              </li>
              {Object.entries(modelsList || {}).map(
                ([group, options], groupIndex) => {
                  const isInvalidGroup =
                    group === "models" ||
                    (bridgeType === "chatbot" && group === "embedding") ||
                    (bridgeType === "batch" &&
                      (group === "image" || group === "embedding"));

                  if (!isInvalidGroup) {
                    return (
                      <div className="w-full">
                        {/* <li className="menu-title w-full">
                          <span>{group}</span>
                        </li> */}
                        {Object.keys(options || {}).map(
                          (option, optionIndex) => {
                            const modelName =
                              options?.[option]?.configuration?.model?.default;
                            const modelDescription =
                              options?.[option]?.description ||
                              `Description for ${modelName} model`;
                            const specification =
                              options?.[option]?.configuration
                                ?.additional_parameters?.specification;
                            return (
                              <li
                                className="w-full relative"
                                onMouseEnter={(e) => {
                                  e.preventDefault();
                                  handleModelHover(
                                    e,
                                    modelDescription,
                                    specification
                                  );
                                  console.log("hover");
                                }}
                                onMouseLeave={handleModelLeave}
                              >
                                <a
                                  className="w-full block"
                                  onClick={() => {
                                    e.preventDefault();
                                    handleModel({
                                      target: {
                                        value: `${group}|${modelName}`,
                                        selectedOptions: [
                                          { parentNode: { label: group } },
                                        ],
                                      },
                                    });
                                  }}
                                >
                                  {modelName}
                                </a>
                              </li>
                            );
                          }
                        )}
                      </div>
                    );
                  }
                  return null;
                }
              )}
            </ul>
          </div>
        </div>

        {/* If model is fine-tuned model*/}
        {modelType === "fine-tune" && (
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Fine-Tune Model</span>
            </div>
            <input
              type="text"
              name="name"
              key={fineTuneModel}
              defaultValue={fineTuneModel}
              onBlur={handleFinetuneModelChange}
              placeholder="Fine-tune model Name"
              className="input input-bordered input-sm w-full"
            />
          </label>
        )}
      </div>

      {showTooltip && (
        <div
          ref={tooltipRef}
          className="fixed bg-base-100 shadow-lg rounded-lg p-4 z-50 max-w-sm"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Model Information</h3>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-1">{modelDescription}</h4>
          </div>

          {specificationData && (
            <div className="space-y-3">
              <h4 className="font-semibold">Specifications</h4>

              {(specificationData.input_cost ||
                specificationData.output_cost) && (
                <div className="grid grid-cols-2 gap-1">
                  {specificationData.input_cost && (
                    <>
                      <span className="text-sm">Input Cost:</span>
                      <span className="text-sm font-medium">
                        {formatCost(specificationData.input_cost)}
                      </span>
                    </>
                  )}

                  {specificationData.output_cost && (
                    <>
                      <span className="text-sm">Output Cost:</span>
                      <span className="text-sm font-medium">
                        {formatCost(specificationData.output_cost)}
                      </span>
                    </>
                  )}
                </div>
              )}

              {specificationData.knowledge_cutoff &&
                specificationData.knowledge_cutoff.trim() !== "" && (
                  <div>
                    <span className="text-sm font-medium">
                      Knowledge Cutoff:
                    </span>
                    <p className="text-sm">
                      {specificationData.knowledge_cutoff}
                    </p>
                  </div>
                )}

              {hasContent(specificationData.description) && (
                <div>
                  <span className="text-sm font-medium">Details:</span>
                  <ul className="list-disc list-inside text-sm pl-2">
                    {safeMap(specificationData.description, (desc, idx) => (
                      <li key={idx}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {hasContent(specificationData.usecase) && (
                <div>
                  <span className="text-sm font-medium">Use Cases:</span>
                  <ul className="list-disc list-inside text-sm pl-2">
                    {safeMap(specificationData.usecase, (use, idx) => (
                      <li key={idx}>{use}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ModelDropdown;
