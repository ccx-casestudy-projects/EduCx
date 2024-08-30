import { LightningElement, api } from 'lwc';
import deleteContentDocument from '@salesforce/apex/OrganizationController.deleteContentDocument';
import { createRecord } from 'lightning/uiRecordApi';
import deleteDocument from '@salesforce/apex/OrganizationController.deleteDocument';


export default class EditDocument extends LightningElement {
    @api fileId;
    @api recordId;
    showSpinner=false;
    uploadedFiles = [];
    isFileChanged = false;
    handleUploadFinished(event) {
        this.uploadedFiles = [...event.detail.files];
        if (this.uploadedFiles.length > 0) {
            this.isFileChanged = true;
        }
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

    handleSuccess(event) {
        this.showSpinner=true;
        this.remId = event.detail.id;
        if (this.isFileChanged) {
            this.uploadFiles(this.uploadedFiles, this.remId);
        } else {
            this.template.querySelector('c-toast-message').showToast('Success', "Operation Success", "Success");
            this.closeForm();
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

            await Promise.all(contentDocumentLinkRecords.map(record => createRecord(record)));
            this.deleteDocument();
        } catch (error) {
            this.template.querySelector('c-toast-message').showToast('Error', 'Failed to save the record: ' + error.body.message, 'error');
            this.closeForm();
        }
    }

    closeForm() {
        this.showSpinner=false;
        const closeFormEvent = new CustomEvent('closeform');
        this.dispatchEvent(closeFormEvent);
    }

    async deleteDocument() { 
      const docId=this.fileId.toString();
      deleteDocument({ documentId: docId })
            .then((result) => {
                if(result=='success'){
                    this.template.querySelector('c-toast-message').showToast('Success', "Operation Success", "Success");
                    this.closeForm();
                }
                else{
                    this.template.querySelector('c-toast-message').showToast('Error', 'Failed to save the record: ', 'error');
            this.closeForm();
                }
            })
            .catch(error => {
                this.template.querySelector('c-toast-message').showToast('Error', error.body.message, 'error');
                this.closeForm();
            });
      
    }
}