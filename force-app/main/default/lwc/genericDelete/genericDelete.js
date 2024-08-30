import { LightningElement,api } from 'lwc';
import LightningConfirm from "lightning/confirm";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
export default class GenericDelete extends LightningElement {
    @api recordIds;
    @api defaultMessage='Are you sure you want to delete this?'
    connectedCallback(){
        this.handleConfirmClick();
    }
    async handleConfirmClick() {
       
        const result = await LightningConfirm.open({
            message: this.defaultMessage,
            variant: "default", // headerless
            label: "Confirm Delete",
        theme: "error"
        });

        if (result) {
          this.deleteRecords()
        } else {
            this.closeAction();
        }
    }
    closeAction(){
        const closeFormEvent = new CustomEvent('action');
        this.dispatchEvent(closeFormEvent);
    }
    async deleteRecords(event) {
        try {
            await deleteRecord(this.recordIds);
            this.template.querySelector('c-toast-message').showToast('Success', "Operation Success", "Success");
            this.closeAction();
    
        } catch (error) {
            this.template.querySelector('c-toast-message').showToast('Error', 'Failed to Delete: ' + error.body.message, 'error');
            this.closeAction();
        }
    }
    
    
}