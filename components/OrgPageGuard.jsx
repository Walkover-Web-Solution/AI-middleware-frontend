'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getFromCookies, setInCookies } from '@/utils/utility';
import { X } from 'lucide-react';

const OrgPageGuard = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show onboarding on the exact /org page, not sub-routes
    const isExactOrgPage = pathname === '/org';
    
    if (isExactOrgPage) {
      // Check URL parameters for form_submitted
      const urlParams = new URLSearchParams(window.location.search);
      const formSubmitted = urlParams.has('form_submitted');
      
      if (formSubmitted) {
        // If form_submitted parameter exists, set cookie and don't show modal
        setInCookies('onboarding_dismissed', 'true');
        return;
      }
      
      // Check if onboarding was dismissed
      const onboardingDismissed = getFromCookies('onboarding_dismissed');
      
      if (!onboardingDismissed) {
        // Show onboarding modal only on /org page
        setShowOnboarding(true);
      }
    }
  }, [pathname]);

  const handleClose = () => {
    // Set cookie to not show again
    setInCookies('onboarding_dismissed', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      {/* Always render the page content */}
      {children}
      
      {/* Simple onboarding modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-base-100 bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-5xl max-h-[99vh] bg-base-200 rounded-lg shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-base-100 rounded-full shadow-lg hover:bg-base-200 transition-all duration-200 hover:scale-105"
              aria-label="Close onboarding"
            >
              <X size={20} className="text-base-content" />
            </button>

            {/* Onboarding Content */}
            <div className="w-full h-full">
              <iframe
                data-tally-src="https://tally.so/r/pbxOAP?transparentBackground=1"
                width="100%"
                height="100%"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                title="Welcome to GTWY 👋"
                className="border-0 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Load Tally Script */}
      {showOnboarding && (
        <script async src="https://tally.so/widgets/embed.js"></script>
      )}
    </>
  );
};

export default OrgPageGuard;
