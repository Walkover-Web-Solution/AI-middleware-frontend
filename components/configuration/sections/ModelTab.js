"use client";

import React, { useMemo } from "react";
import ServiceDropdown from "../configurationComponent/serviceDropdown";
import ModelDropdown from "../configurationComponent/modelDropdown";
import ApiKeyInput from "../configurationComponent/apiKeyInput";
import { useConfigurationContext } from "../ConfigurationContext";
import RecommendedModal from "../configurationComponent/RecommendedModal";
import AdvancedParameters from "../configurationComponent/advancedParamenter";

const ModelTab = () => {
  const {
    params,
    searchParams,
    apiKeySectionRef,
    promptTextAreaRef,
    bridgeApiKey,
    shouldPromptShow,
    service,
    showDefaultApikeys,
    isEmbedUser,
    hideAdvancedParameters,
    isPublished
  } = useConfigurationContext();

  const shouldRenderApiKey = useMemo(
    () => ((!showDefaultApikeys && isEmbedUser) || !isEmbedUser),
    [isEmbedUser, showDefaultApikeys]
  );

  return (
    <div className="flex flex-col w-full ml-2 ">
      {/* LLM Configuration Header */}
      <div className="mb-4 mt-2">
        <h3 className="text-base-content text-md font-medium">LLM Configuration</h3>
      </div>
      
      {!isEmbedUser && <RecommendedModal 
        params={params} 
        searchParams={searchParams} 
        apiKeySectionRef={apiKeySectionRef} 
        promptTextAreaRef={promptTextAreaRef} 
        bridgeApiKey={bridgeApiKey} 
        shouldPromptShow={shouldPromptShow} 
        service={service} 
        deafultApiKeys={showDefaultApikeys}
      />}

      <div className="space-y-6">
        {/* Service Provider and Model Row */}
        <div className="grid grid-cols-2 mt-2 gap-6">
          <div className="space-y-2">
            <label className="block text-base-content/70 text-sm font-medium">
              Service Provider
            </label>
            <ServiceDropdown
              params={params}
              searchParams={searchParams}
              apiKeySectionRef={apiKeySectionRef}
              promptTextAreaRef={promptTextAreaRef}
              isEmbedUser={isEmbedUser}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-base-content/70 text-sm font-medium">
              Model
            </label>
            <ModelDropdown
              params={params}
              searchParams={searchParams}
            />
          </div>
        </div>

        {/* API Key Section */}
        {shouldRenderApiKey && (
          <div className="space-y-2">
            <label className="block text-base-content/70 text-sm font-medium">
              API Key
            </label>
            <ApiKeyInput
              apiKeySectionRef={apiKeySectionRef}
              params={params}
              searchParams={searchParams}
              isEmbedUser={isEmbedUser}
              hideAdvancedParameters={hideAdvancedParameters}
            />
            <p className="text-xs text-base-content/50 mt-2">
              Your API key is encrypted and stored securely
            </p>
          </div>
        )}
        
        {/* Parameters Section with Border */}
        <div className="border-t border-white/[0.08] pt-6">
          <div className="mb-4">
            <h2 className="text-base-content text-md font-medium">Parameters</h2>
          </div>
          <AdvancedParameters
            params={params}
            searchParams={searchParams}
            isEmbedUser={isEmbedUser}
            hideAdvancedParameters={hideAdvancedParameters}
            level={1}
            className="mt-0"
            defaultExpanded
            showAccordion={false}
            compact
          />
        </div>
      </div>
    </div>
  );
};

export default ModelTab;
