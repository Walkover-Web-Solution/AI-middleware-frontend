import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const InputConfigComponent = ({ params }) => {
    const { prompt: reduxPrompt, service, serviceType } = useCustomSelector((state) => ({
        prompt: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.prompt || "",
        serviceType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type || "",
        service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service || "",
    }));
    const [prompt, setPrompt] = useState(reduxPrompt);
    const dispatch = useDispatch();

    useEffect(() => {
        setPrompt(reduxPrompt);
    }, [reduxPrompt]);

    const savePrompt = useCallback((e) => {
        const newValue = e.target?.value || "";
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { prompt: newValue } } }));
    },[]);

    const handlePromptChange = useCallback((e) => {
        const newValue = e.target?.value || "";
        setPrompt(newValue);
    },[]);

    if (service === "google" && serviceType === "chat") {
        return null;
    }

    return (
        <div className="form-control">
            <div className="label">
                <span className="label-text capitalize">Prompt</span>
            </div>
            <textarea
                className="textarea textarea-bordered border w-full min-h-96 resize-y focus:border-primary"
                value={prompt}
                onChange={handlePromptChange}
                onBlur={savePrompt}
            ></textarea>
        </div>
    );
};

export default InputConfigComponent;