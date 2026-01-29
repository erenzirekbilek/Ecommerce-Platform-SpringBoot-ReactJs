import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi, signupApi, refreshApi, logoutApi } from "./auth.api";
import type { RootState } from "../../app/store";

// ===== TYPES =====

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role?: string;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

interface RefreshResponse {
  accessToken: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ===== INITIAL STATE =====

const loadInitialState = (): AuthState => {
  const token = localStorage.getItem("accessToken");
  const savedUser = localStorage.getItem("user"); // Kullanıcıyı da al

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    accessToken: token,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = loadInitialState();

// ===== THUNKS =====

export const login = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginApi(credentials);
    // 'as AuthResponse' diyerek TS'e güvenmesini söylüyoruz
    return response as AuthResponse; 
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Login başarısız"
    );
  }
});

export const signup = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/signup", async (credentials, { rejectWithValue }) => {
  try {
    const response = await signupApi(credentials);
    // 'as AuthResponse' ekleyerek tip uyuşmazlığını manuel çözüyoruz
    return response as AuthResponse; 
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Signup başarısız"
    );
  }
});

export const refreshToken = createAsyncThunk<
  RefreshResponse,
  void,
  { rejectValue: string }
>("auth/refresh", async (_, { rejectWithValue }) => {
  try {
    return await refreshApi();
  } catch (error) {
    localStorage.removeItem("accessToken");
    return rejectWithValue(
      error instanceof Error ? error.message : "Token refresh başarısız"
    );
  }
});

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await logoutApi();
  } catch (error) {
    localStorage.removeItem("accessToken");
    return rejectWithValue(
      error instanceof Error ? error.message : "Logout başarısız"
    );
  }
});

// ===== SLICE =====

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.loading = false;
        // VERİLERİ BURADA KAYDEDİYORUZ:
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' 
            ? action.payload 
            : "Login başarısız";
        state.isAuthenticated = false;
      })

      // SIGNUP
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Signup başarısız";
      })

      // REFRESH TOKEN
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;

        // HAFIZAYI TEMİZLİYORUZ:
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

// ===== SELECTORS =====

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthToken = (state: RootState) => state.auth.accessToken;
