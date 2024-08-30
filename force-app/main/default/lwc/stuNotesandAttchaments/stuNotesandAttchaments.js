// stuNotesandAttachments.js
import { LightningElement,track, api, wire } from 'lwc';
import getStudentFiles from '@salesforce/apex/BookController.getStudentFiles';
import { NavigationMixin } from 'lightning/navigation';

export default class StuNotesandAttachments extends NavigationMixin(LightningElement) {
    @track recordId;
    files;
    previewFileId;
    error;

    // @wire(getStudentFiles, { studentId: '$recordId' })
    // wiredFiles({ error, data }) {
    //     if (data) {
    //         this.files = data.map(file => ({
    //             id: file.ContentDocumentId,
    //             title: file.ContentDocument.Title,
    //             fileType: file.ContentDocument.FileType,
    //             contentSize: file.ContentDocument.ContentSize,
    //             downloadUrl: `/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`
    //         }));
    //         this.error = undefined;
    //     } else if (error) {
    //         this.error = error;
    //         this.files = undefined;
    //     }
    // }
    connectedCallback() {
        this.recordId=sessionStorage.getItem('Id');
        getStudentFiles({studentId: this.recordId})
        .then((result) => {
            console.log('result :'+result);
             this.files = result.map(file => ({
                id: file.ContentDocumentId,
                title: file.ContentDocument.Title,
                fileType: file.ContentDocument.FileType,
                contentSize: file.ContentDocument.ContentSize,
                downloadUrl: `/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`
            }));
        }).catch((error) => {
            console.log('Error :'+error);
            this.error = error;
            this.files = undefined;
        });
    }

    handleDownload(event) {
        const fileId = event.target.value;
        const file = this.files.find(file => file.id === fileId);
        window.open(file.downloadUrl, '_blank');
    }

    handlePreview(event) {
        const contentDocumentId = event.target.value;
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state: {
                selectedRecordId: contentDocumentId
            }
        });
    }

    closePreview() {
        this.previewFileId = null;
    }
}