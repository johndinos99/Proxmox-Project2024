import React from 'react'

const PageHeader = ({ username }) => {
    return (
        <div className='left-items'>
            <h2 className='username'>Welcome {username}</h2>
            <hr></hr>
            <h2 className='title'>My Virtual Machines</h2>
        </div>
    );
};

export default PageHeader;