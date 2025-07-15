import { getTutorial } from "@/config";
import { getTutorialData } from "../reducer/tutorialReducer";

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