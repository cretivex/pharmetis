import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSession, loginWithPassword, logoutSession } from '../api/authApi.js';

/**
 * Defer until after the current Redux reducer finishes. Listeners often call
 * store.getState() (e.g. authService.isAuthenticated); dispatching events synchronously
 * from a reducer would trigger "You may not call store.getState() while the reducer is executing".
 */
function emitLoginStateChange() {
  queueMicrotask(() => {
    try {
      window.dispatchEvent(new Event('loginStateChange'));
    } catch (_) {}
  });
}

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  return getSession();
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const user = await loginWithPassword({ email, password });
      emitLoginStateChange();
      return user;
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutSession();
  } catch (_) {
    // Still clear client state if server fails
  }
  emitLoginStateChange();
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'loading',
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      emitLoginStateChange();
    },
    clearAuth: (state) => {
      state.user = null;
      state.error = null;
      emitLoginStateChange();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'idle';
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.status = 'idle';
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload ?? 'Login failed';
        state.status = 'idle';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
