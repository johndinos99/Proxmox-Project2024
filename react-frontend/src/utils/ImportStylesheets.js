import React from 'react'
import { Helmet } from 'react-helmet-async';

// Function for importing the boxicons CDN.
export const ImportIcons = () => {
    return (
        <Helmet>
            <link rel="stylesheet"
                href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' />
        </Helmet>
    );
};

// Function for importing the css stylesheet for a page.
export const ImportPageStyle = ({ css_file }) => {
    return (
        <Helmet>
            <link rel='stylesheet' href={css_file} />
        </Helmet>
    );
};