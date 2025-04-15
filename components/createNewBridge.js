import { useCustomSelector } from "@/customHooks/customSelector";
import { DEFAULT_MODEL } from "@/jsonFiles/bridgeParameter";
import { createBridgeAction } from "@/store/action/bridgeAction";
import { getModelAction } from "@/store/action/modelAction";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import LoadingSpinner from "./loadingSpinner";
import { closeModal } from "@/utils/utility";
import { MODAL_TYPE } from "@/utils/enums";
import { getServiceAction } from "@/store/action/serviceAction";

function CreateNewBridge({ orgid }) {
    const [selectedService, setSelectedService] = useState('openai');
    const [selectedModel, setSelectedModel] = useState("gpt-4o");
    const [selectedType, setSelectedType] = useState("chat");
    const [bridgeType, setBridgeType] = useState("api");

    const { allBridgeLength, modelsList, SERVICES } = useCustomSelector((state) => ({
        SERVICES : state?.serviceReducer?.services,
        allBridgeLength: (state.bridgeReducer.org[orgid] || [])?.length,
        modelsList: state?.modelReducer?.serviceModels[selectedService],
    }));

    useEffect(() => {
        if(!SERVICES) {
            dispatch(getServiceAction({ orgid }))
        }
    }, [SERVICES]);

    const [isLoading, setIsLoading] = useState(false);
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

    // const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const createBridgeHandler = (name, slugname) => {
        if (name.length > 0 && selectedModel && selectedType) {
            setIsLoading(true);
            const dataToSend = {
                "service": selectedService,
                "model": selectedModel,
                "name": name,
                "slugName": slugname || name,
                "bridgeType": bridgeType,
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
            toast.error("All fields are Required");
        }
    };

    const cleanState = () => {
        setSelectedService("openai");
        setSelectedModel("gpt-4o");
        setSelectedType("chat");
        setBridgeType("api");
        // setUploadedFile(null);
        document.getElementById('bridge-name').value = "";
        if (document.getElementById('slug-name')) document.getElementById('slug-name').value = "";
       closeModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)
    };

    const handleCreateBridge = e => {
        e.preventDefault();
        createBridgeHandler(document.getElementById("bridge-name").value, document.getElementById("slug-name")?.value);
    }

    return (
        <div>
            {isLoading && <LoadingSpinner />}
            <dialog id={MODAL_TYPE.CREATE_BRIDGE_MODAL} className="modal">
                <div className="modal-box">
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
