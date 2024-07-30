import { useCustomSelector } from "@/customSelector/customSelector";
import { services } from "@/jsonFiles/models";
import { createBridgeAction } from "@/store/action/bridgeAction";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDropzone } from 'react-dropzone';
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import LoadingSpinner from "./loadingSpinner";

function CreateNewBridge({ orgid }) {
    const [selectedService, setSelectedService] = useState('openai');
    const [selectedModel, setSelectedModel] = useState("gpt-4o");
    const [selectedType, setSelectedType] = useState("chat");
    const [bridgeType, setBridgeType] = useState("api");
    const allBridgeLength = useCustomSelector((state) => state.bridgeReducer.org[orgid] || []).length;
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const dispatch = useDispatch();
    const route = useRouter();

    const handleService = (e) => {
        setSelectedService(e.target.value);
        setSelectedModel(e.target.value === "google" ? "gemini-pro" : "gpt-4o");
    };

    const handleModel = (e) => {
        setSelectedModel(e.target.value);
        setSelectedType(e.target.selectedOptions[0].parentNode.label);
    };

    const onDrop = (acceptedFiles) => {
        setUploadedFile(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const createBridgeHandler = (name, slugname) => {
        if (name.length > 0 && selectedModel && selectedType) {
            setIsLoading(true);
            const dataToSend = {
                "configuration": {
                    "model": selectedModel,
                    "name": name,
                    "type": selectedType,
                    "slugName": slugname || name
                },
                "service": selectedService,
                "bridgeType": bridgeType // Added missing semicolon
            };
            dispatch(createBridgeAction({ dataToSend: dataToSend, orgid }, (data) => {
                setShowFileUploadModal(false);
                route.push(`/org/${orgid}/bridges/configure/${data.data.bridge._id}`);
                document.getElementById('my_modal_1').close();
                setIsLoading(false);
                cleanState();
            })).catch(() => {
                setIsLoading(false);
            });
        } else {
            toast.error("All fields are Required");
        }
    };

    const cleanState = () => {
        setSelectedService("openai");
        setSelectedModel("gpt-4o");
        setSelectedType("chat");
        setBridgeType("api");
        setUploadedFile(null);
        document.getElementById('bridge-name').value = "";
        if (document.getElementById('slug-name')) document.getElementById('slug-name').value = "";
    };

    return (
        <div>
            {isLoading && <LoadingSpinner />}
            <dialog id="my_modal_1" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Create Bridge !</h3>
                    <div>
                        <div className="items-center justify-start mt-2">
                            <div className="label">
                                <span className="label-text">Used as</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center justify-center gap-2">
                                    <input type="radio" name="radio-1" className="radio" value="api" defaultChecked={bridgeType === "api"} onChange={() => setBridgeType('api')} />
                                    API
                                </label>
                                <label className="flex items-center justify-center gap-2">
                                    <input type="radio" name="radio-1" className="radio" value="chatbot" defaultChecked={bridgeType === "chatbot"} onChange={() => setBridgeType('chatbot')} />
                                    ChatBot
                                </label>
                            </div>
                        </div>
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
                            <select value={selectedService} onChange={handleService} className="select select-bordered w-full ">
                                <option disabled></option>
                                <option value="openai">openai</option>
                                <option value="google">google</option>
                            </select>
                        </label>
                        <label className="form-control w-full mb-2 ">
                            <div className="label">
                                <span className="label-text">Pick a model</span>
                            </div>
                            <select value={selectedModel} onChange={handleModel} className="select select-bordered">
                                <option disabled></option>
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
                        {bridgeType === 'chatbot' ? <label className="form-control w-full mb-2">
                            <div className="label">
                                <span className="label-text">Slug Name</span>
                            </div>
                            <input type="text" id="slug-name" defaultValue={allBridgeLength === 0 ? "root" : ""} placeholder="Type here" className="input input-bordered w-full " />
                        </label> : null}
                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn" onClick={cleanState}>Close</button>
                        </form>
                        <button className="btn" onClick={() => createBridgeHandler(document.getElementById("bridge-name").value, document.getElementById("slug-name")?.value)}>+ Create</button>
                    </div>
                </div>
            </dialog>

            {showFileUploadModal && (
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
            )}
        </div>
    );
}

export default CreateNewBridge;
