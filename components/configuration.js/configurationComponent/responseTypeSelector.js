import { useCustomSelector } from '@/customSelector/customSelector';
import { addorRemoveResponseIdInBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const ResponseTypesSelector = ({ params }) => {
    const { allResponseTypes, bridge } = useCustomSelector((state) => ({
        allResponseTypes: state.responseTypeReducer?.responses?.[params.org_id],
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    const dispatch = useDispatch()
    const handleBotResponseChange = (responseKey, responseObj, action) => {
        dispatch(addorRemoveResponseIdInBridgeAction(params.id, params.org_id, { responseId: responseKey, status: action, responseJson: responseObj }))
    }
    return (
        <>
            {bridge?.bridgeType === "chatbot" && (
                <div className="form-control">
                    <p className='text-xl font-medium'>Choose Response Type</p>
                    {Object.keys(allResponseTypes || {}).map((responseKey) => {
                        // Determine if the checkbox should be checked
                        const isChecked = bridge?.responseIds?.includes(responseKey);
                        // Use a combination of responseKey and isChecked to form a unique key
                        const dynamicKey = `${responseKey}-${isChecked}`;
                        return (
                            <label className="label cursor-pointer" key={dynamicKey}>
                                <span className="label-text">{allResponseTypes?.[responseKey]?.description}</span>
                                <input
                                    key={dynamicKey} // Use dynamicKey here to force re-render
                                    type="checkbox"
                                    defaultChecked={isChecked} // Initial checked state
                                    onChange={(e) => handleBotResponseChange(responseKey, allResponseTypes?.[responseKey], e.target.checked ? "add" : "remove")}
                                    className="checkbox checkbox-primary"
                                />
                            </label>
                        )
                    })}
                </div>
            )}
        </>
    );
};

export default ResponseTypesSelector;