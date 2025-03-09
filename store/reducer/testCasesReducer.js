import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    testCases: {},
};

const testCasesReducer = createSlice({
    name: 'testCases',
    initialState,
    reducers: {
        createTestCaseReducer: (state, action) => {
            const { data, bridgeId } = action.payload;
            if (state.testCases[bridgeId]) {
                state.testCases[bridgeId].push(data);
            } else {
                state.testCases[bridgeId] = [data];
            }
            return state;
        },
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


export const { createTestCaseReducer, getAllTestCasesReducer, deleteTestCaseReducer } = testCasesReducer.actions;

export default testCasesReducer.reducer;