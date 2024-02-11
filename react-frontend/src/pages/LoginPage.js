import React, { useContext, useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext';
import NavigateToHome from '../utils/NavigateToHome';
import usePasswordToggle from '../hooks/usePasswordToggle';
import { HelmetProvider } from 'react-helmet-async';
import { LoginValidator } from '../utils/FormValidators';
import { ImportIcons, ImportPageStyle } from '../utils/ImportStylesheets';
import {
    ButtonComponent, FormErrorComponent, InputComponent,
    LabelComponent, LinkComponent, ResponseErrorBannerComponent,
    ShowPasswordComponent, SpanLinkComponent, ValidationErrorComponent
} from '../components/FormComponents';

const LoginPage = () => {
    let { loginUser, authTokens } = useContext(AuthContext);

    // Show-hide password toggle state.
    const [PasswordInputType, PasswordToggleIcon] = usePasswordToggle();

    // Initial form values.
    const initialValues = { username: '', password: '' }

    //State for the form values.
    const [formValues, setFormValues] = useState(initialValues);

    // State for the isSubmit.
    const [isSubmit, setIsSubmit] = useState(false);

    // State for form validation errors.
    const [formErrors, setFormErrors] = useState({});

    // State for backend validation errors.
    const [validationErrors, setValidationErrors] = useState({});

    // State for backend error response.
    const [responseError, setResponseError] = useState(null);

    // Function for handling the input field changes inside the form.
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    // Function for handling the form submission.
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors(LoginValidator({ values: formValues }));
        setIsSubmit(true);
    };

    useEffect(() => {
        // Function for login the user.
        const submitData = async () => {
            // If there is no form errors and isSubmit is true
            if (Object.keys(formErrors).length === 0 && isSubmit) {
                // Call the loginUser passing the form values.
                loginUser(formValues)
                    // If it returns data means that the backend returned a validation error.
                    .then(data => {
                        if (data) {
                            // Set the validation error.
                            setValidationErrors(data);
                            setIsSubmit(false);
                        }
                    }).catch(error => {
                        // If there is an error set the response error.
                        console.error('Error occurred during login:', error);
                        setResponseError('Error occurred during login');
                    });
            }
        };

        submitData();
    }, [formValues, formErrors, isSubmit, loginUser]);

    return (
        <div>
            <HelmetProvider>
                <ImportIcons/>
                <ImportPageStyle css_file={'css/LoginPage.css'}/>
                <NavigateToHome authTokens={authTokens}/>
                <div className='container'>
                    <form onSubmit={handleSubmit}>
                        <header>Login</header>

                        <ResponseErrorBannerComponent response={responseError} bannerType={'banner banner-error'}/>
                        
                        <div className='field-input'>
                            <LabelComponent label={'Username'}/>
                            <InputComponent
                                type={'text'} name={'username'} placeholder={'Username'} onChange={handleChange}
                                formError={formErrors} formErrorKey={'username'} validationError={validationErrors}
                                validationErrorKey={'detail'}
                            />
                            <FormErrorComponent error={formErrors} errorKey={'username'}/>
                            <ValidationErrorComponent error={validationErrors} errorKey={'detail'}/>
                        </div>

                        <div className='field-input'>
                            <LabelComponent label={'Password'}/>
                            <InputComponent
                                type={PasswordInputType} name={'password'} placeholder={'Password'} onChange={handleChange}
                                formError={formErrors} formErrorKey={'password'} validationError={validationErrors}
                                validationErrorKey={'detail'}
                            />
                            <FormErrorComponent error={formErrors} errorKey={'password'}/>
                            <ShowPasswordComponent icon={PasswordToggleIcon}/>
                        </div>

                        <LinkComponent
                            linkClassName={'forgot-pass'} linkText={'Forgot Password?'} linkTo={'#'}
                        />
                        <ButtonComponent
                            text={'Login'} type={'submit'}
                        />
                        <SpanLinkComponent
                            spanText={'Dont have an account? '} linkClassName={'signup-link'} linkText={'Signup'} linkTo={'/signup'}
                        />
                    </form>
                </div>
            </HelmetProvider>    
        </div>
    );
}

export default LoginPage