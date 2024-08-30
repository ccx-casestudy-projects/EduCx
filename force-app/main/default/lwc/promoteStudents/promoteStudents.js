import { LightningElement, track, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import populateCourseDetails from '@salesforce/apex/StudentController.populateCourseDetails';
import getAcademicYearPicklistValues from '@salesforce/apex/StudentController.getAcademicYearPicklistValues';
import getStudentsByFilter from '@salesforce/apex/StudentController.getStudentsByFilter';
import promoteStudents from '@salesforce/apex/StudentController.promoteStudents';
import getCourses from '@salesforce/apex/StudentController.getCourses';
export default class PromoteStudents extends LightningElement {
    @track academicYearOptions = [];
    @track selectedAcademicYear = 'None';
    @track selectedCourse = 'None';
    @track StdCourseCode = ''; 
    @track StdCourse = '';
    @track StdCourseName = '';
    @track CourseYear = '';
    @track CourseSem = '';
    @track studentData = [];
    @track selectedStudents = [];
    wiredStudentResult; // To store the wired result for refreshApex
    @api showPromotePage = false;

    handleClose() {
        const closeFormEvent = new CustomEvent('close');
        this.dispatchEvent(closeFormEvent);
        this.showPromotePage = false;
    }

    @track columns = [
        { id: '1', label: 'Hall Ticket No', fieldName: 'educx__Hall_Ticket_No__c', type: 'text', hideDefaultActions: true },
        { id: '2', label: 'Student Name', fieldName: 'educx__Name_of_The_Candidate__c', type: 'text', hideDefaultActions: true },
        { id: '3', label: 'Course', fieldName: 'educx__Course__c', hideDefaultActions: true, initialwidth:60 },
        { id: '4', label: 'Course Name', fieldName: 'educx__Course_Name__c', hideDefaultActions: true },
        { id: '5', label: 'Year', fieldName: 'educx__Year__c', hideDefaultActions: true },
        { id: '6', label: 'Semester', fieldName: 'educx__Semester__c', hideDefaultActions: true },
        //{ id: '7', label: 'Adm No', fieldName: 'Name', hideDefaultActions: true }
    ];
    handleAcademicYearChange(event) {
        this.selectedAcademicYear = event.detail.value;
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

    // handleCourseChange(event){
    //     this.selectedCourse = event.detail.value;
    // }
    @wire(getCourses)
    wiredCourseValues({ error, data }) {
        if (data) {
            this.CourseOptions = data.map(course => {
                return { label: course.Name, value: course.Id };
            });
        } else if (error) {
            console.error('Error fetching course picklist values:', error);
        }
    }

    @wire(getStudentsByFilter, {
        academicYear: '$selectedAcademicYear',
        courseCode: '$selectedCourse',
        course: '$StdCourse',
        courseName: '$StdCourseName',
        year: '$CourseYear',
        sem: '$CourseSem'
    })
    wiredStudents(result) {
        this.wiredStudentResult = result; // Store the result for refreshApex
        if (result.data) {
            this.studentData = result.data;
        } else if (result.error) {
            console.error('Error fetching filtered students:', result.error);
        }
    }

    get hasStudents() {
        return this.studentData && this.studentData.length > 0;
    }

    get isPromoteButtonDisabled() {
        return !this.selectedStudents || this.selectedStudents.length === 0;
    }

    handleCourseChange(event) {
        this.selectedCourse = event.target.value;
        populateCourseDetails({ courseId: this.selectedCourse })
            .then(result => {
                if (result) {
                    this.StdCourse = result.educx__Course__c;
                    this.StdCourseName = result.educx__Course_Name__c;
                } else {
                    this.StdCourse = '';
                    this.StdCourseName = '';
                }
            })
            .catch(error => {
                console.error('Error fetching course details:', error);
            });
    }

    StdCourseChange(event) {
        this.StdCourse = event.target.value;
    }

    StdCourseNameChange(event) {
        this.StdCourseName = event.target.value;
    }

    CourseYearChange(event) {
        this.CourseYear = event.target.value;
    }

    CourseSemChange(event) {
        this.CourseSem = event.target.value;
    }

   
    handleRowSelection(event) {
        this.selectedStudents = event.detail.selectedRows;
    }

    handlepromote() {
        if (this.selectedStudents.length > 0) {
            const selectedStudentIds = this.selectedStudents.map(student => student.Id);

            promoteStudents({ selectedStudents: selectedStudentIds })
                .then(() => {
                     this.template.querySelector('c-toast-message').showToast('Success', 'Students Promoted Successfully', 'success');
                    return refreshApex(this.wiredStudentResult); // Refresh the datatable
                })
                .catch(error => {
                    this.template.querySelector('c-toast-message').showToast('Error', 'Error promoting students: ' + error.body.message, 'error');
                });
        } else {
             this.template.querySelector('c-toast-message').showToast('Warning', 'No students selected for promotion', 'warning');
        }
    }
}