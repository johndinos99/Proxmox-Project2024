import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Function for preventing logged in user for accessing the login page.
const NavigateToHome = ({ authTokens }) => {
    const navigate = useNavigate();

    const navigateToHome = useCallback(() => {
        navigate('/');
    }, [navigate]);

    useEffect(() => {
        if (authTokens) {
            navigateToHome();
        }
    }, [authTokens, navigateToHome]);

    return null;
}

export default NavigateToHome;