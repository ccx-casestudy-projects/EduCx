/* eslint-disable eqeqeq */
/* eslint-disable vars-on-top */
import { LightningElement, track, api } from "lwc";

import getStudentAttendance from "@salesforce/apex/loginController.getStudentAttendance";

export default class StuAttendanceCmp extends LightningElement {
  userId;
  @api recordId;
  @track attendanceData;
  get attendancecolumns() {
    return [
      {
        label: "Month",
        fieldName: "Month",
        type: "text"
      },
      {
        label: "Subject",
        fieldName: "Subject",
        type: "text",
        wrapText: true,
        cliptext: false
      },
      {
        label: "Conducted (Cls)",
        fieldName: "classConducted",
        type: "number",
        wraptext: true
      },
      {
        label: "Attended (Cls)",
        fieldName: "classAttended",
        type: "number",
        wraptext: true
      }
    ];
  }

  connectedCallback() {
    if (this.recordId) {
      this.userId = this.recordId;
    }
    getStudentAttendance({ hallticketNo: this.userId })
      .then((result) => {
        this.attendanceData = result.map((record) => {
          return {
            Month: record.educx__AttendanceDetails__r[0].educx__Months__c,
            Subject: record.educx__Subject__r.Name,
            classConducted: record.educx__Total_Classes_Conducted__c,
            classAttended: record.educx__Total_Classes_Attended__c
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }
}