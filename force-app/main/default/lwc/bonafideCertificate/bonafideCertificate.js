import { LightningElement, track, wire } from 'lwc';
import getStudentsByFilter from '@salesforce/apex/StudentController.getStudentsByFilter';
import getAcademicYearPicklistValues from '@salesforce/apex/StudentController.getAcademicYearPicklistValues';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
const PAGE_SIZE = 10;

export default class BonafideCertificate extends LightningElement {
    @track academicYearOptions = [];
   @track selectedAcademicYear = 'None'; // Set default value to 'None'
    @track searchKey = '';
    @track students = [];
    @track pageNumber = 1;
    @track totalPages = 0;
    @track recordsToDisplay = [];
    @track totalRecords = 0;
    @track wiredStudentData;

    columnsList = [
        { label: 'Admission No', fieldName: 'Name', type: 'text', hideDefaultActions: true },
        { label: 'Student Name', fieldName: 'educx__Name_of_The_Candidate__c', type: 'text', hideDefaultActions: true },
        { label: 'Hall Ticket No', fieldName: 'educx__Hall_Ticket_No__c', type: 'text', hideDefaultActions: true },
        { label: 'Email', fieldName: 'educx__Email__c', type: 'email', hideDefaultActions: true },
        { label: 'Phone', fieldName: 'educx__Phone_Number__c', type: 'text', hideDefaultActions: true },
        {
            type: "button-icon",initialWidth: 1,
            typeAttributes: {name: "edit",variant: "brand",iconName: "action:edit"}
        },
        {
            type: "button-icon",initialWidth: 1,
            typeAttributes: {name: "delete",variant: "brand",iconName: "action:delete"}
        },
        // {
        //     type: 'action',
        //     typeAttributes: {
        //         rowActions: [
        //             { label: 'Edit', name: 'edit', iconName: 'action:edit', variant: 'brand' },
        //             { label: 'Delete', name: 'delete', iconName: 'action:delete', variant: 'brand' }
        //         ]
        //     }
        // }
    ];

    @track selectedStudentId;
    @track previewDetails = false;
    @track previewClicked = false;

    handleRowAction(event) {
        this.selectedStudentId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        if (actionName === 'edit') {
            alert('edit');
            this.previewClicked = true;
        }
        if (actionName === 'delete') {
            alert('delete');
            this.handleDelete();
        }
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ 
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }

    async handleDelete() {
        const result = await LightningConfirm.open({
            variant: 'header',
            theme: 'error',
            label: 'Please Confirm !!!',
            message: 'Are You Sure ?? Do you really want to delete the record !!!',
        });
        if (result) {
            try {
                console.log('Attempting to delete record with ID:', this.selectedStudentId);
                await deleteRecord(this.selectedStudentId);
                this.showToast('Record Deleted Successfully.', '', 'success');
                console.log('Record deleted successfully.');

                // Refresh the data after successful deletion
                await refreshApex(this.wiredStudentData);
            } catch (error) {
                this.showToast('Error deleting record.', '', 'error');
                console.error('Error deleting student:', error);
            }
        }
    }

     @wire(getAcademicYearPicklistValues)
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.academicYearOptions = data.map(value => {
                return { label: value, value: value };
            });
        } else if (error) {
            console.error('Error fetching academic year picklist values:', error);
        }
    }
   
    @wire(getStudentsByFilter, { academicYear: '$selectedAcademicYear', searchKey:'$searchKey'})
    wiredStudents(result) {
        this.wiredStudentData = result;
        if (result.data) {
            this.students = result.data;
            this.totalRecords = this.students.length;
            this.totalPages = Math.ceil(this.totalRecords / PAGE_SIZE);
            this.updateRecordsToDisplay();
        } else if (result.error) {
            console.error('Error fetching students:', result.error);
        }
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;
        this.filterRecords();
    }

    handleAcademicYearChange(event) {
        this.selectedAcademicYear = event.detail.value;
        this.pageNumber = 1; // Reset to first page on academic year change
        this.filterRecords();
        this.updateRecordsToDisplay();
    }
    filterRecords() {
        // Trigger the wire method to re-fetch data with new parameters
        refreshApex(this.wiredStudentData);
        this.updateRecordsToDisplay();
    }

    updateRecordsToDisplay() {
        const start = (this.pageNumber - 1) * PAGE_SIZE;
        const end = this.pageNumber * PAGE_SIZE;
        this.recordsToDisplay = this.students.slice(start, end);
    }


    previousPage() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.updateRecordsToDisplay();
        }
    }

    nextPage() {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.updateRecordsToDisplay();
        }
    }

    firstPage() {
        this.pageNumber = 1;
        this.updateRecordsToDisplay();
    }

    lastPage() {
        this.pageNumber = this.totalPages;
        this.updateRecordsToDisplay();
    }

    get bDisableFirst() {
        return this.pageNumber === 1;
    }

    get bDisableLast() {
        return this.pageNumber === this.totalPages;
    }
    @track showRegForm=false;
    handleAddStudent(event){
        const modal=this.template.querySelector('c-student-registration');
        modal.showRegisterForm();
        this.showRegForm=true;
        alert(this.showRegForm);
    }
}