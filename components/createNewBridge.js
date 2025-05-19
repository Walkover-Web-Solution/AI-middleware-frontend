import { useCustomSelector } from "@/customHooks/customSelector";
import { createBridgeAction, createBridgeWithAiAction } from "@/store/action/bridgeAction";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
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

    const { allBridgeList, SERVICES } = useCustomSelector((state) => ({
        SERVICES : state?.serviceReducer?.services,
        allBridgeList: (state.bridgeReducer.org[orgid] || [])?.orgs,
    }));

    useEffect(() => {
        if(!SERVICES) {
            dispatch(getServiceAction({ orgid }))
        }
    }, [SERVICES]);

    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const dispatch = useDispatch();
    const route = useRouter();

    

    const createBridgeHandler = (name, slugname) => {
        name = 'Untitled';
        const matches = allBridgeList?.filter(bridge => bridge?.name?.match(/^Untitled(?:(\d+))?$/));
        const newCount = matches?.length + 1 || 0;
        name = `Untitled${newCount}`;
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
        } else {
            toast.error("Select Bridge Type");
        }
    };

    const cleanState = () => {
        setSelectedService("openai");
        setSelectedModel("gpt-4o");
        setSelectedType("chat");
        setBridgeType("api");
        setIsManualMode(false);
        if (textAreaPurposeRef?.current) {
            textAreaPurposeRef.current.value = '';
        }
       
        closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)
    };


    const handleCreateBridgeUsingAI = () => {
        const purpose = textAreaPurposeRef?.current?.value;
        if (!purpose || purpose.trim() === "") {
            toast.error("Please enter a bridge purpose");
            return;
        }
        else if (!selectedBridgeTypeCard) {
            toast.error("Select Bridge Type")
            return
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
            .catch(() => {
                setIsAiLoading(false);
                toast.error('Error while creating bridge');
            });
    }


    return (
        <div>
            {isLoading && <LoadingSpinner />}
            <dialog id={MODAL_TYPE.CREATE_BRIDGE_MODAL} className="modal">
                
                <div className="bg-base-100 px-4 md:px-10 py-6 md:py-8 rounded-lg max-w-[90%] md:max-w-[80%] mx-auto">
                    <h3 className="font-bold text-xl md:text-2xl mb-4 md:mb-6 text-gray-800">Create Bridge</h3>
                    <div className="space-y-4 pb-2 p-2">
                        <label className="text-lg font-semibold text-gray-800">Select Bridge Type</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto p-2">
                            {/* API Card */}
                            <div
                                className={`card bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 rounded-xl min-w-[280px] md:min-w-0 ${selectedBridgeTypeCard === 'api' ? 'ring-2 ring-blue-500' : ''}`}
                                onClick={() => setSelectBridgeTypeCard('api')}
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
                                onClick={() => setSelectBridgeTypeCard('chatbot')}
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
                                onClick={() => setSelectBridgeTypeCard('batch')}
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
                                onClick={() => setSelectBridgeTypeCard('triggers')}
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

                    

                    {/* {!isManualMode ? ( */}
                    <div className="mt-6 md:mt-8">
                        <div className="form-control">
                            <label className="label pb-1 md:pb-2">
                                <span className="label-text font-medium text-base md:text-lg text-gray-800">Bridge Purpose</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    id="bridge-purpose"
                                    placeholder="Describe the purpose of this bridge..."
                                    ref={textAreaPurposeRef}
                                    className="textarea textarea-bordered w-full min-h-[100px] md:min-h-[120px] bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 placeholder-gray-400 text-sm md:text-base"
                                    required
                                    aria-label="Bridge purpose description"
                                ></textarea>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 md:mt-2 italic">
                                A clear purpose helps AI to understand your bridge's functionality and improves discoverability.
                            </p>
                        </div>
                    </div>
                    

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

            
        </div>
    );
}

export default CreateNewBridge;
