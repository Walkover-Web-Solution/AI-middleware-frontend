import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

const InputConfigComponent = ({ dataToSend: localdata, params }) => {

    const [dataToSend, setDataToSend] = useState({})

    const dispatch = useDispatch()
    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));
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
                    ...dataToSend.configuration,
                    [key]: value // Update the field with the new value
                }
            };
            setDataToSend(updatedDataToSend);
            UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
        }
        else if (key === "apikey") { // If the key is apikey, update the apikey field
            const updatedDataToSend = {
                ...dataToSend,
                [key]: value // Update the field with the new value
            };
            setDataToSend(updatedDataToSend);
            UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
        }
        else {
            const keyIndex = dataToSend?.configuration?.prompt?.findIndex(item => item.role === key);

            let updatedDataToSend;
            if (keyIndex !== -1) { // If the key already exists, update the value
                updatedDataToSend = {
                    ...dataToSend,
                    configuration: {
                        ...dataToSend.configuration,
                        prompt: dataToSend?.configuration?.prompt?.map((item, index) => index === keyIndex ? promptString : item)
                    }
                };
            } else { // If the key does not exist, add it to the prompt array
                updatedDataToSend = {
                    ...dataToSend,
                    configuration: {
                        ...dataToSend.configuration,
                        prompt: [...dataToSend.configuration.prompt, promptString]
                    }
                };
            }
            setDataToSend(updatedDataToSend);
            UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
        }
    };

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    }

    useEffect(() => {
        setDataToSend(localdata)
    }, [localdata])
    const renderInputConfig = useMemo(() => (
        inputConfig && Object.entries(inputConfig).filter(([key]) => key !== "rawData").map(([key, value]) => (
            <div className="form-control w-full " key={key}>
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