import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/AuthStore/slice"
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";// use localstorage

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'],// only auth will be persisted
};

const rootReducer = combineReducers({
    auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;