import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AddBooks extends LightningElement {
    @track copies = 1;

    handleCopiesChange(event) {
        this.copies = parseInt(event.target.value, 10) || 1;
    }

    handleCreateBooks() {
        const fields = {
            'educx__Title_of_the_book__c': this.template.querySelector('[data-field="educx__Title_of_the_book__c"]').value,
            'educx__Author__c': this.template.querySelector('[data-field="educx__Author__c"]').value,
            'educx__Edition__c': this.template.querySelector('[data-field="educx__Edition__c"]').value,
            'educx__Date_of_purchase__c': this.template.querySelector('[data-field="educx__Date_of_purchase__c"]').value,
            'educx__Price__c': this.template.querySelector('[data-field="educx__Price__c"]').value
        };

        const promises = [];
        for (let i = 0; i < this.copies; i++) {
            promises.push(createRecord({ apiName: 'educx__Book__c', fields }));
        }

        Promise.all(promises)
            .then(results => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `${results.length} book(s) created successfully`,
                        variant: 'success'
                    })
                );
                // Optionally, reset form fields or perform other actions upon success
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating books',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }
}