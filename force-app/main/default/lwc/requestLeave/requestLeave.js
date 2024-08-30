/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getEmployeeLeaveAccount from "@salesforce/apex/EmployeeController.getEmpLeaveAccForLeaveRequest";
import createEmployeeLeaveDetail from "@salesforce/apex/EmployeeController.createEmployeeLeaveDetail";
import getEmployeeDetails from "@salesforce/apex/EmployeeController.viewEmployeeDetails";

export default class RequestLeave extends LightningElement {
  @api reqLeave = false;
  @api employeeId;

  @track fromDate;
  @track toDate;
  @track leaveAccountId;
  @track employeeName;
  @track leaveAccountNumber;
  @track reason;
  @track appliedDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  @track numberOfDaysTaken;

  connectedCallback() {
    this.loadLeaveAccount();
    this.loadEmployeeDetails();
  }

  loadLeaveAccount() {
    getEmployeeLeaveAccount({ employeeId: this.employeeId })
      .then((result) => {
        this.leaveAccountId = result ? result.Id : "";
        this.leaveAccountNumber = result ? result.Name : "";
      })
      .catch((error) => {
        console.error("Error fetching leave account:", error);
        this.showToast("Error", "Error fetching leave account.", "error");
      });
  }

  loadEmployeeDetails() {
    getEmployeeDetails({ recordId: this.employeeId })
      .then((result) => {
        this.employeeName = result ? result.Name : "";
      })
      .catch((error) => {
        console.error("Error fetching employee details:", error);
        this.showToast("Error", "Error fetching employee details.", "error");
      });
  }

  handleDateChange(event) {
    const field = event.target.name;
    const value = event.target.value;

    if (field === "fromDate") {
      this.fromDate = value;
    } else if (field === "toDate") {
      this.toDate = value;
    }

    if (this.fromDate && this.toDate) {
      this.calculateNumberOfDaysTaken();
    }
  }

  calculateNumberOfDaysTaken() {
    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);
    let count = 0;

    for (let d = from; d <= to; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) {
        // 0 is Sunday
        count++;
      }
    }
    this.numberOfDaysTaken = count;
  }

  handleInputChange(event) {
    const field = event.target.name;
    this[field] = event.target.value;
  }

  showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(toastEvent);
  }

  closeModal() {
    this.reqLeave = false;
    const closeEvent = new CustomEvent("closemodal");
    this.dispatchEvent(closeEvent);
  }

  handleSuccess() {
    this.showToast("Success", "Leave Record created successfully", "success");
    this.closeModal();
  }

  handleCancel() {
    this.closeModal();
  }

  
  handleRequestLeave() {
    // Check if the leave is being applied for previous dates
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    if (this.fromDate < currentDate || this.toDate < currentDate) {
        const confirmApply = window.confirm("Are you sure you want to apply for the leave in previous dates?");
        if (!confirmApply) {
            return; // Exit if the user cancels the confirmation
        }
    }

    createEmployeeLeaveDetail({
        employeeId: this.employeeId,
        leaveAccountId: this.leaveAccountId,
        fromDate: this.fromDate,
        toDate: this.toDate,
        reason: this.reason,
        appliedDate: this.appliedDate
    })
    .then((result) => {
        console.log("result :" + JSON.stringify(result));
        this.numberOfDaysTaken = result[0].educx__Number_of_Days_Taken__c;
        this.handleSuccess();
    })
    .catch((error) => {
        console.error("Error creating leave record:", error);
        this.showToast("Error", "Error creating leave record.", "error");
    });
}
}