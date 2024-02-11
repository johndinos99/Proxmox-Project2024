import React from 'react'
import { FaWindows, FaUbuntu, FaLinux } from "react-icons/fa";
import { FaPlay, FaStop, FaTerminal, FaXmark } from "react-icons/fa6";

export const VmOsIcon = ({ vm }) => {
    if (vm.os === 'Windows') {
        return (
            <td>
                <div className='os'>
                    <FaWindows className='fa-icon os-icon' />
                    <span>{vm.os}</span>
                </div>
            </td>
        );
    } else if (vm.os === 'Ubuntu') {
        return (
            <td>
                <div className='os'>
                    <FaUbuntu className='fa-icon os-icon' />
                    <span>{vm.os}</span>
                </div>
            </td>
        );
    } else if (vm.os === 'Linux') {
        return (
            <td>
                <div className='os'>
                    <FaLinux className='fa-icon os-icon' />
                    <span>{vm.os}</span>
                </div>
            </td>
        );
    } else {
        return (
            <td>
                <div className='os'>
                    <span>{vm.os}</span>
                </div>
            </td>
        );
    }
};

export const VmStatus = ({ vm }) => {
    if (vm.status === 'Running') {
        return (
            <td>
                <p className='status status-running'>{vm.status}</p>
            </td>
        );
    } else {
        return (
            <td>
                <p className='status status-stopped'>{vm.status}</p>
            </td>
        );
    }
};

export const VMActions = ({ onStartVMClick, onStopVMClick, onDeleteVMClick, vm, axiosInstance }) => {
    // Function for retrieving the SPICE config from the backend and download the .vv file (virt connection config).
    const vmView = async () => {
        const vmid = vm.vmid;
        const status = vm.status

        function downloadFile(vmid, data) {
            const blob = new Blob([data]);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${vmid}.vv`;
            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
        };

        try {
            const response = await axiosInstance.get(`api/vms/vm/${vmid}/console`);

            if (response.status === 200) {
                downloadFile(vmid, response.data);
            }
        } catch (error) {
            if (status === 'Stopped') {
                alert('VM must be running to access the console.');
            } else {
                alert('VM console is not available.');
            }
        }
    };

    return (
        <td>
            <div className='actions'>
                <FaPlay
                    className='fa-icon action-icon'
                    title='Start VM'
                    onClick={() => onStartVMClick(vm.vmid)}
                />
                <FaStop
                    className='fa-icon action-icon'
                    title='Stop VM'
                    onClick={() => onStopVMClick(vm.vmid)}
                />
                <FaTerminal
                    className='fa-icon action-icon'
                    title='View VM'
                    onClick={vmView}
                />
                <FaXmark
                    className='fa-icon action-icon'
                    title='Delete VM'
                    onClick={() => onDeleteVMClick(vm.vmid)}
                />
            </div>
        </td>
    );
}

export const VmTableBody = ({ vms, search, onStartVMClick, onStopVMClick, onDeleteVMClick, axiosInstance }) => {
    return (
        <>
            <tbody>
                {vms.filter((item) => {
                    return search.toLowerCase() === '' ? item : item.name.toLowerCase().includes(search);
                }).map((vm, index) => (
                    <tr key={index}>
                        <td>{vm.name}</td>
                        <td>{vm.vmid}</td>
                        <VmOsIcon vm={vm} />
                        <VmStatus vm={vm} />
                        <td>{new Date(vm.expire * 1000).toLocaleDateString('en-CA', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}</td>
                        <VMActions axiosInstance={axiosInstance} vm={vm} onStartVMClick={onStartVMClick} onStopVMClick={onStopVMClick} onDeleteVMClick={onDeleteVMClick} />
                    </tr>
                ))}
            </tbody>
        </>    
    );
};

export const VmTableHeader = () => {
    return (
        <>
            <thead>
                <tr>
                    <th>VM Name</th>
                    <th>VM Id</th>
                    <th>OS</th>
                    <th>VM Status</th>
                    <th>Expiration Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
        </>
    );
};