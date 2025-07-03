import CommentsCards from "@/components/CommentsCards";
import DisplayCards from "@/components/DisplayCards";
import FeatureRequests from "@/components/FeatureRequests";
import Footer from "@/components/Footer";
import HeroPage from "@/components/HeroPage";
import PlatformImage from "@/components/PlatformImage";
import PromptTemplates from "@/components/PromptTemplates";
import Questions from "@/components/Questions";
import RoadMapCards from "@/components/RoadMapCards";
import SuggestionTemplates from "@/components/SuggestionTemplate";
import TrustedBy from "@/components/TrustedBy";
import Head from "next/head";
/*
  This page is the entry point for the user to start the login process.
  The page checks if the user has already logged in or not.
  If the user has not logged in, it will redirect the user to the login page.
 * If the user has already logged in, it will redirect the user to the bridges page.
 */
function page() {
  return (
    <div className="bg-base-content h-full w-full text-white overflow-hidden">
      <Head>
        <link rel="canonical" href="https://gtwy.ai" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans&display=swap" rel="stylesheet"/>

      </Head>
      <HeroPage />
      <PlatformImage />
      <TrustedBy />
      <DisplayCards />
      <SuggestionTemplates />
      <PromptTemplates />
      <RoadMapCards />
      <CommentsCards />
      <Questions />
      <FeatureRequests />
      <Footer />
    </div>
  );
}
export default page;
