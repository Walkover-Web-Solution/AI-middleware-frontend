import { services } from "@/jsonFiles/models"
import { createBridgeAction } from "@/store/action/bridgeAction";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

function CreateNewBridge({ orgid }) {
    const [selectedService, setSelectedService] = useState('');
    const [selectedModel, setSelectedModel] = useState("");
    const [seletedType, setSelectedType] = useState("");
    const [bridgeType, setBridgeType] = useState("api");
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch()
    const route = useRouter();

    const handleService = (e) => {
        setSelectedService(e.target.value)
    }

    const handleModel = (e) => {
        setSelectedModel(e.target.value)
        setSelectedType(e.target.selectedOptions[0].parentNode.label)
    }

    const createBridgeHandler = (name, slugname) => {
        if (name.length > 0 && selectedModel && selectedModel && seletedType) {
            setIsLoading(true);
            const dataToSend = {
                "configuration": {
                    "model": selectedModel,
                    "name": name,
                    "type": seletedType,
                    "slugName": slugname
                },
                "service": selectedService,
                "bridgeType": bridgeType,
            }
            dispatch(createBridgeAction({ dataToSend: dataToSend, orgid }, (data) => {

                route.push(`/org/${orgid}/bridges/configure/${data.data.bridge._id}`);
                setIsLoading(false);
                document.getElementById('my_modal_1').close()
            })).catch(
                setIsLoading(false)
            );
        }
        else toast.error("All fields are Required ")
    }

    return (
        <div>
            {isLoading &&
                (<div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-lg flex justify-center items-center z-50">
                    <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xl">
                        <div className="flex items-center justify-center space-x-2">
                            {/* Tailwind CSS Spinner */}
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
                    <div >
                        <label className="form-control w-full mb-2">
                            <div className="label">
                                <span className="label-text">Bridge Name</span>
                            </div>
                            <input type="text" id="bridge-name" placeholder="Type here" className="input input-bordered w-full " />

                        </label>
                        <label>
                            <div className="label">
                                <span className="label-text">Select Service</span>
                            </div>
                            <select value={selectedService} onChange={handleService} className="select select-bordered w-full ">
                                <option disabled selected></option>
                                <option>openai</option>
                                {/* <option>google</option> */}
                            </select>
                        </label>
                        <label className="form-control w-full mb-2 ">
                            <div className="label">
                                <span className="label-text">Pick a model</span>
                            </div>
                            <select value={selectedModel} onChange={handleModel} className="select select-bordered">
                                <option disabled selected></option>
                                {Object.entries(services?.[selectedService] || {}).map(([group, options]) => (
                                    group !== 'models' && // Exclude the 'models' group
                                    <optgroup label={group}>
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
                            <input type="text" id="slug-name" placeholder="Type here" className="input input-bordered w-full " />

                        </label>
                        <div className="items-center justify-start mt-2">
                            <div className="label">
                                <span className="label-text">Used as</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center justify-center gap-2">
                                    <input type="radio" name="radio-1" className="radio" value="api" checked={bridgeType === "api"} onChange={() => setBridgeType('api')} />
                                    API
                                </label>
                                <label className="flex items-center justify-center gap-2">
                                    <input type="radio" name="radio-1" className="radio" value="chatbot" checked={bridgeType === "chatbot"} onChange={() => setBridgeType('chatbot')} />
                                    ChatBot
                                </label>
                            </div>
                        </div>

                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn">Close</button>
                        </form>
                        <button className="btn" onClick={() => createBridgeHandler(document.getElementById("bridge-name").value, document.getElementById("slug-name").value)}>+ Create</button>
                    </div>
                </div>
            </dialog>

        </div>
    )
}

export default CreateNewBridge
