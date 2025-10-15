import React from 'react';
import UserRefernceForRichText from "./configurationComponent/userRefernceForRichText";
import StarterQuestionToggle from "./configurationComponent/starterQuestion";
import ActionList from "./configurationComponent/actionList";

const ChatbotConfigView = ({ params, searchParams }) => {
    return (
        <>
            <UserRefernceForRichText params={params} searchParams={searchParams} />
            <StarterQuestionToggle params={params} searchParams={searchParams} />
            <ActionList params={params} searchParams={searchParams} />
        </>
    );
};

export default React.memo(ChatbotConfigView);
