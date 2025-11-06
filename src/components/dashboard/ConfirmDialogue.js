import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const ConfirmDialog = (props) => {
    const { message, accept, reject } = props;
    return (
        <Modal show={props.show} onHide={props.hideIt} size="lg" centered className="modal">
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
            <Button onClick={reject} className="model-button button-back">Reject</Button>
            <Button onClick={accept} className="model-button button-foreword">Accept</Button>
        </Modal.Footer>
        </Modal>
    );
};

export default ConfirmDialog;