import { LightningElement,track,api,wire } from 'lwc';
import getExistingAttachments from '@salesforce/apex/StudentController.getExistingAttachments';
import { createRecord,deleteRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import getContentDocumentId from '@salesforce/apex/StudentController.getContentDocumentId'; 
import getContentDocumentLinks from '@salesforce/apex/StudentController.getContentDocumentLinks';
export default class Attachments extends NavigationMixin(LightningElement) {
    @api recordId;
    @track uploadedFiles = {};
    file;
    @track leftItems = [
        { id: 1, label: 'Rank Card:', filetype: 'rankCard', checkboxApiName: 'educx__Rank_Card__c' },
        { id: 2, label: 'Photo:', filetype: 'photo', checkboxApiName: 'educx__Photo__c' },
        { id: 3, label: 'SSC Memo:', filetype: 'sscMemo', checkboxApiName: 'educx__SSC_Memo__c' },
        { id: 4, label: 'Intermediate Memo:', filetype: 'intermediateMemo', checkboxApiName: 'educx__Intermediate_Memo__c' },
        { id: 5, label: 'Caste Certificate:', filetype: 'casteCertificate', checkboxApiName: 'educx__Caste_Certificate__c' },
        { id: 6, label: 'All Bonafides:', filetype: 'allBonafides', checkboxApiName: 'educx__All_Bonafides__c' }
    ];

    @track rightItems = [
        { id: 7, label: 'ICET Hall Ticket:', filetype: 'icetHallTicket', checkboxApiName: 'educx__Hall_Ticket__c' },
        { id: 8, label: 'Aadhar:', filetype: 'aadhar', checkboxApiName: 'educx__Aadhar_Card__c' },
        { id: 9, label: 'Transfer certificate (TC):', filetype: 'tc', checkboxApiName: 'educx__Tranfer_Certificate__c' },
        { id: 10, label: 'B.Tech / Degree Memo:', filetype: 'degreeMemo', checkboxApiName: 'educx__B_Tech_Degree_Memo__c' },
        { id: 11, label: 'Income Certificate:', filetype: 'incomeCertificate', checkboxApiName: 'educx__Income_Certificate__c' }
    ];
    wiredAttachmentsResult;

    @wire(getExistingAttachments, { StdId: '$recordId' })
    wiredAttachments(result) {
        this.wiredAttachmentsResult = result;
        if (result.data) {
            
            this.processAttachments(result.data);
            console.log('result',result.data);
        } else if (result.error) {
            console.error('Error retrieving existing files:', result.error);
             this.template.querySelector('c-toast-message').showToast('Error loading existing files', 'Error', 'error');
        }
    }
    processAttachments(attachments) {
        console.log('Attachments received:', attachments);
        
        if (Object.keys(attachments).length === 0) {
            console.warn('No attachments found.');
            return;
        }
        // Combine leftItems and rightItems
        const allItems = this.leftItems.concat(this.rightItems);

        allItems.forEach(item => {
            console.log('Processing item:', item);
            const formattedLabel = item.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            console.log('Formatted label:', formattedLabel);

            // Find the filename in attachments
            const fileName = Object.keys(attachments).find(name => {
                const formattedName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                return formattedName.includes(formattedLabel);
            });
            if (fileName) {
                console.log('Found fileName:', fileName);
                const contentDocumentId = attachments[fileName];
                this.uploadedFiles[item.id] = { fileName, contentDocumentId };
                // Update the UI with the existing file
                const fileNameSpan = this.template.querySelector(`[data-file-name-id="${item.id}"]`);
                if (fileNameSpan) {
                    fileNameSpan.textContent = fileName;
                }
            } else {
                console.warn('No matching file found for label:', item.label);
            }
        });
    }
   async uploadDocument({ fileName, recordId, base64Data, fileId }) {
    const fields = {
        Title: fileName,
        PathOnClient: fileName,
        VersionData: base64Data,
        FirstPublishLocationId: recordId
    };

    const recordInput = { apiName: 'ContentVersion', fields };

    try {
        // Check if there is already a file with the same name for this category
        const existingFile = this.uploadedFiles[fileId];

        if (existingFile) {
            // Delete the existing ContentDocumentLink and ContentDocument records
            await this.deleteExistingFile(existingFile.contentDocumentId);
            console.log('Deleted existing file with ContentDocumentId:', existingFile.contentDocumentId);
        }

        // Create the ContentVersion record for the new file
        const contentVersion = await createRecord(recordInput);
        const contentVersionId = contentVersion.id;

        // Fetch the ContentDocumentId using the contentVersionId
        const contentDocumentId = await getContentDocumentId({ contentVersionId });
        console.log('contentDocumentId: ' + contentDocumentId);

        // Store the ContentDocumentId for preview using fileId as key
        this.uploadedFiles[fileId] = { fileName, contentDocumentId };
        console.log('this.uploadedFiles: ' + JSON.stringify(this.uploadedFiles));

        // Update the UI with the newly uploaded file
        const fileNameSpan = this.template.querySelector(`[data-file-name-id="${fileId}"]`);
        if (fileNameSpan) {
            fileNameSpan.textContent = fileName;
        }

         this.template.querySelector('c-toast-message').showToast('Success', 'Document uploaded successfully.', 'success');

        // Refresh the wired data to ensure the latest attachments are loaded
        await refreshApex(this.wiredAttachmentsResult);

    } catch (error) {
        console.error('Error uploading document:', error);
            this.showToast('Error', 'Error uploading document. Check console for details.', 'error');
        }
    }
    async deleteExistingFile(contentDocumentId) {
        try {
            // Call the Apex method to retrieve ContentDocumentLink records
            const contentDocumentLinks = await getContentDocumentLinks({ contentDocumentId });

            if (contentDocumentLinks.length > 0) {
                console.log('Found ContentDocumentLinks to delete:', contentDocumentLinks);

                // Create an array of promises for deleting ContentDocumentLink records
                const deletePromises = contentDocumentLinks.map(link =>
                    deleteRecord(link.Id)
                        .then(() => {
                            console.log('Successfully deleted ContentDocumentLink with Id:', link.Id);
                        })
                        .catch(error => {
                            console.error('Error deleting ContentDocumentLink with Id:', link.Id, error.body ? error.body.message : error.message);
                        })
                );

                // Execute all delete operations concurrently and wait for them to complete
                await Promise.all(deletePromises);
                console.log('All ContentDocumentLink deletions attempted.');
            } else {
                console.log('No ContentDocumentLinks found for ContentDocumentId:', contentDocumentId);
            }

            // Attempt to delete the ContentDocument record
            try {
                await deleteRecord(contentDocumentId);
                console.log('Successfully deleted ContentDocument with Id:', contentDocumentId);
            } catch (docDeleteError) {
                console.error('Error deleting ContentDocument with Id:', contentDocumentId, docDeleteError.body ? docDeleteError.body.message : docDeleteError.message);
                throw docDeleteError; // Rethrow to handle it in the outer catch block
            }

            console.log('File deletion process completed.');

        } catch (error) {
            console.error('Error encountered during the deletion process:', error.body ? error.body.message : error.message);
        }
    }

   handleFileChange(event) {
    this.file = event.target.files[0];
    console.log('Selected file:', this.file);

    const checkboxApiName = event.target.dataset.checkboxApiName;
    const fileId = event.target.dataset.id;
    console.log('File ID:', fileId);

    if (this.file) {
        const label = this.leftItems.concat(this.rightItems).find(item => item.id == fileId).label;
        const extension = this.file.name.split('.').pop();

        let formattedLabel = label.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+$/, '');
        const renamedFileName = `${formattedLabel}.${extension}`;
        const maxSize = 75 * 1024; // 75KB

        if (this.file.size > maxSize) {
            this.template.querySelector(`[data-file-size-error-id="${fileId}"]`).textContent = 'Maximum file size is 75KB';
            event.target.value = '';
            this.file = null;
            return;
        } else {
            this.template.querySelector(`[data-file-size-error-id="${fileId}"]`).textContent = '';

            this.template.querySelector(`[data-file-name-id="${fileId}"]`).textContent = renamedFileName;

            let reader = new FileReader();
            reader.onloadend = () => {
                let base64Data = reader.result.split(',')[1];
                const data = {
                    fileName: renamedFileName,
                    recordId: this.recordId,
                    base64Data: base64Data,
                    fileId: fileId // Ensure fileId is included
                };

                this.uploadDocument(data);
            };
            reader.readAsDataURL(this.file);
         }
        } else {
             this.template.querySelector('c-toast-message').showToast('Please choose a file to upload', 'Error', 'error');
        }
    }


    handlePreviewClick(event) {
        const fileId = event.target.dataset.id;
        console.log('Preview file ID:', fileId);
        console.log('Uploaded Files:', this.uploadedFiles);

        if (fileId && this.uploadedFiles[fileId] && this.uploadedFiles[fileId].contentDocumentId) {
            const contentDocumentId = this.uploadedFiles[fileId].contentDocumentId;
            console.log('ContentDocumentId for preview:', contentDocumentId);

            // Navigate to the file preview page
            this[NavigationMixin.Navigate]({
                type: 'standard__namedPage',
                attributes: {
                    pageName: 'filePreview'
                },
                state: {
                    selectedRecordId: contentDocumentId
                }
            });
        } else {
             this.template.querySelector('c-toast-message').showToast('Error', 'Please upload a file to preview.', 'error');
        }
    }
}