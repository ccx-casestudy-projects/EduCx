import { LightningElement, api } from 'lwc';
import uploadFileToRecord from '@salesforce/apex/FileUploadController.uploadFileToRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class FileUploadAttach extends LightningElement {

    @api recordId; // Record ID to which the file should be attached
    @api fileName; // Name of the file to be uploaded
    @api base64Data; // Base64 data of the file

    connectedCallback() {
        this.uploadFile();
    }

    @api
    uploadFile() {
      
        uploadFileToRecord({ base64Data: this.base64Data, fileName: this.fileName, recordId: this.recordId })
            .then(result => {
                if (result === 'ok') {
                    this.dispatchEvent(new CustomEvent('ok'));
                    
                }
               
            })
            .catch(error => {
              
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to upload file',
                        variant: 'error'
                    })
                );
                console.error('Failed to upload file', error);
            });
    }
}