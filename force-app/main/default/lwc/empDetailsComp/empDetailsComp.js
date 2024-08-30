/* eslint-disable eqeqeq */
/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getEmployeeById from "@salesforce/apex/EmployeeController.getEmployeeDetailsOnHeader";
import getEmployeeLeaveAccount from "@salesforce/apex/EmployeeController.getEmployeeLeaveAccount";

export default class EmpDetailsComp extends NavigationMixin(LightningElement) {
  @api propertyValue;
  @track employeeData;
  @track employeeLeaveAccount;
  @track showAttendance = false;
  @track reqLeave = false;
  @track show = true;
  @track error;
  @track candidateType = "employee";
  @track isTeachingEmployee = false;
  @track isNonTeachingLibrarian = false;
  @track isMarkAttendanceDisabled = true;

  greeting = "";

  libraryColumns = [
    { label: "BIR Id", fieldName: "Name", hideDefaultActions: true },
    { label: "Book Id", fieldName: "BookId", hideDefaultActions: true },
    {
      label: "Title of the book",
      fieldName: "BookName",
      hideDefaultActions: true
    },
    { label: "Status", fieldName: "BookStatus", hideDefaultActions: true },
    {
      label: "Date of Issue",
      fieldName: "DateofIssue",
      type: "date",
      hideDefaultActions: true
    },
    {
      label: "Due Date",
      fieldName: "DueDate",
      type: "date",
      hideDefaultActions: true
    },
    {
      label: "OverDueBy",
      fieldName: "OverDueBy",
      type: "number",
      hideDefaultActions: true
    }
  ];

  connectedCallback() {
    let empUserName = sessionStorage.getItem("UserName");
    this.propertyValue =
      this.propertyValue != null ? this.propertyValue : empUserName;
    this.getGreetings();
    getEmployeeById({ employeeId: this.propertyValue })
      .then((result) => {
        this.employeeData = result[0];
        this.isTeachingEmployee =
          this.employeeData.RecordType.DeveloperName === "Teaching_Employee";
        this.isNonTeachingLibrarian =
        this.employeeData.RecordType.DeveloperName ===
          "Non_Teaching_Employee" &&
        this.employeeData.educx__Designation__c === "Librarian";
        return getEmployeeLeaveAccount({ employeeId: this.employeeData.Id });
      })
      .then((result) => {
        this.employeeLeaveAccount = result;
      })
      .catch((error) => {
        this.error = error;
        this.employeeData = undefined;
        this.employeeLeaveAccount = undefined;
      });
  }

  getGreetings() {
    const currentTime = new Date().getHours();
    if (currentTime >= 5 && currentTime < 12) {
      this.greeting = "Good Morning..!!";
    } else if (currentTime >= 12 && currentTime < 16) {
      this.greeting = "Good Afternoon..!!";
    } else if (currentTime >= 16 && currentTime < 19) {
      this.greeting = "Good Evening..!!";
    } else {
      this.greeting = "Good Night..!!";
    }
  }
  get profileImage() {
    return this.employeeData?.educx__Photo__c || "";
  }

  handleRequestLeave() {
    this.reqLeave = true;
  }

  closeModal3() {
    this.reqLeave = false;
  }

  handleMarkAttendance() {
    this.showAttendance = true;
  }

  handleCloseModal1(event) {
    this.showAttendance = event.detail;
  }

  get availedLeaves() {
    return this.employeeLeaveAccount
      ? this.employeeLeaveAccount.educx__Number_of_Availed_Leaves__c
      : 0;
  }

  get balanceLeaves() {
    return this.employeeLeaveAccount
      ? this.employeeLeaveAccount.educx__Number_of_Balance_Leaves__c
      : 0;
  }

  get totalLeaves() {
    return this.employeeLeaveAccount
      ? this.employeeLeaveAccount.educx__Total_Number_of_Leaves__c
      : 0;
  }

  get lossOfPay() {
    return this.employeeLeaveAccount
      ? this.employeeLeaveAccount.educx__Loss_of_Pay__c
      : 0;
  }

  handleSubjectDataChange(event) {
    this.isMarkAttendanceDisabled = !event.detail.hasSubjects;
  }
  disconnectedCallback() {
    sessionStorage.clear();
  }
  handleLogout() {
    sessionStorage.clear();
    const currentUrl = window.location.href;
    const newUrl = currentUrl.replace("/EMP", "");
    window.location.href = newUrl;
  }
}