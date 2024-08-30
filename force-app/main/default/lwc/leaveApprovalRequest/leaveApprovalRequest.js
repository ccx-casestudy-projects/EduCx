import { LightningElement, wire, track } from 'lwc';
import getEmployeeLeaveDetails from '@salesforce/apex/EmployeeController.getEmployeeLeaveDetails';
import approveRecords from '@salesforce/apex/EmployeeController.approveRecords';
import rejectRecords from '@salesforce/apex/EmployeeController.rejectRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LeaveApprovalRequest extends LightningElement {
       @track leaveDetails = [];
    @track filteredLeaveDetails = [];
    @track searchKey = '';

    @track columns = [
        { label: 'Employee ID', fieldName: 'Name', type: 'text' },
        { label: 'Employee Name', fieldName: 'Employee_Name__c', type: 'text' },
        { label: 'Applied Date', fieldName: 'Applied_Date__c', type: 'date' },
        { label: 'From Date', fieldName: 'From_Date__c', type: 'date' },
        { label: 'To Date', fieldName: 'To_Date__c', type: 'date' },
        { label: 'Reason', fieldName: 'Reason__c', type: 'text' },
        { label: 'Leave Status', fieldName: 'Leave_Status__c', type: 'text' },
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
        }
    ];

    @wire(getEmployeeLeaveDetails)
    wiredLeaveDetails({ error, data }) {
        if (data) {
            this.leaveDetails = data.map(record => ({
                Id: record.Id,
                Name: record.educx__Employee__r.Name,
                Employee_Name__c: record.educx__Employee__r.educx__Employee_Name__c,
                From_Date__c: record.educx__From_Date__c,
                To_Date__c: record.educx__To_Date__c,
                Reason__c: record.educx__Reason__c,
                Applied_Date__c: record.educx__Applied_Date__c,
                Leave_Status__c: record.educx__Leave_Status__c
            }));
            this.filteredLeaveDetails = [...this.leaveDetails]; // Initial load
        } else if (error) {
            console.error('Error fetching leave details:', error);
        }
    }

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.filterRecords();
    }

    filterRecords() {
        if (this.leaveDetails && this.searchKey) {
            this.filteredLeaveDetails = this.leaveDetails.filter(record => 
                record.Name.toLowerCase().includes(this.searchKey) ||
                record.Leave_Status__c.toLowerCase().includes(this.searchKey) ||
                record.Reason__c.toLowerCase().includes(this.searchKey) ||
                record.Employee_Name__c.toLowerCase().includes(this.searchKey)
            );
        } else {
            this.filteredLeaveDetails = [...this.leaveDetails];
        }
    }

    handleApproveRow(rowID) {
        approveRecords({ recordIds: rowID })
            .then(result => {
                this.showToast('Success', 'Leave Request Approved Successfully', 'success');
                this.filterRecords(); // Update the view after approval
            })
            .catch(error => {
                this.showToast('Error', 'Error in Approving Documents', 'error');
            });
    }

    handleRejectRow(rowID) {
        rejectRecords({ recordIds: rowID })
            .then(result => {
                this.showToast('Success', 'Leave Request is Rejected', 'success');
                this.filterRecords(); // Update the view after rejection
            })
            .catch(error => {
                this.showToast('Error', 'Error rejecting documents', 'error');
            });
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.selectedRowId = row.Id;
        this.selectedRowData = row;

        switch (actionName) {
            case 'Approve':
                this.handleApproveRow(this.selectedRowId);
                break;
            case 'Reject':
                this.handleRejectRow(this.selectedRowId);
                break;
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    get pendingRowCount() {
        return this.leaveDetails.filter(record => record.Leave_Status__c === 'Pending').length;
    }

    get ApprovedRowCount() {
        return this.leaveDetails.filter(record => record.Leave_Status__c === 'Approved').length;
    }

    get RejectedRowCount() {
        return this.leaveDetails.filter(record => record.Leave_Status__c === 'Rejected').length;
    }

    get AllRowCount() {
        return this.leaveDetails.length;
    }
     handleTabChange(event) {
        this.selectedTabValue = event.target.value;
    }
}