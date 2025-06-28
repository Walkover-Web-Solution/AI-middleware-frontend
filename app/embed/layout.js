"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import { updateUserDetialsForEmbedUser } from '@/store/reducer/userDetailsReducer';
import { useDispatch } from 'react-redux';
import { getServiceAction } from '@/store/action/serviceAction';

const Layout = ({ children }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const interfaceDetailsParam = searchParams.get('interfaceDetails');
  const decodedParam = interfaceDetailsParam ? decodeURIComponent(interfaceDetailsParam) : null;
  const urlParamsObj = decodedParam ? JSON.parse(decodedParam) : {};

  useEffect(() => {
    window.parent.postMessage({type: 'gtwyLoaded', data: 'gtwyLoaded'}, '*');
  }, []);

  useEffect(()=>{
    dispatch(getServiceAction())
  },[])

  useEffect(() => {
    if (urlParamsObj.org_id && urlParamsObj.token && urlParamsObj.folder_id) {
      setIsLoading(true);

      if (urlParamsObj.token) {
        dispatch(updateUserDetialsForEmbedUser({ isEmbedUser: true }));
        sessionStorage.setItem('proxy_token', urlParamsObj.token);
      }

      router.push(`org/${urlParamsObj.org_id}/agents?isEmbedUser=true`);
    }
  }, [urlParamsObj, router, dispatch]);

 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800 mb-4">
            GTWY
          </div>
          <div className="flex items-center justify-center space-x-1 text-xl text-gray-600">
            <span>is loading</span>
            <div className="flex space-x-1 ml-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}

export default Layout