import { useCustomSelector } from "@/customHooks/customSelector";
import { createOrRemoveActionBridge } from "@/store/action/chatBotAction";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal } from "@/utils/utility";
import { AddIcon } from "@/components/Icons";
import { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

const ACTIONS = {
    DEFAULT: 'sendDataToFrontend',
    REPLY: 'reply'
};

const useInputHandlers = (descriptionRef, dataRef, selectedAction) => {
    const clearInputFields = useCallback(() => {
        descriptionRef.current.value = '';
        if (dataRef.current) dataRef.current.value = '';
    }, [descriptionRef, dataRef]);

    const areFieldsFilled = useCallback(() => {
        const description = descriptionRef.current?.value;
        const data = dataRef.current?.value;
        return !!(description && (selectedAction !== ACTIONS.DEFAULT || data));
    }, [descriptionRef, dataRef, selectedAction]);

    return { clearInputFields, areFieldsFilled };
};

const ActionModel = ({ params, actionId, setActionId }) => {
    const descriptionRef = useRef(null);
    const dataRef = useRef(null);
    const dispatch = useDispatch();
    const [selectedAction, setSelectedAction] = useState(ACTIONS.DEFAULT);
    const [isCreateButtonDisabled, setIsCreateButtonDisabled] = useState(true);

    const { actions } = useCustomSelector((state) => ({
        actions: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.actions?.[actionId]
    }));

    const { clearInputFields, areFieldsFilled } = useInputHandlers(descriptionRef, dataRef, selectedAction);

    const handleInputChange = useCallback(() => {
        setIsCreateButtonDisabled(!areFieldsFilled());
    }, [areFieldsFilled]);

    const handleActionSubmit = useCallback((type, description, data) => {
        const actionJson = {
            description,
            type,
            ...((type === ACTIONS.DEFAULT || type === ACTIONS.REPLY) && { variable: data })
        };

        dispatch(createOrRemoveActionBridge({
            orgId: params?.org_id,
            bridgeId: params?.id,
            versionId: params?.version,
            type: "add",
            dataToSend: { actionJson, ...(actionId && { actionId }) }
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

    const handleModalClose = useCallback(() => {
        closeModal(MODAL_TYPE.ACTION_MODAL);
        setActionId(null);
        clearInputFields();
        setIsCreateButtonDisabled(true);
    }, [setActionId, clearInputFields]);

    const handleCreateUpdate = useCallback(() => {
        handleActionSubmit(selectedAction, descriptionRef.current.value, dataRef.current?.value);
        handleModalClose();
    }, [handleActionSubmit, selectedAction, handleModalClose]);

    return (
        <div className="cursor-pointer">
            <button className="btn btn-outline btn-sm mt-4 w-fit" onClick={() => {
                document.getElementById('actionModel').showModal();
                clearInputFields();
            }}>
                <AddIcon size={16} /> Add a new action
            </button>

            <dialog id={MODAL_TYPE.ACTION_MODAL} className="modal">
                <div className="modal-box w-full bg-base-100 text-base-content">
                    <ActionSelect 
                        selectedAction={selectedAction} 
                        setSelectedAction={setSelectedAction}
                        handleInputChange={handleInputChange}
                    />
                    
                    <ActionDescription 
                        descriptionRef={descriptionRef}
                        handleInputChange={handleInputChange}
                    />

                    {selectedAction === ACTIONS.DEFAULT && (
                        <ActionDataInput 
                            dataRef={dataRef}
                            handleInputChange={handleInputChange}
                        />
                    )}

                    <div className="modal-action">
                        <button className="btn" onClick={handleModalClose}>Close</button>
                        <button
                            className="btn ml-2 btn-primary"
                            disabled={isCreateButtonDisabled}
                            onClick={handleCreateUpdate}
                        >
                            {actionId ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

const ActionSelect = ({ selectedAction, setSelectedAction, handleInputChange }) => (
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
            <option value="reply">Reply</option>
        </select>
        <div className="label">
            <span className="label-text-alt">Choose an action for the chatbot: send data to the Frontend or reply to the user. These options allow you to direct the flow of data accordingly.</span>
        </div>
    </label>
);

const ActionDescription = ({ descriptionRef, handleInputChange }) => (
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
);

const ActionDataInput = ({ dataRef, handleInputChange }) => (
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
);

export default ActionModel;