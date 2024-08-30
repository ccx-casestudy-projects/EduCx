import { LightningElement,track } from 'lwc';


export default class Attendance extends LightningElement {

    @track StudentTarget = 'educx__Student__c';
    @track SubjectTarget = 'educx__Subject__c';
    @track EmployeesTarget = 'educx__Employees__c';
    @track currentSelectedRecordId = '';

    displayStudents = {
        educx__Student__c: {
            additionalFields: ['educx__Name_of_The_Candidate__c']
        }
    };

    matchingStudents = {
        educx__Student__c: {
            additionalFields: [{ fieldPath: 'educx__Name_of_The_Candidate__c' }]
        }
    };


    get displayStudent() {
        return this.displayStudents[this.StudentTarget];
    }

    get matchingStudent() {
        return this.matchingStudents[this.StudentTarget];
    }


    handleStdChange(event) {
        this.currentSelectedRecordId = event.detail.recordId;
        console.log('handleStdChange ' + event.detail.recordId);
    }



    displaySubjects = {
        educx__Subject__c: {
            additionalFields: ['educx__Subject_Name__c']
        }
    };

    matchingSubjects = {
        educx__Subject__c: {
            additionalFields: [{ fieldPath: 'educx__Subject_Name__c' }]
        }
    };


    get displaySubject() {
        return this.displaySubjects[this.SubjectTarget];
    }

    get matchingSubject() {
        return this.matchingSubjects[this.SubjectTarget];
    }


    handleSubChange(event) {
        console.log('handleSubChange ' + event.detail.recordId);
    }




    displayEmployees = {
        educx__Employees__c: {
            additionalFields: ['educx__Employee_Name__c']
        }
    };

    matchingEmployees = {
        educx__Employees__c: {
            additionalFields: [{ fieldPath: 'educx__Employee_Name__c' }]
        }
    };


    get displayEmployee() {
        return this.displayEmployees[this.EmployeesTarget];
    }

    get matchingEmployee() {
        return this.matchingEmployees[this.EmployeesTarget];
    }

    handleEmpChange(event) {
       // this.currentSelectedRecordId = event.detail.recordId;
        console.log('handleSubChange ' + event.detail.recordId);
    }



   
}