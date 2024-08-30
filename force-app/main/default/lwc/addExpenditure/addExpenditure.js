import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
 
export default class AddExpenditure extends LightningElement {
    @api newEmp = false;
    empObject = 'educx__Expenditure__c';
 
    closeModal()
     {
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
    }
 
    handleSuccess(event) {
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Employee Record created with ID: ' + event.detail.id,
            variant: 'success',
        });
        this.dispatchEvent(toastEvent);
        this.closeModal();
        return refreshApex(this.refreshResult);
    }
}