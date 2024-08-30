/* eslint-disable eqeqeq */
import { LightningElement, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getRecordsByStudent from "@salesforce/apex/ApprovalRequestDetailsController.getRecordsByStudent";
import noDueAttachment from "@salesforce/apex/ApprovalRequestDetailsController.noDueAttachment";
import getCertificateDownloadUrl from "@salesforce/apex/ApprovalRequestDetailsController.getCertificateDownloadUrl";

const COLUMNS = [
  {
    label: "Document Requested",
    fieldName: "educx__Document_Type__c",
    type: "Picklist"
  },
  { label: "Submission Date", fieldName: "CreatedDate", type: "date" },
  { label: "Approval Status", fieldName: "educx__Status__c", type: "Picklist" },
  {
    label: "View File",
    type: 'button-icon',
        initialWidth: 75,
        typeAttributes: {
            label: "Preview",
            name: "Preview",
            iconName: 'utility:attach',
            title: 'Preview',
            variant: 'border-filled',
            alternativeText: 'View',
            disabled: { fieldName: "hasContentDocument" }
        },
  },
  {
    label: "Download",
    type: "button-icon",
    typeAttributes: {
      label: "Download",
      name: "Download",
      iconName: "utility:download",
      variant: "brand",
      disabled: { fieldName: "isDownladable" }
    },
    cellAttributes: { alignment: "center" }
  }
];

export default class StudentApprovalStatusPage extends NavigationMixin(
  LightningElement
) {
  @track records = [];
  @track columns = COLUMNS;
  @track selectedRowId;
  @track refreshResult = [];
  hallticketno;
  documentType;
  studentID;

  connectedCallback() {
    this.hallticketno = sessionStorage.getItem("UserName");
    getRecordsByStudent({ hallTicketNo: this.hallticketno })
      .then((result) => {
        this.refreshResult = result;
        this.records = this.formatDataSet(result);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  formatDataSet(data) {
    return data.map((audit) => {
      const row = Object.assign({}, audit);
      row.hasContentDocument = !(
        audit.ContentDocumentLinks && audit.ContentDocumentLinks.length > 0
      );
      row.isDownladable = !(audit.educx__Status__c == "Ready");
      return row;
    });
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    console.log("actionName", actionName);
    this.selectedRowId = event.detail.row.Id;
    //this.selectedRowId = row.Id;
    this.documentType = event.detail.row.educx__Document_Type__c;
    if (this.selectedRowId != null || this.selectedRowId != "") {
      if (actionName === "Preview") {
        noDueAttachment({ studentApproveId: this.selectedRowId })
          .then((result) => {
            console.log("doc id", JSON.stringify(result));
            this.previewHandler(result);
          })
          .catch((error) => {
            console.error("error", error);
          });
      } else {
        this.studentID = row.educx__Student_ID__c;
        this.downloadHandler();
      }
    }
  }

  previewHandler(previewDocId) {
    this[NavigationMixin.Navigate]({
      type: "standard__namedPage",
      attributes: {
        pageName: "filePreview"
      },
      state: {
        selectedRecordId: previewDocId
      }
    });
  }
  downloadHandler() {
    console.log('this.studentID :'+this.studentID);
     console.log('this.hallticketno :'+this.hallticketno);
      console.log('this.documentType :'+this.documentType);
    getCertificateDownloadUrl({
      recordId: this.studentID,
      hallTicketNo: this.hallticketno,
      docType: this.documentType
    })
      .then((data) => {
        console.log("no due attachment", data);
        this[NavigationMixin.Navigate](
          {
            type: "standard__webPage",
            attributes: {
              url: data
            }
          },
          false
        );
      })
      .catch((error) => {
        console.log("error", error);
      });
  }
}