import { LightningElement, api, track } from 'lwc';

export default class GenericModal extends LightningElement {
    @api headerId;
    @api contentId;
    @api headerText;
    @track isShowGenericModal = true;

    @api closeModal() {
        // Dispatch custom event to notify parent component to close the modal
        const closeModalEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeModalEvent);
        this.isShowGenericModal = false;
    }
}