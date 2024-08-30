import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import STATUS_FIELD from '@salesforce/schema/Book__c.Status__c';
import OVERDUE_FIELD from '@salesforce/schema/Book_Issue_and_Returns__c.OverDue_By__c';
import DATE_OF_ISSUE_FIELD from '@salesforce/schema/Book_Issue_and_Returns__c.Date_of_Issue__c';
import RETURNED_DATE_FIELD from '@salesforce/schema/Book_Issue_and_Returns__c.Date_of_Return__c';

export default class BorrowBook extends LightningElement {
    candidateValue = '';
    

    handleCandidateChange(event) {
        this.candidateValue = event.target.value;
    }

    handleSuccess(event) {
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Borrowed Record created with ID: ' + event.detail.id,
            variant: 'success',
        });
        this.dispatchEvent(toastEvent);

        // Get the Book ID from the created record
        const bookId = event.detail.id;

        // Get field values from the event detail
        const dateOfIssue = event.detail.fields[DATE_OF_ISSUE_FIELD.fieldApiName].value;
        const overdue = event.detail.fields[OVERDUE_FIELD.fieldApiName].value;
        const returnedDate = event.detail.fields[RETURNED_DATE_FIELD.fieldApiName].value;

        // Create an object with the fields to update
        const fields = {};
        fields.Id = bookId;

        // Determine the status based on conditions
        if (dateOfIssue) {
            fields[STATUS_FIELD.fieldApiName] = 'Issued';  // Update status to 'Issued' if Date of Issue is set
        } else if (overdue > 0) {
            fields[STATUS_FIELD.fieldApiName] = 'Not Returned';  // Update status to 'Not Returned' if overdue > 0
        } else if (returnedDate) {
            fields[STATUS_FIELD.fieldApiName] = 'In Stock';  // Update status to 'In Stock' if returnedDate is set
        }

        const recordInput = { fields };

        // Update the book record
        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Book status updated successfully',
                        variant: 'success',
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating book status',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    }

    get isEmployeeSelected() {
        return this.candidateValue === 'Employee';
    }

    get isStudentSelected() {
        return this.candidateValue === 'Student';
    }
}