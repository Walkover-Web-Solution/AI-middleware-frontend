import React from 'react';
import UserRefernceForRichText from "./configurationComponent/userRefernceForRichText";
import StarterQuestionToggle from "./configurationComponent/starterQuestion";
import ActionList from "./configurationComponent/actionList";

const ChatbotConfigView = ({ params, searchParams , isPublished }) => {
    return (
        <>
            <UserRefernceForRichText params={params} searchParams={searchParams} isPublished={isPublished} />
            <StarterQuestionToggle params={params} searchParams={searchParams} isPublished={isPublished} />
            <ActionList params={params} searchParams={searchParams} isPublished={isPublished} />
        </>
    );
};

export default React.memo(ChatbotConfigView);
