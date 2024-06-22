import { useCustomSelector } from "@/customSelector/customSelector";
import { services } from "@/jsonFiles/models"
import { createBridgeAction } from "@/store/action/bridgeAction";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

function CreateNewBridge({ orgid }) {
    const [selectedService, setSelectedService] = useState('openai');
    const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
    const [seletedType, setSelectedType] = useState("chat");
    const [bridgeType, setBridgeType] = useState("api");
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch()
    const route = useRouter();
    const allBridgeLength = useCustomSelector((state) => state.bridgeReducer.org[orgid] || []).length;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleModelChange = (e) => {
        const selectedModel = e.target.value;
        const selectedType = e.target.selectedOptions[0].parentNode.label;
        setFormState(prevState => ({
            ...prevState,
            selectedModel,
            selectedType
        }));
    };

    const createBridgeHandler = () => {
        const { bridgeName, selectedModel, selectedType, selectedService, bridgeType } = formState;
        if (bridgeName.trim().length > 0 && selectedModel && selectedType) {
            setFormState(prevState => ({
                ...prevState,
                isLoading: true
            }));

    const createBridgeHandler = (name, slugname) => {
        if (name.length > 0 && selectedModel && seletedType) {
            setIsLoading(true);
            const dataToSend = {
                "configuration": {
                    "model": selectedModel,
                    "name": bridgeName,
                    "type": selectedType,
                    "slugName": formState.slugName
                },
                "service": selectedService,
                "bridgeType": bridgeType,
            };

            dispatch(createBridgeAction({ dataToSend, orgid }, (data) => {
                route.push(`/org/${orgid}/bridges/configure/${data.data.bridge._id}`);
                setFormState(prevState => ({
                    ...prevState,
                    isLoading: false
                }));
                cleanState();
                document.getElementById('my_modal_1').close();
            })).catch(() => {
                setFormState(prevState => ({
                    ...prevState,
                    isLoading: false
                }));
            });
        } else {
            toast.error("All fields are Required");
        }
    };

    const cleanState = () => {
        setFormState({
            selectedService: 'openai',
            selectedModel: "gpt-4o",
            selectedType: "chat",
            bridgeType: "api",
            isLoading: false,
            bridgeName: "assistant",
            slugName: "root"
        });
    };

    const { isLoading, selectedService, selectedModel, bridgeType } = formState;

    return (
        <div>
            {isLoading && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-lg flex justify-center items-center z-50">
                    <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xl">
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-xl font-medium text-gray-700">Loading...</span>
                        </div>
                    </div>
                </div>
            )}

            <dialog id="my_modal_1" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Create Bridge !</h3>
                    <div>
                        <label className="form-control w-full mb-2">
                            <div className="label">
                                <span className="label-text">Bridge Name</span>
                            </div>
                            <input type="text" id="bridge-name" defaultValue={allBridgeLength === 0 ? "Assistant" : ""} placeholder="Type here" className="input input-bordered w-full" maxLength="50" />
                        </label>
                        <label>
                            <div className="label">
                                <span className="label-text">Select Service</span>
                            </div>
                            <select
                                value={selectedService}
                                onChange={handleChange}
                                name="selectedService"
                                className="select select-bordered w-full"
                            >
                                <option disabled></option>
                                <option value="openai">openai</option>
                                <option value="google">google</option>
                            </select>
                        </label>
                        <label className="form-control w-full mb-2">
                            <div className="label">
                                <span className="label-text">Pick a model</span>
                            </div>
                            <select
                                value={selectedModel}
                                onChange={handleModelChange}
                                name="selectedModel"
                                className="select select-bordered"
                            >
                                <option disabled></option>
                                {/* Replace services?.[selectedService] with your data */}
                                {Object.entries(services?.[selectedService] || {}).map(([group, options]) => (
                                    group !== 'models' && // Exclude the 'models' group
                                    <optgroup label={group} key={group}>
                                        {[...options].map(option => (
                                            <option key={option}>{option}</option>
                                        ))}
                                    </optgroup>
                                ))}
                                {!services?.[selectedService] && <option disabled key="0">Please select a service first !</option>}
                            </select>
                        </label>
                        <label className="form-control w-full mb-2">
                            <div className="label">
                                <span className="label-text">Slug Name</span>
                            </div>
                            <input type="text" id="slug-name" defaultValue={allBridgeLength === 0 ? "root" : ""} placeholder="Type here" className="input input-bordered w-full " />

                        </label>
                        <div className="items-center justify-start mt-2">
                            <div className="label">
                                <span className="label-text">Used as</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center justify-center gap-2">
                                    <input
                                        type="radio"
                                        name="bridgeType"
                                        className="radio"
                                        value="api"
                                        checked={bridgeType === "api"}
                                        onChange={() => setFormState(prevState => ({ ...prevState, bridgeType: 'api' }))}
                                    />
                                    API
                                </label>
                                <label className="flex items-center justify-center gap-2">
                                    <input
                                        type="radio"
                                        name="bridgeType"
                                        className="radio"
                                        value="chatbot"
                                        checked={bridgeType === "chatbot"}
                                        onChange={() => setFormState(prevState => ({ ...prevState, bridgeType: 'chatbot' }))}
                                    />
                                    ChatBot
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn" disabled={allBridgeLength == '0'} onClick={cleanState}>Close</button>
                        </form>
                        <button className="btn" onClick={() => createBridgeHandler(document.getElementById("bridge-name").value, document.getElementById("slug-name").value)}>+ Create</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}

export default CreateNewBridge
