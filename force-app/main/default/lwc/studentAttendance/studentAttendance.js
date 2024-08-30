import { LightningElement, track, wire, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getrecords from "@salesforce/apex/CustomLookupController.getRecords";
import getPicklistValuesYear from "@salesforce/apex/StudentAttendanceController.getPicklistValuesYear";
import getPicklistValuesSemester from "@salesforce/apex/StudentAttendanceController.getPicklistValuesSemester";
import getCourseYearSemesterDetail from "@salesforce/apex/StudentAttendanceController.getCourseYearSemester";
import getStudents from "@salesforce/apex/StudentAttendanceController.getStudents";
import createAttendanceDetails from "@salesforce/apex/StudentAttendanceController.createAttendanceDetails";
import { refreshApex } from '@salesforce/apex';

export default class Attendance extends LightningElement {
  @track attendanceObj = "educx__Attendance__c";
  @track attendanceYear = "educx__Year__c";
  @track attendanceSem = "educx__Semester__c";
  @track StudentTarget = "educx__Student__c";
  @track SubjectTarget = "educx__Subject__c";
  @track EmployeesTarget = "educx__Employees__c";
  @track CourseTarget = "educx__Course__c";
  @track semesteroptions = "";
  @track statusoptions = "";
  @track yearoptions = "";
  @track currentDateTime;
  @track subjectOptions = [];
  @track data = [];
  @track courseId;
  @track year;
  @track semester; 
  @track employeeCode;
  @track subject;
  @track currentAcademicYear;

  @track attendanceMap = [];
  @api propertyValue;
  @track showStudentDataTable = false;
  @track isSubmitDisabled = true;
  @track showDateTime;

  connectedCallback() {
    this.setAcademicYear();
    this.setCurrentDateTime();
  }

  @track field = ["Id", "Name", "educx__Course__r.Name"," educx__Course__r.educx__Course_Name__c","educx__Course__c","educx__Employee__c"];
  @track recordsList = [];

  @wire(getrecords, { objectName: "educx__Faculty_Subjects__c", columns: "$field" , empId: "$propertyValue"})
  getrecss(result) {
    if (result.data) {
      this.recordsList = result.data.map((record) => ({
        Id: record.educx__Course__c,
        Name: record.educx__Course__r.Name,
        Phone: record.educx__Course__r.educx__Course_Name__c
      }));
    } else if (result.error) {
      this.error = result.error;
    }
  }

  @wire(getPicklistValuesYear, {
    sObjectName: "$attendanceObj",
    fieldName: "$attendanceYear"
  })
  typePicklistValues1({ error, data }) {
    if (data) {
      this.yearoptions = data.map((value) => ({ label: value, value: value }));
    } else if (error) {
      console.log("error in year :: " + error);
    }
  }

  @wire(getPicklistValuesSemester, {
    sObjectName: "$attendanceObj",
    fieldName: "$attendanceSem"
  })
  typePicklistValues2({ error, data }) {
    if (data) {
      this.semesteroptions = data.map((value) => ({
        label: value,
        value: value
      }));
    } else if (error) {
      console.log("error in semester :: " + error);
    }
  }

  setAcademicYear() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    if (month >= 4) {
      // April to December
      this.currentAcademicYear = `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      // January to March
      this.currentAcademicYear = `${year - 1}-${year.toString().slice(-2)}`;
    }
  }

  columns = [
    { label: "Student Id", fieldName: "studentNameId", type: "text" },
    { label: "Student Name", fieldName: "studentName", type: "text" },
    { label: "Hall Ticket No", fieldName: "hallTicketNo", type: "text" },
    {
      label: "Attendance Status",
      fieldName: "attendancecheck",
      type: "attendancecheck",
      editable: true,
      typeAttributes: {
        isChecked: { fieldName: "isChecked" },
        recordId: { fieldName: "studentId" },
        onchange: { fieldName: "checkboxChange" }
      }
    }
  ];

  isChecked = true;

  handleSelectedRowHandler(event) {
    // eslint-disable-next-line no-unused-vars
    const selectedRows = event.detail.selectedRows;
  }

  handleAttendanceCheck(event) {
    const { recordId, isChecked } = event.detail;

    let updatedAttendanceMap = [...this.attendanceMap];

    if (isChecked) {
      // If checked, add the recordId to the copy if it's not already present
      if (!updatedAttendanceMap.includes(recordId)) {
        updatedAttendanceMap.push(recordId);
      } else {
        console.log("RecordId already present in attendanceMap:", recordId);
      }
    } else {
      // If unchecked, remove the recordId from the copy
      updatedAttendanceMap = updatedAttendanceMap.filter(
        (id) => id !== recordId
      );
    }

    // Update the attendanceMap with the modified copy
    this.attendanceMap = updatedAttendanceMap;
    // this.isSubmitDisabled = updatedAttendanceMap.length === 0;
     console.log('updatedAttendanceMap ::: '+updatedAttendanceMap);
  }

  get attendanceList() {
    return [...this.attendanceMap.entries()];
  }

  handleYearChange(event) {
    this.year = event.target.value;
  }

  handleSemesterChange(event) {
    this.semester = event.target.value;
    this.handleGetSubjectDetail();
  }

  handleGetSubjectDetail() {
    if (this.courseId && this.year && this.semester) {
      this.courseId = this.courseId ? this.courseId : "";
      this.year = this.year ? this.year : "";
      this.semester = this.semester ? this.semester : "";

      getCourseYearSemesterDetail({
        courseId: this.courseId,
        year: this.year,
        semester: this.semester,
        dateOfAttendance: this.currentDateTime,
       empId : this.propertyValue
      })
        .then((result) => {
          this.subjectOptions = result.map((subject) => {
            return { label: subject, value: subject };
          });
          console.log(
            "subjectOptions :: " + JSON.stringify(this.subjectOptions)
          );
        })
        .catch((error) => {
          console.error("Error retrieving subject details: ", error);
        });
      if (this.semester != null) {
        this.getStudentsDetail();
      }
      this.showStudentDataTable = true;
      this.showDateTime = true;
    }
  }

  handleStatusChange(event) {
    // eslint-disable-next-line no-unused-vars
    const status = event.target.value;
  }

  handleSubjectChange(event) {
    this.subject = event.target.value;
    this.isSubmitDisabled = !this.subject;
  }
  
  handleSubmitAttendance() {
    createAttendanceDetails({
      recordMap: this.attendanceMap,
      course: this.courseId,
      semester: this.semester,
      year: this.year,
      subject: this.subject,
      employeeCode: this.propertyValue
    })
      .then(() => {
          this.showToast("Success", "Attendance Submit successfully", "success");
           // window.location.reload();
          this.handleCloseModal();
      })
      .catch((error) => {
        this.showToast(
          "Error",
          "Error in Submit Attendance: " + error.body.message,
          "error"
        );
      });
  }
  handleCourseChange(event) {
    this.courseId = event.detail.selectedRecordId;
    console.log("handleCourseChange " + event.detail.selectedRecordId);
  }

  getStudentsDetail() {
    if (this.courseId && this.year && this.semester) {
      this.courseId = this.courseId ? this.courseId : "";
      this.year = this.year ? this.year : "";
      this.semester = this.semester ? this.semester : "";

      console.log("Getting students detail with parameters:");
      console.log("Course ID: " + this.courseId);
      console.log("Year: " + this.year);
      console.log("Semester: " + this.semester);

      if (this.courseId && this.year && this.semester) {
        getStudents({
          courseId: this.courseId,
          year: this.year,
          semester: this.semester
        })
          .then((result) => {
            // this.data = result;
            this.data = result.map((item) => ({
              ...item,
              isChecked: true
            }));
            this.attendanceMap = this.data
              .filter((item) => item.studentId)
              .map((item) => item.studentId);
            console.log("getStudents data ::: " + JSON.stringify(this.data));
            console.log(
              "getStudents attendanceMap ::: " +
                JSON.stringify(this.attendanceMap)
            );
          })
          .catch((error) => {
            console.error("Error retrieving students: ", error);
          });
      } else {
        console.warn(
          "Missing parameters. Ensure courseId, year, and semester are provided."
        );
      }
    }
  }

  get hasStudents() {
    return this.data && this.data.length > 0;
  }

  // handleCheckboxChange(recordId, event) {
  //     const isChecked = event.target.checked;

  //     if (isChecked) {
  //         // If checked, add the recordId to the map
  //         if (!this.attendanceMap.includes(recordId)) {
  //             this.attendanceMap.push(recordId);
  //         }
  //     } else {
  //         // If unchecked, remove the recordId from the map
  //         this.attendanceMap = this.attendanceMap.filter(id => id !== recordId);
  //     }
  // }

  setCurrentDateTime() {
    this.currentDateTime = new Date().toISOString();
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

  handleCloseModal() {
    const custom = new CustomEvent("closemodalatt", {
      detail: false,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(custom);
  }
}