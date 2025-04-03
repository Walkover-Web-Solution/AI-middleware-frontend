import { useCustomSelector } from "@/customHooks/customSelector";
import { AlertTriangle } from 'lucide-react';

function ApiKeyMessage({ params }) {
    const { bridgeApiKey } = useCustomSelector(state => {
        const service = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service;
        return {
            service,
            bridgeApiKey: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.apikey_object_id?.[service]
        };
    });

    if (!bridgeApiKey) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-200 z-[99999] gap-2">
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
