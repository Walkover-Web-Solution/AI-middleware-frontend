import { CloseIcon } from '@/components/Icons';
import { toggleSidebar } from '@/utils/utility';
import React, { useState } from 'react';

function ApiKeyGuideSlider() {
    const [selectedModel, setSelectedModel] = useState('openai');
    const models = [
        { id: 'openai', name: 'OpenAI', color: 'bg-primary' },
        { id: 'groq', name: 'Groq', color: 'bg-primary' },
        { id: 'anthropic', name: 'Anthropic', color: 'bg-primary' },
        { id: 'openrouter', name: 'OpenRouter', color: 'bg-primary' },
        { id: 'mistral', name: 'Mistral', color: 'bg-primary' },
        { id: 'openresponse', name: 'OpenResponse', color: 'bg-primary' }
    ];

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

    // Enhanced CodeBlock component to fix the positioning issue
    const CodeBlock = ({ children }) => (
        <div className="bg-gray-900 rounded-lg p-4 mt-3 mb-3 font-mono text-sm overflow-x-auto">
            <div className="flex items-center">
                <span className="text-green-400 mr-2">$</span>
                <code className="text-yellow-300">{children}</code>
            </div>
        </div>
    );

    const renderOpenAIGuide = () => (
        <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
            <Section 
                title="OpenAI API Key Setup" 
                caption="OpenAI provides access to GPT models. Follow these detailed steps to obtain your API key."
            >
                <StepCard stepNumber="1" title="Create Your OpenAI Account">
                    <p className="text-sm text-gray-700 mb-3">
                        First, you need to create an OpenAI account. Visit <a href="https://platform.openai.com" className="text-blue-600 hover:underline font-medium" target="_blank">platform.openai.com</a> in your web browser.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Click on "Sign up" and complete the registration process using your email address. You'll need to verify your email before proceeding.
                    </p>
                </StepCard>

                <StepCard stepNumber="2" title="Navigate to API Keys Section">
                    <p className="text-sm text-gray-700 mb-3">
                        Once logged in, look for your profile icon in the top-right corner and click on it to open the dropdown menu.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        From the dropdown, select "View API keys" or navigate directly to the API keys section from your dashboard sidebar.
                    </p>
                </StepCard>

                <StepCard stepNumber="3" title="Generate Your New API Key">
                    <p className="text-sm text-gray-700 mb-3">
                        On the API Keys page, you'll see a green button labeled "Create new secret key". Click this button to start the key generation process.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        A dialog box will appear asking you to name your key. Choose a descriptive name like "My App API Key" or "Development Key" to help you identify it later.
                    </p>
                </StepCard>

                <StepCard stepNumber="4" title="Copy and Save Your API Key">
                    <p className="text-sm text-gray-700 mb-3">
                        After clicking "Create secret key", OpenAI will generate your unique API key. This key will only be shown once, so it's crucial to copy it immediately.
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                        The key will look similar to this format:
                    </p>
                    <CodeBlock>sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</CodeBlock>
                    <p className="text-sm text-gray-700 mt-2">
                        Copy this key and save it in a secure location. You'll need it to authenticate your API requests.
                    </p>
                </StepCard>
            </Section>
        </div>
    );

    const renderGroqGuide = () => (
        <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
            <Section 
                title="Groq API Key Setup" 
                caption="Groq offers lightning-fast inference speeds. Here's how to get your API key step by step."
            >
                <StepCard stepNumber="1" title="Access the Groq Console">
                    <p className="text-sm text-gray-700 mb-3">
                        Open your web browser and navigate to <a href="https://console.groq.com" className="text-blue-600 hover:underline font-medium" target="_blank">console.groq.com</a>.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        If you don't have an account yet, click "Sign up" and create one using your email address. If you already have an account, simply log in.
                    </p>
                </StepCard>

                <StepCard stepNumber="2" title="Find the API Keys Section">
                    <p className="text-sm text-gray-700 mb-3">
                        Once you're logged into the Groq console, look for the navigation menu on the left side of the screen.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Click on "API Keys" in the sidebar menu. This will take you to the API key management page where you can view and create new keys.
                    </p>
                </StepCard>

                <StepCard stepNumber="3" title="Create Your New API Key">
                    <p className="text-sm text-gray-700 mb-3">
                        On the API Keys page, you'll see a button labeled "Create API Key". Click this button to start creating your new key.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Enter a descriptive name for your API key when prompted. This helps you identify the key's purpose later, especially if you create multiple keys for different projects.
                    </p>
                </StepCard>

                <StepCard stepNumber="4" title="Copy Your Generated Key">
                    <p className="text-sm text-gray-700 mb-3">
                        After creating the key, Groq will display your new API key. This is your only chance to copy it, as it won't be shown again for security reasons.
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                        Your Groq API key will have this format:
                    </p>
                    <CodeBlock>gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</CodeBlock>
                    <p className="text-sm text-gray-700 mt-2">
                        Copy this key immediately and store it safely. You'll use this key to authenticate your API requests to Groq.
                    </p>
                </StepCard>
            </Section>
        </div>
    );

    const renderAnthropicGuide = () => (
        <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
            <Section 
                title="Anthropic API Key Setup" 
                caption="Anthropic provides access to Claude AI models. Follow these steps to get your API key."
            >
                <StepCard stepNumber="1" title="Visit Anthropic's Console">
                    <p className="text-sm text-gray-700 mb-3">
                        Go to <a href="https://console.anthropic.com" className="text-blue-600 hover:underline font-medium" target="_blank">console.anthropic.com</a> in your web browser.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Click "Sign up" to create a new account or "Log in" if you already have one. You'll need to provide your email address and create a secure password.
                    </p>
                </StepCard>

                <StepCard stepNumber="2" title="Navigate to API Keys">
                    <p className="text-sm text-gray-700 mb-3">
                        After logging in, you'll see the Anthropic console dashboard. Look for the navigation menu on the left side of the screen.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Click on "API Keys" in the left sidebar. This will open the API key management page where you can create and manage your keys.
                    </p>
                </StepCard>

                <StepCard stepNumber="3" title="Create a New API Key">
                    <p className="text-sm text-gray-700 mb-3">
                        On the API Keys page, you'll see a button labeled "Create Key" or "New Key". Click this button to begin the key creation process.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        You'll be prompted to enter a descriptive name for your key. Choose something meaningful like "My Application Key" or "Development Testing" to help you remember its purpose.
                    </p>
                </StepCard>

                <StepCard stepNumber="4" title="Copy Your Anthropic API Key">
                    <p className="text-sm text-gray-700 mb-3">
                        Once you click "Create", Anthropic will generate your unique API key. This key will only be displayed once, so make sure to copy it immediately.
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                        Your Anthropic API key will look like this:
                    </p>
                    <CodeBlock>sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</CodeBlock>
                    <p className="text-sm text-gray-700 mt-2">
                        Copy this entire key and save it securely. You'll need it to make API calls to Claude and other Anthropic models.
                    </p>
                </StepCard>
            </Section>
        </div>
    );

    const renderOpenRouterGuide = () => (
        <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
            <Section 
                title="OpenRouter API Key Setup" 
                caption="OpenRouter gives you access to multiple AI models through a single API. Here's how to get started."
            >
                <StepCard stepNumber="1" title="Sign Up for OpenRouter">
                    <p className="text-sm text-gray-700 mb-3">
                        Visit <a href="https://openrouter.ai" className="text-blue-600 hover:underline font-medium" target="_blank">openrouter.ai</a> in your web browser.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Click on "Sign up" to create a new account. You can sign up using your email address or connect with your Google/GitHub account for faster registration.
                    </p>
                </StepCard>

                <StepCard stepNumber="2" title="Access Your Dashboard">
                    <p className="text-sm text-gray-700 mb-3">
                        After successful registration and email verification, log into your OpenRouter account to access your dashboard.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Once logged in, look for the "Keys" or "API Keys" section in your account dashboard navigation menu.
                    </p>
                </StepCard>

                <StepCard stepNumber="3" title="Generate Your API Key">
                    <p className="text-sm text-gray-700 mb-3">
                        In the Keys section, you'll find a "Create Key" or "Generate New Key" button. Click this to start creating your API key.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        OpenRouter may allow you to set optional usage limits and permissions for your key. Configure these settings according to your needs, or leave them as default for general use.
                    </p>
                </StepCard>

                <StepCard stepNumber="4" title="Save Your OpenRouter Key">
                    <p className="text-sm text-gray-700 mb-3">
                        After generating your key, OpenRouter will display it once. Copy this key immediately as you won't be able to view it again.
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                        Your OpenRouter API key will have this format:
                    </p>
                    <CodeBlock>sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</CodeBlock>
                    <p className="text-sm text-gray-700 mt-2">
                        Store this key safely. You'll use it to access various AI models through OpenRouter's unified API interface.
                    </p>
                </StepCard>
            </Section>
        </div>
    );

    const renderMistralGuide = () => (
        <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
            <Section 
                title="Mistral AI API Key Setup" 
                caption="Mistral AI offers powerful open-source language models. Follow these steps to get your API key."
            >
                <StepCard stepNumber="1" title="Visit Mistral Console">
                    <p className="text-sm text-gray-700 mb-3">
                        Navigate to <a href="https://console.mistral.ai" className="text-blue-600 hover:underline font-medium" target="_blank">console.mistral.ai</a> in your web browser.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        If you're new to Mistral, click "Sign up" to create an account. You'll need to provide your email address and create a secure password. If you already have an account, simply log in.
                    </p>
                </StepCard>

                <StepCard stepNumber="2" title="Access API Keys Section">
                    <p className="text-sm text-gray-700 mb-3">
                        Once you're logged into the Mistral console, look for the main navigation menu or dashboard options.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Find and click on "API Keys" in your account dashboard. This will take you to the key management page where you can view existing keys and create new ones.
                    </p>
                </StepCard>

                <StepCard stepNumber="3" title="Create New API Key">
                    <p className="text-sm text-gray-700 mb-3">
                        On the API Keys page, look for a button labeled "Create new key" or "Generate API Key". Click this button to start the key generation process.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        You'll be prompted to provide a name for your API key. Choose a descriptive name that will help you identify this key later, such as "Production App" or "Development Testing".
                    </p>
                </StepCard>

                <StepCard stepNumber="4" title="Copy Your Mistral Key">
                    <p className="text-sm text-gray-700 mb-3">
                        After clicking create, Mistral will generate your unique API key. This key will only be shown once, so it's important to copy it immediately.
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                        Your Mistral API key will look like this:
                    </p>
                    <CodeBlock>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</CodeBlock>
                    <p className="text-sm text-gray-700 mt-2">
                        Copy this key and store it in a secure location. You'll need this key to authenticate your requests to Mistral AI's API.
                    </p>
                </StepCard>
            </Section>
        </div>
    );

    const renderOpenResponseGuide = () => (
        <div className="flex w-full flex-col gap-4 bg-white shadow p-8">
            <Section 
                title="OpenResponse API Key Setup" 
                caption="OpenResponse provides AI-powered response generation. Here's how to obtain your API key."
            >
                <StepCard stepNumber="1" title="Visit OpenResponse Platform">
                    <p className="text-sm text-gray-700 mb-3">
                        Go to <a href="https://openresponse.ai" className="text-blue-600 hover:underline font-medium" target="_blank">openresponse.ai</a> in your web browser.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Look for a "Sign up" or "Get Started" button on the homepage. Click it to begin the registration process. You'll need to provide your email address and create a password.
                    </p>
                </StepCard>

                <StepCard stepNumber="2" title="Navigate to Your Dashboard">
                    <p className="text-sm text-gray-700 mb-3">
                        After completing registration and email verification, log into your OpenResponse account to access your dashboard.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        Once logged in, explore the dashboard interface and look for an "API Keys" or "Developer" section in the main navigation menu.
                    </p>
                </StepCard>

                <StepCard stepNumber="3" title="Generate Your API Key">
                    <p className="text-sm text-gray-700 mb-3">
                        In the API Keys section, you'll find a "Generate API Key" or "Create New Key" button. Click this to start creating your API key.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                        When prompted, enter a descriptive name for your API key. This could be something like "My App Integration" or "Testing Environment" to help you manage multiple keys if needed.
                    </p>
                </StepCard>

                <StepCard stepNumber="4" title="Store Your Generated Key">
                    <p className="text-sm text-gray-700 mb-3">
                        Once generated, OpenResponse will display your new API key. This is the only time you'll be able to see the complete key, so copy it immediately.
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                        Your OpenResponse API key will have this format:
                    </p>
                    <CodeBlock>or_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</CodeBlock>
                    <p className="text-sm text-gray-700 mt-2">
                        Save this key securely. You'll use it to authenticate your API requests to OpenResponse services.
                    </p>
                </StepCard>
            </Section>
        </div>
    );

    const renderGuideContent = () => {
        switch (selectedModel) {
            case 'openai':
                return renderOpenAIGuide();
            case 'groq':
                return renderGroqGuide();
            case 'anthropic':
                return renderAnthropicGuide();
            case 'openrouter':
                return renderOpenRouterGuide();
            case 'mistral':
                return renderMistralGuide();
            case 'openresponse':
                return renderOpenResponseGuide();
            default:
                return renderOpenAIGuide();
        }
    };

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
                    onClick={() => toggleSidebar("Api-Keys-guide-slider","right")}
                    className="absolute top-4 right-4 p-2 rounded-full hover:text-error transition-colors z-10"
                >
                    <CloseIcon  />
                </button>

                {/* Header */}
                <div className="sticky top-0 bg-base-100 p-6 border-b border-base-300">
                    <h2 className="text-xl font-bold mb-4">API Key Setup Guide</h2>
                    
                    {/* Model Selection Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => setSelectedModel(model.id)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedModel === model.id
                                        ? `${model.color} text-white shadow-lg`
                                        : 'bg-base-200 text-base-content hover:bg-base-300'
                                }`}
                            >
                                {model.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {renderGuideContent()}
                </div>
            </div>
        </aside>
    );
}

export default ApiKeyGuideSlider;