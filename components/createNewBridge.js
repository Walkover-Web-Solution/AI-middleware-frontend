import { useCustomSelector } from "@/customHooks/customSelector";
import { createBridgeAction, createBridgeWithAiAction } from "@/store/action/bridgeAction";
import { getModelAction } from "@/store/action/modelAction";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingSpinner from "./loadingSpinner";
import { closeModal, sendDataToParent } from "@/utils/utility";
import { MODAL_TYPE } from "@/utils/enums";
import { getServiceAction } from "@/store/action/serviceAction";

import Protected from "./protected";
import CreateBridgeCards from "./CreateBridgeCards";

function CreateNewBridge({ orgid, isEmbedUser }) {
    const [selectedService, setSelectedService] = useState('openai');
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [selectedType, setSelectedType] = useState("chat");
  const [bridgeType, setBridgeType] = useState("api");
  const [isManualMode, setIsManualMode] = useState(false);
  const textAreaPurposeRef = useRef();
  const [selectedBridgeTypeCard, setSelectBridgeTypeCard] = useState("api");
  const [validationErrors, setValidationErrors] = useState({
    bridgeType: "",
        purpose: ""
  });
    const [globalError, setGlobalError] = useState(""); // New state for global error messages

    const { allBridgeList, modelsList, SERVICES, showAgentType } = useCustomSelector((state) => ({
      SERVICES: state?.serviceReducer?.services,
      allBridgeList: state.bridgeReducer.org[orgid]?.orgs || [],
      modelsList: state?.modelReducer?.serviceModels[selectedService],
        showAgentType: state?.userDetailsReducer?.userDetails?.showAgentTypeOnCreateAgent
    }));
    
    useEffect(() => {
        if (!SERVICES || Object?.entries(SERVICES)?.length === 0) {
            dispatch(getServiceAction({ orgid }))
        }
    }, [SERVICES]);

  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const dispatch = useDispatch();
  const route = useRouter();

  useEffect(() => {
    return () => {
      closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL);
    };
  }, []);


  useEffect(() => {
    if (selectedService && !modelsList) {
            dispatch(getModelAction({ service: selectedService }))
    }
  }, [selectedService]);


  const handleBridgeTypeSelection = (type) => {
    setSelectBridgeTypeCard(type);
        setValidationErrors(prev => ({ ...prev, bridgeType: "" }));
        setGlobalError(""); // Clear global error when making a new selection
  };

    // Clear validation error when typing in textarea
  const handlePurposeInput = () => {
        setValidationErrors(prev => ({ ...prev, purpose: "" }));
        setGlobalError(""); // Clear global error when typing
  };

    const createBridgeHandler = (name, slugname) => {
      name = isEmbedUser ? 'untitled' : 'Untitled';
      const matches = isEmbedUser ? allBridgeList?.filter(bridge => bridge?.name?.match(/^untitled_agent_(?:\d+)$/)) : allBridgeList?.filter(bridge => bridge?.name?.match(/^Untitled(?:(\d+))?$/));
    const newCount = matches?.length + 1 || 0;
      name = isEmbedUser ? `untitled_agent_${newCount}` : `Untitled${newCount}`;
      const slugNameMatches = isEmbedUser ? allBridgeList?.filter(bridge => bridge?.slugName?.match(/^untitled_agent_(?:\d+)$/)) : allBridgeList?.filter(bridge => bridge?.slugName?.match(/^Untitled(?:(\d+))?$/));
    const slugNameCount = slugNameMatches?.length + 1 || 0;
      slugname = isEmbedUser ? `untitled_agent_${slugNameCount}` : `Untitled${slugNameCount}`
    if (!selectedBridgeTypeCard) {
        setValidationErrors(prev => ({ ...prev, bridgeType: "Select Agent Type" }));
      return;
    }

    if (name.length > 0 && selectedModel && selectedBridgeTypeCard) {
      setIsLoading(true);
      const dataToSend = {
          "service": selectedService,
          "model": selectedModel,
          "name": name,
          "slugName": slugname || name,
          "bridgeType":isEmbedUser && !showAgentType ? "api" : selectedBridgeTypeCard || bridgeType,
          "type": selectedType,
      };
        dispatch(createBridgeAction({ dataToSend: dataToSend, orgid }, (data) => {
          // setShowFileUploadModal(false);
          isEmbedUser && sendDataToParent("drafted", {name: data?.bridge?.name, agent_id: data?.bridge?._id}, "Agent created Successfully")
          route.push(`/org/${orgid}/agents/configure/${data.data.bridge._id}?version=${data.data.bridge.versions[0]}`);
          setIsLoading(false);
          cleanState();
        })).catch(() => {
        setIsLoading(false);
      });
    }
  };

  const cleanState = () => {
    setSelectedService("openai");
    setSelectedModel("gpt-4o");
    setSelectedType("chat");
    setBridgeType("api");
    setIsManualMode(false);
    setValidationErrors({ bridgeType: "", purpose: "" });
        setGlobalError(""); // Clear global error
    if (textAreaPurposeRef?.current) {
            textAreaPurposeRef.current.value = '';
    }
  };

  const handleCreateBridgeUsingAI = () => {
    const purpose = textAreaPurposeRef?.current?.value;
    let hasErrors = false;

        // Reset validation errors
    const newValidationErrors = { bridgeType: "", purpose: "" };
        setGlobalError(""); // Clear any previous global error

        // Validate purpose
    if (!purpose || purpose.trim() === "") {
      newValidationErrors.purpose = "Please enter a agent purpose";
      hasErrors = true;
    }

        // Validate bridge type
    if (!selectedBridgeTypeCard && !isEmbedUser && !showAgentType) {
      newValidationErrors.bridgeType = "Select Agent Type";
      hasErrors = true;
    }

        // Update validation errors state
    setValidationErrors(newValidationErrors);

    if (hasErrors) {
      return;
    }

    setIsAiLoading(true);
        const dataToSend = { purpose, bridgeType: isEmbedUser && !showAgentType ? "api" : selectedBridgeTypeCard }
    dispatch(createBridgeWithAiAction({ dataToSend, orgId: orgid }))
      .then((response) => {
        const data = response.data;
                isEmbedUser && sendDataToParent("drafted", {name: data?.name, agent_id: data?.bridge?._id}, "Agent created Successfully")
                route.push(`/org/${orgid}/agents/configure/${data.bridge._id}?version=${data.bridge.versions[0]}`);
        setIsAiLoading(false);
        cleanState();
      })
      .catch((error) => {
        setIsAiLoading(false);
                // Instead of toast.error, set the global error state
                setGlobalError(error?.response?.data?.message || "Error while creating agent");
      });
    }


  return (
    <div>
      {isLoading && <LoadingSpinner />}
      <dialog id={MODAL_TYPE.CREATE_BRIDGE_MODAL} className="modal">
          <div className={`bg-base-100 px-2 md:px-10 py-4 md:py-4 rounded-lg ${isEmbedUser && !showAgentType ? "min-w-[70%] md:min-w-[70%]" : "max-w-[90%] md:max-w-[80%]"} overflow-auto max-h-[98vh] mx-auto`}>
            <h3 className="font-bold text-xl md:text-xl text-base-content">
              Create Agent
            </h3>

            {/* Global Error Message */}
            {globalError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-center font-medium">
                {globalError}
              </div>
            )}

            <CreateBridgeCards
                selectedBridgeTypeCard={selectedBridgeTypeCard}
                handleBridgeTypeSelection={handleBridgeTypeSelection}
                validationErrors={validationErrors}
                isEmbedUser={isEmbedUser}
            />

            {/* {!isManualMode ? ( */}
            <div className="mt-4 md:mt-4">
              <div className="form-control">
                <label className="label pb-1 md:pb-2">
                  <span className="label-text font-medium text-base-content md:text-lg">
                    Agent Purpose
                  </span>
                  {validationErrors.purpose && (
                    <span className="label-text-alt text-red-500">
                      {validationErrors.purpose}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <textarea
                    id="agent-purpose"
                    placeholder="Describe the purpose of this agent..."
                    ref={textAreaPurposeRef}
                    onChange={handlePurposeInput}
                    className={`textarea textarea-bordered w-full ${isEmbedUser && !showAgentType ? "min-h-[100px]" : "min-h-[50px] md:min-h-[50px]"} bg-base-100 transition-all duration-300 placeholder-base-content text-sm md:text-base ${
                      validationErrors.purpose
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-base-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    required
                    aria-label="Agent purpose description"
                  ></textarea>
                </div>
                <p className="text-xs text-gray-500 mt-1 md:mt-2 italic">
                  A clear purpose helps AI to understand your agent's
                  functionality and improves discoverability.
                </p>
              </div>
            </div>

            <div className="modal-action mb-4 flex flex-col-reverse md:flex-row justify-between gap-4">
              <div className="w-full md:w-auto">
                <button
                  className="btn btn-primary text-sm md:text-base w-full"
                  onClick={createBridgeHandler}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                    </>
                  ) : (
                    "Create Manually"
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mb-2 w-full my-2 md:my-0 md:w-auto">
                <hr className="flex-1 border-t-2 border-base-content/20 md:w-8" />
                <span className="text-base-content text-xs sm:text-sm mx-2">
                  or
                </span>
                <hr className="flex-1 border-t-2 border-base-content/20 md:w-8" />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full md:w-auto px-2">
                <button
                  className="btn text-sm md:text-base w-full sm:w-1/2 md:w-auto"
                  onClick={() => closeModal(MODAL_TYPE?.CREATE_BRIDGE_MODAL)}
                >
                  Cancel
                </button>
                {isManualMode ? (
                  <button
                    className="btn btn-primary text-sm md:text-base w-full sm:w-1/2 md:w-auto"
                    onClick={handleCreateBridge}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                      </>
                    ) : (
                      "Create Agent"
                    )}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary text-sm md:text-base w-full sm:w-1/2 md:w-auto"
                    onClick={handleCreateBridgeUsingAI}
                    disabled={isAiLoading || isLoading}
                  >
                    {isAiLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                      </>
                    ) : (
                      "Create Agent"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
      </dialog>
    </div>
  );
}

export default Protected(CreateNewBridge);