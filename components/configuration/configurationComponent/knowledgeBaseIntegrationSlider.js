import CopyButton from '@/components/copyButton/copyButton';
import { useCloseSliderOnEsc } from '@/components/historyPageComponents/assistFile';
import { useCustomSelector } from '@/customHooks/customSelector';
import { generateAccessKeyAction } from '@/store/action/orgAction';
import {CloseIcon } from '@/components/Icons';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '@/utils/utility';

function KnowledgeBaseIntegrationSlider({ params, openKnowledgeBaseSlider, setOpenKnowledgeBaseSlider }) {
    const dispatch = useDispatch();
    const access_key = useCustomSelector((state) =>
        state?.userDetailsReducer?.organizations?.[params.org_id]?.meta?.auth_token || ""
    );

    const [copied, setCopied] = useState({
        accessKey: false,
    });
    useCloseSliderOnEsc(setOpenKnowledgeBaseSlider);

    const handleCopy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(prev => ({ ...prev, [key]: true }));
            setTimeout(() => {
                setCopied(prev => ({ ...prev, [key]: false }));
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleGenerateAccessKey = () => {
        dispatch(generateAccessKeyAction(params?.org_id))
    }

    const Section = ({ title, caption, children }) => (
        <div className="flex items-start flex-col justify-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 block">{caption}</p>
            {children}
        </div>
    );

    const renderStepOne = ({ orgId, access_key }) => {
        const apiConfig = `{
    "org_id": ${orgId},
    "user_id": "unique_user_id"
}`;

        return (
            <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
                <Section title="Step 1: Connect Knowledge Base" caption="Use the following API configuration and access key." />
                <div className="mockup-code">
                    <CopyButton data={apiConfig} />
                        <pre data-prefix=">" className="text-error"><code>org_id=</code><code className="text-warning">{orgId}</code></pre>
                        <pre data-prefix=">" className="text-error"><code>user_id=</code><code className="text-warning">"unique_user_id"</code></pre>
                </div>
                {access_key ? (
                    <div className="mockup-code">
                        <CopyButton data={access_key} />
                        <pre data-prefix=">" className="text-error">
                            <code>Access Key: </code>
                            <code className="text-warning">{access_key}</code>
                        </pre>
                    </div>
                ) : (
                    <button className='btn mt-4 text-base-content' onClick={handleGenerateAccessKey}>Generate Access key</button>
                )}
            </div>
        );
    }

    const renderStepTwo = () => {
        const DataObject = {
            script: `<script\n      id="rag-main-script"\n      embedToken=" <embed token here> "\n      src=${process?.env?.NEXT_PUBLIC_KNOWLEDGEBASE_SCRIPT_SRC}\n     ></script>`,
        };

        return (
            <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
                <Section title="Step 2" caption="Add below code in your product." />
                <div className="mockup-code">
                    <CopyButton data={DataObject.script} />
                    <pre data-prefix=">" className="text-error" ><code>&lt;script </code></pre>
                    <pre data-prefix=">" className="text-error"><code className="text-error"> id= </code><code className="text-warning">"rag-main-script"</code></pre>
                    <pre data-prefix=">" className="text-error"><code> embedToken=</code><code className="text-warning">"Enter Embed Token here"</code></pre>
                    <pre data-prefix=">" className="text-error"><code> src=</code><code className="text-warning">"{process?.env?.NEXT_PUBLIC_KNOWLEDGEBASE_SCRIPT_SRC}"</code></pre>
                    <pre data-prefix=">" className="text-error"><code> parentId=</code><code className="text-warning">"Id of parent Container"</code></pre>
                    <pre data-prefix=">" className="text-error"><code> theme=</code><code className="text-warning">"dark/light"</code></pre>
                    <pre data-prefix=">" className="text-error"><code> defaultOpen=</code><code className="text-warning">"true/false" /* true for open list by default */</code></pre>
                    <pre data-prefix=">" className="text-error"><code>&lt;/script&gt;</code></pre>
                </div>
                
            </div>
        );
    }
    const renderStepThree = () => {
        return (
            <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
                <Section title="Step 3" caption="Use this function to show list or add Document modal" />
                <div className="mockup-code">
                    <pre data-prefix=">" className="text-error" ><code className="text-warning">window.openRag() /* to open add document modal */</code></pre>
                    <pre data-prefix=">" className="text-error" ><code className="text-warning">window.closeRag() /* to close add document modal */</code></pre>
                    <pre data-prefix=">" className="text-error"><code className="text-warning">window.showDocuments() /* to show document list */</code></pre>
                </div>
            </div>
        );
    }

    return (
         <aside
            id="knowledgeBase-integration-slider"
            className="fixed inset-y-0 right-0 border-l-2 bg-base-100 shadow-2xl rounded-md w-full md:w-1/2 lg:w-1/2 
                     overflow-y-auto bg-gradient-to-br from-base-200 to-base-100 transition-all duration-300 ease-in-out z-medium
                     translate-x-full"
            aria-label="Api Keys guide slider"
        >
        <div
           
        >
            <button
                onClick={() => toggleSidebar("knowledgeBase-integration-slider","right")}
                className="absolute top-4 right-4 p-2 rounded-full hover:text-error transition-colors z-10"
            >
                <CloseIcon/>
            </button>

            {/* Step 1 */}
            {renderStepOne({ orgId: params?.org_id, access_key })}

            {/* Step 2 */}
            {renderStepTwo()}

            {/* Step 3 */}
            {renderStepThree()}
        </div>
        </aside>
    );
}

export default KnowledgeBaseIntegrationSlider;
