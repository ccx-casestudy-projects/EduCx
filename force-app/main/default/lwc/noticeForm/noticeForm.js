import { LightningElement, api, track } from 'lwc';
import deleteContentDocument from '@salesforce/apex/GenericController.deleteContentDocument';
import { createRecord } from 'lightning/uiRecordApi';

export default class NoticeForm extends LightningElement {
    @api recordId;
    @api noticeType;
    @track uploadedFiles = [];
    @api hideSemister=false;
    handleSuccess(event) {
        this.remId = event.detail.id;
        this.uploadFiles(this.uploadedFiles, this.remId);

    }

    handleError(event) {
        this.template.querySelector('c-toast-message').showToast('Error', event.detail.message, 'error');
        this.closeForm();
    }



    closeForm() {
        const closeFormEvent = new CustomEvent('closeform');
        this.dispatchEvent(closeFormEvent);
    }

    handleUploadFinished(event) {
        this.uploadedFiles = [...event.detail.files];
    }

    async handleRemoveFile(event) {
        const documentId = event.currentTarget.dataset.documentId;
        try {
            await deleteContentDocument({ documentId });
            this.uploadedFiles = this.uploadedFiles.filter(file => file.documentId !== documentId);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    async uploadFiles(files, recordId) {
        try {
            const contentDocumentLinkRecords = files.map(file => ({
                apiName: 'ContentDocumentLink',
                fields: {
                    ContentDocumentId: file.documentId,
                    LinkedEntityId: recordId,
                    ShareType: 'V'
                }
            }));

            await Promise.all(contentDocumentLinkRecords.map(record =>
                createRecord(record)
            ));
            this.template.querySelector('c-toast-message').showToast('Success', "Operation Success", "Success");
            this.closeForm();
        } catch (error) {
            this.template.querySelector('c-toast-message').showToast('Error', 'Failed to save the record: ' + error.body.message, 'error');
            this.closeForm();
        } 
    }
   
}