import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {

    // For getting user detail from the access token
    let [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null);
    // For setting the auth tokes from the backend
    let [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    let [loading, setLoading] = useState(true)

    const navigate = useNavigate();

    let loginUser = async (formValues) => {
        let response = await fetch('api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': formValues.username,
                'password': formValues.password
            })
        });

        // returns {"access": "key", "refresh": "key"}
        let data = await response.json()
        
        if (response.status === 200) {
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            localStorage.setItem('authTokens', JSON.stringify(data))
            navigate("/")
        }

        if (response.status === 401) {
            return data
        }

        if (response.status === 400) {
            return data
        }
    }

    let registerUser = async (formValues) => {
        const epochTime = new Date(formValues.expire).getTime() / 1000.0;

        let response = await fetch('api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'firstname': formValues.firstname,
                'lastname': formValues.lastname,
                'username': formValues.username,
                'email': formValues.email,
                'password': formValues.password,
                'expire': epochTime
            })
        });

        let data = await response.json()

        if (response.status === 201) {
            return data
        }

        if (response.status === 400) {
            return data
        }
    }

    let logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
        navigate("/login")
    }

    let contextData = {
        user: user,
        setUser: setUser,
        authTokens: authTokens,
        setAuthTokens: setAuthTokens,
        loginUser: loginUser,
        registerUser: registerUser,
        logoutUser: logoutUser
    }

    useEffect(() => {
        if (authTokens) {
            setUser(jwtDecode(authTokens.access))
        }
        setLoading(false)
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
}