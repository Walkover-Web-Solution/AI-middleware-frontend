'use client'
import LoginPage from "@/components/loginPage";
import WithPublicAgentAuth from "@/components/withPublicAgentAuth";

export const runtime = 'edge';

const page = ({ loading }) => {
  return (
   <LoginPage loading={loading} />
  );
};

export default WithPublicAgentAuth(page);