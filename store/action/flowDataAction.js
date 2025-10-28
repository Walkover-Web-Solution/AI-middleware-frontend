import { getApiKeyGuide, getDescriptions, getGuardrailsTemplates, getTutorial } from "@/config";
import { getApiKeyGuideData, getDescriptionsData, getGuardrailsTemplatesData, getTutorialData } from "../reducer/flowDataReducer";

export const getTutorialDataAction = () => {
  return async (dispatch) => {
    try {
      const data = await getTutorial();
      dispatch(getTutorialData(data.data));
    } catch (error) {
      console.error("Failed to fetch tutorial data:", error);
    }
  };
};

export const getApiKeyGuideAction = () => {
  return async (dispatch) => {
    try {
      const data = await getApiKeyGuide();
      dispatch(getApiKeyGuideData(data.data));
    } catch (error) {
      console.error("Failed to fetch tutorial data:", error);
    }
  };
};
export const getGuardrailsTemplatesAction = () => {
  return async (dispatch) => {
    try {
      const data = await getGuardrailsTemplates();
      dispatch(getGuardrailsTemplatesData(data?.data?.SafetyChecksFunction));
    } catch (error) {
      console.error("Failed to fetch tutorial data:", error);
    }
  };
};
export const getDescriptionsAction = () => {
  return async (dispatch) => {
    try {
      const data = await getDescriptions();
      dispatch(getDescriptionsData(data.data));
    } catch (error) {
      console.error("Failed to fetch tutorial data:", error);
    }
  };
};