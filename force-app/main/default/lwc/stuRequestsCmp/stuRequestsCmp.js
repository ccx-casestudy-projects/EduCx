/* eslint-disable eqeqeq */
/* eslint-disable vars-on-top */
import { LightningElement, track, api } from "lwc";
import getStudentRequests from "@salesforce/apex/loginController.getStudentRequests";

export default class StuRequestsCmp extends LightningElement {
  @track studentRequestData;
  @api recordId;
  userId;

  get requestColumn() {
    return [
      {
        label: "Submission Date",
        fieldName: "SubmissionDate",
        type: "date"
      },
      {
        label: "Document Type",
        fieldName: "DocumentType",
        type: "text"
      },
      {
        label: "Reason",
        fieldName: "Reason",
        type: "text"
      },
      {
        label: "Status",
        fieldName: "Status",
        type: "text"
      }
    ];
  }
  connectedCallback() {
    if (this.recordId) {
      this.userId = this.recordId;
    }
    getStudentRequests({ hallticketNo: this.userId }).then((result) => {
      this.studentRequestData = result.map((record) => {
        return {
          Id: record.Id,
          Reason:
            record.educx__Reason__c !== ""
              ? record.educx__Reason__c
              : record.educx__Other_Reason__c,
          DocumentType: record.educx__Document_Type__c,
          Status: record.educx__Status__c,
          SubmissionDate: record.CreatedDate
        };
      });
    });
  }
}