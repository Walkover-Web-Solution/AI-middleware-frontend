import { createOrRemoveActionBridge } from "@/store/action/chatBotAction";
import { Plus } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";

const ActionModel = ({ params }) => {
    const actionIdRef = useRef(null);
    const actionNameRef = useRef(null);
    const descriptionRef = useRef(null);
    const dataRef = useRef(null);
    const dispatch = useDispatch();

    const [selectedAction, setSelectedAction] = useState('Frontend');
    const [isCreateButtonDisabled, setIsCreateButtonDisabled] = useState(true);

    const handleActionSubmit = (actionId, type, description, data) => {
        const dataToSend = {
            actionId,
            actionJson: {
                description,
                type
            }
        };

        if (type === 'Frontend') {
            dataToSend.actionJson.data = data;
        }

        dispatch(createOrRemoveActionBridge({
            orgId: params?.org_id, bridgeId: params?.id, type: "add", dataToSend
        }));
    };

    const areFieldsFilled = () => {
        const actionId = actionIdRef.current?.value;
        const description = descriptionRef.current?.value;
        const data = dataRef.current?.value;
        return !!(actionId && description && (selectedAction !== 'Frontend' || data));
    };

    const handleInputChange = () => {
        setIsCreateButtonDisabled(!areFieldsFilled());
    };

    useEffect(() => {
        handleInputChange();
    }, [selectedAction]);

    return (
        <div>
            <button className="btn btn-outline btn-sm mt-4 w-fit" onClick={() => document.getElementById('actionModel').showModal()}>
                <Plus size={16} /> Add a new action
            </button>

            <dialog id="actionModel" className="modal">
                <div className="modal-box w-full">
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text text-lg">Action ID</span>
                        </div>
                        <input type="text" placeholder="Enter Action ID" ref={actionIdRef} className="input w-full input-bordered input-sm" onChange={handleInputChange} />
                        <div className="label">
                            <span className="label-text-alt">Unique identifier for the action</span>
                        </div>
                    </label>

                    <label className="form-control">
                        <div className="label">
                            <span className="label-text text-lg">Select an Action</span>
                        </div>
                        <select
                            className="select select-sm select-bordered"
                            ref={actionNameRef}
                            value={selectedAction}
                            onChange={(e) => {
                                setSelectedAction(e.target.value);
                                handleInputChange();
                            }}
                        >
                            <option disabled>Pick one</option>
                            <option>Send Data to Frontend</option>
                            <option>Send Data to GPT</option>
                        </select>
                        <div className="label">
                            <span className="label-text-alt">Choose an action for the chatbot: send data to the Frontend or back to the AI. These options allow you to direct the flow of data accordingly.</span>
                        </div>
                    </label>

                    <label className="form-control">
                        <div className="label">
                            <span className="label-text text-lg">Description</span>
                        </div>
                        <textarea className="textarea textarea-bordered h-24" placeholder="Enter a brief bio" ref={descriptionRef} onChange={handleInputChange}></textarea>
                        <div className="label">
                            <span className="label-text-alt">Describe when to run this action. Provide specific scenarios or conditions.</span>
                        </div>
                    </label>

                    {selectedAction === 'Frontend' && (
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text text-lg">Data Structure for Frontend</span>
                            </div>
                            <textarea className="textarea textarea-bordered h-24" placeholder="Enter data structure format" ref={dataRef} onChange={handleInputChange}></textarea>
                            <div className="label">
                                <span className="label-text-alt">Provide a proper structure in which the data should be sent to the frontend.</span>
                            </div>
                        </label>
                    )}

                    <div className="modal-action">
                        <div>
                            <button className="btn" onClick={() => document.getElementById('actionModel').close()}>Close</button>
                            <button className="btn ml-2" disabled={isCreateButtonDisabled} onClick={() => { handleActionSubmit(actionIdRef.current.value, selectedAction, descriptionRef.current.value, dataRef?.current?.value); document.getElementById('actionModel').close(); }}>Create</button>
                        </div>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default ActionModel;
