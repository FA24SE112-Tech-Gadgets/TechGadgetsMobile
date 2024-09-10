import React from 'react'
import useAuth from '../../utils/useAuth';
import LoadingScreen from '../LoadingScreen/Loading';
import LoginScreen from './LoginScreen';

export default function AuthRoute({ children }) {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }
    if (!isLoggedIn) {
        return (
            <LoginScreen />
        )
    }

    return (
        <>{children}</>
    )
}