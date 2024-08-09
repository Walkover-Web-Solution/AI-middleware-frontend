import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const InputConfigComponent = ({ params }) => {
    const { prompt, service, serviceType } = useCustomSelector((state) => ({
        prompt: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.prompt || "",
        serviceType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type || "",
        service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service || "",
    }));
    const dispatch = useDispatch();

    const handlePromptChange = (e) => {
        const newValue = e.target?.value || "";
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { prompt: newValue } } }));
    }

    if (service === "google" && serviceType === "chat") {
        return null;
    }

    return (
        <div className="form-control">
            <div className="label">
                <span className="label-text capitalize">Prompt</span>
            </div>
            <textarea
                key={prompt}
                className="textarea textarea-bordered border w-full min-h-96 resize-y focus:border-primary"
                defaultValue={prompt}
                onBlur={handlePromptChange}
            ></textarea>
        </div>
    );
};

export default InputConfigComponent;