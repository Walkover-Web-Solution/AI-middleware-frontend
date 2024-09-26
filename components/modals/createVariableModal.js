import { useCustomSelector } from '@/customSelector/customSelector';
import { updateVariables } from '@/store/reducer/bridgeReducer';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

function CreateVariableModal({ keyName, setKeyName, params }) {
    const dispatch = useDispatch();
    const { variablesKeyValue } = useCustomSelector((state) => ({
        variablesKeyValue: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || [],
    }));

    const [keyValue, setKeyValue] = useState(keyName);
    const [valueValue, setValueValue] = useState('');

    const handleKeyValueChange = (field, value) => {
        console.log(field, value);
        if (field === 'key') {
            setKeyValue(value);
        } else if (field === 'value') {
            setValueValue(value);
        }
    };

    const CreateVariable = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        // Create a new key-value pair
        if (keyValue && valueValue) {
            let updatedPairs = [...variablesKeyValue, { "key": keyValue, "value": valueValue }];
            // Dispatch the update action to the store
            dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id }));
            // Clear the inputs after creating
            setKeyName('');
            setKeyValue('');
            setValueValue('');
            document.getElementById('create_variable_modal').close(); // Close the modal after creation
        }
    };

    const handleCloseModal = (e) => {
        e.preventDefault();
        setKeyName('');
        setKeyValue('');
        setValueValue('');
        document.getElementById('create_variable_modal').close();
    }

    return (
        <dialog id="create_variable_modal" className="modal">
            <div className="modal-box" key={keyName}>
                <h3 className="font-bold text-lg">Create Variable</h3>
                {/* <form> */}
                <div className="label">
                    <span className="label-text">Key</span>
                </div>
                <input
                    type="text"
                    className="input input-bordered input-md w-full mb-2"
                    placeholder="Enter key"
                    defaultValue={keyName}
                    key={keyName}
                    autoFocus
                    onChange={e => handleKeyValueChange("key", e.target.value)}
                    onBlur={e => handleKeyValueChange("key", e.target.value)}
                />
                <div className="label">
                    <span className="label-text">Value</span>
                </div>
                <input
                    key={keyName}
                    defaultValue={valueValue}
                    type="text"
                    className="input input-bordered input-md w-full mb-2"
                    placeholder="Enter value"
                    onChange={e => handleKeyValueChange("value", e.target.value)}
                    onBlur={e => handleKeyValueChange("value", e.target.value)}
                />
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn" onClick={handleCloseModal}>Close</button>
                        <button className="btn ml-2" onClick={CreateVariable}>Create</button>
                    </form>
                </div>
                {/* </form> */}
            </div>
        </dialog>
    )
}

export default React.memo(CreateVariableModal);
