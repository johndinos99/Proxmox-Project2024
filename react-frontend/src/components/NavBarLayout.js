import React from 'react'
import { Outlet } from "react-router-dom";
import NavBar from './NavBar';

// Function for adding the navbar to pages.
const NavBarLayout = () => {
    return (
        <div>
            <NavBar/>
            <Outlet/>
        </div>
    );
};

export default NavBarLayout;