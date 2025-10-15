import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
import { getServiceAction } from '@/store/action/serviceAction';
import { getModelAction } from '@/store/action/modelAction';
import { userDetails } from '@/store/action/userDetailsAction';
import { useCustomSelector } from '@/customHooks/customSelector';

const ServiceInitializer = () => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const retryTimeoutRef = useRef(null);
    const retryCountRef = useRef(0);
    const maxRetries = 10; // Maximum number of retry attempts
    
    const SERVICES = useCustomSelector(state => state.serviceReducer.services);
    const MODELS = useCustomSelector(state => state.modelReducer.models);
    const isOrgPage = pathname === '/org' || pathname.startsWith('/org/page') || pathname === '/org/';

    // Always run on org page - initial data fetch
    useEffect(() => {
        if (isOrgPage) {
            dispatch(userDetails());
            dispatch(getServiceAction());
        }
    }, [dispatch, isOrgPage]);

    // Fetch models for each service and retry if models are missing
    useEffect(() => {
        if (Array.isArray(SERVICES) && SERVICES.length > 0) {
            SERVICES.forEach((service) => {
                const serviceValue = service?.value;
                if (serviceValue) {
                    const serviceModels = MODELS?.[serviceValue];
                    
                    if (!serviceModels || !Array.isArray(serviceModels) || serviceModels.length === 0) {
                        dispatch(getModelAction({ service: serviceValue }));
                    }
                }
            });
        }
    }, [SERVICES, MODELS, dispatch]);

    // Retry mechanism - check every 5 seconds if models are still missing
    useEffect(() => {
        if (isOrgPage && Array.isArray(SERVICES) && SERVICES.length > 0) {
            const checkAndRetryModels = () => {
                if (retryCountRef.current >= maxRetries) {
                    return;
                }

                let hasMissingModels = false;
                
                SERVICES.forEach((service) => {
                    const serviceValue = service?.value;
                    if (serviceValue) {
                        const serviceModels = MODELS?.[serviceValue];
                        
                        if (!serviceModels || !Array.isArray(serviceModels) || serviceModels.length === 0) {
                            hasMissingModels = true;
                            dispatch(getModelAction({ service: serviceValue }));
                        }
                    }
                });
                if (hasMissingModels && retryCountRef.current < maxRetries) {
                    retryCountRef.current += 1;
                    retryTimeoutRef.current = setTimeout(checkAndRetryModels, 5000);
                } else if (!hasMissingModels) {
                    retryCountRef.current = 0;
                }
            };

            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }

            // Start retry mechanism after initial delay
            retryTimeoutRef.current = setTimeout(checkAndRetryModels, 3000);
        }

        // Cleanup timeout on unmount or dependency change
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [SERVICES, MODELS, dispatch, isOrgPage]);

    // This component doesn't render anything
    return null;
};

export default ServiceInitializer;
