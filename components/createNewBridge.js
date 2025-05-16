import { useCustomSelector } from "@/customHooks/customSelector";
import { DEFAULT_MODEL } from "@/jsonFiles/bridgeParameter";
import { createBridgeAction, createBridgeWithAiAction } from "@/store/action/bridgeAction";
import { getModelAction } from "@/store/action/modelAction";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingSpinner from "./loadingSpinner";
import { closeModal } from "@/utils/utility";
import { MODAL_TYPE } from "@/utils/enums";
import { getServiceAction } from "@/store/action/serviceAction";
import { Bot, CircleAlert, Clock10, Webhook } from "lucide-react";

function CreateNewBridge({ orgid }) {
    const [selectedService, setSelectedService] = useState('openai');
    const [selectedModel, setSelectedModel] = useState("gpt-4o");
    const [selectedType, setSelectedType] = useState("chat");
    const [bridgeType, setBridgeType] = useState("api");
    const [isManualMode, setIsManualMode] = useState(false);
    const textAreaPurposeRef = useRef();
    const [selectedBridgeTypeCard, setSelectBridgeTypeCard] = useState();
    const [validationErrors, setValidationErrors] = useState({
        bridgeType: "",
        purpose: ""
    });
    const [globalError, setGlobalError] = useState(""); // New state for global error messages

    const { allBridgeLength, allBridgeList, modelsList, SERVICES } = useCustomSelector((state) => ({
        SERVICES : state?.serviceReducer?.services,
        allBridgeLength: (state.bridgeReducer.org[orgid] || [])?.length,
        allBridgeList: (state.bridgeReducer.org[orgid] || [])?.orgs,
        modelsList: state?.modelReducer?.serviceModels[selectedService],
    }));

    useEffect(() => {
        if(!SERVICES) {
            dispatch(getServiceAction({ orgid }))
        }
    }, [SERVICES]);

    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    // const [uploadedFile, setUploadedFile] = useState(null);
    // const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const dispatch = useDispatch();
    const route = useRouter();

    useEffect(() => {
        if (selectedService && !modelsList) {
            dispatch(getModelAction({ service: selectedService }))
        }
    }, [selectedService]);

    const handleService = (e) => {
        setSelectedService(e.target.value);
        setSelectedModel(DEFAULT_MODEL[e.target.value]);
    };

    const handleModel = (e) => {
        const selectedModel = e.target.value;
        const selectedModelType = e.target.selectedOptions[0].parentNode.label;

        setSelectedModel(selectedModel);
        setSelectedType(selectedModelType);
    };

    // const onDrop = (acceptedFiles) => {
    //     setUploadedFile(acceptedFiles[0]);
    // };
    // Clear validation errors when selecting bridge type
    const handleBridgeTypeSelection = (type) => {
        setSelectBridgeTypeCard(type);
        setValidationErrors(prev => ({...prev, bridgeType: ""}));
        setGlobalError(""); // Clear global error when making a new selection
    };

    // Clear validation error when typing in textarea
    const handlePurposeInput = () => {
        setValidationErrors(prev => ({...prev, purpose: ""}));
        setGlobalError(""); // Clear global error when typing
    };

    const createBridgeHandler = (name, slugname) => {
        name = 'Untitled';
        const matches = allBridgeList?.filter(bridge => bridge?.name?.match(/^Untitled(?:(\d+))?$/));
        const newCount = matches?.length + 1 || 0;
        name = `Untitled${newCount}`;
        
        // Validate bridge type selection
        if (!selectedBridgeTypeCard) {
            setValidationErrors(prev => ({...prev, bridgeType: "Select Bridge Type"}));
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
                route.push(`/org/${orgid}/bridges/configure/${data.data.bridge._id}?version=${data.data.bridge.versions[0]}`);
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
        setValidationErrors({bridgeType: "", purpose: ""});
        setGlobalError(""); // Clear global error
        if (textAreaPurposeRef?.current) {
            textAreaPurposeRef.current.value = '';
        }
         // setUploadedFile(null);
        // document.getElementById('bridge-name').value = "";
        // if (document.getElementById('slug-name')) document.getElementById('slug-name').value = "";
        closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)
    };
    
    // const handleCreateBridge = e => {
    //     e.preventDefault();
    //     createBridgeHandler(document.getElementById("bridge-name").value, document.getElementById("slug-name")?.value);
    // }

    const handleCreateBridgeUsingAI = () => {
        const purpose = textAreaPurposeRef?.current?.value;
        let hasErrors = false;
        
        // Reset validation errors
        const newValidationErrors = {bridgeType: "", purpose: ""};
        setGlobalError(""); // Clear any previous global error
        
        // Validate purpose
        if (!purpose || purpose.trim() === "") {
            newValidationErrors.purpose = "Please enter a bridge purpose";
            hasErrors = true;
        }
        
        // Validate bridge type
        if (!selectedBridgeTypeCard) {
            newValidationErrors.bridgeType = "Select Bridge Type";
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
                route.push(`/org/${orgid}/bridges/configure/${data.bridge._id}?version=${data.bridge.versions[0]}`);
                closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL);
                setIsAiLoading(false);
                cleanState();
            })
            .catch((error) => {
                setIsAiLoading(false);
                // Instead of toast.error, set the global error state
                setGlobalError(error?.response?.data?.message || "Error while creating bridge");
            });
    }

    const toggleMode = () => {
        setIsManualMode(!isManualMode);
    };

    return (
        <div>
            {isLoading && <LoadingSpinner />}
            <dialog id={MODAL_TYPE.CREATE_BRIDGE_MODAL} className="modal">
                 {/* <div className="modal-box">
                    <h3 className="font-bold text-lg">Create Bridge</h3>
                    <form onSubmit={handleCreateBridge}>
                        <div>
                            <div className="items-center justify-start mt-2">
                                <div className="label">
                                    <span className="label-text">Used as</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center justify-center gap-2">
                                        <input type="radio" name="radio-1" className="radio" value="api" defaultChecked={bridgeType === "api"} onChange={() => setBridgeType('api')} required />
                                        API
                                    </label>
                                    <label className="flex items-center justify-center gap-2">
                                        <input type="radio" name="radio-1" className="radio" value="chatbot" defaultChecked={bridgeType === "chatbot"} onChange={() => setBridgeType('chatbot')} required />
                                        ChatBot
                                    </label>
                                </div>
                            </div>
                            <label className="form-control w-full mb-2">
                                <div className="label">
                                    <span className="label-text">Bridge Name</span>
                                </div>
                                <input type="text" id="bridge-name" defaultValue={allBridgeLength === 0 ? "Assistant" : ""} placeholder="Type here" className="input input-bordered w-full" maxLength="50" required />
                            </label>
                            <label>
                                <div className="label">
                                    <span className="label-text">Select Service</span>
                                </div>
                                <select value={selectedService} onChange={handleService} className="select select-bordered w-full ">
                                    <option disabled></option>
                                    {Array.isArray(SERVICES) ? SERVICES?.map(({ value, displayName }) => (
                                        <option key={value} value={value}>{displayName}</option>
                                    )) : null}
                                </select>
                            </label>
                            <label className="form-control w-full mb-2 ">
                                <div className="label">
                                    <span className="label-text">Pick a model</span>
                                </div>
                                <select value={selectedModel} onChange={handleModel} className="select select-bordered">
                                    <option disabled></option>
                                    {Object.entries(modelsList || {}).map(([group, options], groupIndex) => {
                                        if (group !== 'models') {
                                            return (
                                                <optgroup label={group} key={`group_${groupIndex}`}>
                                                    {Object.keys(options || {}).map((option, optionIndex) => {
                                                        const modelName = options?.[option]?.configuration?.model?.default;
                                                        return (
                                                            <option key={`option_${groupIndex}_${optionIndex}`}>
                                                                {modelName}
                                                            </option>
                                                        );
                                                    })}
                                                </optgroup>
                                            );
                                        }
                                        return null;
                                    })}
                                </select>
                            </label>
                            {bridgeType === 'chatbot' ? <label className="form-control w-full mb-2">
                                <div className="label">
                                    <span className="label-text">Slug Name</span>
                                </div>
                                <input type="text" id="slug-name" defaultValue={allBridgeLength === 0 ? "root" : ""} placeholder="Type here" className="input input-bordered w-full " required={bridgeType === 'chatbot'} />
                            </label> : null}
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={cleanState}>Close</button>
                            <button className="btn btn-primary">+ Create</button>
                        </div>
                    </form>
                </div> */}
                <div className="bg-base-100 px-4 md:px-10 py-6 md:py-8 rounded-lg max-w-[90%] md:max-w-[80%] mx-auto">
                    <h3 className="font-bold text-xl md:text-2xl mb-4 md:mb-6 text-gray-800">Create Bridge</h3>
                    
                    {/* Global Error Message */}
                    {globalError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-center font-medium">
                            {globalError}
                        </div>
                    )}
                    
                    <div className="space-y-4 pb-2 p-2">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold text-gray-800">Select Bridge Type</label>
                            {validationErrors.bridgeType && (
                                <span className="text-red-500 text-sm">{validationErrors.bridgeType}</span>
                            )}
                        </div>
                        <div 
                            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto p-2 ${
                                validationErrors.bridgeType ? 'border border-red-500 rounded-xl' : ''
                            }`}
                        >
                            {/* API Card */}
                            <div
                                className={`card bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 rounded-xl min-w-[280px] md:min-w-0 ${selectedBridgeTypeCard === 'api' ? 'ring-2 ring-blue-500' : ''}`}
                                onClick={() => handleBridgeTypeSelection('api')}
                            >
                                <div className="card-body p-4 md:p-6">
                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div className="p-2 md:p-3 rounded-lg bg-blue-50">
                                            <Webhook className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                                        </div>
                                        <h2 className="card-title text-lg md:text-xl font-semibold text-gray-800">API</h2>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                                        Easily integrate AI into your backend using our API. Send prompts, receive intelligent responses, and automate tasks—no frontend needed. It's fast, flexible, and works with any backend stack.
                                    </p>
                                </div>
                            </div>

                            {/* Chatbot Card */}
                            <div
                                className={`card bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 rounded-xl min-w-[280px] md:min-w-0 ${selectedBridgeTypeCard === 'chatbot' ? 'ring-2 ring-green-500' : ''}`}
                                onClick={() => handleBridgeTypeSelection('chatbot')}
                            >
                                <div className="card-body p-4 md:p-6">
                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div className="p-2 md:p-3 rounded-lg bg-green-50">
                                            <Bot className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                                        </div>
                                        <h2 className="card-title text-lg md:text-xl font-semibold text-gray-800">Chatbot</h2>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                                        Quickly embed an AI-powered chatbot into your app or website. It responds in real time, handles user queries, and delivers smart, conversational experiences—fully customizable and easy to deploy.
                                    </p>
                                </div>
                            </div>

                            {/* Batch API Card */}
                            <div
                                className={`card bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 rounded-xl min-w-[280px] md:min-w-0 ${selectedBridgeTypeCard === 'batch' ? 'ring-2 ring-purple-500' : ''}`}
                                onClick={() => handleBridgeTypeSelection('batch')}
                            >
                                <div className="card-body p-4 md:p-6">
                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div className="p-2 md:p-3 rounded-lg bg-purple-50">
                                            <Clock10 className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                                        </div>
                                        <h2 className="card-title text-lg md:text-xl font-semibold text-gray-800">Batch API</h2>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                                        Process multiple prompts or data inputs in a single request using the Batch API. Ideal for large-scale tasks like summarization, generation, or classification—fast, efficient, and built for bulk operations.
                                    </p>
                                </div>
                            </div>

                            {/* Triggers Card */}
                            <div
                                className={`card bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 rounded-xl min-w-[280px] md:min-w-0 ${selectedBridgeTypeCard === 'triggers' ? 'ring-2 ring-amber-500' : ''}`}
                                onClick={() => handleBridgeTypeSelection('triggers')}
                            >
                                <div className="card-body p-4 md:p-6">
                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div className="p-2 md:p-3 rounded-lg bg-amber-50">
                                            <CircleAlert className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                                        </div>
                                        <h2 className="card-title text-lg md:text-xl font-semibold text-gray-800">Triggers</h2>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                                        Automate workflows using Triggers. Set conditions to auto-run actions like sending prompts, generating responses, or forwarding data—no manual input required. Perfect for real-time automation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                     {/* <div className="mt-6 md:mt-8 flex justify-center">
                        <div className="w-full md:w-auto grid grid-cols-2 gap-2 md:flex items-center bg-gray-100 p-2 rounded-lg">
                            <button 
                                className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-md transition-all text-sm md:text-base whitespace-nowrap ${!isManualMode ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700'}`}
                                onClick={() => setIsManualMode(false)}
                            >
                                Create with AI
                            </button>
                            <button 
                                className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-md transition-all text-sm md:text-base whitespace-nowrap ${isManualMode ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700'}`}
                                onClick={() => setIsManualMode(true)}
                            >
                                Create Manually
                            </button>
                        </div>
                    </div> */}

                      {/* {!isManualMode ? ( */}
                    <div className="mt-6 md:mt-8">
                        <div className="form-control">
                            <label className="label pb-1 md:pb-2">
                                <span className="label-text font-medium text-base md:text-lg text-gray-800">Bridge Purpose</span>
                                {validationErrors.purpose && (
                                    <span className="label-text-alt text-red-500">{validationErrors.purpose}</span>
                                )}
                            </label>
                            <div className="relative">
                                <textarea
                                    id="bridge-purpose"
                                    placeholder="Describe the purpose of this bridge..."
                                    ref={textAreaPurposeRef}
                                    onChange={handlePurposeInput}
                                    className={`textarea textarea-bordered w-full min-h-[100px] md:min-h-[120px] bg-white transition-all duration-300 placeholder-gray-400 text-sm md:text-base ${
                                        validationErrors.purpose 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                    }`}
                                    required
                                    aria-label="Bridge purpose description"
                                ></textarea>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 md:mt-2 italic">
                                A clear purpose helps AI to understand your bridge's functionality and improves discoverability.
                            </p>
                        </div>
                    </div>
                    {/* ) : (
                        <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="form-control">
                                <label className="label pb-1 md:pb-2">
                                    <span className="label-text font-medium text-gray-800">Bridge Name</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="bridge-name" 
                                    placeholder="Enter bridge name" 
                                    className="input input-bordered w-full bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm md:text-base"
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label pb-1 md:pb-2">
                                    <span className="label-text font-medium text-gray-800">Service</span>
                                </label>
                                <select value={selectedService} onChange={handleService} className="select select-bordered w-full text-sm md:text-base">
                                    <option disabled></option>
                                    {SERVICES.map((service, index) => (
                                        <option key={index} value={service}>{service}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label pb-1 md:pb-2">
                                    <span className="label-text font-medium text-gray-800">Model</span>
                                </label>
                                <select value={selectedModel} onChange={handleModel} className="select select-bordered text-sm md:text-base">
                                    <option disabled></option>
                                    {Object.entries(modelsList || {}).map(([group, options], groupIndex) => {
                                        if (group !== 'models') {
                                            return (
                                                <optgroup label={group} key={`group_${groupIndex}`}>
                                                    {Object.keys(options || {}).map((option, optionIndex) => {
                                                        const modelName = options?.[option]?.configuration?.model?.default;
                                                        return (
                                                            <option key={`option_${groupIndex}_${optionIndex}`}>
                                                                {modelName}
                                                            </option>
                                                        );
                                                    })}
                                                </optgroup>
                                            );
                                        }
                                        return null;
                                    })}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label pb-1 md:pb-2">
                                    <span className="label-text font-medium text-gray-800">Bridge Type</span>
                                </label>
                                <select 
                                    className="select select-bordered w-full bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm md:text-base"
                                    value={bridgeType}
                                    onChange={(e) => setBridgeType(e.target.value)}
                                >
                                    <option value="api">API</option>
                                    <option value="chatbot">Chatbot</option>
                                    <option value="batch">Batch API</option>
                                </select>
                            </div>
                        </div>
                    )} */}

                    <div className="modal-action mt-6 md:mt-8 flex flex-col-reverse md:flex-row justify-between gap-4">
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
                                ) : "Create Manually"}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 w-full my-4 md:my-0 md:w-auto">
                            <hr className="flex-1 border-t-2 border-gray-200 md:w-8" />
                            <span className="text-gray-400 text-xs sm:text-sm mx-2">or</span>
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
                                    ) : "Create Bridge"}
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
                                ) : "Create Bridge"}
                            </button>
                               )}
                        </div>
                    </div>
                </div>
            </dialog>

            {/* {showFileUploadModal && (
                <dialog id="file_upload_modal" className="modal" open>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Upload Postman Collection</h3>
                        <div {...getRootProps({ className: 'dropzone' })} className="border-dashed border-2 border-gray-300 p-4 text-center">
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop a file here, or click to select a file</p>
                            {uploadedFile && <p className="mt-2 text-green-600">{uploadedFile.name}</p>}
                        </div>
                        <div className="modal-action">
                            <form method="dialog">
                                <button className="btn" onClick={() => { setShowFileUploadModal(false); cleanState(); }}>Close</button>
                            </form>
                            <button className="btn" onClick={() => createBridgeHandler(document.getElementById("bridge-name").value, document.getElementById("slug-name").value)}>+ Create</button>
                        </div>
                    </div>
                </dialog>
            )} */}
        </div>
    );
}

export default CreateNewBridge;
