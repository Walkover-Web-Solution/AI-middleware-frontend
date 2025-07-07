import React, { useState } from 'react';
import { closeModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import { CheckCircleIcon, CloseIcon, CopyIcon } from '../Icons';
import { useCustomSelector } from '@/customHooks/customSelector';
import { generateGtwyAccessTokenAction } from '@/store/action/orgAction';
import { useDispatch } from 'react-redux';
import Modal from '@/components/UI/Modal';

const IntegrationGuideModal = ({ selectedIntegration = {}, params }) => {
    const dispatch = useDispatch();
    const [copied, setCopied] = useState({ accessKey: false, jwtToken: false, script: false });
    const gtwyAccessToken = useCustomSelector((state) =>
            state?.userDetailsReducer?.organizations?.[params.org_id]?.meta?.gtwyAccessToken || ""
        );

    const handleCopy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied((prev) => ({ ...prev, [key]: true }));
            setTimeout(() => {
                setCopied((prev) => ({ ...prev, [key]: false }));
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleGenerateAccessKey = () => {
        dispatch(generateGtwyAccessTokenAction(params?.org_id))
    };

    const integrationItem = selectedIntegration || {};

    const jwtPayload = `{
  "org_id": "${integrationItem.org_id}",
  "folder_id": "${integrationItem.folder_id}",
  "user_id": "Your_user_id"
  }`;

    const integrationScript =
        `<script
    id="gtwy-main-script"
    embedToken="Your embed token"
    src="https://app.gtwy.ai/gtwy.js"
    slide="left/right/full /* adjust the position of the gtwy */"
    defaultOpen="true /* open by default */"
    parentId="Your_parent_id /* parent id of the element where the gtwy will be embedded */"
   ></script>`;

    const helperFunctions =
        ` window.openGtwy();
   window.closeGtwy();`;

    const CopyButton = ({ data, onCopy, copied: isCopied }) => (
        <button
            onClick={onCopy}
            className={`btn btn-sm btn-ghost absolute top-2 right-2 text-base-100 ${isCopied ? 'btn-success' : ''}`}
        >
            {isCopied ? <CheckCircleIcon size={16} /> : <CopyIcon size={16} />}
            {isCopied ? 'Copied!' : 'Copy'}
        </button>
    );


    return (
        <Modal MODAL_ID={MODAL_TYPE?.INTEGRATION_GUIDE_MODAL}>
            <div className="modal-box max-w-7xl w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Integration Setup</h3>
                        <p className="text-sm opacity-70 mt-1">
                            {integrationItem?.name
                                ? `Setup integration for: ${integrationItem.name}`
                                : 'Follow these steps to integrate with your application'}
                        </p>
                    </div>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={() => closeModal(MODAL_TYPE?.INTEGRATION_GUIDE_MODAL)}
                    >
                        <CloseIcon size={16} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Step 1: JWT Configuration */}
                    <div className="card bg-base-100 border">
                        <div className="card-body">
                            <h4 className="card-title text-base">Step 1: Connect Integration</h4>

                            <div className="space-y-4">
                                {/* JWT Payload */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">JWT Payload</span>
                                    </label>
                                    <div className="relative">
                                        <div className="mockup-code">
                                            <pre><code>{jwtPayload}</code></pre>
                                        </div>
                                        <CopyButton
                                            data={jwtPayload}
                                            onCopy={() => handleCopy(jwtPayload, 'jwtToken')}
                                            copied={copied.jwtToken}
                                        />
                                    </div>
                                </div>

                                {/* Access Token */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">JWT Access Token</span>
                                    </label>
                                    {gtwyAccessToken ? (
                                        <div className="relative">
                                            <div className="mockup-code">
                                                <pre><code>{gtwyAccessToken}</code></pre>
                                            </div>
                                            <CopyButton
                                                data={gtwyAccessToken}
                                                onCopy={() => handleCopy(gtwyAccessToken, 'accessKey')}
                                                copied={copied.accessKey}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleGenerateAccessKey}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Generate JWT Access Token
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Script Integration */}
                    <div className="card bg-base-100 border">
                        <div className="card-body">
                            <h4 className="card-title text-base">Step 2: Add Script</h4>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Add this script tag to your HTML</span>
                                </label>
                                <div className="relative">
                                    <div className="mockup-code">
                                        <pre><code>{integrationScript}</code></pre>
                                    </div>
                                    <CopyButton
                                        data={integrationScript}
                                        onCopy={() => handleCopy(integrationScript, 'script')}
                                        copied={copied.script}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Helper Functions */}
                    <div className="card bg-base-100 border">
                        <div className="card-body">
                            <h4 className="card-title text-base">Step 3: Integration Functions</h4>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Available Functions</span>
                                </label>
                                <div className="relative">
                                    <div className="mockup-code">
                                        <pre><code>{helperFunctions}</code></pre>
                                    </div>
                                    <CopyButton
                                        data={helperFunctions}
                                        onCopy={() => handleCopy(helperFunctions, 'functions')}
                                        copied={copied.functions}
                                        className="text-base-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default IntegrationGuideModal;