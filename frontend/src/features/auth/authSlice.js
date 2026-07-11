import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCurrentUser, loginUser, logoutUser, registerUser, googleLoginUser } from '../../api/userApi';
import { normalizeApiError } from '../../api/normalize';

const initialState = {
  user: null,
  status: 'idle',
  initialized: false,
  error: null,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    return await getCurrentUser();
  } catch (error) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const googleSignIn = createAsyncThunk('auth/googleSignIn', async (credential, { rejectWithValue }) => {
  try {
    return await googleLoginUser(credential);
  } catch (error) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const signIn = createAsyncThunk('auth/signIn', async (credentials, { rejectWithValue }) => {
  try {
    return await loginUser(credentials);
  } catch (error) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const signUp = createAsyncThunk('auth/signUp', async (payload, { rejectWithValue }) => {
  try {
    return await registerUser(payload);
  } catch (error) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const signOut = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
  try {
    return await logoutUser();
  } catch (error) {
    return rejectWithValue(normalizeApiError(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearSession(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload ?? null;
        state.status = 'succeeded';
        state.initialized = true;
        state.error = null;
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.initialized = true;
        state.error = action.payload ?? action.error;
      })
      .addCase(googleSignIn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.user = action.payload?.user ?? action.payload ?? null;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      })
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload?.user ?? action.payload ?? null;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      })
      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload ?? null;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { clearSession } = authSlice.actions;

export default authSlice.reducer;