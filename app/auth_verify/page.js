"use client"
import { useCustomSelector } from '@/customHooks/customSelector';
import { filterOrganizations } from '@/utils/utility';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Protected from '@/components/protected';
import LoadingSpinner from '@/components/loadingSpinner';
import { Search, Building2, Shield, CheckCircle, AlertCircle, Key, Link, FileText } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { verifyAuth } from '@/config';

function Page({ params }) {
    const [formState, setFormState] = useState({
        searchQuery: '',
        selectedOrg: null,
        isLoading: false,
        clientId: '',
        redirectionUrl: '',
        state: ''
    });
    const [isInitialLoading, setIsInitialLoading] = useState(false);

    const searchParams = useSearchParams();

    useEffect(() => {
        const clientId = searchParams.get('client_id');
        const redirectionUrl = searchParams.get('redirection_url');
        const state = searchParams.get('state');

        if (clientId || redirectionUrl || state) {
            updateFormState({
                clientId: clientId || '',
                redirectionUrl: redirectionUrl || '',
                state: state || ''
            });
        }
    }, [searchParams]);
    
    const { organizations } = useCustomSelector(state => ({
        organizations: state.userDetailsReducer.organizations
    }));

    const updateFormState = useCallback((updates) => {
        setFormState(prev => ({ ...prev, ...updates }));
    }, []); 

    const handleChange = useCallback((field) => (e) => {
        updateFormState({ [field]: e.target.value });
    }, [updateFormState]);

    const handleSelectOrg = useCallback((orgId, orgName) => {
        updateFormState({ selectedOrg: { id: orgId, name: orgName } });
    }, [updateFormState]);

    const handleVerify = useCallback(async() => {
        if (!formState.selectedOrg) return;
        
        updateFormState({ isLoading: true });
        const data = {
            client_id : formState?.clientId,
            redirection_url: formState?.redirectionUrl,
            state: formState?.state
        }
        const res = await verifyAuth(data)
        console.log(res)
        updateFormState({ isLoading: false });
    }, [formState.selectedOrg, updateFormState]);

    const filteredOrganizations = useMemo(() =>
        filterOrganizations(organizations, formState.searchQuery),
        [organizations, formState.searchQuery]);

    const renderedOrganizations = useMemo(() => (
        filteredOrganizations.slice().reverse().map((org, index) => (
            <div
                key={org.id || index}
                onClick={() => handleSelectOrg(org.id, org.name)}
                className={`card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                    formState.selectedOrg?.id === org.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent hover:border-base-300'
                }`}
            >
                <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            formState.selectedOrg?.id === org.id 
                                ? 'bg-primary text-primary-content' 
                                : 'bg-base-200'
                        }`}>
                            <Building2 size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-base-content">{org.name}</h3>
                            <p className="text-sm text-base-content/70">ID: {org.id}</p>
                        </div>
                        {formState.selectedOrg?.id === org.id && (
                            <CheckCircle className="text-primary" size={20} />
                        )}
                    </div>
                </div>
            </div>
        ))
    ), [filteredOrganizations, formState.selectedOrg, handleSelectOrg]);

    if (formState.isLoading || isInitialLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex min-h-screen bg-base-200 p-6 gap-6">
            {/* Organizations List */}
            <div className="w-96 bg-base-100 rounded-xl shadow-sm p-6 h-[calc(100vh-3rem)]">
                <div className="flex items-center gap-2 mb-6">
                    <Building2 className="text-primary" size={24} />
                    <h2 className="text-xl font-bold text-base-content">Organizations</h2>
                </div>
                
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search organizations..."
                            value={formState.searchQuery}
                            onChange={handleChange('searchQuery')}
                            className="input input-bordered w-full pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={20} />
                    </div>
                </div>
                
                <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    {renderedOrganizations.length > 0 ? (
                        renderedOrganizations
                    ) : (
                        <div className="text-center py-8 text-base-content/70">
                            <Building2 size={48} className="mx-auto mb-2 opacity-50" />
                            <p>No organizations found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Authentication Verification Section */}
            <div className="flex-1 bg-base-100 rounded-xl shadow-sm p-6 h-[calc(100vh-3rem)]">
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="text-secondary" size={24} />
                    <h2 className="text-xl font-bold text-base-content">Authentication Verification</h2>
                </div>

                {formState.selectedOrg ? (
                    <div className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                        {/* Selected Organization Info */}
                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-primary rounded-lg">
                                        <Building2 className="text-primary-content" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-base-content">
                                            {formState.selectedOrg.name}
                                        </h3>
                                        <p className="text-sm text-base-content/70">
                                            Organization ID: {formState.selectedOrg.id}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="divider"></div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-success" size={16} />
                                        <span className="text-sm">Organization selected for authentication</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className={`${formState.clientId && formState.redirectionUrl ? 'text-success' : 'text-warning'}`} size={16} />
                                        <span className="text-sm">
                                            {formState.clientId && formState.redirectionUrl 
                                                ? 'Authentication configuration completed' 
                                                : 'Please fill in required authentication fields'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="text-info" size={16} />
                                        <span className="text-sm">Security protocols will be validated</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Verify Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleVerify}
                                disabled={formState.isLoading || !formState.selectedOrg || !formState.clientId || !formState.redirectionUrl}
                                className={`btn gap-2 ${
                                    formState.selectedOrg && formState.clientId && formState.redirectionUrl 
                                        ? 'btn-primary' 
                                        : 'btn-disabled'
                                }`}
                            >
                                {formState.isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Shield size={16} />
                                        Verify Auth
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-base-content/70">
                        <Building2 size={64} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
                        <p className="text-center">Please select an organization from the list to proceed with authentication verification.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Protected(Page);