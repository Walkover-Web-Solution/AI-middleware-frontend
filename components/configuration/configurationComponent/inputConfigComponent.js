import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

const InputConfigComponent = ({ params }) => {


    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));
    const dataToSend = {
        configuration: {
            model: bridge?.configuration?.model?.default,
        },
        service: bridge?.service?.toLowerCase(),
    }

    const dispatch = useDispatch()

    const [inputConfig, setInputConfig] = useState()
    useEffect(() => {
        setInputConfig(bridge?.inputConfig)
    }, [bridge])

    const handleInputConfigChanges = (value, key) => {
        setInputConfig(prevInputConfig => ({
            ...prevInputConfig,
            [key]: {
                default: {
                    content: value,
                }
            }
        }));
    };

    const SaveData = (value, key) => {
        const promptString = { "role": key, "content": value }; // The prompt string to add or update

        if (key === "input" || key === "prompt") { // If the key is input or prompt, update the configuration.input or configuration.prompt field
            const updatedDataToSend = {
                ...dataToSend,
                configuration: {
                    ...dataToSend?.configuration,
                    [key]: value // Update the field with the new value
                }
            };
            UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
        }
        else {

            let updatedDataToSend = {
                ...dataToSend,
                configuration: {
                    ...dataToSend?.configuration,
                    prompt: [promptString]
                }
            };
            UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
        }
    };

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    }

    const renderInputConfig = useMemo(() => (
        inputConfig && Object.entries(inputConfig).filter(([key]) => key !== "rawData").map(([key, value]) => (
            <div className="form-control" key={key}>
                <div className="label">
                    <span className="label-text capitalize">{key}</span>
                </div>
                <textarea
                    className="textarea textarea-bordered w-full min-h-96 resize-y"
                    defaultValue={value?.default?.content || value?.prompt || value?.input || ""}
                    onBlur={(e) => { handleInputConfigChanges(e.target.value, key); SaveData(e.target.value, key) }}
                ></textarea>
            </div>
        ))
    ), [inputConfig, handleInputConfigChanges, SaveData]);

    return <>{renderInputConfig}</>;
};

export default InputConfigComponent;