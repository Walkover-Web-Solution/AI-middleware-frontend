"use client";

import React from "react";
import InputSection from "../InputSection";
import { useConfigurationContext } from "../ConfigurationContext";
import AdvancedParameters from "../configurationComponent/AdvancedParamenter";
import { useCustomSelector } from "@/customHooks/customSelector";

const PromptTab = ({ isPublished,isEmbedUser }) => {
  const { params, searchParams, isEditor } = useConfigurationContext();
  const { showAdvancedParameters } = useCustomSelector(state => ({
    showAdvancedParameters: state.appInfoReducer.embedUserDetails.showAdvancedParameters ?? false,
  }));
  return (
    <div className="flex flex-col w-full">
      <InputSection />

      <div className="w-full max-w-2xl">
              <AdvancedParameters
                params={params}
                searchParams={searchParams}
                isEmbedUser={isEmbedUser}
                showAdvancedParameters={showAdvancedParameters}
                level={2}
                className="w-full"
                isPublished={isPublished}
                isEditor={isEditor}
              />
            </div>
    </div>
  );
};

export default PromptTab;
