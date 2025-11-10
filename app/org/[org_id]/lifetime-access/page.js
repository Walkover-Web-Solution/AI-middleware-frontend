'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layoutComponents/MainLayout';

const LifetimeAccessPage = () => {
  const params = useParams();

  useEffect(() => {
    // Load Tally embed script
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <MainLayout withPadding={false}>
      <div className="min-h-screen bg-base-100">
        {/* Tally Form Container */}
        <div className="flex-1 relative">
          <iframe
            data-tally-src="https://tally.so/r/eqZp1q?transparentBackground=1&formEventsForwarding=1"
            width="100%"
            height="88vh"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            title="GTWY- Lifetime Free Access"
            className="w-full min-h-[88vh]"
          />
        </div>

        {/* Footer */}
        <div className="bg-base-200 py-6 mt-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-base-content/70">
              © 2024 GTWY.AI - Empowering businesses with AI solutions
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LifetimeAccessPage;
