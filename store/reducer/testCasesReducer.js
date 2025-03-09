import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    testCases: {},
};

const testCasesReducer = createSlice({
    name: 'testCases',
    initialState,
    reducers: {
        getAllTestCasesReducer: (state, action) => {
            const { data, bridgeId } = action.payload;
            state.testCases[bridgeId] = data;
        }
    },
});


export const { getAllTestCasesReducer } = testCasesReducer.actions;

export default testCasesReducer.reducer;