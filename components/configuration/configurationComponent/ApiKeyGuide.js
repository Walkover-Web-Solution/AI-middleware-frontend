import { CloseIcon } from '@/components/Icons';
import { toggleSidebar } from '@/utils/utility';
import React, { useState, useMemo } from 'react';

// Configuration object for better maintainability
const API_PROVIDERS = {
  openai: {
    name: 'OpenAI / OpenAI-response',
    title: 'OpenAI API Key Setup',
    caption: 'OpenAI provides access to GPT models. Follow these detailed steps to obtain your API key.',
    url: 'https://platform.openai.com',
    keyFormat: 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    steps: [
      {
        title: 'Create Your OpenAI Account',
        content: [
          'First, you need to create an OpenAI account. Visit platform.openai.com in your web browser.',
          'Click on "Sign up" and complete the registration process using your email address. You\'ll need to verify your email before proceeding.'
        ]
      },
      {
        title: 'Navigate to API Keys Section',
        content: [
          'Once logged in, look for your profile icon in the top-right corner and click on it to open the dropdown menu.',
          'From the dropdown, select "View API keys" or navigate directly to the API keys section from your dashboard sidebar.'
        ]
      },
      {
        title: 'Generate Your New API Key',
        content: [
          'On the API Keys page, you\'ll see a green button labeled "Create new secret key". Click this button to start the key generation process.',
          'A dialog box will appear asking you to name your key. Choose a descriptive name like "My App API Key" or "Development Key" to help you identify it later.'
        ]
      },
      {
        title: 'Copy and Save Your API Key',
        content: [
          'After clicking "Create secret key", OpenAI will generate your unique API key. This key will only be shown once, so it\'s crucial to copy it immediately.',
          'The key will look similar to this format:',
          'Copy this key and save it in a secure location. You\'ll need it to authenticate your API requests.'
        ]
      }
    ]
  },
  groq: {
    name: 'Groq',
    title: 'Groq API Key Setup',
    caption: 'Groq offers lightning-fast inference speeds. Here\'s how to get your API key step by step.',
    url: 'https://console.groq.com',
    keyFormat: 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    steps: [
      {
        title: 'Access the Groq Console',
        content: [
          'Open your web browser and navigate to console.groq.com.',
          'If you don\'t have an account yet, click "Sign up" and create one using your email address. If you already have an account, simply log in.'
        ]
      },
      {
        title: 'Find the API Keys Section',
        content: [
          'Once you\'re logged into the Groq console, look for the navigation menu on the left side of the screen.',
          'Click on "API Keys" in the sidebar menu. This will take you to the API key management page where you can view and create new keys.'
        ]
      },
      {
        title: 'Create Your New API Key',
        content: [
          'On the API Keys page, you\'ll see a button labeled "Create API Key". Click this button to start creating your new key.',
          'Enter a descriptive name for your API key when prompted. This helps you identify the key\'s purpose later, especially if you create multiple keys for different projects.'
        ]
      },
      {
        title: 'Copy Your Generated Key',
        content: [
          'After creating the key, Groq will display your new API key. This is your only chance to copy it, as it won\'t be shown again for security reasons.',
          'Your Groq API key will have this format:',
          'Copy this key immediately and store it safely. You\'ll use this key to authenticate your API requests to Groq.'
        ]
      }
    ]
  },
  anthropic: {
    name: 'Anthropic',
    title: 'Anthropic API Key Setup',
    caption: 'Anthropic provides access to Claude AI models. Follow these steps to get your API key.',
    url: 'https://console.anthropic.com',
    keyFormat: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    steps: [
      {
        title: 'Visit Anthropic\'s Console',
        content: [
          'Go to console.anthropic.com in your web browser.',
          'Click "Sign up" to create a new account or "Log in" if you already have one. You\'ll need to provide your email address and create a secure password.'
        ]
      },
      {
        title: 'Navigate to API Keys',
        content: [
          'After logging in, you\'ll see the Anthropic console dashboard. Look for the navigation menu on the left side of the screen.',
          'Click on "API Keys" in the left sidebar. This will open the API key management page where you can create and manage your keys.'
        ]
      },
      {
        title: 'Create a New API Key',
        content: [
          'On the API Keys page, you\'ll see a button labeled "Create Key" or "New Key". Click this button to begin the key creation process.',
          'You\'ll be prompted to enter a descriptive name for your key. Choose something meaningful like "My Application Key" or "Development Testing" to help you remember its purpose.'
        ]
      },
      {
        title: 'Copy Your Anthropic API Key',
        content: [
          'Once you click "Create", Anthropic will generate your unique API key. This key will only be displayed once, so make sure to copy it immediately.',
          'Your Anthropic API key will look like this:',
          'Copy this entire key and save it securely. You\'ll need it to make API calls to Claude and other Anthropic models.'
        ]
      }
    ]
  },
  openrouter: {
    name: 'OpenRouter',
    title: 'OpenRouter API Key Setup',
    caption: 'OpenRouter gives you access to multiple AI models through a single API. Here\'s how to get started.',
    url: 'https://openrouter.ai',
    keyFormat: 'sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    steps: [
      {
        title: 'Sign Up for OpenRouter',
        content: [
          'Visit openrouter.ai in your web browser.',
          'Click on "Sign up" to create a new account. You can sign up using your email address or connect with your Google/GitHub account for faster registration.'
        ]
      },
      {
        title: 'Access Your Dashboard',
        content: [
          'After successful registration and email verification, log into your OpenRouter account to access your dashboard.',
          'Once logged in, look for the "Keys" or "API Keys" section in your account dashboard navigation menu.'
        ]
      },
      {
        title: 'Generate Your API Key',
        content: [
          'In the Keys section, you\'ll find a "Create Key" or "Generate New Key" button. Click this to start creating your API key.',
          'OpenRouter may allow you to set optional usage limits and permissions for your key. Configure these settings according to your needs, or leave them as default for general use.'
        ]
      },
      {
        title: 'Save Your OpenRouter Key',
        content: [
          'After generating your key, OpenRouter will display it once. Copy this key immediately as you won\'t be able to view it again.',
          'Your OpenRouter API key will have this format:',
          'Store this key safely. You\'ll use it to access various AI models through OpenRouter\'s unified API interface.'
        ]
      }
    ]
  },
  mistral: {
    name: 'Mistral',
    title: 'Mistral AI API Key Setup',
    caption: 'Mistral AI offers powerful open-source language models. Follow these steps to get your API key.',
    url: 'https://console.mistral.ai',
    keyFormat: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    steps: [
      {
        title: 'Visit Mistral Console',
        content: [
          'Navigate to console.mistral.ai in your web browser.',
          'If you\'re new to Mistral, click "Sign up" to create an account. You\'ll need to provide your email address and create a secure password. If you already have an account, simply log in.'
        ]
      },
      {
        title: 'Access API Keys Section',
        content: [
          'Once you\'re logged into the Mistral console, look for the main navigation menu or dashboard options.',
          'Find and click on "API Keys" in your account dashboard. This will take you to the key management page where you can view existing keys and create new ones.'
        ]
      },
      {
        title: 'Create New API Key',
        content: [
          'On the API Keys page, look for a button labeled "Create new key" or "Generate API Key". Click this button to start the key generation process.',
          'You\'ll be prompted to provide a name for your API key. Choose a descriptive name that will help you identify this key later, such as "Production App" or "Development Testing".'
        ]
      },
      {
        title: 'Copy Your Mistral Key',
        content: [
          'After clicking create, Mistral will generate your unique API key. This key will only be shown once, so it\'s important to copy it immediately.',
          'Your Mistral API key will look like this:',
          'Copy this key and store it in a secure location. You\'ll need this key to authenticate your requests to Mistral AI\'s API.'
        ]
      }
    ]
  }
};

// Reusable components
const Section = ({ title, caption, children }) => (
  <div className="flex items-start flex-col justify-center mb-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600 block mb-4">{caption}</p>
    {children}
  </div>
);

const StepCard = ({ stepNumber, title, children }) => (
  <div className="bg-base-200 p-5 rounded-lg mb-4 border-l-4 border-primary">
    <h4 className="font-semibold text-base text-primary mb-3 flex items-center">
      <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
        {stepNumber}
      </span>
      {title}
    </h4>
    {children}
  </div>
);

const CodeBlock = ({ children }) => (
  <div className="bg-gray-900 rounded-lg p-4 mt-3 mb-3 font-mono text-sm overflow-x-auto">
    <div className="flex items-center">
      <span className="text-green-400 mr-2">$</span>
      <code className="text-yellow-300">{children}</code>
    </div>
  </div>
);

const Link = ({ href, children }) => (
  <a 
    href={href} 
    className="text-blue-600 hover:underline font-medium" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

function ApiKeyGuideSlider() {
  const [selectedModel, setSelectedModel] = useState('openai');
  
  // Memoize the model tabs to prevent unnecessary re-renders
  const modelTabs = useMemo(() => 
    Object.entries(API_PROVIDERS).map(([id, provider]) => ({
      id,
      name: provider.name,
      color: 'bg-primary'
    })), []
  );

  // Memoize the guide content to prevent unnecessary re-renders
  const guideContent = useMemo(() => {
    const provider = API_PROVIDERS[selectedModel];
    if (!provider) return null;

    return (
      <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
        <Section title={provider.title} caption={provider.caption}>
          {provider.steps.map((step, index) => (
            <StepCard key={index} stepNumber={index + 1} title={step.title}>
              {step.content.map((paragraph, pIndex) => {
                // Handle code format display
                if (paragraph === 'Your Groq API key will have this format:' || 
                    paragraph === 'The key will look similar to this format:' ||
                    paragraph === 'Your Anthropic API key will look like this:' ||
                    paragraph === 'Your OpenRouter API key will have this format:' ||
                    paragraph === 'Your Mistral API key will look like this:' ||
                    paragraph === 'Your OpenResponse API key will have this format:') {
                  return (
                    <div key={pIndex}>
                      <p className="text-sm text-gray-700 mb-3">{paragraph}</p>
                      <CodeBlock>{provider.keyFormat}</CodeBlock>
                    </div>
                  );
                }

                // Handle URL mentions
                if (paragraph.includes(provider.url.replace('https://', ''))) {
                  const urlText = provider.url.replace('https://', '');
                  const parts = paragraph.split(urlText);
                  return (
                    <p key={pIndex} className="text-sm text-gray-700 mb-3">
                      {parts[0]}
                      <Link href={provider.url}>{urlText}</Link>
                      {parts[1]}
                    </p>
                  );
                }

                // Regular paragraph
                return (
                  <p key={pIndex} className="text-sm text-gray-700 mb-2">
                    {paragraph}
                  </p>
                );
              })}
            </StepCard>
          ))}
        </Section>
      </div>
    );
  }, [selectedModel]);

  return (
    <aside
      id="Api-Keys-guide-slider"
      className="fixed inset-y-0 right-0 border-l-2 bg-base-100 shadow-2xl rounded-md w-full md:w-1/2 lg:w-1/2 
               overflow-y-auto bg-gradient-to-br from-base-200 to-base-100 transition-all duration-300 ease-in-out z-medium
               translate-x-full"
      aria-label="Api Keys guide slider"
    >
      <div>
        <button
          onClick={() => toggleSidebar("Api-Keys-guide-slider", "right")}
          className="absolute top-4 right-4 p-2 rounded-full hover:text-error transition-colors z-10"
          aria-label="Close guide"
        >
          <CloseIcon />
        </button>

        {/* Header */}
        <div className="sticky top-0 bg-base-100 p-6 border-b border-base-300">
          <h2 className="text-xl font-bold mb-4">API Key Setup Guide</h2>
          
          {/* Model Selection Tabs */}
          <div className="flex flex-wrap gap-2">
            {modelTabs.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedModel === model.id
                    ? `${model.color} text-white shadow-lg`
                    : 'bg-base-200 text-base-content hover:bg-base-300'
                }`}
                aria-pressed={selectedModel === model.id}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {guideContent}
        </div>
      </div>
    </aside>
  );
}

export default ApiKeyGuideSlider;