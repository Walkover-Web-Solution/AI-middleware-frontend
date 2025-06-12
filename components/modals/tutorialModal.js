'use client';
import { MODAL_TYPE, ONBOARDING_VIDEOS } from '@/utils/enums';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Key, 
  Wrench, 
  Settings, 
  Play, 
  ChevronDown, 
  ChevronRight, 
  X, 
  BookOpen,
  Sparkles,
  BookText
} from 'lucide-react';

const tutorials = [
  {
    title: 'Agent Creation',
    description: 'Learn how to create and manage agents in GTWY.ai platform',
    videoUrl: ONBOARDING_VIDEOS.bridgeCreation, 
    icon: Bot
  },
  {
    title: 'pAuth Key Setup',
    description: 'Configure authentication keys for secure access',
    videoUrl: ONBOARDING_VIDEOS.PauthKey,
    icon: Key
  },
  {
    title: 'Tool Configuration',
    description: 'Set up and configure tools for your workflow',
    videoUrl: ONBOARDING_VIDEOS.FunctionCreation,
    icon: Wrench
  },
  {
    title: 'Variable Management',
    description: 'Add and manage variables in your environment',
    videoUrl: ONBOARDING_VIDEOS.Addvariables,
    icon: Settings
  },
  {
    title: 'KnowledgeBase Configuration',
    description: 'Set up and manage your knowledge base for intelligent responses',
    videoUrl: ONBOARDING_VIDEOS.knowledgeBase,
    icon: BookText
  },
];

// Video Component using iframe
const TutorialVideo = ({ videoUrl, title }) => {
  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <iframe
        src={videoUrl}
        title={title}
        className="w-full aspect-video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const TutorialModal = ({handleCloseModal}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const videoRefs = useRef({});
  const contentAreaRef = useRef(null);
 useEffect(() => {
  return () => {
    setActiveIndex(null);
  };
}, []);
const internalClose = () => {
  setActiveIndex(null); 
  handleCloseModal();  
};
  const toggleTutorial = (index) => {
    const newActiveIndex = index === activeIndex ? null : index;
    setActiveIndex(newActiveIndex);
    
    // Scroll to video when opened
    if (newActiveIndex !== null) {
      setTimeout(() => {
        const videoElement = videoRefs.current[index];
        if (videoElement && contentAreaRef.current) {
          videoElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 150); // Small delay to allow animation to start
    }
  };

  // Set ref for video sections
  const setVideoRef = (index, element) => {
    videoRefs.current[index] = element;
  };
  
  return (
    <dialog id={MODAL_TYPE.TUTORIAL_MODAL} className="modal">
      {/* Main Modal */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className=" px-8 py-6 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">GTWY.ai Tutorials</h2>
                <p className="text-gray-600  text-sm mt-1">Learn how to use our platform effectively</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div 
          ref={contentAreaRef}
          className="p-8 max-h-[75vh] overflow-y-auto scroll-smooth"
        >
          <div className="space-y-3">
            {tutorials.map((tutorial, index) => {
              const IconComponent = tutorial.icon;
              const isActive = activeIndex === index;
              
              return (
                <div
                  key={index}
                  className={`border rounded-xl transition-all duration-200 transform hover:scale-[1.01] ${
                    isActive 
                      ? 'border-slate-300 shadow-lg bg-slate-50' 
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`p-2.5 bg-slate-100 rounded-lg border border-slate-200 transition-all duration-200 ${
                        isActive ? 'bg-slate-800 border-slate-700' : 'group-hover:bg-slate-200'
                      }`}>
                        <IconComponent className={`h-5 w-5 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-slate-700'
                        }`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-slate-900 mb-1 truncate">{tutorial.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-1">{tutorial.description}</p>
                      </div>

                      {/* Action buttons and indicator */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {!isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTutorial(index);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 text-sm font-medium hover:scale-105 shadow-sm hover:shadow-md"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Watch
                          </button>
                        )}
                        
                        <div className={`text-slate-400 transition-transform duration-200 cursor-pointer ${
                          isActive ? 'rotate-180' : 'hover:translate-x-1'
                        }`} onClick={() => toggleTutorial(index)}>
                          {isActive ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Section */}
                  {isActive && (
                    <div 
                      ref={(el) => setVideoRef(index, el)}
                      className="border-t border-slate-200 bg-slate-50 animate-in slide-in-from-top-2 duration-300"
                    >
                      <div className="p-6">
                        <TutorialVideo 
                          videoUrl={tutorial.videoUrl}
                          title={tutorial.title}
                        />
                        <div className="mt-6 flex justify-between items-center">
                          <div className="text-sm text-slate-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            You can pause, rewind, or replay the video using the video controls
                          </div>
                          <button
                            onClick={() => setActiveIndex(null)}
                            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-all duration-200 text-sm hover:scale-105"
                          >
                            Close Video
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-5">
          <div className="flex justify-between items-center">
            <button
              onClick={internalClose}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-medium text-sm hover:scale-105 shadow-sm hover:shadow-md ml-auto"
            >
              Close Tutorials
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default TutorialModal;