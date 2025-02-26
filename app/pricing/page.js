'use client'
import Header from '@/components/Header';
import Footer from "@/components/Footer";
import { PRICINGPLANS } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';

export default function PricingPage() {

  const handleClick = (planName) => {
    if(planName === 'Enterprise') {
      openModal(MODAL_TYPE.DEMO_MODAL);
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="bg-black flex flex-col w-full min-h-screen text-white relative pt-40">
      <div className="hero-bg absolute w-full top-[-10px] h-screen z-10"></div>
      <div className="z-20">
        <Header/>

        {/* Pricing Section */}
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-gray-400">Choose the plan that works best for you</p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch justify-between w-3/4 mx-auto gap-8">
            {PRICINGPLANS?.map((plan) => (
              <div key={plan.name} className="flex-1 w-full rounded-md p-10 flex flex-col justify-between border-opacity-40 border-gray-400 border-[0.1px] relative overflow-hidden group hover:bg-zoom bg-black/20 backdrop-blur-sm">
                <div>
                  <h2 className="text-4xl font-bold">{plan.name}</h2>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                </div>

                <div className="my-8">
                  <span className="text-5xl font-bold">{plan.price === 'Custom' ? plan.price : `$${plan.price}`}</span>
                  {plan.price !== 'Custom Pricing' && <span className="text-xl text-gray-400 ml-2">/month</span>}
                </div>

                <div className="h-[1px] bg-gray-600 w-full mb-8"></div>

                <div className="flex-grow">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300 mb-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      {feature}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleClick(plan.name)}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mt-8"
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
