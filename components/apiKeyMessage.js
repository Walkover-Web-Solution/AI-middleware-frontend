import { useCustomSelector } from "@/customHooks/customSelector";
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';

function ApiKeyMessage({ params }) {
    const messageRef = useRef(null);
    const { bridgeApiKey, isFirstFunction, isFirstParameter, isFirstVariable } = useCustomSelector(state => {
        const service = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service;
        const onboarding = state.userDetailsReducer.userDetails?.c_companies?.find((c) => c.id === Number(orgId))?.meta?.onboarding
        return {
            service,
            bridgeApiKey: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.apikey_object_id?.[service],
            isFirstFunction : onboarding?.FunctionCreation,
            isFirstParameter : onboarding?.FunctionCreation,
            isFirstVariable : onboarding?.Addvariables,
            isFirstKnowledgeBase : onboarding?.knowledgeBase
        };
    });
    useEffect(() => {
        if (!bridgeApiKey && messageRef.current) {
            messageRef.current.style.display = 'none';
            setTimeout(() => {
                if (messageRef.current) {
                    messageRef.current.style.display = 'flex';
                }
            }, 2000);
        }
    }, [bridgeApiKey]);

    if (!bridgeApiKey&&!isFirstFunction&&!isFirstKnowledgeBase&&!isFirstParameter&&!isFirstVariable) {
        return (
            <div ref={messageRef} className="absolute inset-0 flex flex-col items-center justify-center bg-base-200 z-[99999] opacity-95 gap-2">
                <AlertTriangle className="h-12 w-12 text-warning" />
                <div className="text-lg font-semibold">API Key Required</div>
                <div className="text-sm text-center">
                    Please add your API key in the API key section to start using the bridge.
                </div>
            </div>
        );
    }

    return null;
}

export default ApiKeyMessage;
