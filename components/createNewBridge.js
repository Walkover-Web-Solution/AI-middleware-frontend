import { useCustomSelector } from "@/customHooks/customSelector";
import { createBridgeAction, createBridgeWithAiAction } from "@/store/action/bridgeAction";
import { getModelAction } from "@/store/action/modelAction";
import { getServiceAction } from "@/store/action/serviceAction";
import { closeModal, sendDataToParent } from "@/utils/utility";
import { DEFAULT_PROMPT, MODAL_TYPE } from "@/utils/enums";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingSpinner from "./loadingSpinner";
import Protected from "./protected";
import CreateBridgeCards from "./CreateBridgeCards";

const INITIAL_STATE = {
  selectedService: 'openai',
  selectedModel: "gpt-4o",
  selectedType: "chat",
  bridgeType: "api",
  isManualMode: false,
  selectedBridgeTypeCard: "api",
  validationErrors: { bridgeType: "", purpose: "" },
  globalError: "",
  isLoading: false,
  isAiLoading: false
};

function CreateNewBridge({ orgid, isEmbedUser }) {
  const [state, setState] = useState(INITIAL_STATE);
  const textAreaPurposeRef = useRef();
  const dispatch = useDispatch();
  const router = useRouter();

  const { modelsList, SERVICES, showAgentType, hideCreateManuallyButton } = useCustomSelector((state) => ({
    SERVICES: state?.serviceReducer?.services,
    modelsList: state?.modelReducer?.serviceModels[state.selectedService],
    showAgentType: state?.userDetailsReducer?.userDetails?.showAgentTypeOnCreateAgent,
    hideCreateManuallyButton: state?.userDetailsReducer?.userDetails?.hideCreateManuallyButton
  }));

  // Memoized calculations
  const shouldHideAgentType = useMemo(() => 
    isEmbedUser && !showAgentType, 
    [isEmbedUser, showAgentType]
  );

  const modalClasses = useMemo(() => 
    `bg-base-100 px-2 md:px-10 py-4 md:py-4 rounded-lg ${
      shouldHideAgentType ? "min-w-[70%] md:min-w-[70%]" : "max-w-[90%] md:max-w-[80%]"
    } overflow-auto max-h-[98vh] mx-auto`,
    [shouldHideAgentType]
  );

  // Generate unique names
  const generateUniqueName = useCallback(() => {
    const baseName = 'untitled_agent_';
    return `${baseName}`;
  }, []);

  // State update helper
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear validation errors
  const clearErrors = useCallback(() => {
    updateState({
      validationErrors: { bridgeType: "", purpose: "" },
      globalError: ""
    });
  }, [updateState]);

  // Clean state
  const cleanState = useCallback(() => {
    setState(INITIAL_STATE);
    if (textAreaPurposeRef?.current) {
      textAreaPurposeRef.current.value = '';
    }
    closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL);
  }, []);

  // Effects
  useEffect(() => {
    if (!SERVICES || Object.entries(SERVICES).length === 0) {
      dispatch(getServiceAction({ orgid }));
    }
  }, [SERVICES, dispatch, orgid]);

  useEffect(() => {
    if (state.selectedService && !modelsList) {
      // dispatch(getModelAction({ service: state.selectedService }));
    }
  }, [state.selectedService, modelsList, dispatch]);

  useEffect(() => () => {
    closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL);
  }, []);

  // Handlers
  const handleBridgeTypeSelection = useCallback((type) => {
    updateState({
      selectedBridgeTypeCard: type,
      validationErrors: { ...state.validationErrors, bridgeType: "" },
      globalError: ""
    });
  }, [updateState, state.validationErrors]);

  const handlePurposeInput = useCallback(() => {
    updateState({
      validationErrors: { ...state.validationErrors, purpose: "" },
      globalError: ""
    });
  }, [updateState, state.validationErrors]);

  const createBridgeHandler = useCallback(() => {
    if (!state.selectedBridgeTypeCard) {
      updateState({
        validationErrors: { ...state.validationErrors, bridgeType: "Select Agent Type" }
      });
      return;
    }

    const name = generateUniqueName();
    const slugname = generateUniqueName();

    if (name.length > 0 && state.selectedModel && state.selectedBridgeTypeCard) {
      updateState({ isLoading: true });
      
      const dataToSend = {
        service: state.selectedService,
        model: state.selectedModel,
        name,
        slugName: slugname,
        bridgeType: shouldHideAgentType ? "api" : state.selectedBridgeTypeCard || state.bridgeType,
        type: state.selectedType,
        prompt:DEFAULT_PROMPT
      };

      dispatch(createBridgeAction({ dataToSend, orgid }, (data) => {
        if (isEmbedUser) {
          sendDataToParent("drafted", {
            name: data?.bridge?.name, 
            agent_id: data?.bridge?._id
          }, "Agent created Successfully");
        }
        
        router.push(`/org/${orgid}/agents/configure/${data.data.bridge._id}?version=${data.data.bridge.versions[0]}`);
        updateState({ isLoading: false });
        cleanState();
      })).catch(() => {
        updateState({ isLoading: false });
      });
    }
  }, [
    state.selectedBridgeTypeCard, state.selectedModel, state.selectedService, 
    state.bridgeType, state.selectedType, generateUniqueName, shouldHideAgentType, 
    updateState, dispatch, orgid, isEmbedUser, router, cleanState
  ]);

  const handleCreateBridgeUsingAI = useCallback(() => {
    const purpose = textAreaPurposeRef?.current?.value?.trim();
    const newValidationErrors = { bridgeType: "", purpose: "" };
    let hasErrors = false;

    // Validate purpose
    if (!purpose) {
      newValidationErrors.purpose = "Please enter a agent purpose";
      hasErrors = true;
    }

    // Validate bridge type
    if (!state.selectedBridgeTypeCard && !shouldHideAgentType) {
      newValidationErrors.bridgeType = "Select Agent Type";
      hasErrors = true;
    }

    if (hasErrors) {
      updateState({ validationErrors: newValidationErrors, globalError: "" });
      return;
    }

    updateState({ isAiLoading: true });
    
    const dataToSend = { 
      purpose, 
      bridgeType: shouldHideAgentType ? "api" : state.selectedBridgeTypeCard 
    };

    dispatch(createBridgeWithAiAction({ dataToSend, orgId: orgid }))
      .then((response) => {
        const data = response.data;
        
        if (isEmbedUser) {
          sendDataToParent("drafted", {
            name: data?.name, 
            agent_id: data?.bridge?._id
          }, "Agent created Successfully");
        }
        
        router.push(`/org/${orgid}/agents/configure/${data.bridge._id}?version=${data.bridge.versions[0]}`);
        updateState({ isAiLoading: false });
        cleanState();
      })
      .catch((error) => {
        updateState({ 
          isAiLoading: false,
          globalError: error?.response?.data?.message || "Error while creating agent"
        });
      });
  }, [
    state.selectedBridgeTypeCard, shouldHideAgentType, updateState, 
    dispatch, orgid, isEmbedUser, router, cleanState
  ]);

  const handleCloseModal = useCallback(() => {
    closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL);
  }, []);

  return (
    <div>
      {state.isLoading && <LoadingSpinner />}
      <dialog id={MODAL_TYPE.CREATE_BRIDGE_MODAL} className="modal">
        <div className={modalClasses}>
          <h3 className="font-bold text-xl md:text-xl text-base-content">
            Create Agent
          </h3>
          {/* Global Error Message */}
          {state.globalError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-center font-medium">
              {state.globalError}
            </div>
          )}
          {((isEmbedUser && showAgentType )||!isEmbedUser) && (
          <CreateBridgeCards
          selectedBridgeTypeCard={state.selectedBridgeTypeCard}
          handleBridgeTypeSelection={handleBridgeTypeSelection}
          validationErrors={state.validationErrors}
          isEmbedUser={isEmbedUser}

        />
      )}
          {/* Agent Purpose Section */}
          <div className="mt-4 md:mt-4">
            <div className="form-control">
              <label className="label pb-1 md:pb-2">
                <span className="label-text font-medium text-base-content md:text-lg">
                  Agent Purpose
                </span>
                {state.validationErrors.purpose && (
                  <span className="label-text-alt text-red-500">
                    {state.validationErrors.purpose}
                  </span>
                )}
              </label>
              <div className="relative">
                <textarea
                  id="agent-purpose"
                  placeholder="Describe the purpose of this agent..."
                  ref={textAreaPurposeRef}
                  onChange={handlePurposeInput}
                  className={`textarea textarea-bordered w-full ${
                    shouldHideAgentType ? "min-h-[100px]" : "min-h-[50px] md:min-h-[50px]"
                  } bg-base-100 transition-all duration-300 placeholder-base-content text-sm md:text-base ${
                    state.validationErrors.purpose
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-base-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                  required
                  aria-label="Agent purpose description"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 md:mt-2 italic">
                A clear purpose helps AI to understand your agent's
                functionality and improves discoverability.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-action mb-4 flex flex-col-reverse md:flex-row justify-between gap-4">
            {((!hideCreateManuallyButton&&isEmbedUser)||!isEmbedUser) && (
            <>
            <div className="w-full md:w-auto">
              <button
                className="btn btn-primary text-sm md:text-base w-full"
                onClick={createBridgeHandler}
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Create Manually"
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2 w-full my-2 md:my-0 md:w-auto">
              <hr className="flex-1 border-t-2 border-base-content/20 md:w-8" />
              <span className="text-base-content text-xs sm:text-sm mx-2">or</span>
              <hr className="flex-1 border-t-2 border-base-content/20 md:w-8" />
            </div>

              </>
            )}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full md:w-auto px-2">
              <button
                className="btn text-sm md:text-base w-full sm:w-1/2 md:w-auto"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              
              <button
                className="btn btn-primary text-sm md:text-base w-full sm:w-1/2 md:w-auto"
                onClick={handleCreateBridgeUsingAI}
                disabled={state.isAiLoading || state.isLoading}
              >
                {state.isAiLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Create Agent"
                )}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Protected(CreateNewBridge);