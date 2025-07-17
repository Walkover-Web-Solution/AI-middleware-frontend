import axios from "axios";
import { addNewModelReducer, fetchModelReducer } from "../reducer/modelReducer";
import { addNewModel, getAllModels } from "@/config";


export const getModelAction = ({ service }) => async (dispatch) => {
  try {
    const data = await getAllModels(service);
    dispatch(fetchModelReducer({ data: data, service }));
  } catch (error) {
    console.error(error);
  }
};

export const addNewModelAction = ({service, type, newModelObject}) => async(dispatch) =>{
  try {
    const data = await addNewModel(newModelObject);
    dispatch(addNewModelReducer({service, type, modelData: data?.data?.result}))
    return data;
  } catch (error) {
    console.error(error)
  }
}