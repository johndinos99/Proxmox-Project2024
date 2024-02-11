import { useContext } from 'react'
import { jwtDecode } from "jwt-decode";
import axios from 'axios'
import AuthContext from '../context/AuthContext';

const useAxios = () => {
    const url = 'https://localhost:8000/'

    const { setUser, setAuthTokens } = useContext(AuthContext)
    
    const axiosInstance = axios.create({
        baseURL: url,
    });

    // Function for refreshing the tokens.
    const tokenRefresh = async () => {
        try {
            const refreshToken = JSON.parse(localStorage.getItem('authTokens')).refresh

            const response = await axios.post(`${url}api/token/refresh`, {
                refresh: refreshToken
            });

            return response.data
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw refreshError;
        }
    };

    // Request interceptor to add auth token to requests.
    axiosInstance.interceptors.request.use(
        (request) => {
            const accessToken = JSON.parse(localStorage.getItem('authTokens')).access

            if (accessToken) {
                request.headers.Authorization = `Bearer ${accessToken}`
            }

            return request
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle 401 error and refresh the token.
    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            if (error.response) {
                if (error.response.status === 401 && !error.config._retry) {
                    error.config._retry = true;

                    const refreshedTokens = await tokenRefresh();

                    // Update tokens in local storage.
                    localStorage.setItem('authTokens', JSON.stringify(refreshedTokens))

                    // Set the new tokens into the AuthContext.
                    setAuthTokens(refreshedTokens)
                    setUser(jwtDecode(refreshedTokens.access))

                    // Refresh the token and update the request with the new token
                    error.config.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('authTokens')).access}`
                    // Retry the original request with the new token
                    return axiosInstance(error.config);
                }
            }

            // Reject for non-refreshable errors
            return Promise.reject(error);
        }
    );

    return axiosInstance
};

export default useAxios;
