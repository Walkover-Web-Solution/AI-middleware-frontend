
"use client";
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getFromCookies } from '@/utils/utility';
import Protected from '@/components/Protected';

export const runtime = 'edge';

function UserManagementPage({ params }) {
  return (
    <div id = "userProxyContainer">
    </div>
  );
}

export default Protected(UserManagementPage);

