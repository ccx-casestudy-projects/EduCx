import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAllCourses from '@salesforce/apex/CourseController.getAllCourses';
import getSubjectsByCourse from '@salesforce/apex/CourseController.getSubjectsByCourse';
import createCourseSubjects from '@salesforce/apex/CourseController.createCourseSubjects';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import LightningConfirm from 'lightning/confirm';

const PAGE_SIZE = 5;

const columns = [
  { label: 'Course Code', fieldName: 'Name', type: 'text' },
  { label: 'Course', fieldName: 'educx__Course__c' },
  { label: 'Course Name', fieldName: 'educx__Course_Name__c' },
  { label: 'Course Level', fieldName: 'educx__Course_Level__c' },
  { label: 'Medium', fieldName: 'educx__Medium__c' },
  { label: 'Course Duration', fieldName: 'educx__Course_Duration__c' },
  { label: 'Sanctioned Intake', fieldName: 'educx__Sanctioned_Intake__c' },
  {
    type: 'button',
    initialWidth: 150,
    typeAttributes: {
      label: 'Show Subjects',
      name: 'available_subjects',
      variant: 'neutral  ',

    }
  }
];

export default class CourseCmp extends LightningElement {

  columns = columns;
  @track availableCourses;
  @track selectedRows = [];
  @track isModalOpen = false;
  @track modalTitle = '';
  @track availableSubjectsPopup = false;
  @track selectedCourseId = [];
  @track refreshResult;
  @track showRecs = false;
  @track donotShowRec = false;
  @api relatedSubjects;
  @api result;
  @track refreshResult;
  rowId;
  @track pageNumber = 1; // Initialize pageNumber
  @track totalPages = 0;
  @track filteredCourses = [];
  @track displayedCourses = [];
  @track courses = [];
  @track searchKey = '';
  @track isAssociateModalOpen = false;

  @wire(getAllCourses)
  wiredcourses(result) {
    this.wiredCoursesResult = result;
    const { data, error } = result;
    if (data) {
      this.availableCourses = data;
      this.filterCourses(); // Apply search filtering
    } else if (error) {
      console.error('Error loading course:', error);
    }
  }

  handleSearchChange(event) {
    this.searchKey = event.target.value.toLowerCase();
    this.pageNumber = 1;
    this.filterCourses();
  }

  filterCourses() {
    this.filteredCourses = this.availableCourses.filter(course => {
      return (
        (course.Name && course.Name.toLowerCase().includes(this.searchKey)) ||
        (course.educx__Course__c && course.educx__Course__c.toLowerCase().includes(this.searchKey)) ||
        (course.educx__Course_Name__c && course.educx__Course_Name__c.toLowerCase().includes(this.searchKey)) ||
        (course.educx__Course_Level__c && course.educx__Course_Level__c.toLowerCase().includes(this.searchKey)) ||
        (course.educx__Medium__c && course.educx__Medium__c.toLowerCase().includes(this.searchKey)) ||
        (course.educx__Course_Duration__c && course.educx__Course_Duration__c.toLowerCase().includes(this.searchKey)) 
      );
    });

    this.updateRecordsToDisplay();
  }

  updateRecordsToDisplay() {
    this.totalPages = Math.ceil(this.filteredCourses.length / PAGE_SIZE);
    const startIndex = (this.pageNumber - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, this.filteredCourses.length);
    this.displayedCourses = this.filteredCourses.slice(startIndex, endIndex);
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
    const action = event.detail.action.name;
    this.rowId = event.detail.row.Id;
    if (action === 'available_subjects') {
      const courseId = this.rowId;
      this.fetchRelatedSubjects(courseId);
      this.availableSubjectsPopup = true;
      this.modalTitle = 'Available Subjects';
    }
  }

  handleRowSelection(event) {
    const selectedRows = event.detail.selectedRows;
    this.selectedCourses = selectedRows;
    this.selectedCourseId = selectedRows.map(row => row.Id);
  }

  fetchRelatedSubjects(courseId) {
    getSubjectsByCourse({ courseId: courseId })
      .then(result => {
        this.relatedSubjects = result;
        this.showRecs = this.relatedSubjects && this.relatedSubjects.length > 0;
        this.donotShowRec = !this.showRecs;
      })
      .catch(error => {
        console.error('Error fetching related subjects:', error);
      });
  }

  get groupedSubjects() {
    const groups = {};
    this.relatedSubjects.forEach(subject => {
      const key = `${subject.educx__Year__c}-${subject.educx__Semester__c}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(subject);
    });
    return Object.keys(groups).map(key => ({
      yearSemester: key,
      subjects: groups[key],
      subjectNames: this.getSubjectsAsCommaSeparated(groups[key])
    }));
  }

  getSubjectsAsCommaSeparated(subjects) {
    return subjects.map(subject => subject.educx__Subject__r.Name).join(', ');
  }

  handleCreate() {
    this.isModalOpen = true;
    this.modalTitle = 'Create Course';
    this.selectedCourseId = null;
  }

  handleEdit() {
    const selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
    if (selectedRows.length !== 1) {
      this.showToast('No records selected.', 'Please select one record to edit.', 'warning');
      return;
    }
    const selectedCourse = selectedRows[0];
    this.isModalOpen = true;
    this.modalTitle = 'Edit Course';
    this.selectedCourseId = selectedCourse.Id;
  }

  handleCloseModal() {
    this.isModalOpen = false;
    this.availableSubjectsPopup = false;
  }

  handleSuccess(event) {
    this.showToast(this.selectedCourseId ? 'Course Updated' : 'Course Created', `Course Record ${this.selectedCourseId ? 'updated' : 'created'} with ID: ${event.detail.id}`, 'success');
    this.refreshData();
    this.handleCloseModal();
  }

  async handleDelete() {
    if (!this.selectedCourseId || this.selectedCourseId.length === 0) {
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
        this.selectedCourseId.forEach(subjectId => {

          deletePromises.push(deleteRecord(subjectId));
        });
        await Promise.all(deletePromises);

        this.showToast('Records Deleted Successfully.', '', 'success');
        this.selectedCourseId = [];
        this.template.querySelector('lightning-datatable').selectedRows = [];
        await refreshApex(this.wiredCoursesResult);
      } catch (error) {
        this.showToast('Error deleting records.', '', 'error');
      }
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

  handleAssociateSubject() {
    const selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
    if (selectedRows.length === 0) {
      this.showToast('No records selected.', 'Please select atleast one record to Associate.', 'warning');
      return;
    }
    this.isAssociateModalOpen = true;
    this.selectedCourses = selectedRows.map(row => ({
      Id: row.Id,
      Name: row.Name,
      educx__Course_Name__c: row.educx__Course_Name__c
    }));
  }

  handleAssociateSuccess(event) {
    this.showToast('Success', 'Subjects associated with selected courses successfully.', 'success');

    this.refreshData();
    this.handleCloseAssociateModal();
  }

  handleSaveAssociations() {
    const courseIds = this.selectedCourses.map(course => course.Id);
    createCourseSubjects({ courseIds: courseIds, subjectId: this.subjectId, year: this.year, semester: this.semester })
      .then(() => {

        this.handleAssociateSuccess();
      })
      .catch(error => {
        this.showToast('Error', `Failed to associate courses`, 'error');
      });
  }

  handleError(event) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: 'Error',
        message: 'An error occurred',
        variant: 'error',
      })
    );
  }

  handleSubjectChange(event) {
    this.subjectId = event.target.value;
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

  refreshData() {
    return refreshApex(this.wiredCoursesResult);
  }
}