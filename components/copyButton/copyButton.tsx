import { CopyIcon } from '@/components/Icons';
import React, { useState } from 'react';

const CopyButton = ({data}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboardSendData = () => {
    // Your clipboard copy logic here
    navigator.clipboard.writeText(data || '');

    // Show the copied message
    setCopied(true);

    // Hide the copied message after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className='absolute right-5 top-5'>
      <CopyIcon
        className=" cursor-pointer text-white"
        size={'20px'}
        onClick={copyToClipboardSendData}
      />
      {copied && (
        <span className=" text-sm text-green-500">
          Copied!
        </span>
      )}
    </div>
  );
};

export default CopyButton;
