import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import React from 'react';
import { CircleX, CalendarDays } from 'lucide-react';

const DemoModal = () => {
    const handleClose = () => {
        closeModal(MODAL_TYPE.DEMO_MODAL);
    };

    return (
        <dialog id={MODAL_TYPE.DEMO_MODAL} className="modal backdrop-blur-lg">
            <div className="modal-box flex flex-col gap-6 max-w-[95vw] w-[1300px] bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 border border-slate-700/50 shadow-2xl">
                <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                    <h3 className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
                        Discover GTWY AI
                    </h3>
                    <button 
                        onClick={handleClose}
                        className="btn btn-ghost p-2 rounded-full hover:bg-slate-700/50 transition-colors group"
                    >
                        <CircleX size={26} className="text-slate-400 group-hover:text-purple-300 transition-colors" />
                    </button>
                </div>

                <div className="relative group rounded-xl overflow-hidden border-2 border-slate-700/50 shadow-xl hover:border-purple-300/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none" />
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                        <iframe
                            src="https://video-faq.viasocket.com/embed/cm60d6r5a031w121t2akjkw9y?embed_v=2"
                            loading="lazy"
                            title="AI-middleware"
                            className="w-full h-full transition-transform duration-300"
                            frameBorder="0"
                            mozallowfullscreen="true"
                            allowFullScreen
                        />
                    </div>
                </div>

                <div className="modal-action mt-4">
                    <a
                        href=""
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary px-8 py-3 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 border-none hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <CalendarDays className="w-5 h-5" />
                        <span>Schedule Personalized Demo</span>
                    </a>
                </div>
            </div>
        </dialog>
    );
};

export default DemoModal;
