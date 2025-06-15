import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TestSuite, TestCase } from '../../types/testing';

interface TestState {
    suites: TestSuite[];
    selectedSuite: TestSuite | null;
    cases: TestCase[];
    selectedCase: TestCase | null;
    loading: boolean;
    error: string | null;
}

const initialState: TestState = {
    suites: [],
    selectedSuite: null,
    cases: [],
    selectedCase: null,
    loading: false,
    error: null
};

const testSlice = createSlice({
    name: 'test',
    initialState,
    reducers: {
        setSuites: (state, action: PayloadAction<TestSuite[]>) => {
            state.suites = action.payload;
        },
        setSelectedSuite: (state, action: PayloadAction<TestSuite | null>) => {
            state.selectedSuite = action.payload;
        },
        setCases: (state, action: PayloadAction<TestCase[]>) => {
            state.cases = action.payload;
        },
        setSelectedCase: (state, action: PayloadAction<TestCase | null>) => {
            state.selectedCase = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        addTestSuite: (state, action: PayloadAction<TestSuite>) => {
            state.suites.push(action.payload);
        },
        updateTestSuite: (state, action: PayloadAction<TestSuite>) => {
            const index = state.suites.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.suites[index] = action.payload;
            }
        },
        removeTestSuite: (state, action: PayloadAction<number>) => {
            state.suites = state.suites.filter(s => s.id !== action.payload);
            if (state.selectedSuite?.id === action.payload) {
                state.selectedSuite = null;
            }
        },
        addTestCase: (state, action: PayloadAction<TestCase>) => {
            state.cases.push(action.payload);
        },
        updateTestCase: (state, action: PayloadAction<TestCase>) => {
            const index = state.cases.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.cases[index] = action.payload;
            }
        },
        removeTestCase: (state, action: PayloadAction<number>) => {
            state.cases = state.cases.filter(c => c.id !== action.payload);
            if (state.selectedCase?.id === action.payload) {
                state.selectedCase = null;
            }
        }
    }
});

export const {
    setSuites,
    setSelectedSuite,
    setCases,
    setSelectedCase,
    setLoading,
    setError,
    addTestSuite,
    updateTestSuite,
    removeTestSuite,
    addTestCase,
    updateTestCase,
    removeTestCase
} = testSlice.actions;

export default testSlice.reducer;
