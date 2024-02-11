import React, { useEffect, useContext, useState, useRef } from 'react'
import { HelmetProvider } from 'react-helmet-async';
import AuthContext from '../context/AuthContext';
import useAxios from '../hooks/useAxios';
import { VmTableBody, VmTableHeader } from '../components/VmComponents';
import PageHeader from '../components/PageHeader';
import EmptyMessage from '../components/EmptyMessage';
import { ImportIcons, ImportPageStyle } from '../utils/ImportStylesheets';

const HomePage = () => {
    // Getting details from the jwt token.
    let { user } = useContext(AuthContext);

    // Instantiate the axios interceptor.
    let api = useAxios();

    // Getting the value of search input using useRef.
    const searchRef = useRef(null);

    // State for loading the virtual machines from the backend.
    let [vms, setVMs] = useState([]);

    // State for the search bar input.
    const [searchInput, setSearchInput] = useState('');

    // Function for handling the input changes of the searchbar.
    const handleSearchInputChange = () => {
        const value = searchRef.current.value;
        setSearchInput(value);
    };

    // Function for handling the clear icon click.
    const handleSearchClearClick = () => {
        setSearchInput('');
        searchRef.current.value = '';
        searchRef.current.focus();
    };

    // Function for handling the start vm click.
    const handleStartVMClick = async (vmid) => {
        try {
            // Send the start request to the api.
            const response = await api.post(`api/vms/vm/${vmid}/action/start`);

            // If the response is 200
            if (response.status === 200) {
                // Alert the user.
                alert('VM started successfully!');

                // Set the virtual machine status to 'Running'.
                setVMs((prevData) =>
                    prevData.map((obj) =>
                        obj.vmid === vmid ? { ...obj, status: 'Running' } : obj
                    )
                );
            }

        } catch (error) {
            // If the response is 400
            if (error.response.status === 400) {
                // Alert the user.
                alert('VM is already running!');
            }
        }
    };

    // Function for handling the stop vm click.
    const handleStopVMClick = async (vmid) => {
        try {
            // Send the stop request to the api.
            const response = await api.post(`api/vms/vm/${vmid}/action/stop`);

            // If the response is 200
            if (response.status === 200) {
                // Alert the user.
                alert('VM stopped successfully!');

                // Set the virtual machine status to 'Stopped'.
                setVMs((prevData) =>
                    prevData.map((obj) =>
                        obj.vmid === vmid ? { ...obj, status: 'Stopped' } : obj
                    )
                );
            }

        } catch (error) {
            // If the response is 400
            if (error.response.status === 400) {
                // Alert the user.
                alert('VM is already stopped!');
            }
        }
    };

    // Function for handling the delete vm click.
    const handleDeleteVMClick = async (vmid) => {
        try {
            // Send the delete request to the api.
            const response = await api.delete(`api/vms/vm/${vmid}`);

            // If the response is 200
            if (response.status === 200) {
                // Alert the user.
                alert('VM deleted successfully!');

                // Refresh the page
                window.location.reload(); 
            }

        } catch (error) {
            // If there is an error, alert the user.
            alert('Error while deleting the VM!');
        }
    }

    useEffect(() => {
        // Function for retrieving user virtual machines.
        const getVms = async () => {
            try {
                const response = await api.get(`api/vms/vm/${user.username}`);

                // If the response is 200
                if (response.status === 200) {
                    const result = response.data.data;
                    // Set the state with the result from the backend.
                    setVMs(result);
                }

            } catch (error) {
                console.log(error);
            }
        }
        getVms();
    // eslint-disable-next-line
    }, []);

    return (
        <HelmetProvider>
            <ImportPageStyle css_file={'css/HomePage.css'} />
            <ImportIcons />
            <div className='container'>
                <div className='header-row'>
                    <PageHeader username={user.username}/>

                    <div className='right-items'>
                        <div className='search-container'>
                            <div className='search-input-container'>
                                <i className='search-icon bx bx-search bx-xs' ></i>
                                <input className='search-input' type='text' placeholder='Search for a VM' ref={searchRef} onChange={handleSearchInputChange}/>
                                <div className='search-clear-icon'>
                                    {searchInput && (<i className='clear-icon bx bx-x bx-xs' onClick={handleSearchClearClick}></i>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {vms && vms.length > 0 ? (
                    <div className='main-body'>
                        <div className='table-container'>
                            <div className='table-content'>
                                <table>
                                    <VmTableHeader/>
                                    <VmTableBody
                                        vms={vms}
                                        search={searchInput}
                                        axiosInstance={api}
                                        onStartVMClick={handleStartVMClick}
                                        onStopVMClick={handleStopVMClick}
                                        onDeleteVMClick={handleDeleteVMClick}
                                    />
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <EmptyMessage/>
                )}
            </div>
        </HelmetProvider>
    );
}

export default HomePage;