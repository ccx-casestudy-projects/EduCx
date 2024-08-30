import { LightningElement, track, wire } from 'lwc';
import getStudentsByAcademicYear from '@salesforce/apex/StudentController.getStudentsByAcademicYear';
import getAcademicYearPicklistValues from '@salesforce/apex/StudentController.getAcademicYearPicklistValues';
import uploadCSVFile from '@salesforce/apex/StudentController.uploadCSVFile';
import LightningConfirm from 'lightning/confirm';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

export default class DisplayStudentsInAY extends LightningElement {
    @track academicYearOptions = [];
    @track selectedAcademicYear = 'None'; // Set default value to 'None'
    @track searchKey = '';
    @track students = [];
    @track filteredStudents = [];
    @track recordsToDisplay = [];
    wiredStudentData;
    @track currentPage = 1;
    pageSize = 10;
    @track totalPages = 0;
    @track isPrevDisabled = true;
    @track isNextDisabled = true;

    columnsList = [
        { id: '1',label: 'Course', fieldName: 'educx__Course__c', type: 'text', hideDefaultActions: true,initialWidth:80 },
        { id: '2',label: 'Year', fieldName: 'educx__Year__c', type: 'text', hideDefaultActions: true ,initialWidth:70},
        { id: '3',label: 'Sem', fieldName: 'educx__Semester__c', type: 'text', hideDefaultActions: true,initialWidth:60 },
        { id: '4',label: 'Hall Ticket No', fieldName: 'educx__Hall_Ticket_No__c', type: 'text', hideDefaultActions: true },
        { id: '5',label: 'Student Name', fieldName: 'educx__Name_of_The_Candidate__c', type: 'text', hideDefaultActions: true },
        { id: '6',label: 'Email', fieldName: 'educx__Email__c', type: 'email', hideDefaultActions: true },
        { id: '7',label: 'Phone', fieldName: 'educx__Phone_Number__c', type: 'text', hideDefaultActions: true,initialWidth:90  },
        {
            type: "button-icon",initialWidth: 1,
            typeAttributes: {name: "edit",variant: "brand",iconName: "action:edit"}
        },
    ];

    @track selectedStudentId;
    @track previewDetails = false;
    @track previewClicked = false;
    @track editPage=false;
    handleRowAction(event) {
            this.selectedStudentId = event.detail.row.Id;
            const actionName = event.detail.action.name;
            if (actionName === 'edit') {
                this.editPage = true;
            }
    }
    handlePreviewClose(event){
        this.editPage=false;
        refreshApex(this.wiredStudentData);
    }
    
    selectedStudentIds = []; // To store selected row IDs

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        this.selectedStudentIds = selectedRows.map(row => {
            return row.Id;
        });
    }
    async handleDeleteStudents() {
        if (!this.selectedStudentIds || this.selectedStudentIds.length === 0) {
             this.template.querySelector('c-toast-message').showToast('No records selected.', 'Please select records to delete.', 'warning');
            return;
        }

        const result = await LightningConfirm.open({
            variant: 'header',
            theme: 'error',
            label: 'Please Confirm',
            message: 'Are you sure you want to delete the selected records?',
        });

        if (result) {
            try {
                const deletePromises = [];
                this.selectedStudentIds.forEach(studentId => {
                    deletePromises.push(deleteRecord(studentId));
                });
                await Promise.all(deletePromises);

                 this.template.querySelector('c-toast-message').showToast('Records Deleted Successfully.', '', 'success');
                console.log('Records deleted successfully.');
                // Clear the selected IDs after deletion
                this.selectedStudentIds = [];
                // Refresh the data after successful deletion
                await refreshApex(this.wiredStudentData);
            } catch (error) {
                 this.template.querySelector('c-toast-message').showToast('Error deleting records.', '', 'error');
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
    

    @wire(getStudentsByAcademicYear, { academicYear: '$selectedAcademicYear' })
    wiredStudents(result) {
        this.wiredStudentData = result;
        if (result.data) {
            this.students = result.data;
            this.filterAndPaginateRecords();
        } else if (result.error) {
            console.error('Error fetching students:', result.error);
        }
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.currentPage = 1;
        this.filterAndPaginateRecords();
    }

    handleAcademicYearChange(event) {
        this.selectedAcademicYear = event.detail.value;
        this.currentPage = 1;
        this.filterAndPaginateRecords();
    }

    filterAndPaginateRecords() {
        this.filteredStudents = this.students.filter(student => {
            return (
                (student.educx__Name_of_The_Candidate__c && student.educx__Name_of_The_Candidate__c.toLowerCase().includes(this.searchKey)) ||
                (student.educx__Course__c && student.educx__Course__c.toLowerCase().includes(this.searchKey)) ||
                (student.educx__Hall_Ticket_No__c && student.educx__Hall_Ticket_No__c.toLowerCase().includes(this.searchKey)) ||
                (student.educx__Year__c && student.educx__Year__c.toLowerCase().includes(this.searchKey)) ||
                (student.educx__Semester__c && student.educx__Semester__c.toLowerCase().includes(this.searchKey))
            );
        });

        this.updatePaginationInfo();
    }

    updatePaginationInfo() {
        this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.filteredStudents.length);
        this.recordsToDisplay = this.filteredStudents.slice(startIndex, endIndex);

        this.isPrevDisabled = this.currentPage === 1;
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
                     this.template.querySelector('c-toast-message').showToast('Records uploaded successfully!', 'Success', 'success');
                })
                .catch(error => {
                    console.error('Error:', error); // Log the error for debugging
                     this.template.querySelector('c-toast-message').showToast('Error uploading accounts.', error.body.message, 'error');
                });
                refreshApex(this.wiredStudentData);
        };
        reader.readAsText(file);
    }
    @track promotePage=false;
    handlePromoteStudents(){
        this.promotePage=true;
    }
    handlePromoteClose(){
        this.promotePage=false;
        refreshApex(this.wiredStudentData);
    }
    @track registerPage=false;
    handleAddStudent(){
        this.registerPage=true;
    }
    handleRegisterClose(){
        this.registerPage=false;
        refreshApex(this.wiredStudentData);
    }
}