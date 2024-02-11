import React from 'react'
import { Link } from 'react-router-dom';

const EmptyMessage = () => {
    return (
        <div className='main-body'>
            <div className='empty-message-container'>
                <div className='empty-message-content'>
                    <h1>No Virtual Machines found!</h1>
                    <p>Looks like you dont have a VM. Click the button to create one</p>
                    <div className='button'>
                        <Link to={'/create-vm'}><button type='submit'>Create VM</button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyMessage