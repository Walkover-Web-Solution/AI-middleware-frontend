import axios from "axios";
import { fetchModelReducer } from "../reducer/modelReducer";
import { getAllModels } from "@/config";


export const getModelAction = ({ service }) => async (dispatch) => {
  try {
    const data = await getAllModels(service);
    dispatch(fetchModelReducer({ data: data, service }));
  } catch (error) {
    console.error(error);
  }
};