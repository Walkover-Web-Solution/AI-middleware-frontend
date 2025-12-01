'use client'
import LoginPage from "@/components/loginPage";
import WithAuth from "@/components/withauth";

const page = ({ loading }) => {
  return (
   <LoginPage loading={loading} />
  );
};

export default WithAuth(page);