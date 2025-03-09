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
        },
        deleteTestCaseReducer: (state, action) => {
            const { testCaseId, bridgeId } = action.payload;
            if (state.testCases[bridgeId]) {
                state.testCases[bridgeId] = state.testCases[bridgeId].filter(testCase => testCase._id !== testCaseId);
            }
            return state;
        },
    },
});


export const { getAllTestCasesReducer, deleteTestCaseReducer } = testCasesReducer.actions;

export default testCasesReducer.reducer;