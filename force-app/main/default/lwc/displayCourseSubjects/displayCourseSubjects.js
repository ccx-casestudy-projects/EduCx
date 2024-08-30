import { LightningElement, api, wire } from 'lwc';
import getFacultySubjects from '@salesforce/apex/EmployeeController.getFacultySubjects';

const columns = [
    { label: 'Course', fieldName: 'CourseName' },
    { label: 'Semester', fieldName: 'educx__Semester__c' },
    { label: 'Year', fieldName: 'educx__Year__c' },
    { label: 'Subject', fieldName: 'SubjectName' }
];

export default class DisplayCourseSubjects extends LightningElement {
    @api employeeId;  // Employee ID passed as a public property
    columns = columns;
    facultySubjects = [];
    error;

    @wire(getFacultySubjects, { employeeId: '$employeeId' })
    wiredFacultySubjects({ error, data }) {
        if (data) {
            // Transform the data to add CourseName and SubjectName fields
            this.facultySubjects = data.map(record => ({
                ...record,
                CourseName: record.educx__Course__r.educx__Course_Name__c,
                SubjectName: record.educx__Subject__r.educx__Subject_Name__c
            }));
            this.error = undefined;
            // Dispatch event to notify parent component
            this.dispatchEvent(new CustomEvent('subjectdatachange', {
                detail: { hasSubjects: this.facultySubjects.length > 0 }
            }));
        } else if (error) {
            this.error = error;
            this.facultySubjects = [];
            // Dispatch event to notify parent component
            this.dispatchEvent(new CustomEvent('subjectdatachange', {
                detail: { hasSubjects: false }
            }));
        }
    }
}