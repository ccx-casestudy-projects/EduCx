import { LightningElement, api, wire } from 'lwc';
import editRecordsRefresh from '@salesforce/apex/EmployeeController.displayEmployeeRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class EditEmployee extends LightningElement {
    @api crecordId;
    showEditScreen = false;
    refreshResult;

    @api show() {
        this.showEditScreen = true;
    }

    closeModal() {
        this.showEditScreen = false;
    }

    @wire(editRecordsRefresh)
    getData(result) {
        this.refreshResult = result;
    }

    handleSuccess() {
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Employee Record updated successfully.',
            variant: 'success',
        });
        this.dispatchEvent(toastEvent);
        this.closeModal();
        return refreshApex(this.refreshResult);
    }

    handleError(event) {
        let errorMessage = 'An error occurred while updating the record. Please check required fields.';
        if (event.detail && event.detail.output && event.detail.output.errors) {
            errorMessage = event.detail.output.errors.map(error => error.message).join(', ');
        }
        const toastEvent = new ShowToastEvent({
            title: 'Error',
            message: errorMessage,
            variant: 'error',
        });
        this.dispatchEvent(toastEvent);
    }
}