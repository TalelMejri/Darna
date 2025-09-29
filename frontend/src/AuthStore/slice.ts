import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../types'

interface AuthState {
    user: User | null,
    isAuth: boolean
}
const initialState: AuthState = {
    user: null,
    isAuth: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        LoginUser: (
            state,
            action: PayloadAction<{ user: User }>
        ) => {
            state.isAuth = true;
            state.user = action.payload.user
        },
        LogoutUser: (
            state,
        ) => {
            state.isAuth = false;
            state.user = null
        }
    }
})

export const { LoginUser, LogoutUser } = authSlice.actions

export default authSlice.reducer
