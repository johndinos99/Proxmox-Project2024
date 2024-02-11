// Form validator for the Signup page.
export const SignupValidator = ({ values }) => {
    const errors = {};

    if (!values.firstname) {
        errors.firstname = "First Name is required!";
    }

    if (!values.lastname) {
        errors.lastname = "Last Name is required!";
    }

    if (!values.username) {
        errors.username = "Username is required!";
    }

    if (!values.email) {
        errors.email = "Email is required!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = "Invalid email format!";
    }

    if (!values.password) {
        errors.password = "Password is required!"
    } else if ((values.password).length < 5 || (values.password).length > 10) {
        errors.password = "Password must be 5-10 characters!"
    }

    if (!values.confirm_password) {
        errors.confirm_password = "Confirm Password is required!"
    }

    if (values.password !== values.confirm_password) {
        errors.password = "Passwords don't match!"
        errors.confirm_password = "Passwords don't match!"
    }

    return errors
};

// Form validator for the Login page.
export const LoginValidator = ({ values }) => {
    const errors = {};

    if (!values.username) {
        errors.username = "Username is required!";
    }
    if (!values.password) {
        errors.password = "Password is required!"
    }

    return errors
};

// Form validator for the CreateVm page.
export const CreateVmValidator = ({ values }) => {
    const errors = {};

    if (!values.name) {
        errors.name = "Please provide a name for the VM!";
    }

    if (!values.os) {
        errors.os = "Please select an OS for the VM!";
    }

    if (!values.cpu_cores) {
        errors.cpu_cores = "Please provide the number of CPU cores!"
    } else if (/^[a-zA-Z]+$/.test(values.cpu_cores)) {
        errors.cpu_cores = "Field must contain only numbers!"
    } else if (!/[1-4]/.test(values.cpu_cores)) {
        errors.cpu_cores = "The maximum number of CPU cores is 4!"
    }

    if (!values.memory) {
        errors.memory = "Please provide the memory size in MiB!"
    } else if (/^[a-zA-Z]+$/.test(values.memory)) {
        errors.memory = "Field must contain only numbers!"
    }

    if (!values.disk) {
        errors.disk = "Please provide the disk size in GiB!"
    } else if (/^[a-zA-Z]+$/.test(values.disk)) {
        errors.disk = "Field must contain only numbers!"
    }

    return errors
};