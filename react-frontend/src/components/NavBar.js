import React, {useContext} from 'react'
import AuthContext from '../context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { toggleMenu } from '../utils/SubMenu';
import { Link } from 'react-router-dom';
import {ImportIcons, ImportPageStyle} from '../utils/ImportStylesheets';

// Navbar component
const NavBar = () => {
    let { user, logoutUser } = useContext(AuthContext);
    
    return (
        <HelmetProvider>
            <ImportIcons/>
            <ImportPageStyle css_file={'css/NavBar.css'}/>
            
            {user && (
                <nav className='nav-container'>
                    <Link className='create_vm' to={'/create-vm'}><button>Create VM</button></Link>
                    <ul className='nav-link'>
                        <li><Link to={'/'}>Home</Link></li>
                        <li><Link to={'/about'}>About</Link></li>
                    </ul>
                    <img src='images/user.png' alt='User Profile' className='user-pic' onClick={toggleMenu}/>
                    <div className='sub-menu-wrapper' id='subMenu'>
                        <div className='sub-menu'>
                            <div className='user-info'>
                                <img src='images/user.png' alt='User Profile'/>
                                <h3>{ user.username }</h3>
                            </div>
                            <hr></hr>

                            <Link to={`/profile/${user.username}`} className='sub-menu-link'>
                                <div className='icon-container'>
                                    <i className='edit-icon bx bxs-user bx-sm'></i>
                                </div>
                                <p>Edit Profile</p>
                                <span>{'>'}</span>
                            </Link>

                            <Link onClick={logoutUser} to={'#'} className='sub-menu-link'>
                                <div className='icon-container'>
                                    <i className='logout-icon bx bx-log-out bx-sm' ></i>
                                </div>
                                <p>Logout</p>
                                <span>{'>'}</span>
                            </Link>
                        </div>
                    </div>
                </nav> 
            )}
        </HelmetProvider>
    );
}

export default NavBar