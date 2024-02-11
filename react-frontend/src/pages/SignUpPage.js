import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import NavigateToHome from '../utils/NavigateToHome';
import { SignupValidator } from '../utils/FormValidators';
import { HelmetProvider } from 'react-helmet-async';
import usePasswordToggle from '../hooks/usePasswordToggle';
import {
    LabelComponent,
    InputComponent, FormErrorComponent, ValidationErrorComponent,
    ShowPasswordComponent, SimpleInputComponent, ButtonComponent,
    SpanLinkComponent,
    ResponseErrorBannerComponent,
    ResponseSuccessBannerComponent
} from '../components/FormComponents';
import { ImportIcons, ImportPageStyle } from '../utils/ImportStylesheets';

const SignUpPage = () => {
    let { authTokens, registerUser } = useContext(AuthContext);

    // State for password toggle hook.
    const [PasswordInputType, PasswordToggleIcon] = usePasswordToggle();
    const [ConfirmPasswordInputType, ConfirmPasswordToggleIcon] = usePasswordToggle();

    // Initial form values.
    const initialValues = {firstname: '', lastname: '', username: '', email: '', password: '', confirm_password: '', expire: ''}
    
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
    
    // State for backend success response.
    const [responseSuccess, setResponseSuccess] = useState(null);

    // Function for handling the input field changes inside the form.
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    // Function for handling the form submission.
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors(SignupValidator({values:formValues}));
        setIsSubmit(true);
    };

    useEffect(() => {
        // Function for signin a new user.
        const submitData = async () => {
            // If there is no form errors and isSubmit is true
            if (Object.keys(formErrors).length === 0 && isSubmit) {
                // Call the registerUser passing the form values.
                registerUser(formValues)
                    // If it returns results
                    .then(result => {
                        // If result contains the key data means that user signedin successfuly.
                        if (result && result.data) {
                            // Set the response success message.
                            setResponseSuccess('Signup was successful. Proceed to login.');
                            // If result contains the key message means that the backend returned a validation error.
                        } else if (result && result.message) {
                            // Set the validation error.
                            setValidationErrors(result.message);
                            setIsSubmit(false);
                        }
                    })
                    .catch(error => {
                        // If there is an error set the response error.
                        console.error('Error occurred during signup:', error);
                        setResponseError('Error occurred during signup');
                    });
            }
        };

        submitData();
    }, [formValues, formErrors, isSubmit, registerUser]);

    return (
        <div>
            <HelmetProvider>
                <ImportIcons />
                <ImportPageStyle css_file={'css/SignUpPage.css'}/>
                <NavigateToHome authTokens={authTokens}/>
                <div className='container'>
                    <form onSubmit={handleSubmit}>
                        <header>Signup</header>

                        <ResponseSuccessBannerComponent response={responseSuccess} bannerType={'banner banner-success'}/>
                        <ResponseErrorBannerComponent response={responseError} bannerType={'banner banner-error'}/>

                        <div className='column'>
                            <div className='field-input'>
                                <LabelComponent label={'Firstname'}/>
                                <InputComponent
                                    type={'text'} name={'firstname'} placeholder={'Firstname'} onChange={handleChange}
                                    formError={formErrors} formErrorKey={'firstname'} validationError={validationErrors}
                                    validationErrorKey={'firstname'}
                                />
                                <FormErrorComponent error={formErrors} errorKey={'firstname'}/>
                                <ValidationErrorComponent error={validationErrors} errorKey={'firstname'}/>
                            </div>

                            <div className='field-input'>
                                <LabelComponent label={'Lastname'}/>
                                <InputComponent
                                    type={'text'} name={'lastname'} placeholder={'Lastname'} onChange={handleChange}
                                    formError={formErrors} formErrorKey={'lastname'} validationError={validationErrors}
                                    validationErrorKey={'lastname'}
                                />
                                <FormErrorComponent error={formErrors} errorKey={'lastname'}/>
                                <ValidationErrorComponent error={validationErrors} errorKey={'lastname'}/>
                            </div>
                        </div>

                        <div className='field-input'>
                            <LabelComponent label={'Username'}/>
                            <InputComponent
                                type={'text'} name={'username'} placeholder={'Username'} onChange={handleChange}
                                formError={formErrors} formErrorKey={'username'} validationError={validationErrors}
                                validationErrorKey={'username'}
                            />
                            <FormErrorComponent error={formErrors} errorKey={'username'}/>
                            <ValidationErrorComponent error={validationErrors} errorKey={'username'}/>
                        </div>

                        <div className='field-input'>
                            <LabelComponent label={'Email'}/>
                            <InputComponent
                                type={'email'} name={'email'} placeholder={'Email'} onChange={handleChange}
                                formError={formErrors} formErrorKey={'email'} validationError={validationErrors}
                                validationErrorKey={'email'}
                            />
                            <FormErrorComponent error={formErrors} errorKey={'email'}/>
                            <ValidationErrorComponent error={validationErrors} errorKey={'email'}/>
                        </div>

                        <div className='column'>
                            <div className='field-input'>
                                <LabelComponent label={'Password'}/>
                                <InputComponent
                                    type={PasswordInputType} name={'password'} placeholder={'Password'} onChange={handleChange}
                                    formError={formErrors} formErrorKey={'password'} validationError={validationErrors}
                                    validationErrorKey={'password'}
                                />
                                <FormErrorComponent error={formErrors} errorKey={'password'}/>
                                <ShowPasswordComponent icon={PasswordToggleIcon}/>
                            </div>

                            <div className='field-input'>
                                <LabelComponent label={'Confirm Password'}/>
                                <InputComponent
                                    type={ConfirmPasswordInputType} name={'confirm_password'} placeholder={'Confirm Password'} onChange={handleChange}
                                    formError={formErrors} formErrorKey={'confirm_password'} validationError={validationErrors}
                                    validationErrorKey={'confirm_password'}
                                />
                                <FormErrorComponent error={formErrors} errorKey={'confirm_password'}/>
                                <ShowPasswordComponent icon={ConfirmPasswordToggleIcon}/>
                            </div>
                        </div>

                        <div className='field-input'>
                            <LabelComponent label={'Expiration Date'}/>
                            <SimpleInputComponent type={'date'} name={'expire'} onChange={handleChange}/>
                        </div>

                        <ButtonComponent
                            text={'Signup'} type={'submit'}
                        />

                        <SpanLinkComponent
                            spanText={'Already have  an account? '} linkClassName={'login-link'} linkText={'Login'} linkTo={'/login'}
                        />
                    </form>
                </div>
            </HelmetProvider>    
        </div>
    );
}

export default SignUpPage