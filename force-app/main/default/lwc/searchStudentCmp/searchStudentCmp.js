/* eslint-disable eqeqeq */
import { LightningElement, track } from "lwc";

import getStudDetails from "@salesforce/apex/loginController.getStudDetails";
import modalContainer from "@salesforce/resourceUrl/modalContainer";
import { loadStyle } from "lightning/platformResourceLoader";

export default class SearchStudentCmp extends LightningElement {
  @track isShowModal = false;
  @track showContent = false;
  @track selectedRecord;
  @track studentName;
  @track Course;
  @track CourseCode;
  @track semester;
  @track year;
  @track hallticketNo;
  @track selectedStudent = true;
  @track paidAmount;
  @track balanceAmount;
  @track totalFee;

  matchingInfo = {
    primaryField: { fieldPath: "educx__Hall_Ticket_No__c" },
    additionalFields: [{ fieldPath: "educx__Name_of_The_Candidate__c" }]
  };
  displayInfo = {
    additionalFields: [
      "educx__Hall_Ticket_No__c",
      "educx__Name_of_The_Candidate__c"
    ]
  };
  handleChange(event) {
    this.selectedRecord = event.detail.recordId;
    if (this.selectedRecord == "" || this.selectedRecord == null) {
      this.showContent = false;
    } else {
      this.selectedStudent = false;
      this.showContent = true;
      getStudDetails({ recordId: this.selectedRecord }).then((result) => {
        this.studentName = result[0].educx__Name_of_The_Candidate__c;
        this.CourseCode = result[0].educx__Course_Code__r.Name
          ? result[0].educx__Course_Code__r.Name
          : "";
        this.hallticketNo = result[0].educx__Hall_Ticket_No__c;
        this.Course = result[0].educx__Course_Code__r.educx__Course__c
          ? result[0].educx__Course_Code__r.educx__Course__c
          : "";
        this.CourseName = result[0].educx__Course_Code__r.educx__Course_Name__c
          ? result[0].educx__Course_Code__r.educx__Course_Name__c
          : "";
        this.year = result[0].educx__Academic_Years__r[0].educx__Year__c
          ? result[0].educx__Academic_Years__r[0].educx__Year__c
          : "";
        this.semester = result[0].educx__Academic_Years__r[0].educx__Sem__c
          ? result[0].educx__Academic_Years__r[0].educx__Sem__c
          : "";

        //For Payment Component
        this.paidAmount = result[0].educx__Fee_Paid__c
          ? result[0].educx__Fee_Paid__c
          : "0";
        this.balanceAmount = result[0].educx__Balance_Fee__c
          ? result[0].educx__Balance_Fee__c
          : "0";
        this.totalFee = result[0].educx__Total_Course_Fee__c
          ? result[0].educx__Total_Course_Fee__c
          : "0";
      });
    }
  }
  handleSearchStudent() {
    this.isShowModal = true;
  }
  hideModalBox() {
    this.isShowModal = false;
    this.showContent = false;
    this.selectedStudent = true;
  }
  renderedCallback() {
    Promise.all([loadStyle(this, modalContainer)]).catch((error) => {
      console.error("Error", error);
    });
  }
}