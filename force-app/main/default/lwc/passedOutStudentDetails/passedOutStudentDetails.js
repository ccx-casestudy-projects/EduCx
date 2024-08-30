import { LightningElement, track, wire } from 'lwc';
import getPassedOutStudents from '@salesforce/apex/DisplayPaymentDetails.getPassedOutStudentAndAcademicYearDetails';
import getAcademicYearPicklistValues from '@salesforce/apex/StudentController.getAcademicYearPicklistValues';
import { refreshApex } from '@salesforce/apex';

const PAGE_SIZE = 10; // Adjust page size as needed

export default class PassedOutStudentDetails extends LightningElement {

    @track academicYearOptions = [];
    @track selectedAcademicYear = 'None'; // Set default value to 'None'
    @track searchKey = '';
    @track students = [];
    @track pageNumber = 1;
    @track totalPages = 0;
    @track recordsToDisplay = [];
    @track totalRecords = 0;
    wiredStudentData;

    columnsList = [
        { id: '1', label: 'Acadmeic Year', fieldName: 'educx__Current_Academic_Year__c', type: 'text', hideDefaultActions: true },
        { id: '2', label: 'Course', fieldName: 'educx__Course__c', type: 'text', hideDefaultActions: true },
       //{ id: '2', label: 'Year', fieldName: 'educx__Year__c', type: 'text', hideDefaultActions: true },
       //{ id: '3', label: 'Semester', fieldName: 'educx__Semester__c', type: 'text', hideDefaultActions: true },
        { id: '3', label: 'Hall Ticket No', fieldName: 'educx__Hall_Ticket_No__c', type: 'text', hideDefaultActions: true },
        { id: '4', label: 'Student Name', fieldName: 'educx__Name_of_The_Candidate__c', type: 'text', hideDefaultActions: true },
        { id: '5', label: 'Email', fieldName: 'educx__Email__c', type: 'email', hideDefaultActions: true },
        { id: '6', label: 'Phone', fieldName: 'educx__Phone_Number__c', type: 'text', hideDefaultActions: true },
       
        { id: '7', label: 'Status', fieldName: 'educx__Status__c', type: 'text', hideDefaultActions: true },
        {
            type: "button-icon", initialWidth: 1,
            typeAttributes: { name: "edit", variant: "brand", iconName: "action:edit" }
        },
    ];

    @track selectedStudentId;
    @track editPage = false;

    //edit icon action
    handleRowAction(event) {
        this.selectedStudentId = event.detail.row.Id;
        const actionName = event.detail.action.name;
            if (actionName === 'edit') {
                this.editPage = true;
            }
    }

    //to refresh records from child after update
    handlePreviewClose(event){
        this.editPage=false;
        refreshApex(this.wiredStudentData);
    }

    //getting academic year picklist values
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


    //getting data from apex
    @wire(getPassedOutStudents)
    wiredStudents(result) {
        this.wiredStudentData = result;
        if (result.data) {
            this.students = result.data;
            this.totalRecords = this.students.length;
            this.totalPages = Math.ceil(this.totalRecords / PAGE_SIZE);
            this.filterRecords(); // Filter records after fetching
        } else if (result.error) {
            console.error('Error fetching students:', result.error);
        }
    }

    //get search key from ui
    handleSearchChange(event) {
        this.searchKey = event.target.value;
        this.pageNumber = 1; // Reset to first page on search change
        this.filterRecords();
    }

    //get academic year from ui
    handleAcademicYearChange(event) {
        this.selectedAcademicYear = event.detail.value;
        this.pageNumber = 1; // Reset to first page on academic year change
        this.filterRecords();
    }

    //fitering records based on search
    filterRecords() {
        const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const escapedSearchKey = escapeRegExp(this.searchKey);
        // Filter students based on search key and selected academic year
        let filteredStudents = this.students.filter(student => {
            const matchesSearch = new RegExp(escapedSearchKey, 'i').test(student.educx__Name_of_The_Candidate__c) ||
                              new RegExp(escapedSearchKey, 'i').test(student.educx__Hall_Ticket_No__c);
            const matchesAcademicYear = this.selectedAcademicYear === 'None' || student.educx__Current_Academic_Year__c === this.selectedAcademicYear;
            return matchesSearch && matchesAcademicYear;
        });
        
        this.totalRecords = filteredStudents.length;
        this.totalPages = Math.ceil(this.totalRecords / PAGE_SIZE);
        this.updateRecordsToDisplay(filteredStudents);
    }

    //update data table page records
    updateRecordsToDisplay(filteredStudents) {
        const start = (this.pageNumber - 1) * PAGE_SIZE;
        const end = this.pageNumber * PAGE_SIZE;
        this.recordsToDisplay = filteredStudents.slice(start, end);
    }

    //pagination code
    previousPage() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.filterRecords();
        }
    }

    nextPage() {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.filterRecords();
        }
    }

    firstPage() {
        this.pageNumber = 1;
        this.filterRecords();
    }

    lastPage() {
        this.pageNumber = this.totalPages;
        this.filterRecords();
    }

    get bDisableFirst() {
        return this.pageNumber === 1;
    }

    get bDisableLast() {
        return this.pageNumber === this.totalPages;
    }
}