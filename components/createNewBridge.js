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
import { Info, Lightbulb, Plus } from "lucide-react";
import { CloseIcon } from "./Icons";

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
    showAgentType: state.appInfoReducer.embedUserDetails?.showAgentTypeOnCreateAgent,
    hideCreateManuallyButton: state.appInfoReducer.embedUserDetails?.hideCreateManuallyButton
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


  const handleCreateAgent = useCallback(() => {
    const purpose = textAreaPurposeRef?.current?.value?.trim();
    const newValidationErrors = { bridgeType: "", purpose: "" };
    let hasErrors = false;

    // Validate bridge type if not hidden
    if (!state.selectedBridgeTypeCard && !shouldHideAgentType) {
      newValidationErrors.bridgeType = "Select Agent Type";
      hasErrors = true;
    }

    if (hasErrors) {
      updateState({ validationErrors: newValidationErrors, globalError: "" });
      return;
    }

    // If purpose exists, create with AI, otherwise create manually
    if (purpose) {
      // Create with AI using purpose
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
    } else {
      // Create manually without purpose
      const name = generateUniqueName();
      const slugname = generateUniqueName();

      if (name.length > 0 && state.selectedModel) {
        updateState({ isLoading: true });
        
        const dataToSend = {
          service: state.selectedService,
          model: state.selectedModel,
          name,
          slugName: slugname,
          bridgeType: shouldHideAgentType ? "api" : state.selectedBridgeTypeCard || state.bridgeType,
          type: state.selectedType,
          prompt: DEFAULT_PROMPT
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
    }
  }, [
    state.selectedBridgeTypeCard, state.selectedModel, state.selectedService, 
    state.bridgeType, state.selectedType, shouldHideAgentType, updateState, 
    dispatch, orgid, isEmbedUser, router, cleanState, generateUniqueName
  ]);

  const handleCloseModal = useCallback(() => {
    closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL);
  }, []);

  return (
    <div>
      {state.isLoading && <LoadingSpinner />}
      <dialog id={MODAL_TYPE.CREATE_BRIDGE_MODAL} className="modal backdrop-blur-sm">
        <div className="modal-box max-w-2xl w-full mx-4 bg-gradient-to-br from-base-100 to-base-200 shadow-2xl border border-base-300">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-base-content">Create New Agent</h3>
              </div>
            </div>
            <button 
              className="btn btn-sm btn-circle btn-ghost hover:bg-base-300"
              onClick={handleCloseModal}
            >
              <CloseIcon size={20} className="text-primary"/>
            </button>
          </div>

          {/* Global Error Message */}
          {state.globalError && (
            <div className="alert alert-error mb-6 shadow-lg">
              <Plus size={20} className="text-primary" />
              <span className="font-medium">{state.globalError}</span>
            </div>
          )}

          {/* Agent Purpose Section */}
          <div className="space-y-4">
            <div className="bg-base-100 p-6 rounded-xl border border-base-300 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <Lightbulb size={20} className="text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-base-content">Agent Purpose</h4>
                <span className="text-xs bg-info/20 text-info px-2 py-1 rounded-full">Optional</span>
              </div>
              
              <div className="form-control">
                <div className="relative">
                  <textarea
                    id="agent-purpose"
                    placeholder="e.g., A customer support agent that helps users with product inquiries and troubleshooting..."
                    ref={textAreaPurposeRef}
                    onChange={handlePurposeInput}
                    className={`textarea textarea-bordered w-full min-h-[120px] bg-base-100 transition-all duration-300 text-base resize-none ${
                      state.validationErrors.purpose
                        ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                        : "border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                    aria-label="Agent purpose description"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-base-content/50">
                    {textAreaPurposeRef?.current?.value?.length || 0}/500
                  </div>
                </div>
                
                {state.validationErrors.purpose && (
                  <div className="flex items-center gap-2 mt-2 text-error">
                    <Info size={20} className="text-error"/>
                    <span className="text-sm font-medium">{state.validationErrors.purpose}</span>
                  </div>
                )}
                
                <div className="mt-3 p-3 bg-info/10 rounded-lg border border-info/20">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-info mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-info">
                      <p className="font-medium mb-1">Smart Creation</p>
                      <p className="text-xs text-info/80">
                        • <strong>With purpose:</strong> AI will create a customized agent based on your description<br/>
                        • <strong>Without purpose:</strong> A basic agent template will be created for manual setup
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-base-300">
            <button
              className="btn btn-sm"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            
            <button
              className="btn btn-sm btn-primary"
              onClick={handleCreateAgent}
              disabled={state.isAiLoading || state.isLoading}
            >
              {(state.isAiLoading || state.isLoading) ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Agent
                </>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Protected(CreateNewBridge);