import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAllFeeStructure from '@salesforce/apex/FeeStructureController.getAllFeeStructure';
import deleteFeeStructure from '@salesforce/apex/FeeStructureController.deleteFeeStructure';
import saveFeeStructure from '@salesforce/apex/FeeStructureController.saveFeeStructure';
import getRecordTypes from '@salesforce/apex/FeeStructureController.getRecordTypes';
import { refreshApex } from '@salesforce/apex';

const columns = [
    { label: 'G.O Number', fieldName: 'educx__G_O_Revised__c', type: 'text' },
    { label: 'Course Code', fieldName: 'educx__CourseCode__r.Name', apiName: 'educx__CourseCode__r.Name', type: 'text', initalWidth: 80 },
    { label: 'Course', fieldName: 'educx__CourseCode__r.educx__Course__c', apiName: 'educx__CourseCode__r.educx__Course__c', type: 'text', initalWidth: 80 },
    { label: 'Course Name', fieldName: 'educx__CourseCode__r.educx__Course_Name__c', apiName: 'educx__CourseCode__r.educx__Course_Name__c', type: 'text', initalWidth: 200 },
    { label: 'Year', fieldName: 'educx__Year__c', type: 'text' },
    { label: 'Admission Fee', fieldName: 'educx__Admission_Fee__c', type: 'currency' },
    { label: 'Tuition Fee', fieldName: 'educx__Tution_Fee__c', type: 'currency' },
    { label: 'Special Fee', fieldName: 'educx__Special_Fee__c', type: 'currency' },
    { label: 'Management Fee', fieldName: 'educx__Management_Fee__c', type: 'currency' },
    { label: 'Total Fee', fieldName: 'educx__Total_Fee__c', type: 'currency' }
];

export default class FeeStructureManagement extends LightningElement {
    @track columns = columns;
    @track feeStructureData;
    @track selectedRows = [];
    @track isModalOpen = false;
    @track selectedFeeStructureId;
    @track modalTitle = '';
    @track refreshResult;
    @track selectedRecordTypeId;
    @track isDisabled = false;
    @track yearValue;
    @track courseId;
    @track name;
    @track admissionFee;
    @track tuitionFee;
    @track specialFee;
    @track managementFee;
    @track filterFeeStructure;
    @track CourseTarget = 'educx__Course__c';
    @track isManagement = false;
    @track recordTypeOptions;
    @track GOvalue;
    @track currentPage = 1;
    pageSize = 10;
    @track totalPages = 0;
    @track paginatedRecords = [];
    @track isPrevDisabled = true;
    @track isNextDisabled = true;

    get yearOptions() {
        return [
            { label: '1st Year', value: '1st Year' },
            { label: '2nd Year', value: '2nd Year' },
            { label: '3rd Year', value: '3rd Year' },
            { label: '4th Year', value: '4th Year' }
        ];
    }

    displayCourses = {
        educx__Course__c: {
            additionalFields: ['educx__Course_Name__c']
        }
    }
    matchingCourses = {
        educx__Course__c: {
            additionalFields: [{ fieldPath: 'educx__Course_Name__c' }]
        }
    }
    get displayCourse() {
        return this.displayCourses[this.CourseTarget];
    }
    get matchingCourse() {
        return this.matchingCourses[this.CourseTarget];
    }
    handleCourseChange(event) {
        this.courseId = event.detail.recordId;
        console.log('handleCourseChange ' + event.detail.recordId);
    }
    handleGOchange(event) {
        this.GOvalue = event.detail.value;
    }


    @wire(getAllFeeStructure)
    wiredFeeStructure(result) {
        this.refreshResult = result;
        if (result.data) {
            this.filterFeeStructure = this.formatDataSet(result.data);
            this.feeStructureData = this.filterFeeStructure;
            this.updatePaginationInfo();
        } else if (result.error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading fee structures',
                    message: result.error.body.message,
                    variant: 'error'
                })
            );
        }
    }

    updatePaginationInfo() {
        if (this.feeStructureData.length > 0) {
            this.totalPages = Math.ceil(this.feeStructureData.length / this.pageSize);
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = Math.min(startIndex + this.pageSize, this.feeStructureData.length);
            this.paginatedRecords = this.feeStructureData.slice(startIndex, endIndex);
            this.isPrevDisabled = this.currentPage === 1;
            this.isFirstPage = this.currentPage === 1;
            this.isLastPage = this.currentPage === this.totalPages;
            this.isNextDisabled = this.currentPage === this.totalPages;
        } else {
            this.paginatedRecords = [];
            this.isPrevDisabled = true;
            this.isNextDisabled = true;
            this.isFirstPage = true;
            this.isLastPage = true;
            this.totalPages = 0;
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePaginationInfo();
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePaginationInfo();
        }
    }

    handleFirstPage() {
        if (this.currentPage !== 1) {
            this.currentPage = 1;
            this.updatePaginationInfo();
        }
    }

    handleLastPage() {
        if (this.currentPage !== this.totalPages) {
            this.currentPage = this.totalPages;
            this.updatePaginationInfo();
        }
    }


    handleCreate() {
        this.isModalOpen = true;
        this.modalTitle = 'New Fee Structure';
        this.selectedRecordTypeId = '';
        this.selectedFeeStructureId = null;
        this.isDisabled = false;
        this.GOvalue = '';
        this.clearFields();
    }

    handleEdit() {
        const selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        if (selectedRows.length !== 1) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select one record to edit',
                    variant: 'error',
                })
            );
            return;
        }
        const selectedFeeStructure = selectedRows[0];
        this.isModalOpen = true;
        this.modalTitle = 'Edit Fee Structure';
        this.selectedFeeStructureId = selectedFeeStructure.Id;
        this.selectedRecordTypeId = selectedFeeStructure.RecordTypeId;
        const selectedRecordType = this.recordTypeOptions.find(rt => rt.value === this.selectedRecordTypeId);
        if (selectedRecordType && selectedRecordType.label === 'Management') {
            this.isManagement = true;
        } else {
            this.isManagement = false;
        }
        this.courseId = selectedFeeStructure.educx__CourseCode__c;
        this.GOvalue = selectedFeeStructure.educx__G_O_Revised__c;
        this.fillFields(selectedFeeStructure);
        this.isDisabled = true;
    }


    handleCloseModal() {
        this.isModalOpen = false;
    }

    handleRecordTypeChange(event) {
        this.selectedRecordTypeId = event.detail.value;
        const selectedRecordType = this.recordTypeOptions.find(rt => rt.value === this.selectedRecordTypeId);
        if (selectedRecordType && selectedRecordType.label === 'Management') {
            this.isManagement = true;
        } else {
            this.isManagement = false;
        }
    }

    handleYearChange(event) {
        this.yearValue = event.detail.value;
    }

    handleNameChange(event) {
        this.name = event.detail.value;
    }

    handleAdmissionFeeChange(event) {
        this.admissionFee = event.detail.value;
    }

    handleTuitionFeeChange(event) {
        this.tuitionFee = event.detail.value;
    }

    handleSpecialFeeChange(event) {
        this.specialFee = event.detail.value;
    }

    handleManagementFeeChange(event) {
        this.managementFee = event.detail.value;
    }

    @wire(getRecordTypes)
    wiredRecordTypes({ error, data }) {
        if (data) {
            this.recordTypeOptions = Object.keys(data).map(key => {
                return { label: data[key], value: key };
            });
            console.log('this.recordTypeOptions', this.recordTypeOptions);
        } else if (error) {
            console.error('Error fetching record types', error);
        }
    }

    handleSave() {
        const feeStructureRecord = {
            Id: this.selectedFeeStructureId,
            educx__CourseCode__c: this.courseId,
            educx__Year__c: this.yearValue,
            educx__Admission_Fee__c: this.admissionFee,
            educx__Tution_Fee__c: this.tuitionFee,
            educx__Special_Fee__c: this.specialFee,
            educx__Management_Fee__c: this.managementFee,
            RecordTypeId: this.selectedRecordTypeId,
            Name: this.name
        };

        saveFeeStructure({ feeStructureUpsert: feeStructureRecord })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `Fee Structure Record ${this.selectedFeeStructureId ? 'updated' : 'created'} successfully`,
                        variant: 'success',
                    })
                );
                this.refreshData();
                this.handleCloseModal();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error",
                        message: "There was an error saving the Fee Structure record.",
                        variant: "error",
                    })
                );
                console.error('Error saving Fee Structure:', error);
            });
    }

    handleDelete() {
        const selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        const selectedIds = selectedRows.map(row => row.Id);
        if (selectedIds.length === 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select at least one record to delete',
                    variant: 'error',
                })
            );
            return;
        }
        deleteFeeStructure({ feeStructureIds: selectedIds })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Fee Structure(s) deleted',
                        variant: 'success',
                    })
                );
                return refreshApex(this.refreshResult);
            })
            .catch(error => {
                console.error('Error deleting Fee Structure:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting fee structure',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    }

    updateSearch(event) {
    const searchValue = event.target.value;
    const regex = new RegExp(searchValue, 'gi');
    this.feeStructureData = this.filterFeeStructure.filter(row => {
        const isMatch = regex.test(row.educx__CourseCode__r.Name) || 
                        regex.test(row.educx__CourseCode__r.educx__Course_Name__c) || 
                        regex.test(row.educx__Year__c) || 
                        regex.test(row.educx__CourseCode__r.educx__Course__c);
        return isMatch;
    });
    this.currentPage = 1;
    this.updatePaginationInfo();
    }


    refreshData() {
        return refreshApex(this.refreshResult);
    }

    clearFields() {
        this.name = '';
        this.courseId = '';
        this.yearValue = '';
        this.GOvalue = '';
        this.selectedRecordTypeId = '';
        this.admissionFee = 0;
        this.tuitionFee = 0;
        this.specialFee = 0;
        this.managementFee = 0;
    }

    fillFields(selectedFeeStructure) {
        this.name = selectedFeeStructure.Name;
        this.courseId = selectedFeeStructure.educx__CourseCode__c;
        this.GOvalue = selectedFeeStructure.educx__G_O_Revised__c;
        console.log('this.courseId', this.courseId);
        console.log('selectedFeeStructure.educx__CourseCode__c', selectedFeeStructure.educx__CourseCode__c);
        this.yearValue = selectedFeeStructure.educx__Year__c;
        this.admissionFee = selectedFeeStructure.educx__Admission_Fee__c;
        this.tuitionFee = selectedFeeStructure.educx__Tution_Fee__c;
        this.specialFee = selectedFeeStructure.educx__Special_Fee__c;
        this.managementFee = selectedFeeStructure.educx__Management_Fee__c;
    }

    formatDataSet(data) {
        return data.map(item => {
            const row = { ...item };
            this.columns.forEach(column => {
                if (column.apiName) {
                    const fieldName = column.fieldName;
                    const apiFields = column.apiName.split('.');
                    if (apiFields.length > 1) {
                        const apiObject = apiFields[0];
                        const apiField = apiFields[1];
                        row[fieldName] = item[apiObject] && item[apiObject][apiField] ? item[apiObject][apiField] : '';
                    }
                }
            });
            return row;
        });
    }
}