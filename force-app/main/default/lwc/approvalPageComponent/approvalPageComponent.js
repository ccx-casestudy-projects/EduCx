import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getRecordsByTab from '@salesforce/apex/ApprovalRequestDetailsController.getRecordsByTab';
import approveRecords from '@salesforce/apex/ApprovalRequestDetailsController.approveRecords';
import rejectRecords from '@salesforce/apex/ApprovalRequestDetailsController.rejectRecords';
import noDueAttachment from '@salesforce/apex/ApprovalRequestDetailsController.noDueAttachment';
import updateApprovalStatus from '@salesforce/apex/ApprovalRequestDetailsController.updateApprovalStatus';
import updateRejectStatus from '@salesforce/apex/ApprovalRequestDetailsController.updateRejectStatus';
import getCertificateDownloadUrl from '@salesforce/apex/ApprovalRequestDetailsController.getCertificateDownloadUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class ApprovalPageComponent extends NavigationMixin(LightningElement) {
    @track records;
    @track copyRecords;
    @track selectedTabValue;
    @track selectedRowId;
    @track selectedRowData;
    @track selectedRequestRecords = [];
    @track selectedRecords = [];
    @track showDetails = false;
    @track value;
    @track radioValue = 'Student';
    @track isStudent = true;
    @track approvalrecid;
    @track currentPage = 1;
    pageSize = 8;
    @track totalPages = 0;
    @track paginatedRecords = [];
    @track isPrevDisabled = true;
    @track isNextDisabled = true;
    @track filterRecords = false;
    @track refreshResult;
    @track studentID;
    hallticketNo;
    documentType;

    get columns() {
        let columns = [
            { label: 'HallTicket No', fieldName: 'educx__Student_ID__r.educx__Hall_Ticket_No__c', apiName: 'educx__Student_ID__r.educx__Hall_Ticket_No__c', type: 'text' },
            { label: 'Admission Number', fieldName: 'educx__Student_ID__r.Name', apiName: 'educx__Student_ID__r.Name', type: 'text' },
            { label: 'Student Name', fieldName: 'educx__Student_ID__r.educx__Name_of_The_Candidate__c', apiName: 'educx__Student_ID__r.educx__Name_of_The_Candidate__c', type: 'text' },
            { label: 'Document Requested', fieldName: 'educx__Document_Type__c', type: 'Picklist' },
            { label: 'Submission Date', fieldName: 'CreatedDate', type: 'date' },
            { label: 'Approval Status', fieldName: 'educx__Status__c', type: 'Picklist' },
            {
                label: 'File', type: 'button-icon', typeAttributes: {
                    label: 'Preview', name: 'Preview', iconName: 'utility:attach',
                    variant: 'brand', disabled: { fieldName: 'hasContentDocument' }
                }, cellAttributes: { alignment: 'center' }
            },
            {
                label: 'Approve', type: 'button-icon', typeAttributes: {
                    label: 'Approve', name: 'Approve', iconName: 'utility:success',
                    variant: 'brand', disabled: { fieldName: 'isApproved' }
                }, cellAttributes: { alignment: 'center' }
            },
            {
                label: 'Reject', type: 'button-icon', typeAttributes: {
                    label: 'Reject', name: 'Reject', iconName: 'utility:error',
                    variant: 'brand', class: 'reject-button', disabled: { fieldName: 'isRejected' }
                }, cellAttributes: { alignment: 'center' }
            },
            {
                label: 'Download', type: 'button-icon', typeAttributes: {
                    label: 'Download', name: 'Download', iconName: 'utility:download',
                    variant: 'brand', disabled: { fieldName: 'isDownladable' }
                }, cellAttributes: { alignment: 'center' }
            }
        ];
        columns.forEach(column => {
            column.hideDefaultActions = true;
        });

        return columns;
    }

    get pendingRowCount() {
        if (this.records) {
            return this.records.filter(record => record.educx__Status__c === 'Pending').length;
        }
        return 0;
    }

    get ApprovedRowCount() {
        if (this.records) {
            return this.records.filter(record => record.educx__Status__c === 'Ready').length;
        }
        return 0;
    }

    get RejectedRowCount() {
        if (this.records) {
            return this.records.filter(record => record.educx__Status__c === 'Rejected').length;
        }
        return 0;
    }

    get AllRowCount() {
        if (this.records) {
            return this.records.length;
        }
        return 0;
    }

    get options() {
        return [
            { label: 'Student', value: 'Student' },
            { label: 'Employee', value: 'Employee' },
        ];
    }

    get filteredData() {
        return this.data.filter(record => record.educx__Status__c !== '');
    }

    handleRowSelection(event) {
        this.selectedRequestRecords = event.detail.selectedRows.map(row => row.Id);
        this.selectedRecords = event.detail.selectedRows;
    }


    handleTabChange(event) {
        this.selectedTabValue = event.target.value;
        console.log('selected Tab', this.selectedTabValue);
    }

    radioChange(event) {
        this.radioValue = event.detail.value;
        this.radioValue == 'Employee' ? this.isStudent = false : this.isStudent = true;
    }

    @wire(getRecordsByTab, { tabValue: '$selectedTabValue' })
        wiredRecords(result) {
           this.refreshResult = result; 
           if (result.data) {
           this.copyRecords = this.formatDataSet(result.data);
           this.records = this.copyRecords;
           this.updatePaginationInfo();
          }  else if (result.error) {
           console.error(result.error);
        }
    }

    handleApproveRecords() {
        const missingFieldsStudents = [];
        this.selectedRequestRecords.forEach(recordId => {
            const row = this.records.find(student => student.Id === recordId);
            if (row) {
                const missingFieldsMessage = this.checkMissingFields(row);
                if (missingFieldsMessage) {
                    missingFieldsStudents.push(missingFieldsMessage);
                }
            }
        });

        if (missingFieldsStudents.length > 0) {
            const missingStudentsMessage = `The following students have missing fields:\n\n${missingFieldsStudents.join('\n\n')}`;
            this.showToast('Error', missingStudentsMessage, 'error');
            return;
        }

        approveRecords({ recordIds: this.selectedRequestRecords })
            .then(result => {
                console.log('approve selectedRequestRecords', JSON.stringify(this.selectedRequestRecords));
                this.showToast('Success', 'Documents Approved Successfully', 'success');
                this.filterRecords = true;
                return this.refreshData();
            })
            .catch(error => {
                this.showToast('Error', 'Error in Approving Documents', 'error');
            });
    }

    handleRejectRecords() {
        rejectRecords({ recordIds: this.selectedRequestRecords })
            .then(result => {
                console.log('reject selectRequestRecords', JSON.stringify(this.selectedRequestRecords));
                this.showToast('Success', 'Documents Rejected Successfully', 'success');
                return this.refreshData();
            })
            .catch(error => {
                this.showToast('Error', 'Error rejecting documents', 'error');
            });
    }

    formatDataSet(data) {
        return data.map(audit => {
            const row = Object.assign({}, audit);
            row.hasContentDocument = !(audit.ContentDocumentLinks && audit.ContentDocumentLinks.length > 0);
            row.isApproved = (audit.educx__Status__c == 'Ready' || audit.educx__Status__c == 'Rejected');
            row.isRejected = (audit.educx__Status__c == 'Rejected' || audit.educx__Status__c == 'Ready');
            row.isDownladable = !(audit.educx__Status__c == 'Ready');
            console.log('row.isApproved', row.isApproved);
            console.log('row.hasContentDocument', row.hasContentDocument);
            this.filterRecords=false;
            this.columns.forEach(column => {
                if (!column.apiName) {
                    return;
                }
                const fieldName = column.fieldName;
                const apiFields = column.apiName.split('.');
                if (apiFields.length < 2) {
                    return;
                }
                const apiObject = apiFields[0];
                const apiField = apiFields[1];
                row[fieldName] = audit[apiObject] && audit[apiObject][apiField] ? audit[apiObject][apiField] : '';
            });
            return row;
        });
    }

    updatePaginationInfo() {
        this.totalPages = Math.ceil(this.records.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.records.length);
        this.paginatedRecords = this.records.slice(startIndex, endIndex);
        this.isPrevDisabled = this.currentPage === 1;
        this.isFirstPage = this.currentPage === 1;
        this.isLastPage = this.currentPage === this.totalPages;
        this.isNextDisabled = this.currentPage === this.totalPages;
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.updatePaginationInfo();
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
            this.updatePaginationInfo();
        }
    }

    handleFirstPage() {
        this.currentPage = 1;
        this.updatePaginationInfo();
    }

    handleLastPage() {
        this.currentPage = this.totalPages;
        this.updatePaginationInfo();
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.selectedRecords = row;
        console.log('selectedRecords', JSON.stringify(this.selectedRecords));
        this.studentID = row.educx__Student_ID__c;
        this.hallticketNo=row.educx__Student_ID__r.educx__Hall_Ticket_No__c;
        this.documentType=row.educx__Document_Type__c;
        this.selectedRowId = row.Id;
        this.selectedRowData = row;
        console.log('selected rowId', this.selectedRowId);
        console.log('selected rowData', JSON.stringify(row.educx__Student_ID__r.educx__Hall_Ticket_No__c));
        console.log('selected rowData', JSON.stringify(row.educx__Document_Type__c));
        switch (actionName) {
            case 'Preview':
                this.handlePreview(this.selectedRowId);
                break;
            case 'Approve':
                this.handleApproveRow(this.selectedRowId);
                break;
            case 'Reject':
                this.handleRejectRow(this.selectedRowId);
                break;
            case 'Download':
                this.handleDownload(this.studentID,this.hallticketNo,this.documentType);
                break;
        }
    }

    handlePreview(rowID) {
        noDueAttachment({ studentApproveId: rowID })
            .then(result => {
                console.log('result preview',JSON.stringify(result));
                this.previewHandler(result);
            })
            .catch(error => {
                console.error('error', error);
            });
    }

    previewHandler(previewDocId) {
        console.log('result',JSON.stringify(previewDocId));
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state: {
                selectedRecordId: previewDocId
            }
        });
    }

    checkMissingFields(row) {
    const missingFields = [];
    const studentName = row.educx__Student_ID__r.educx__Name_of_The_Candidate__c || `Student with ID: ${row.educx__Student_ID__c}`;
    if (!row.educx__Student_ID__r.Name) {
        missingFields.push('Admission No');
    }
    if (!row.educx__Student_ID__r.educx__Name_of_The_Candidate__c) {
        missingFields.push('Student Name');
    }
    if (!row.educx__Student_ID__r.educx__Name_of_The_Father__c) {
        missingFields.push('Father\'s Name');
    }
    if (!row.educx__Student_ID__r.educx__Course__c) {
        missingFields.push('Course');
    }
    if (!row.educx__Student_ID__r.educx__Current_Academic_Year__c) {
        missingFields.push('Academic Year');
    }
    if (!row.educx__Student_ID__r.educx__Hall_Ticket_No__c) {
        missingFields.push('Hall Ticket No');
    }
    if (!row.educx__Student_ID__r.educx__Date_of_Birth__c) {
        missingFields.push('Date of Birth');
    }
    if (!row.educx__Student_ID__r.educx__Caste__c) {
        missingFields.push('Caste');
    }
    if (!row.educx__Student_ID__r.educx__Religion__c) {
        missingFields.push('Religion');
    }
    if (!row.educx__Student_ID__r.educx__Nationality__c) {
        missingFields.push('Nationality');
    }
    return missingFields.length > 0 ? `${studentName}: ${missingFields.join(', ')}` : null;
}

    handleApproveRow(rowID) {
        const row = this.records.find(record => record.Id === rowID);
        if (row) {
        const missingFieldsMessage = this.checkMissingFields(row);
        if (missingFieldsMessage) {
            this.showToast('Error', `The following student has missing fields:\n\n${missingFieldsMessage}`, 'error');
            return; // Abort approval if there are missing fields
        }
    }

    updateApprovalStatus({ recId: rowID })
        .then(() => {
            this.showToast('Success', 'Document Approved Successfully', 'success');
            this.filterRecords = true;
            return refreshApex(this.refreshResult); // Auto-refresh data
        })
        .catch(error => {
            this.showToast('Error', 'Error in Approving Document', 'error');
            console.error('Error in Approving Document', error);
        });
    }

    handleRejectRow(rowID) {
    updateRejectStatus({ recId: rowID })
        .then(() => {
            this.showToast('Success', 'Document Rejected Successfully', 'success');
            return refreshApex(this.refreshResult); // Auto-refresh data
        })
        .catch(error => {
            this.showToast('Error', 'Error in Rejecting Document', 'error');
            console.error('Error in Rejecting Document', error);
        });
    }

    handleDownload(student,hallTicket,documentType) {
        getCertificateDownloadUrl({ recordId:student, hallTicketNo: hallTicket, docType: documentType })
            .then(data => {
                console.log('no due attachment', data);
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: data
                    }
                }, false);
            })
            .catch(error => {
                console.log('error', error);
            });
    }

    refreshData() {
        return refreshApex(this.refreshResult);
    }

    updateSearch(event) {
        const searchKey = event.target.value;
        const regex = new RegExp(searchKey, 'gi');
        this.records = this.copyRecords.filter(row => {
            const isMatch = regex.test(row.educx__Student_ID__r.educx__Hall_Ticket_No__c) ||
                regex.test(row.educx__Student_ID__r.Name) ||
                regex.test(row.educx__Student_ID__r.educx__Name_of_The_Candidate__c);
            return isMatch;
        });
        this.updatePaginationInfo();
        console.log('event search: ',event.detail.value);
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    renderedCallback() {
        if (this.template.querySelector('.edu-datatable')) {
            const style1 = document.createElement('style');
            style1.innerText = `
            .edu-datatable .slds-hint-parent .slds-grid .reject-button .slds-button {
                background-color: #ba0517;
                border: #ba0517 !important;
            }
            .edu-datatable .slds-hint-parent .slds-grid .reject-button .slds-button:disabled {
                background-color: #c9c9c9;
                border: #c9c9c9;
                cursor: not-allowed;!important;
            }
        `;
            this.template.querySelector('.edu-datatable').appendChild(style1);
        }
    }
}