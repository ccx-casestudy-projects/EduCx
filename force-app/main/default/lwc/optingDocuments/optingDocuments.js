/* eslint-disable no-else-return */
/* eslint-disable eqeqeq */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import { LightningElement, api, track } from "lwc";
import approvalRequest from "@salesforce/apex/approvalRequestRecordCreation.approvalRequest";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class OptingDocuments extends LightningElement {
  @track typeValues = [];
  @track reasonSelectedValue;
  @track isShowModal = false;
  @track otherReasonEnable = false;
  @track isRequired = false;
  @track isDisabled = false;

  @api studentValue;
  @api studentrecordId;
  @api courseValue;
  @api course;
  @api courseName;
  @track otherValue;
  dataloaded = false;

  @track uploadedFiles = [];

  get typeOptions() {
    return [
      { label: "Transfer Certificate", value: "Transfer Certificate(TC)" },
      { label: "Bonafide", value: "Bonafide Certificate" },
      { label: "SSC certificate", value: "SSC Certificate" },
      { label: "Intermediate Certificate", value: "Inter Certificate" }
    ];
  }

  get reasons() {
    return [
      { label: "Graduated", value: "Graduated" },
      { label: "Transfer", value: "Transfer" },
      { label: "Passport Verification", value: "Passport Verification" },
      { label: "Other", value: "Other" }
    ];
  }
  handleApply() {
    this.isShowModal = true;
  }

  connectedCallback() {
    this.isDisabled = true;
    this.dataloaded = true;
  }

  handleCheckboxChange(event) {
    this.typeValues = event.detail.value;
  }

  handleReasonChange(event) {
    this.reasonSelectedValue = event.detail.value;
    if (this.reasonSelectedValue === "Other") {
      this.otherReasonEnable = true;
      this.isRequired = true;
    } else {
      this.otherReasonEnable = false;
      this.isRequired = false;
    }
  }
  handleTextAreaChange(event) {
    this.otherValue = event.detail.value;
  }

  handleSave() {
    const documentTypes = this.typeValues;
    const studentID = this.studentrecordId;
    const courseName = this.courseValue;
    const reason = this.reasonSelectedValue;
    const otherReasonText = this.otherValue;

    approvalRequest({
      documentTypes,
      studentID,
      courseName,
      reason,
      otherReasonText
    })
      .then((result) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Approval Request sent successfully.",
            variant: "success"
          })
        );
        this.isShowModal = false;
      })
      .catch((error) => {
        console.error("Error creating records:", error.message);
      });
  }

  handleCancel() {
    this.hideModalBox();
  }
  hideModalBox() {
    this.typeValues = [];
    this.reasonSelectedValue = "";
    this.otherValue = "";
    this.uploadedFiles = [];
    this.isShowModal = false;
  }
}