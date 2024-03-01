import { services } from "@/jsonFiles/models"
import { createBridgeAction } from "@/store/action/bridgeAction";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

function CreateNewBridge() {
    const [selectedService, setSelectedService] = useState('');
    const [selectedModel, setSelectedModel] = useState("");
    const [seletedType , setSelectedType] = useState("");
    const dispatch = useDispatch()
    const route = useRouter()

    const handleService = (e) => {
        setSelectedService(e.target.value)
    }

    const handleModel = (e) => {
        setSelectedModel(e.target.value)
        setSelectedType(e.target.selectedOptions[0].parentNode.label)
    }

    const createBridgeHandler = (name) => {
        if (name.length > 0 && selectedModel && selectedModel && seletedType) {
            const dataToSend = {
                "configuration": {
                    "model": selectedModel,
                    "name": name,
                    "type": seletedType
                },
                "service": selectedService,
            }
            dispatch(createBridgeAction(dataToSend, (data) => {
                route.replace(`/configure/${data.data.bridge._id}`);
            }));
            document.getElementById('my_modal_1').close()
        }
        else toast.error("All fields are Required ")
    }

    return (
        <div>
            <dialog id="my_modal_1" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Hello!</h3>
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
                                <option>google</option>
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
                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn">Close</button>
                        </form>
                        <button className="btn" onClick={() => createBridgeHandler(document.getElementById("bridge-name").value)}>+ Create</button>
                    </div>
                </div>
            </dialog>
        </div>
    )
}

export default CreateNewBridge
