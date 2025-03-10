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
        runTestCaseReducer: (state, action) => {
            const { data: { testcases_result }, bridgeId, versionId } = action.payload;
            if (testcases_result && state.testCases[bridgeId]) {
                Object.keys(testcases_result).forEach((testCaseId) => {
                    const testCase = state.testCases[bridgeId].find(testCase => testCase._id === testCaseId);
                    if (testCase) {
                        if (!testCase.version_history[versionId]) {
                            testCase.version_history[versionId] = [];
                        }
                        testCase.version_history[versionId].push(testcases_result[testCaseId]?.result);
                    }
                });
            } else {
                console.error("Invalid testcases_result or bridgeId not found in state.testCases");
            }
            return state;
        },
    },
});


export const { createTestCaseReducer, getAllTestCasesReducer, deleteTestCaseReducer, runTestCaseReducer } = testCasesReducer.actions;

export default testCasesReducer.reducer;