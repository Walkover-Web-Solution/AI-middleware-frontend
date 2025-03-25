import { useCustomSelector } from "@/customHooks/customSelector";
import { DEFAULT_MODEL, SERVICES } from "@/jsonFiles/bridgeParameter";
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { modelSuggestionApi } from "@/config";

function ServiceDropdown({ params }) {
    const { bridgeType, service } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service,
    }));
    const [selectedService, setSelectedService] = useState(service);
    const [modelRecommendations, setModelRecommendations] = useState(null);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (service) {
            setSelectedService(service);
        }
    }, [service]);

    const handleServiceChange = useCallback((e) => {
        const newService = e.target.value;
        const defaultModel = DEFAULT_MODEL?.[newService];
        setSelectedService(newService);
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: params.version,
            dataToSend: { service: newService, configuration: { model: defaultModel } }
        }));
    }, [dispatch, params.id, params.version]);

    const handleGetRecommendations = async () => {
        setIsLoadingRecommendations(true);
        try {
            const response = await modelSuggestionApi({versionId: params?.version});
            if (response?.success) {
                setModelRecommendations({
                    service: response.data.best_model_from_available_service,
                    model: response.data.best_model_from_available_model
                });
            } else {
                setModelRecommendations({ error: 'Failed to get model recommendations' });
            }
        } catch (error) {
            console.error('Error fetching recommended model:', error);
            setModelRecommendations({ error: 'Error fetching recommended model' });
        } finally {
            setIsLoadingRecommendations(false);
        }
    };

    const isDisabled = bridgeType === 'batch' && service === 'openai';

    return (
        <div className="space-y-4 max-w-xs">
            <label className="form-control">
                <div className="label gap-2 max-w-xl">
                    <span className="label-text font-medium">Service</span>
                    <button 
                        className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text"
                        onClick={handleGetRecommendations}
                        disabled={isLoadingRecommendations}
                    >
                        {isLoadingRecommendations ? 'Loading...' : 'Get Recommended Model'}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedService}
                        onChange={handleServiceChange}
                        className="select select-sm select-bordered capitalize w-full max-w-xs"
                        disabled={isDisabled}
                    >
                        <option disabled>Select a Service</option>
                        {SERVICES.map((service, index) => (
                            <option key={index} value={service}>{service}</option>
                        ))}
                    </select>
                    {isDisabled && (
                        <div role="alert" className="alert p-2 flex items-center gap-2 w-auto">
                            <Info size={16} className="flex-shrink-0 mt-0.5" />
                            <span className='label-text-alt text-xs leading-tight'>
                                Batch API is only applicable for OpenAI services.
                            </span>
                        </div>
                    )}
                </div>
            </label>

            {modelRecommendations && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {modelRecommendations.error ? (
                        <p className="text-red-500 text-sm">{modelRecommendations.error}</p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-medium">Service:</span> {modelRecommendations?.service}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-medium">Recommended Model:</span> {modelRecommendations?.model}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
export default ServiceDropdown;