import React, { useState } from 'react'

// Show-hide password toggle hook.
const usePasswordToggle = () => {
    const [visible, setVisibility] = useState(false)

    const Icon = (
        visible
            ? <i className='bx bx-hide' onClick={() => setVisibility(!visible)}></i>
            : <i className='bx bx-show' onClick={() => setVisibility(!visible)}></i>
    );

    const InputType = visible ? 'text' : 'password';

    return [InputType, Icon];
}

export default usePasswordToggle