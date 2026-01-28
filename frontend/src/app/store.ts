import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import cartReducer from "../features/cart/cart.slice";
// Uygulamanın global state merkezi
export const store = configureStore({
  reducer: {
    // Kullanıcı login / logout durumu
    auth: authReducer,
    cart: cartReducer,
  },
});

// Tüm state'in TypeScript tipi (useSelector için)
export type RootState = ReturnType<typeof store.getState>;

// Typed dispatch (useDispatch için)
export type AppDispatch = typeof store.dispatch;
