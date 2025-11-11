import React, { useMemo, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SettingsIcon } from '@/components/Icons';
import { useConfigurationContext } from '../ConfigurationContext';
import BridgeTypeToggle from './bridgeTypeToggle';
import ToneDropdown from './toneDropdown';
import ResponseStyleDropdown from './responseStyleDropdown';
import AdvancedConfiguration from './advancedConfiguration';

const ConfigurationSettingsAccordion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    params,
    searchParams,
    isEmbedUser,
    showConfigType,
    hideAdvancedConfigurations,
    bridgeType,
    modelType
  } = useConfigurationContext();

  const shouldShowAgentType = useMemo(
    () => ((isEmbedUser && showConfigType) || !isEmbedUser),
    [isEmbedUser, showConfigType]
  );
  return (
    <div className="z-very-low text-base-content w-full max-w-md cursor-pointer" tabIndex={0}>
      <div
        className={`info px-2 py-1.5 ${isOpen ? 'border border-base-content/20 rounded-x-lg rounded-t-lg' : 'border border-base-content/20 rounded-lg'} flex items-center justify-between font-medium w-full !cursor-pointer`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <SettingsIcon size={14} className="shrink-0" />
          <span className="label-text text-sm">Settings</span>
        </div>
        <span className="cursor-pointer">
          {isOpen ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
        </span>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'px-2 py-2 border-x border-b border-base-content/20 rounded-x-lg rounded-b-lg opacity-100' : 'max-h-0 opacity-0 overflow-hidden border border-base-content/20 rounded-lg p-0'}`}
      >
        <div className="flex flex-col gap-2">
          {shouldShowAgentType && (
            <div className="bg-base-100 border border-base-content/20 rounded-lg p-2">
              <BridgeTypeToggle params={params} searchParams={searchParams} isEmbedUser={isEmbedUser} />
            </div>
          )}

          {/* Only show tone, response style, and advanced config if modelType is NOT image */}
          {modelType !== 'image' && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <ToneDropdown params={params} searchParams={searchParams} />
                <ResponseStyleDropdown params={params} searchParams={searchParams} />
              </div>

              {((isEmbedUser && !hideAdvancedConfigurations) || !isEmbedUser) && (
                <AdvancedConfiguration
                  params={params}
                  searchParams={searchParams}
                  bridgeType={bridgeType}
                  modelType={modelType}
                  forceExpanded
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConfigurationSettingsAccordion);
