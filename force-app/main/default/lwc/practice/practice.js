import { LightningElement, track } from 'lwc';
import uploadCSVFile from '@salesforce/apex/StudentController.uploadCSVFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Practicetest extends LightningElement {
    @track fileInput;

    handleUploadClick() {
        this.fileInput = this.template.querySelector('input[type="file"]');
        this.fileInput.click();
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            this.uploadFile(file);
        }
    }

    uploadFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const fileContents = reader.result;
            console.log('File Contents:', fileContents); // Log the file contents for debugging
            uploadCSVFile({ csvContent: fileContents })
                .then(result => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Accounts uploaded successfully!',
                            variant: 'success',
                        })
                    );
                })
                .catch(error => {
                    console.error('Error:', error); // Log the error for debugging
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error uploading accounts',
                            message: error.body.message,
                            variant: 'error',
                        })
                    );
                });
        };
        reader.readAsText(file);
    }
}