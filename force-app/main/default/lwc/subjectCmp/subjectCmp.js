import { LightningElement, track, wire,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getSubjects from '@salesforce/apex/SubjectController.getSubjects';
import createCourseSubjects from '@salesforce/apex/SubjectController.createCourseSubjects';
import getElectivesBySubjects from '@salesforce/apex/SubjectController.getElectivesBySubjects';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import LightningAlert from 'lightning/alert';
import LightningConfirm from 'lightning/confirm';

const PAGE_SIZE = 10;

export default class SubjectCmp extends LightningElement {
    @track subjects = [];
    @track isModalOpen = false;
    @track isAssociateModalOpen = false;
    @track isAddElectiveModalOpen = false;
    @track availableElectivesPopup = false;
    @track modalTitle = '';
    @track selectedSubjectId ;
    @track selectedSubjectName;
    @track selectedHasElective;
    @track refreshResult;
    @track pageNumber = 1; // Initialize pageNumber
    @track totalPages = 0;
    @track filteredSubjects = [];
    @track displayedSubjects = [];
    @track subjects = [];
    @track searchKey = '';
    @api relatedElectives;
    @track showRecs = false;
    @track donotShowRec = false;


    columns = [
        { label: 'Subject Code', fieldName: 'Name' },
        { label: 'Subject Name', fieldName: 'educx__Subject_Name__c' },
        {
            type: 'button',
            initialWidth: 100,
            typeAttributes: {
                iconName: 'utility:edit',
                label: 'Edit',
                name: 'edit',
                title: 'edit',
                disabled: false,
                value: 'edit'
            }
        },
        {
            type: 'button',
            initialWidth: 150,
            typeAttributes: {
                label: 'Show Electives',
                name: 'electives',
                title: 'show electives',
                disabled: { fieldName: 'isElectiveDisabled' },
                value: 'electives'
            }
        }
    ];

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }

   @wire(getSubjects)
   wiredSubjects(result) {
    this.refreshResult = result;
    const { data, error } = result;
    if (data) {
        this.subjects = data.map(subject => ({
            ...subject,
            isElectiveDisabled: !subject.educx__Has_Elective__c // Disable if `Has_Elective__c` is `false`
        }));
        this.filterSubjects(); // Update the filtered list
    } else if (error) {
        this.showToast('Error', error.message, 'error');
    }
    }

    searchField(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.pageNumber = 1;
        this.filterSubjects();
    }

    filterSubjects() {
        this.filteredSubjects = this.subjects.filter(subject => {
            return (
                (subject.Name && subject.Name.toLowerCase().includes(this.searchKey)) ||
                (subject.educx__Subject_Name__c && subject.educx__Subject_Name__c.toLowerCase().includes(this.searchKey))
            );
        });

        this.updateRecordsToDisplay();
    }

    updateRecordsToDisplay() {
        this.totalPages = Math.ceil(this.filteredSubjects.length / PAGE_SIZE);
        const startIndex = (this.pageNumber - 1) * PAGE_SIZE;
        const endIndex = Math.min(startIndex + PAGE_SIZE, this.filteredSubjects.length);
        this.displayedSubjects = this.filteredSubjects.slice(startIndex, endIndex);

        this.isPrevDisabled = this.pageNumber === 1;
        this.isNextDisabled = this.pageNumber === this.totalPages;
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

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        const subId = row.Id;
        
        switch (actionName) {
            case 'edit':
                this.handleEdit(row);
                break;
            case 'electives':
                this.handleShowElective(subId);
                this.availableElectivesPopup = true;
                break;
            default:
                break;
        }
    }

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        if (selectedRows.length > 0) {
            this.selectedSubId = selectedRows[0].Id;
            this.selectedSubjectId = selectedRows.map(row => row.Id);
            this.selectedSubjectName = selectedRows[0].Name;
            this.hasElective = selectedRows[0].educx__Has_Elective__c;
        } else {
            this.resetSelectedProperties();
        }
    }

    handleCreate() {
        this.isModalOpen = true;
        this.modalTitle = 'Create Subject';
        this.selectedSubjectId = null; // Ensure no record ID is set
    }

    handleEdit(row) {
        this.isModalOpen = true;
        this.modalTitle = 'Edit Subject';
        this.selectedSubjectId = row.Id;
        this.selectedSubjectName = row.educx__Subject_Name__c;
        this.selectedHasElective = row.educx__Has_Elective__c;
    }

    handleSuccess(event) {
        const message = `Subject Record ${this.selectedSubjectId ? 'updated' : 'created'} with ID: ${event.detail.id}`;
        this.showToast('Success', message, 'success');
        this.refreshData();
        this.handleCloseModal();
    }

    handleCloseModal() {
        this.isModalOpen = false;
        this.availableElectivesPopup = false;
        this.resetSelectedProperties();
    }

    handleShowElective(subId) {
       getElectivesBySubjects({ subjectId: subId })
        .then(result => {
            
            this.relatedElectives = result;
            this.showRecs = this.relatedElectives && this.relatedElectives.length > 0;
            
            this.donotShowRec = !this.showRecs;
           
        })
        .catch(error => {
            alert('hii')
            console.error('Error fetching related electives:', error);
        });
    }

    async handleDelete() {
        if (!this.selectedSubjectId || this.selectedSubjectId.length === 0) {
            this.showToast('No records selected.', 'Please select records to delete.', 'warning');
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
                this.selectedSubjectId.forEach(subjectId => {
                    deletePromises.push(deleteRecord(subjectId));
                });
                await Promise.all(deletePromises);

                this.showToast('Records Deleted Successfully.', '', 'success');
                this.template.querySelector('lightning-datatable').selectedRows = [];
                await refreshApex(this.refreshResult);
            } catch (error) {
                this.showToast('Error deleting records.', '', 'error');
            }
        }
    }

    handleAssociateCourse() {
        const selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        if (selectedRows.length === 0) {
            this.showToast('No records selected.', 'Please select atleast one record to Associate.', 'warning');
            return;
        }

        this.isAssociateModalOpen = true;
        this.selectedSubjects = selectedRows.map(row => ({
            Id: row.Id,
            Name: row.Name,
            educx__Subject_Name__c: row.educx__Subject_Name__c
        }));
    }

    handleAssociateSuccess(event) {
        this.showToast('Success', 'Courses associated with selected subjects successfully.', 'success');
        this.refreshData();
        this.handleCloseAssociateModal();
    }

    handleSaveAssociations() {
        const subjectIds = this.selectedSubjects.map(subject => subject.Id);

        createCourseSubjects({ subjectIds: subjectIds, courseId: this.courseId, year: this.year, semester: this.semester })
            .then(() => {
                this.handleAssociateSuccess();
            })
            .catch(error => {
                this.showToast('Error', `Failed to associate courses`, 'error');
            });
    }

    handleError(event) {
        this.showToast('An Error Occurred');
    }

    handleCourseChange(event) {
        this.courseId = event.target.value;
    }

    handleYearChange(event) {
        this.year = event.target.value;
    }

    handleSemesterChange(event) {
        this.semester = event.target.value;
    }

    handleCloseAssociateModal() {
        this.isAssociateModalOpen = false;
        
    }

    async handleElective() {
        if (this.selectedSubId && this.selectedSubId.length > 0) {
            console.log('this.hasElective:: '+this.hasElective);
            if (this.hasElective) {
                this.isAddElectiveModalOpen = true;

            } else {
                await LightningAlert.open({
                    message: 'The selected subject is not an elective subject.Please select other subject.',
                    theme: 'error',
                    label: 'Error!',
                });
            }
        } else {
            this.showToast('No records selected.', 'Please select the record to add elective.', 'warning');
        }
    }

    handleAddElectiveSuccess(event) {
        this.showToast('Success', `Elective added to subject with ID: ${event.detail.id}`, 'success');
        this.refreshData();
        this.handleCloseAddElectiveModal();
    }

    handleCloseAddElectiveModal() {
        this.isAddElectiveModalOpen = false;
    }

    refreshData() {
        return refreshApex(this.refreshResult);
    }

    resetSelectedProperties() {
        this.selectedSubjectId = [];
        this.selectedSubjectName = null;
        this.hasElective = false;
    }
}