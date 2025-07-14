import { useCustomSelector } from "@/customHooks/customSelector";
import { createBridgeAction, createBridgeWithAiAction } from "@/store/action/bridgeAction";
import { getModelAction } from "@/store/action/modelAction";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingSpinner from "./loadingSpinner";
import { closeModal } from "@/utils/utility";
import { MODAL_TYPE } from "@/utils/enums";
import { getServiceAction } from "@/store/action/serviceAction";
import { BotIcon, CheckIcon, CircleAlertIcon, ClockTenIcon, WebhookIcon } from "@/components/Icons";
import Protected from "./protected";
import { Check, CircleCheckBig } from "lucide-react";

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

    const { allBridgeList, modelsList, SERVICES } = useCustomSelector((state) => ({
        SERVICES: state?.serviceReducer?.services,
        allBridgeList: (state.bridgeReducer.org[orgid]?.orgs) || [],
        modelsList: state?.modelReducer?.serviceModels[selectedService],
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
      const matches = isEmbedUser ? allBridgeList?.filter(bridge => bridge?.name?.match(/^untitled(?:(\d+))?$/)) : allBridgeList?.filter(bridge => bridge?.name?.match(/^Untitled(?:(\d+))?$/));
      const newCount = matches?.length + 1 || 0;
      name = isEmbedUser ? `untitled${newCount}` : `Untitled${newCount}`;
      const slugNameMatches = isEmbedUser ? allBridgeList?.filter(bridge => bridge?.slugName?.match(/^untitled(?:(\d+))?$/)) : allBridgeList?.filter(bridge => bridge?.slugName?.match(/^Untitled(?:(\d+))?$/));
      const slugNameCount = slugNameMatches?.length + 1 || 0;
      slugname = isEmbedUser ? `untitled${slugNameCount}` : `Untitled${slugNameCount}`
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
          "bridgeType": selectedBridgeTypeCard || bridgeType,
          "type": selectedType,
        };
        dispatch(createBridgeAction({ dataToSend: dataToSend, orgid }, (data) => {
          // setShowFileUploadModal(false);
          route.push(`/org/${orgid}/agents/configure/${data.data.bridge._id}?version=${data.data.bridge.versions[0]}`);
          closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)
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
        closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)
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
        if (!selectedBridgeTypeCard) {
            newValidationErrors.bridgeType = "Select Agent Type";
            hasErrors = true;
        }

        // Update validation errors state
        setValidationErrors(newValidationErrors);

        if (hasErrors) {
            return;
        }

        setIsAiLoading(true);
        const dataToSend = { purpose, bridgeType: selectedBridgeTypeCard }
        dispatch(createBridgeWithAiAction({ dataToSend, orgId: orgid }))
            .then((response) => {
                const data = response.data;
                route.push(`/org/${orgid}/agents/configure/${data.bridge._id}?version=${data.bridge.versions[0]}`);
                closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL);
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
          <div className="bg-base-100 px-2 md:px-10 py-4 md:py-4 rounded-lg max-w-[90%] md:max-w-[80%] overflow-auto max-h-[98vh] mx-auto">
            <h3 className="font-bold text-xl md:text-xl text-gray-800 pl-2">
              Create Agent
            </h3>

            {/* Global Error Message */}
            {globalError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-center font-medium">
                {globalError}
              </div>
            )}

            <div className="space-y-2 pb-2 p-2 mt-2 ml-4 text-semi-bold">
              <div className="flex justify-between items-center">
                <label className="text-md  text-gray-800">
                  Select Agent Type
                </label>
                {validationErrors.bridgeType && (
                  <span className="text-red-500 text-sm">
                    {validationErrors.bridgeType}
                  </span>
                )}
              </div>
              <div
                className={`flex flex-col md:flex-row gap-2 justify-center mx-auto overflow-x-auto p-2 ${
                  validationErrors.bridgeType
                    ? "border border-red-500 rounded-xl"
                    : ""
                }`}
              >
                {/* API Card */}
                <div
                  className={`card bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 rounded-xl min-w-[280px] md:min-w-0 ${
                    selectedBridgeTypeCard === "api"
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => handleBridgeTypeSelection("api")}
                >
                  <div className="card-body p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="p-2 md:p-3 rounded-lg bg-blue-50">
                        <WebhookIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      {selectedBridgeTypeCard === "api" && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckIcon className="text-base-100 h-4 w-4"/>
                      </div>
                    )}
                      </div>
                      <h2 className="card-title text-lg md:text-xl font-semibold text-gray-800">
                        API
                      </h2>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      Easily integrate AI into your backend using our API. Send
                      prompts, receive intelligent responses, and automate
                      tasks—no frontend needed. It's fast, flexible, and works
                      with any backend stack.
                    </p>
                  </div>
                </div>

                {/* Chatbot Card */}
                <div
                  className={`card bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 rounded-xl min-w-[280px] md:min-w-0 ${
                    selectedBridgeTypeCard === "chatbot"
                      ? "ring-2 ring-green-500"
                      : ""
                  }`}
                  onClick={() => handleBridgeTypeSelection("chatbot")}
                >
                  <div className="card-body p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="p-2 md:p-3 rounded-lg bg-green-50">
                        <BotIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                        {selectedBridgeTypeCard === "chatbot" && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                         <CheckIcon className="text-base-100 h-4 w-4"/>
                      </div>
                    )}
                      </div>
                      <h2 className="card-title text-lg md:text-xl font-semibold text-gray-800">
                        Chatbot
                      </h2>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      Quickly embed an AI-powered chatbot into your app or
                      website. It responds in real time, handles user queries,
                      and delivers smart, conversational experiences—fully
                      customizable and easy to deploy.
                    </p>
                  </div>
                </div>

                {/* Batch API Card */}
                <div
                  className={`card bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 rounded-xl min-w-[280px] md:min-w-0 ${
                    selectedBridgeTypeCard === "batch"
                      ? "ring-2 ring-purple-500"
                      : ""
                  }`}
                  onClick={() => handleBridgeTypeSelection("batch")}
                >
                  <div className="card-body p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="p-2 md:p-3 rounded-lg bg-purple-50">
                        <ClockTenIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                        {selectedBridgeTypeCard === "batch" && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                       <CheckIcon className="text-base-100 h-4 w-4"/>
                       </div>
                    )}
                      </div>
                      <h2 className="card-title text-lg md:text-xl font-semibold text-gray-800">
                        Batch API
                      </h2>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      Process multiple prompts or data inputs in a single
                      request using the Batch API. Ideal for large-scale tasks
                      like summarization, generation, or classification—fast,
                      efficient, and built for bulk operations.
                    </p>
                  </div>
                </div>

                {/* Triggers Card */}
                {!isEmbedUser && <div
                  className={`card bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 rounded-xl min-w-[280px] md:min-w-0 ${
                    selectedBridgeTypeCard === "trigger"
                      ? "ring-2 ring-amber-500"
                      : ""
                  }`}
                  onClick={() => handleBridgeTypeSelection("trigger")}
                >
                  <div className="card-body p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="p-2 md:p-3 rounded-lg bg-amber-50">
                        <CircleAlertIcon className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                        {selectedBridgeTypeCard === "trigger" && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                         <CheckIcon className="text-base-100 h-4 w-4"/>
                      </div>
                    )}
                      </div>
                      <h2 className="card-title text-lg md:text-xl font-semibold text-gray-800">
                        Triggers
                      </h2>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      Automate workflows using Triggers. Set conditions to
                      auto-run actions like sending prompts, generating
                      responses, or forwarding data—no manual input required.
                      Perfect for real-time automation.
                    </p>
                  </div>
                </div>}
              </div>
            </div>

            {/* {!isManualMode ? ( */}
            <div className="mt-4 md:mt-4">
              <div className="form-control">
                <label className="label pb-1 md:pb-2">
                  <span className="label-text font-medium text-base md:text-lg text-gray-800">
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
                    className={`textarea textarea-bordered w-full min-h-[50px] md:min-h-[50px] bg-white transition-all duration-300 placeholder-gray-400 text-sm md:text-base ${
                      validationErrors.purpose
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                  className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base w-full"
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
                <hr className="flex-1 border-t-2 border-gray-200 md:w-8" />
                <span className="text-gray-400 text-xs sm:text-sm mx-2">
                  or
                </span>
                <hr className="flex-1 border-t-2 border-gray-200 md:w-8" />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full md:w-auto px-2">
                <button
                  className="btn btn-base-200 text-sm md:text-base w-full sm:w-1/2 md:w-auto"
                  onClick={() => closeModal(MODAL_TYPE?.CREATE_BRIDGE_MODAL)}
                >
                  Cancel
                </button>
                {isManualMode ? (
                  <button
                    className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base w-full sm:w-1/2 md:w-auto"
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
                    className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base w-full sm:w-1/2 md:w-auto"
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