/* eslint-disable no-restricted-globals */
/* eslint-disable no-empty */
/* eslint-disable @lwc/lwc/no-api-reassignments */
/* eslint-disable eqeqeq */
import { LightningElement, track, api } from "lwc";

import getStudentDetails from "@salesforce/apex/loginController.getStudentDetails";

export default class StudentMainComponent extends LightningElement {
  password;
  @api userid;
  @track studentRecId;
  @track studentName;
  @track Course;
  @track CourseCode;
  @track CourseName;
  @track year;
  @track semester;
  @track studentHallticketNo;

  connectedCallback() {
    let userName = sessionStorage.getItem("UserName");
    let pass = sessionStorage.getItem("Password");
    this.password = pass;
    this.studentHallticketNo = this.userid != null ? this.userid : userName;
    if (this.studentHallticketNo) {
      getStudentDetails({
        hallticketNo: this.studentHallticketNo
      }).then((result) => {
        this.studentData = result;
        this.studentRecId = result[0].Id;
        sessionStorage.setItem("Id", this.studentRecId);
        this.studentName = result[0].educx__Name_of_The_Candidate__c;
        if (result[0]?.educx__Course_Code__r) {
          this.CourseCode = result[0].educx__Course_Code__r.Name || "";
          this.Course = result[0].educx__Course_Code__r.educx__Course__c;
          this.CourseName =
            result[0].educx__Course_Code__r.educx__Course_Name__c;
        } else {
          this.CourseCode = "";
          this.Course = "";
          this.CourseName = "";
        }
        this.year = result[0].educx__Academic_Years__r[0].educx__Year__c;
        this.semester = result[0].educx__Academic_Years__r[0].educx__Sem__c;
      });
    }
  }
  disconnectedCallback() {
    sessionStorage.clear();
  }
  handleLogout() {
      sessionStorage.clear();
      const currentUrl = window.location.href;
      const newUrl = currentUrl.replace("/STUD", "");
      window.location.href = newUrl;
  }
}