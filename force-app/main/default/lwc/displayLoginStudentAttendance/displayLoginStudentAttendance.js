import { LightningElement, track, api } from 'lwc';
import getSubjectAttendance from '@salesforce/apex/DisplayAllStudentsAttendence.getSubjectAttendance';

export default class DisplayLoginStudentAttendance extends LightningElement {
    @track groupedSubjects = [];
    @track showRecs = false;

    @api studentId;
    //studentId = '123rty';

    connectedCallback() {
        this.studentId=sessionStorage.getItem('UserName');
        if (this.studentId) {
            this.fetchAttendanceDetails();
        }
    }

    fetchAttendanceDetails() {
        getSubjectAttendance({ studentId: this.studentId })   
            .then(result => {
                for(var rec of result){
                    console.log('rec ', rec);
                    console.log('rec.educx__Academic_Year__c', rec.educx__Acadmic_Year__c);
                    console.log('rec.educx__Year__c', rec.educx__Year__c);
                }
                if (result && result.length > 0) {
                    this.groupedSubjects = this.groupByYearAndSemester(result);
                    this.showRecs = true;
                } else {
                    this.showRecs = false;
                }
                console.log('Fetched Attendance Details:', JSON.stringify(result));
            })
            .catch(error => {
                console.error('Error fetching attendance details:', JSON.stringify(error));
                this.showRecs = false;
                this.groupedSubjects = [];
            })
            .catch(error => {
                console.error('Error fetching attendance details:', error);
            });
    }

    groupByYearAndSemester(attendanceRecords) {
        console.log('Grouping Attendance Records:', attendanceRecords);
       
        const groups = attendanceRecords.reduce((acc, record) => {
            const key = `${record.educx__Acadmic_Year__c}_${record.educx__Year__c}_${record.educx__Semester__c}`;
            console.log('record.educx__Academic_Year__c', record.educx__Acadmic_Year__c);
            
            if (!acc[key]) {
                acc[key] = { 
                    yearSemester: `${record.educx__Year__c} - Semester ${record.educx__Semester__c} - Acadmic Year ${record.educx__Acadmic_Year__c} `, 
                    subjects: [] 
                };
              
            }

            const subjectRecord = {
                Id: record.Id,
                subjectName: record.educx__Subject__r.educx__Subject_Name__c,
                subjectCode: record.educx__Subject__r.Name,
                attendance: record.educx__Total_Classes_Attended__c
            };

            // Log each subject record being added
            console.log('Adding Subject Record:', subjectRecord);
            
            acc[key].subjects.push(subjectRecord);

            return acc;
        }, {});

        // Log the final grouped results
        console.log('Grouped Subjects:', Object.values(groups));

        return Object.values(groups);
    }
}