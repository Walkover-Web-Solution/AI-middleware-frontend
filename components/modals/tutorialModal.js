'use client';
import { MODAL_TYPE } from '@/utils/enums';
import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, ChevronDownIcon, ChevronRightIcon, BookIcon, BotIcon, KeyIcon, WrenchIcon, SettingsIcon } from '@/components/Icons';
import { closeModal } from '@/utils/utility';
import Modal from '../UI/Modal';
import { useCustomSelector } from '@/customHooks/customSelector';

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
const iconMap = {
  "bot": BotIcon,
  "key": KeyIcon,
  "wrench": WrenchIcon,
  "settings": SettingsIcon,
  "book-text": BookIcon
};
const TutorialModal = () => {
  const {tutorialData}=useCustomSelector((state)=>({
    tutorialData:state.tutorialReducer?.tutorialData
  }))
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
    closeModal(MODAL_TYPE.TUTORIAL_MODAL);
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
    <Modal MODAL_ID={MODAL_TYPE.TUTORIAL_MODAL}>
      {/* Main Modal */}
      <div className="relative z-low w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className=" px-8 py-6 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg">
                <BookIcon size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">GTWY AI Tutorials</h2>
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
            {tutorialData?.map((tutorial, index) => {
              const IconComponent = iconMap[tutorial.icon];
              const isActive = activeIndex === index;

              return (
                <div
                  key={index}
                  className={`border rounded-xl transition-all duration-200 transform hover:scale-[1.01] ${isActive
                      ? 'border-slate-300 shadow-lg bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white hover:bg-slate-50'
                    }`}
                >
                  <div
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`p-2.5 bg-slate-100 rounded-lg border border-slate-200 transition-all duration-200 ${isActive ? 'bg-slate-800 border-slate-700' : 'group-hover:bg-slate-200'
                        }`}>
                        <IconComponent size={20} className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-700'}`} />
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
                            <PlayIcon size={20} />
                            Watch
                          </button>
                        )}

                        <div className={`text-slate-400 transition-transform duration-200 cursor-pointer ${isActive ? 'rotate-180' : 'hover:translate-x-1'
                          }`} onClick={() => toggleTutorial(index)}>
                          {isActive ? (
                            <ChevronDownIcon size={20} />
                          ) : (
                            <ChevronRightIcon size={20} />
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
    </Modal>
  );
};

export default TutorialModal;