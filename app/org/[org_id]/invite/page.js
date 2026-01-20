
"use client";
import Protected from '@/components/Protected';

export const runtime = 'edge';
function UserManagementPage({ params }) {
  return (
    <div id = "userProxyContainer">
    </div>
  );
}

export default Protected(UserManagementPage);

