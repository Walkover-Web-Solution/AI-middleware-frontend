import React from 'react'

function LoadingSpinner({ height = '100vh', width = '100vw', marginLeft = '0px', marginTop = '0px', margin = 'auto' }) {
  return (
    <div 
        className="fixed inset-0 bg-gray-50 flex flex-col justify-center items-center z-very-high" 
        style={{ height, width, margin, marginLeft, marginTop }}
    >
        {/* Spinner Circle with darker and larger border */}
        <div className="relative w-8 h-8 mb-3">
            <div className="absolute inset-0 w-8 h-8 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-gray-900 rounded-full animate-spin" 
                //  style={{ 
                //    filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.1))',
                //    animationDuration: '1s',
                //    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                //  }}
                >
            </div>
            {/* Subtle inner glow */}
            <div className="absolute inset-1 w-8 h-8 bg-gradient-to-br from-white/20 to-transparent rounded-full pointer-events-none"></div>
        </div>
        
        {/* Loading Text with subtle animation */}
        <span className="text-black text-sm font-normal tracking-wide animate-pulse" 
              style={{ animationDuration: '2s' }}>
            Loading...
        </span>
    </div>
);
}
export default LoadingSpinner