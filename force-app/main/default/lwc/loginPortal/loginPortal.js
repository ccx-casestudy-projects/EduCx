/* eslint-disable eqeqeq */
/* eslint-disable vars-on-top */
import { LightningElement, track } from "lwc";
import { loadStyle } from "lightning/platformResourceLoader";
import Tabs from "@salesforce/resourceUrl/TabStyle";
import empLogo from "@salesforce/resourceUrl/EmployeeLogo";
import stuLogo from "@salesforce/resourceUrl/StudentLogo";

import checkPasswordWithUserName from "@salesforce/apex/loginController.checkPasswordWithUserName";

import { NavigationMixin } from "lightning/navigation";

export default class LoginPortal extends NavigationMixin(LightningElement) {
  @track studentPassword;
  @track studentId;
  @track employeePassword;
  @track employeeId;
  @track employeeLogo = empLogo;
  @track studentLogo = stuLogo;
  @track studentError = "";

  activeTabValue = "";

  handleInput() {
    this.activeTabValue =
      this.template.querySelector("lightning-tabset").activeTabValue;
    if (this.activeTabValue === "student") {
      this.studentPassword = this.template.querySelector(
        "[data-id='studentpassword']"
      ).value;
      this.studentId = this.template.querySelector(
        "[data-id='studentid']"
      ).value;
    } else {
      this.employeeId = this.template.querySelector(
        "[data-id='employeeId']"
      ).value;
      this.employeePassword = this.template.querySelector(
        "[data-id='employeePassword']"
      ).value;
    }
  }
  handleKeyPress(event) {
    if (event.keyCode === 13) {
      if (this.studentId != null && this.studentPassword != null)
        this.handleSubmit();
      else if (this.employeeId != null && this.employeePassword != null)
        this.handleSubmit();
    }
  }
  handleTabChange() {
    this.activeTabValue =
      this.template.querySelector("lightning-tabset").activeTabValue;
    if (this.activeTabValue === "employee") {
      this.studentId = "";
      this.studentPassword = "";
    } else {
      this.employeeId = "";
      this.employeePassword = "";
    }
  }
  handleResetSubmit() {}
  handleSubmit() {
    if (this.activeTabValue === "student") {
      checkPasswordWithUserName({
        userName: this.studentId,
        password: this.studentPassword,
        typ: "Student"
      }).then((result) => {
        if (result.length > 0) {
          sessionStorage.setItem("UserName", this.studentId);
          sessionStorage.setItem("Password", this.studentPassword);
          this.pageReference = {
            type: "comm__namedPage",
            attributes: {
              name: "EDUCX__c"
            }
          };
          if (this.pageReference) {
            this[NavigationMixin.GenerateUrl](this.pageReference).then(
              (url) => {
                this.href = url;
              }
            );
          }
          if (this.pageReference) {
            this[NavigationMixin.Navigate](this.pageReference);
          }
        } else {
          this.studentError = "Invalid Username or Password";
          this.studentError =
            this.studentId === "" && this.studentPassword === ""
              ? ""
              : "Invalid Username or Password";
        }
      });
    } else if (this.activeTabValue === "employee") {
      checkPasswordWithUserName({
        userName: this.employeeId,
        password: this.employeePassword,
        typ: "Employee"
      }).then((result) => {
        if (result.length > 0) {
          sessionStorage.setItem("UserName", this.employeeId);
          sessionStorage.setItem("Password", this.employeePassword);
          this.pageReference = {
            type: "comm__namedPage",
            attributes: {
              name: "EMP__c"
            }
          };
          if (this.pageReference) {
            this[NavigationMixin.GenerateUrl](this.pageReference).then(
              (url) => {
                this.href = url;
              }
            );
          }
          if (this.pageReference) {
            this[NavigationMixin.Navigate](this.pageReference);
          }
        } else {
          this.studentError = "Invalid Username or Password";
          this.studentError =
            this.employeeId === "" && this.employeePassword === ""
              ? ""
              : "Invalid Username or Password";
        }
      });
    }
  }
  renderedCallback() {
    Promise.all([loadStyle(this, Tabs)]).catch((error) => {
      console.error("Error", error);
    });
  }
}