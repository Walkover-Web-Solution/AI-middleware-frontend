import { Copy } from 'lucide-react';
import React, { useState } from 'react';

const CopyButton = ({data}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboardSendData = () => {
    // Your clipboard copy logic here
    navigator.clipboard.writeText(data || 'Your data to be copied');

    // Show the copied message
    setCopied(true);

    // Hide the copied message after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div>
      <Copy
        className="absolute right-5 top-5 cursor-pointer text-white"
        size={'20px'}
        onClick={copyToClipboardSendData}
      />
      {copied && (
        <span className="absolute right-5 top-10 text-sm text-green-500">
          Copied!
        </span>
      )}
    </div>
  );
};

export default CopyButton;
