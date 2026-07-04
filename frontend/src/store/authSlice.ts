import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/auth";
import type {
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";
import { clearToken, getToken, saveToken } from "../utils/tokenStorage";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: getToken(),
  status: "idle",
  initialized: false,
  error: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }
  return fallback;
}

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await registerUser(payload);
      saveToken(response.data.token, false);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Registration failed"));
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await loginUser(payload);
      saveToken(response.data.token, payload.rememberMe);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Login failed"));
    }
  }
);

export const loadCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) {
      return rejectWithValue("No token");
    }

    try {
      const response = await fetchCurrentUser();
      return response.data.user;
    } catch (error) {
      clearToken();
      return rejectWithValue(getErrorMessage(error, "Session expired"));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutUser();
  } finally {
    clearToken();
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Registration failed";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Login failed";
      })
      .addCase(loadCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.token = null;
        state.initialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
        state.error = null;
        state.initialized = true;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
