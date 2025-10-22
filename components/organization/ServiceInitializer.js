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
    const SERVICES = useCustomSelector(state => state.serviceReducer.services);
    const MODELS = useCustomSelector(state => state.modelReducer.serviceModels);
    const isOrgPage = pathname === '/org' || pathname.startsWith('/org') || pathname === '/org/';
    const hasCalledAPIs = useRef(false);

    // Always run on org page - initial data fetch
    useEffect(() => {
        if (isOrgPage) {
            dispatch(userDetails());
            dispatch(getServiceAction());
        }
    }, [dispatch, isOrgPage]);

    useEffect(() => {
        if (!isOrgPage && !hasCalledAPIs.current) {
            const hasServices = Array.isArray(SERVICES) && SERVICES.length > 0;
            const hasModels = MODELS && Object.keys(MODELS).length > 0;
            if (!hasServices || !hasModels) {
                hasCalledAPIs.current = true;
                dispatch(userDetails());
                dispatch(getServiceAction());
            }
        }
    }, [dispatch, isOrgPage, SERVICES, MODELS]);

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
    }, [SERVICES]);
    // This component doesn't render anything
    return null;
};

export default ServiceInitializer;
