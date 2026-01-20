
"use client";
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getFromCookies } from '@/utils/utility';
import Protected from '@/components/Protected';

export const runtime = 'edge';



function UserManagementPage({ params }) {
  useEffect(()=>{
  window.dispatchEvent(new CustomEvent('showUserManagement'));
  return () => {
    // window.dispatchEvent(new CustomEvent('hideUserManagement'));
  };
},[])
  return (
    <div id = "userProxyContainer">
    </div>
  );
}

export default Protected(UserManagementPage);

