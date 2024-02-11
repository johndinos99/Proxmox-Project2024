import React, { useEffect, useState } from 'react'
import { HelmetProvider } from 'react-helmet-async';
import { ImportIcons, ImportPageStyle } from '../utils/ImportStylesheets';
import { Link, useNavigate } from 'react-router-dom';
import { LabelComponent, ButtonComponent, InputComponent, FormErrorComponent, ResponseErrorBannerComponent, ResponseSuccessBannerComponent } from '../components/FormComponents';
import { CreateVmValidator } from '../utils/FormValidators';
import useAxios from '../hooks/useAxios';

const CreateVmPage = () => {
    // Initial form values.
    const initialValues = { name: '', os: '', cpu_cores: '', memory: '', disk: '' }
    
    // State for the form values.
    const [formValues, setFormValues] = useState(initialValues);

    // State for setting if the form is ok for submission.
    const [isSubmit, setIsSubmit] = useState(false);

    // State for form validation errors.
    const [formErrors, setFormErrors] = useState({});

    // State for backend error response & backend success response.
    const [responseError, setResponseError] = useState(null);
    const [responseSuccess, setResponseSuccess] = useState(null);

    // Instantiate the axios interceptor.
    let api = useAxios();

    // Instantiate the useNavigate hook.
    const navigate = useNavigate();

    // Function for handling the input field changes inside the form.
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    // Function for handling the form submission.
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors(CreateVmValidator({values:formValues}));
        setIsSubmit(true);
    };

    useEffect(() => {
        // Function for creating a new virtual machine.
        const submitData = async () => {
            // If there is no form errors and isSubmit is true
            if (Object.keys(formErrors).length === 0 && isSubmit) {
                // Prepare post body.
                const body = {
                    'name': formValues.name,
                    'os': formValues.os,
                    'cpu_cores': parseInt(formValues.cpu_cores, 10),
                    'memory': parseInt(formValues.memory, 10),
                    'disk': `${formValues.disk}G`
                }

                try {
                    // Post the data to the backend.
                    const response = await api.post('api/vms', body);

                    // If response is 201
                    if (response.status === 201) {
                        // Set the response success message.
                        setResponseSuccess('Virtual machine created successfuly!. Redirecting to home...');

                        // Set the isSubmit to false to prevent the submitData function from running multiple times.
                        setIsSubmit(false);

                        // After 3 seconds return to home.
                        setTimeout(() => {
                            navigate('/');
                        }, 3000);
                    }
                } catch (error) {
                    // If there is an error set the response error.
                    console.log('Error creating a vm: ', error);
                    setResponseError('Error while creating the virtual machine!');
                }
            };
        };

        submitData();
    });

    return (
        <div>
            <HelmetProvider>
            <ImportIcons />    
            <ImportPageStyle css_file={'css/CreateVmPage.css'}/>
                <div className='container'>
                    <form onSubmit={handleSubmit}>
                        <header>Create a VM</header>

                        <ResponseSuccessBannerComponent response={responseSuccess} bannerType={'banner banner-success'}/>
                        <ResponseErrorBannerComponent response={responseError} bannerType={'banner banner-error'}/>

                        <div className='field-input'>
                            <LabelComponent label={'VM Name'}/>
                            <InputComponent
                                type={'text'}
                                name={'name'}
                                placeholder={'VM Name'}
                                onChange={handleChange}
                                formError={formErrors}
                                formErrorKey={'name'}
                            />
                            <FormErrorComponent error={formErrors} errorKey={'name'}/>
                        </div>

                        <div className='field-input'>
                            <LabelComponent label={'VM OS'}/>
                            <select name='os' onChange={handleChange} defaultValue={''} {...(formErrors['os'] ? { haserror: 'true' } : { haserror: 'false' })}>
                                <option value={''} disabled>Choose an OS</option>
                                <option value={'Linux'}>Linux</option>
                                <option value={'Ubuntu'}>Ubuntu</option>
                                <option value={'Windows'}>Windows</option>
                            </select>

                            <FormErrorComponent error={formErrors} errorKey='os'/>
                        </div>

                        <div className='field-input'>
                            <LabelComponent label={'CPU Cores'}/>
                            <InputComponent
                                type={'text'}
                                name={'cpu_cores'}
                                placeholder={'Number of CPU Cores'}
                                onChange={handleChange}
                                formError={formErrors}
                                formErrorKey={'cpu_cores'}
                            />
                            <FormErrorComponent error={formErrors} errorKey={'cpu_cores'}/>
                        </div>

                        <div className='field-input'>
                            <LabelComponent label={'VM Memory'}/>
                            <InputComponent
                                type={'text'}
                                name={'memory'}
                                placeholder={'Memory size (MiB)'}
                                onChange={handleChange}
                                formError={formErrors}
                                formErrorKey={'memory'}
                            />
                            <FormErrorComponent error={formErrors} errorKey={'memory'}/>
                        </div>

                        <div className='field-input'>
                            <LabelComponent label={'VM Disk'}/>
                            <InputComponent
                                type={'text'}
                                name={'disk'}
                                placeholder={'Disk size (GiB)'}
                                onChange={handleChange}
                                formError={formErrors}
                                formErrorKey={'disk'}
                            />
                            <FormErrorComponent error={formErrors} errorKey={'disk'}/>
                        </div>

                        <div className='column btn'>
                            <ButtonComponent text={'Create VM'} type={'submit'}/>

                            <div className='button cancel'>
                                <Link to={'/'}><button>Cancel</button></Link>
                            </div>
                        </div>
                    </form>
                </div>
            </HelmetProvider>
        </div>
    );
}

export default CreateVmPage
