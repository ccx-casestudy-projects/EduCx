import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ToastMessage extends LightningElement {
    @api showToast(title, message, variant, mode = 'dismissable') {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode, // 'dismissable', 'pester', 'sticky'
        });
        this.dispatchEvent(event);
    }
}