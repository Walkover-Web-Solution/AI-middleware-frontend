"use client";

import React from "react";
import InputSection from "../InputSection";
import ResponseFormatSelector from "../configurationComponent/responseFormatSelector";
import { useConfigurationContext } from "../ConfigurationContext";
import AdvancedParameters from "../configurationComponent/advancedParamenter";
import { useCustomSelector } from "@/customHooks/customSelector";

const PromptTab = ({ isPublished }) => {
  const { params, searchParams, bridgeType, modelType } = useConfigurationContext();
  const { isEmbedUser, hideAdvancedParameters } = useCustomSelector(state => ({
    isEmbedUser: state.appInfoReducer.embedUserDetails.isEmbedUser,
    hideAdvancedParameters: state.appInfoReducer.embedUserDetails.hideAdvancedParameters,
  }));

  return (
    <div className="flex flex-col gap-4 w-full">
      <InputSection />

      <div className="w-full max-w-2xl">
              <AdvancedParameters
                params={params}
                searchParams={searchParams}
                isEmbedUser={isEmbedUser}
                hideAdvancedParameters={hideAdvancedParameters}
                level={2}
                className="w-full"
                isPublished={isPublished}
              />
            </div>
    </div>
  );
};

export default PromptTab;
