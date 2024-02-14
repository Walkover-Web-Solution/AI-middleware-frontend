import axios from "axios";
import { fetchAllHistoryReducer, fetchThreadReducer } from "../reducer/historyReducer";



export const dryRunAction = () => async (dispatch, getState) => {
    try {
        const dataToSend = {
            "configuration":{
                "model":"gpt-3.5-turbo",
                "temperature":1,
                "prompt":[{"system":"hey"}],
                "type":"chat",
                  "user":[{"role":"user","content":"hello"}]
            },
              
            "org_id":"124dfgh67ghj",
            "apikey":"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"
        }
      const data = await axios.post(`http://localhost:7072/api/v1/model/playground/chat/completion` , dataToSend );
      dispatch(dryRun(data.data));
    } catch (error) {
      console.error(error);
    }
  };
