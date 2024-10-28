import { useCustomSelector } from "@/customHooks/customSelector";
import { createOrRemoveActionBridge } from "@/store/action/chatBotAction";
import { Plus } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

const DEFAULT_ACTION = 'sendDataToFrontend';

const useClearInputFields = (descriptionRef, dataRef) => useCallback(() => {
    descriptionRef.current.value = '';
    if (dataRef.current) dataRef.current.value = '';
}, [descriptionRef, dataRef]);

const useAreFieldsFilled = (descriptionRef, dataRef, selectedAction) => useCallback(() => {
    const description = descriptionRef.current?.value;
    const data = dataRef.current?.value;
    return !!(description && (selectedAction !== DEFAULT_ACTION || data));
}, [descriptionRef, dataRef, selectedAction]);

const useHandleInputChange = (areFieldsFilled, setIsCreateButtonDisabled) => useCallback(() => {
    setIsCreateButtonDisabled(!areFieldsFilled());
}, [areFieldsFilled, setIsCreateButtonDisabled]);

const ActionModel = ({ params, actionId, setActionId }) => {
    const descriptionRef = useRef(null);
    const dataRef = useRef(null);
    const dispatch = useDispatch();

    const { actions } = useCustomSelector((state) => ({
        actions: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.actions?.[actionId]
    }));

    const clearInputFields = useClearInputFields(descriptionRef, dataRef);
    const [selectedAction, setSelectedAction] = useState(DEFAULT_ACTION);
    const [isCreateButtonDisabled, setIsCreateButtonDisabled] = useState(true);

    const areFieldsFilled = useAreFieldsFilled(descriptionRef, dataRef, selectedAction);
    const handleInputChange = useHandleInputChange(areFieldsFilled, setIsCreateButtonDisabled);

    const handleActionSubmit = useCallback((type, description, data) => {
        const dataToSend = {
            actionJson: {
                description,
                type,
                ...(type === DEFAULT_ACTION && { variable: data })
            },
            ...(actionId && { actionId })
        };

        dispatch(createOrRemoveActionBridge({
            orgId: params?.org_id,
            bridgeId: params?.id,
            type: "add",
            dataToSend
        }));
    }, [dispatch, actionId, params]);

    useEffect(() => {
        handleInputChange();
    }, [handleInputChange]);

    useEffect(() => {
        if (actionId && actions) {
            descriptionRef.current.value = actions?.description;
            dataRef.current.value = actions.variable;
            setSelectedAction(actions.type);
        }
    }, [actionId, actions]);

    return (
        <div className="cursor-pointer">
            <button className="btn btn-outline btn-sm mt-4 w-fit" onClick={() => {
                document.getElementById('actionModel').showModal();
                clearInputFields();
            }}>
                <Plus size={16} /> Add a new action
            </button>

            <dialog id="actionModel" className="modal">
                <div className="modal-box w-full bg-base-100 text-base-content">
                    <label className="form-control">
                        <div className="label">
                            <span className="label-text text-lg">Select an Action</span>
                        </div>
                        <select
                            className="select select-sm select-bordered"
                            value={selectedAction}
                            onChange={(e) => {
                                setSelectedAction(e.target.value);
                                handleInputChange();
                            }}
                        >
                            <option disabled>Pick one</option>
                            <option value="sendDataToFrontend">Send Data to Frontend</option>
                        </select>
                        <div className="label">
                            <span className="label-text-alt">Choose an action for the chatbot: send data to the Frontend or back to the AI. These options allow you to direct the flow of data accordingly.</span>
                        </div>
                    </label>

                    <label className="form-control">
                        <div className="label">
                            <span className="label-text text-lg">Description</span>
                        </div>
                        <textarea
                            className="textarea textarea-bordered h-24"
                            placeholder="Enter a brief bio"
                            ref={descriptionRef}
                            onChange={handleInputChange}
                        ></textarea>
                        <div className="label">
                            <span className="label-text-alt">Describe when to run this action. Provide specific scenarios or conditions.</span>
                        </div>
                    </label>
                    {selectedAction === DEFAULT_ACTION && (
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text text-lg">Data Structure for Frontend</span>
                            </div>
                            <textarea
                                className="textarea textarea-bordered h-24"
                                placeholder="Enter data structure format"
                                ref={dataRef}
                                onChange={handleInputChange}
                            ></textarea>
                            <div className="label">
                                <span className="label-text-alt">Provide a proper structure in which the data should be sent to the Frontend.</span>
                            </div>
                        </label>
                    )}
                    <div className="modal-action">
                        <button className="btn" onClick={() => {
                            document.getElementById('actionModel').close();
                            setActionId(null);
                            clearInputFields();
                            setIsCreateButtonDisabled(true);
                        }}>Close</button>
                        <button
                            className="btn ml-2 btn-primary"
                            disabled={isCreateButtonDisabled}
                            onClick={() => {
                                handleActionSubmit(selectedAction, descriptionRef.current.value, dataRef.current?.value);
                                document.getElementById('actionModel').close();
                                setActionId(null);
                                setIsCreateButtonDisabled(true);
                            }}
                        >{actionId ? "Update" : "Create"}</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default ActionModel;