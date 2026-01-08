"use client"
import { Modal } from '@mui/material';
import React, { useState } from 'react';
import Styles from './CustomModal.module.css';

const CustomModal = ({ children, content, open, onClose }) => {

    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalIsOpen;

    const handleOpen = () => {
        if (!isControlled) setInternalIsOpen(true);
    }

    const handleClose = () => {
        if (isControlled) {
            onClose && onClose();
        } else {
            setInternalIsOpen(false);
        }
    }

    const modifiedChildren = children ? React.cloneElement(children, {
        onClick: handleOpen
    }) : null;

    return (
        <>
            {modifiedChildren}
            <Modal open={isOpen} onClose={handleClose}>
                <div className={Styles.modalContent} onClick={(e) => handleClose()}>
                    <div onClick={(e) => e.stopPropagation()}>
                        {content}
                    </div>
                </div>
            </Modal >
        </>
    )
}

export default CustomModal