import { getPrebuiltPrompts, resetPrebuiltPrompt, updatePrebuiltPrompt } from "@/config";
import { getAllPrebuiltPrompts, updatePrebuiltPromptData } from "../reducer/prebuiltPromptReducer";

export const getPrebuiltPromptsAction = () => async (dispatch) => {
  try {
    const response = await getPrebuiltPrompts()
    console.log(response,"response")
    dispatch(getAllPrebuiltPrompts(response))
      } catch (error) {
    console.error(error);
  }
}
export const updatePrebuiltPromptAction = (dataToSend) => async (dispatch) => {
  try {
    const response = await updatePrebuiltPrompt(dataToSend)
    dispatch(updatePrebuiltPromptData(response))
      } catch (error) {
    console.error(error);
  }
}
export const resetPrebuiltPromptAction = (dataToSend) => async (dispatch) => {
  try {
    const response = await resetPrebuiltPrompt(dataToSend)
    console.log(response,"response")
    dispatch(updatePrebuiltPromptData(response))
      } catch (error) {
    console.error(error);
  }
}
