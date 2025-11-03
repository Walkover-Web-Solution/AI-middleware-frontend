import { Pointer } from 'lucide-react';
import React from 'react';

/**
 * HoverClickIndicator - A component that shows hand pointer click indicator on hover
 * Used as endComponent in CustomTable to indicate clickable rows
 */
const HoverClickIndicator = () => {
  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
      <div className="relative">
        {/* Cursor pointer icon with click animation */}
       <Pointer className="w-4 h-4 text-primary animate-pulse" />
        
        {/* Click indicator circle */}
        
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
      </div>
    </div>
  );
};

export default HoverClickIndicator;
