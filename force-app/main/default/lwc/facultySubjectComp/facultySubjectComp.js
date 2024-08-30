import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import populateSubjectDetails from '@salesforce/apex/EmployeeController.populateSubjectDetails';
export default class FacultySubjectComp extends LightningElement {
    @api newSubToEmp = false;
    @track course;
    @track year='';
    @track sem='';
    facSubjectObject = 'educx__Faculty_Subjects__c';

    // Handle the change event for the Course field
    handleCourseChange(event) {
        this.course = event.target.value;
       
    }
    handleYearChange(event){
        this.year=event.target.value;
    }
    handleSemChange(event){
        this.sem=event.target.value;
    }
    @track subjectOptions = [];
    selectedSubject;

    @wire(populateSubjectDetails, { courseId: '$course',Year:'$year',sem:'$sem' })
    wiredSubjects({ error, data }) {
    if (data) {
        console.log(data);
        this.subjectOptions = data.map(record => ({
            label: record.educx__Subject__r.educx__Subject_Name__c,
           value: String(record.educx__Subject__r.Id)
        }));
    } else if (error) {
        console.error('Error retrieving subject details:', error);
        console.log('Error Details:', JSON.stringify(error));
    }
    }



    handleSubjectChange(event) {
        this.selectedSubject = String(event.detail.value); // Convert to string
    console.log('Selected Subject ID:', this.selectedSubject);
    }


    closeModal() {
        this.newSubToEmp = false;
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
    }

    handleSuccess(event) {
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Subject assigned to Employee Successfully: ' + event.detail.id,
            variant: 'success',
        });
        this.dispatchEvent(toastEvent);
        this.closeModal();
    }

    handleCancel() {
        this.closeModal();
    }
}