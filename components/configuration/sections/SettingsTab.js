"use client";

import React, { useMemo } from "react";
import AdvancedParameters from "../configurationComponent/advancedParamenter";
import ChatbotConfigSection from "../ChatbotConfigSection";
import ConfigurationSettingsAccordion from "../configurationComponent/ConfigurationSettingsAccordion";
import TriggersList from "../configurationComponent/TriggersList";
import { useConfigurationContext } from "../ConfigurationContext";

const SettingsTab = () => {
  const {
    params,
    searchParams,
    isEmbedUser,
    hideAdvancedParameters,
    bridgeType,
  } = useConfigurationContext();

  const shouldShowTriggers = useMemo(
    () => bridgeType === "trigger" && !isEmbedUser,
    [bridgeType, isEmbedUser]
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {shouldShowTriggers && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 w-full max-w-2xl">
          <TriggersList params={params} />
        </div>
      )}

      

      <div className="w-full max-w-2xl">
        <ChatbotConfigSection />
      </div>

      <div className="w-full max-w-2xl">
        <ConfigurationSettingsAccordion />
      </div>
    </div>
  );
};

export default SettingsTab;
