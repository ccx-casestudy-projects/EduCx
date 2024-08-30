import { LightningElement, wire, track, api } from 'lwc';
import getDataTableHeaders from '@salesforce/apex/DisplayAllStudentsAttendence.getDataTableHeaders';
import getAcademicYearPicklistValues from '@salesforce/apex/StudentController.getAcademicYearPicklistValues';
import getCourses from '@salesforce/apex/DisplayAllStudentsAttendence.getCourses';
import getCourseNames from '@salesforce/apex/DisplayAllStudentsAttendence.getCourseNames';
import getCourseYears from '@salesforce/apex/DisplayAllStudentsAttendence.getCourseYears';
import getCourseSem from '@salesforce/apex/DisplayAllStudentsAttendence.getCourseSem';
import getAttendanceDetails from '@salesforce/apex/DisplayAllStudentsAttendence.getAttendanceDetails';
import getCourseYearSemester from '@salesforce/apex/StudentAttendanceController.getCourseYearSemester';

import { refreshApex } from '@salesforce/apex';

export default class DisplayAllStudentsAttendence extends LightningElement {
    @track headers = [];
    @track columnsList = [];
    @track data = [];
    @track filteredData = []; // Track filtered data
    @track searchName = ''; // Search input

    @track academicYearOptions = [];
    @track selectedAcademicYear = 'None'; 
    @track courseOptions = [];
    @track selectedCourse = 'None';
    @track courseNameOptions = [];
    @track selectedCourseName = 'None';
    @track courseYearOptions = [];
    @track selectedCourseYear = 'None';
    @track courseSemOptions = [];
    @track selectedCourseSem = 'None';
    @api studentId;

    @wire(getAcademicYearPicklistValues)
    wiredAcademicYears({ error, data }) {
        if (data) {
            console.log('Academic Year Options:', data);
            this.academicYearOptions = data.map(value => ({
                label: value,
                value: value
            }));
        } else if (error) {
            console.error('Error fetching academic year picklist values:', error);
        }
    }

    @wire(getCourses)
    wiredCourses({ error, data }) {
        if (data) {
            console.log('Course Options:', data);
            this.courseOptions = data.map(value => ({
                label: value,
                value: value
            }));
        } else if (error) {
            console.error('Error fetching course picklist values:', error);
        }
    }

    @wire(getCourseNames, { course: '$selectedCourse' })
    wiredCourseNames(result) {
        this.wiredCourseNamesResult = result;
        if (result.data) {
            console.log('Course Name Options:', result.data);
            this.courseNameOptions = result.data.map(value => ({
                label: value,
                value: value
            }));
        } else if (result.error) {
            console.error('Error fetching course names:', result.error);
        }
    }

    @wire(getCourseYears)
    wiredCourseYears({ error, data }) {
        if (data) {
            console.log('Course Year Options:', data);
            this.courseYearOptions = data.map(value => ({
                label: value,
                value: value
            }));
        } else if (error) {
            console.error('Error fetching course years:', error);
        }
    }

    @wire(getCourseSem)
    wiredCourseSem({ error, data }) {
        if (data) {
            console.log('Course Semester Options:', data);
            this.courseSemOptions = data.map(value => ({
                label: value,
                value: value
            }));
        } else if (error) {
            console.error('Error fetching course semesters:', error);
        }
    }

    @wire(getDataTableHeaders, { 
        academicYear: '$selectedAcademicYear', 
        course: '$selectedCourse', 
        courseName: '$selectedCourseName', 
        year: '$selectedCourseYear', 
        sem: '$selectedCourseSem' 
    })
    wiredDataTableHeaders(result) {
        this.wiredDataTableHeadersResult = result;
        if (result.data) {
            console.log('Data Table Headers:', result.data);
            this.headers = result.data;
            this.updateColumns(this.headers);
            this.refreshAttendanceData();
        } else if (result.error) {
            console.error('Error fetching data table headers:', result.error);
        }
    }

    // Wire to get course year semester details
    @wire(getCourseYearSemester, { courseId: '$selectedCourseId', year: '$selectedYear', semester: '$selectedSemester' })
    wiredCourseYearSemester({ error, data }) {
        if (data) {
            this.headers = data;
            this.updateColumns(this.headers);
        } else if (error) {
            console.error('Error fetching course year semester subjects:', error);
        }
    }

    refreshAttendanceData() {
        this.studentId= (this.studentId!=null || this.studentId!=undefined )?this.studentId: sessionStorage.getItem("UserName");
        console.log('Refreshing attendance data with:', {
            academicYear: this.selectedAcademicYear, 
            course: this.selectedCourse, 
            courseName: this.selectedCourseName, 
            year: this.selectedCourseYear, 
            sem: this.selectedCourseSem 
        });

        console.log('------studentId----->'+this.studentId);

        getAttendanceDetails({
            academicYear: this.selectedAcademicYear, 
            course: this.selectedCourse, 
            courseName: this.selectedCourseName, 
            year: this.selectedCourseYear, 
            sem: this.selectedCourseSem,
            studentId: this.studentId
        })
        .then(attendanceResult => {
            console.log('Attendance Details:', attendanceResult);
            this.processAttendanceData(attendanceResult);
        })
        .catch(error => {
            console.error('Error fetching attendance details:', error);
        });
    }

    processAttendanceData(attendanceData) {
        console.log('Processing Attendance Data:', attendanceData);

        // Create a map of subject names to their header indices
        const subjectToIndexMap = new Map();
        this.headers.forEach((subject, index) => {
            subjectToIndexMap.set(subject, index);
        });

        // Create a map to store attendance data keyed by student identification
        const attendanceMap = new Map();

        attendanceData.forEach(record => {
            const studentKey = `${record.hallTicketNo}-${record.studentName}`;
            
            // Initialize the student data if not already present in the map
            if (!attendanceMap.has(studentKey)) {
                attendanceMap.set(studentKey, {
                    studentName: record.studentName,
                    hallTicketNo: record.hallTicketNo,
                    ...this.headers.reduce((acc, subject) => ({ ...acc, [`subject_${subjectToIndexMap.get(subject)}`]: 0 }), {})
                });
            }

            // Retrieve the student data object
            const studentData = attendanceMap.get(studentKey);
            
            // Check if the subject exists in the headers
            const subjectIndex = subjectToIndexMap.get(record.subjectName);
            if (subjectIndex !== undefined) {
                const subjectField = `subject_${subjectIndex}`;
                studentData[subjectField] = record.totalClassesAttended;
            }
        });

        // Convert the attendanceMap to an array for display
        this.data = Array.from(attendanceMap.values());
        this.filteredData = [...this.data]; // Initialize filtered data for potential filtering operations
        console.log('Final Processed Data:', JSON.stringify(this.data));
    }

    updateColumns(subjects) {
        console.log('Updating Columns with Subjects:', subjects);
        if (subjects) {
            this.columnsList = [
                { label: 'Hall Ticket No', fieldName: 'hallTicketNo', type: 'text' },
                { label: 'Student Name', fieldName: 'studentName', type: 'text' },
               
                ...subjects.map((subject, index) => ({
                    label: subject,
                    fieldName: `subject_${index}`,
                    type: 'text'
                }))
            ];
        }
    }

    handleAcademicYearChange(event) {
        console.log('Selected Academic Year:', event.detail.value);
        this.selectedAcademicYear = event.detail.value;
    }

    handleCourseChange(event) {
        console.log('Selected Course:', event.detail.value);
        this.selectedCourse = event.detail.value;
        this.refreshCourseNames();
    }

    handleCourseNameChange(event) {
        console.log('Selected Course Name:', event.detail.value);
        this.selectedCourseName = event.detail.value;
    }

    handleCourseYearChange(event) {
        console.log('Selected Course Year:', event.detail.value);
        this.selectedCourseYear = event.detail.value;
    }

    handleCourseSemChange(event) {
        console.log('Selected Course Sem:', event.detail.value);
        this.selectedCourseSem = event.detail.value;
    }

    refreshCourseNames() {
        console.log('Refreshing Course Names');
        return refreshApex(this.wiredCourseNamesResult);
    }

    handleSearch(event) {
        console.log('Search Input:', event.target.value);
        this.searchName = event.target.value;
       // this.filterData();
       if(this.searchName.length >=2){
        let searchRecords = [];
        let lowerSearchKey = this.searchName.toLowerCase();
            for (let record of this.filteredData) {
                let name = record.studentName ? String(record.studentName).toLowerCase() : '';
                let hallticket = record.hallTicketNo ? String(record.hallTicketNo).toLowerCase() : '';

                if (name.includes(lowerSearchKey) || hallticket.includes(lowerSearchKey)) {
                    searchRecords.push(record);
                }
            }
             this.filteredData = searchRecords;
       }else {
            this.filteredData = [...this.data];
        }
    
    }

   
}