/* eslint-disable @lwc/lwc/no-leading-uppercase-api-name */
import { LightningElement, track, api } from "lwc";
import getStudentPayments from "@salesforce/apex/loginController.getStudentPayments";

export default class StuPaymentCmp extends LightningElement {
  @track paymentsData = [];
  @api paidAmount;
  @api balanceAmount;
  @api totalFee;
  @api recordId;
  userId;

  get paymentsColumn() {
    return [
      {
        label: "Payment Date",
        fieldName: "CreatedDate",
        type: "date"
      },
      {
        label: "Year",
        fieldName: "Year",
        type: "text"
      },
      {
        label: "Fee Type",
        fieldName: "FeeType",
        type: "text"
      },
      {
        label: "Amount Paid",
        fieldName: "AmountPaid",
        type: "number"
      }
    ];
  }
  connectedCallback() {
    if (this.recordId) {
      this.userId = this.recordId;
    }

    getStudentPayments({ hallticketNo: this.userId })
      .then((result) => {
        this.paymentsData = result.map((record) => {
          return {
            Year: record.educx__Payment__r.educx__Year__c,
            FeeType: record.educx__Fee_Type__c,
            AmountPaid: record.educx__Amount_Paid__c,
            CreatedDate: record.CreatedDate
          };
        });
      })
      .catch((error) => {
        this.error = error;
      });
  }
}