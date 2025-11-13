import React, { memo } from 'react';
import { ChevronDownIcon, InfoIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';
import { CircleQuestionMark } from 'lucide-react';

// Optimized default variables section
const DefaultVariablesSection = memo(() => {
    return (
        <div className="bg-gradient-to-r bg-base-1 border-t-0 border border-base-content/10 rounded-t-none p-2 ">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <span className="text-nowrap text-xs font-medium">Default Variables</span>
                    <InfoTooltip tooltipContent="Use these variables in prompt to get their functionality: {{current_time_and_date}} - To access the current date and time, {{pre_function}} - Use this variable if you are using the pre_function, {{timezone}} - Access the timezone using a timezone identifier. Use custom variables like {{your_custom_variable}}, created from the Add Variable section, to insert dynamic values.">
                        <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
                    </InfoTooltip>
                </div>
                <p role="alert" className="label-text-alt p-2 bg-base-300 inline-block w-fit">
                    &#123;&#123;current_time_and_date&#125;&#125;,
                    &#123;&#123;pre_function&#125;&#125;,
                    &#123;&#123;timezone&#125;&#125;
                </p>
            </div>
        </div>
    );
});

DefaultVariablesSection.displayName = 'DefaultVariablesSection';

export default DefaultVariablesSection;
