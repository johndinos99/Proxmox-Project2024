import React from 'react';
import { Link } from 'react-router-dom';

export const LabelComponent = ({ label }) => {
    return (
        <label>{label}</label>
    );
}
export const SimpleInputComponent = ({ type, name, placeholder, onChange }) => {
    return (
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
        />
    );
};

export const InputComponent = ({ type, name, placeholder, onChange, formError, formErrorKey, validationError ,validationErrorKey }) => {
    return (
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            autoComplete='off'
            {...(formError[formErrorKey] || (validationError && validationError.hasOwnProperty(validationErrorKey)) ? { haserror: 'true' } : { haserror: 'false' })}
        />
    );
};

// For the banners on top of the form
export const ErrorBannerComponent = ({ text, bannerType, iconClassName }) => {
    return (
        <div className={bannerType}>
            <i class={`${iconClassName} bx bx-error-circle`}></i>
            <div className='banner-text'>{text}</div>
        </div>
    );
}; 

export const SuccessBannerComponent = ({ text, bannerType, iconClassName }) => {
    return (
        <div className={bannerType}>
            <i className={`${iconClassName} bx bx-check`}></i>
            <div className='banner-text'>{text}</div>
        </div>
    );
}

export const ResponseErrorBannerComponent = ({ response, bannerType }) => {
    return (
        <>
            {response && <ErrorBannerComponent text={response} bannerType={bannerType} iconClassName='error-banner-icon'/>}
        </>
    );
};

export const ResponseSuccessBannerComponent = ({ response, bannerType }) => {
    return (
        <>
            {response && <SuccessBannerComponent text={response} bannerType={bannerType} iconClassName='success-banner-icon'/>}
        </>
    );
};
//.

export const ErrorTextComponent = ({ errorText }) => {
    return (
        <div className="field-error">
            <i className="error-icon bx bx-error-circle"></i>
            <div className="error-text">{errorText}</div>
        </div>
    );
};

export const SimpleErrorComponent = ({ error }) => {
    return (
        <>
            {error && (<ErrorTextComponent errorText={error} />)}
        </>
    );
};

export const FormErrorComponent = ({ error, errorKey }) => {
    return (
        <>
            {error[errorKey] && (<ErrorTextComponent errorText={error[errorKey]}/>)}
        </>
    );
};

export const ValidationErrorComponent = ({ error, errorKey }) => {
    return (
        <>
            {error && error.hasOwnProperty(errorKey) && (<ErrorTextComponent errorText={error[errorKey]} />)}
        </>
    );
};

export const ButtonComponent = ({ text, type }) => {
    return (
        <div className='button'>
            <button type={type}>{text}</button>
        </div>
    );
};

export const LinkComponent = ({ linkText, linkClassName, linkTo }) => {
    return (
        <div className='link'>
            <Link className={linkClassName} to={linkTo}>
                {linkText}
            </Link>
        </div>
    );
};

export const SpanLinkComponent = ({ spanText, linkText, linkClassName, linkTo }) => {
    return (
        <div className='link'>
            <span>{spanText}<Link className={linkClassName} to={linkTo}>{linkText}</Link></span>
        </div>
    );
};

export const ShowPasswordComponent = ({ icon }) => {
    return (
        <span className='password-toggle-icon'>
            {icon}
        </span>
    );
};