import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Protected = (WrappedComponent) => {
  return (props) => {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
      // Since useEffect runs on the client, we can safely access localStorage here
      if (!localStorage.getItem("proxy_auth_token")) {
        router.replace('/');
      } else {
        // Update state to indicate we're on the client side now
        setIsClient(true);
      }
    }, []); // Empty dependency array means this runs once on mount

    // Prevent the component from rendering on the server
    if (!isClient) {
      return null;
    }

    // Now that we're sure it's safe, render the wrapped component
    return <WrappedComponent {...props} />;
  };
};

export default Protected;
