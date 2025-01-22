import CommentsCards from "@/components/CommentsCards";
import DisplayCards from "@/components/DisplayCards";
import Footer from "@/components/Footer";
import HeroPage from "@/components/HeroPage";
import PlatformImage from "@/components/PlatformImage";
import PromptTemplates from "@/components/PromptTemplates";
import Questions from "@/components/Questions";
import TrustedBy from "@/components/TrustedBy";
import WithAuth from "@/components/withauth";

/**
 * This page is the entry point for the user to start the login process.
 * The page checks if the user has already logged in or not.
 * If the user has not logged in, it will redirect the user to the login page.
 * If the user has already logged in, it will redirect the user to the bridges page.
 */
function page() {

  return (
    <div className="bg-black h-full w-full text-white overflow-hidden">
      <HeroPage />
      <PlatformImage />
      <TrustedBy />
      <DisplayCards />
      <PromptTemplates />
      <CommentsCards />
      <Questions />
      <Footer />
    </div>
  );
}

export default page;
