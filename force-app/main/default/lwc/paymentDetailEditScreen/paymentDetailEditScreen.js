import { LightningElement, api, track } from 'lwc';

export default class PaymentDetailEditScreen extends LightningElement {
    @api recordId;
    @api isModalOpen ; // Modal is open initially

    handleCloseModal() {
        this.isModalOpen = false; // Close the modal locally
        this.dispatchEvent(new CustomEvent('closemodal')); // Notify parent component
    }

    handleSuccess(event) {
        this.dispatchEvent(new CustomEvent('recordupdated')); // Notify parent component about success
        this.handleCloseModal(); // Close the modal after success
    }

    handleError(event) {
        console.error('Error updating record: ', event.detail.message);
    }
}