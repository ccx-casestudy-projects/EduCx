/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api, track } from "lwc";
export default class CustomLookup extends LightningElement {
  @track recordsList;
  @api recordsLst = [];
  @track searchKey = "";
  @api selectedValue;
  @api selectedRecordId;
  //@api objectApiName;
  @api iconName;
  @api lookupLabel;
  @track message;

  onRecordSelection(event) {
    this.selectedRecordId = event.target.dataset.key;
    console.log("this.selectedRecordId :" + this.selectedRecordId);
    this.selectedValue = event.target.dataset.name;
    this.searchKey = "";
    this.onSeletedRecordUpdate();
  }

  handleKeyChange(event) {
    const searchKey = event.target.value;
    this.searchKey = searchKey;
    let searchRecords = [];
    let lowerSearchKey = this.searchKey.toLowerCase();

    for (let record of this.recordsLst) {
      let name = record.Name ? String(record.Name).toLowerCase() : "";
      let phone = record.educx__Course_Name__c
        ? String(record.educx__Course_Name__c).toLowerCase()
        : "";

      if (name.includes(lowerSearchKey) || phone.includes(lowerSearchKey)) {
        searchRecords.push(record);
      }
    }
    this.recordsList = searchRecords;
  }
  onLeave(){
    
  }
  removeRecordOnLookup() {
    this.searchKey = "";
    this.selectedValue = null;
    this.selectedRecordId = null;
    this.recordsList = null;
    this.onSeletedRecordUpdate();
  }

  onSeletedRecordUpdate() {
    console.log("this.selectedRecordId: " + this.selectedRecordId);
    console.log("this.selectedValue :" + this.selectedValue);
    const passEventr = new CustomEvent("recordselection", {
      detail: {
        selectedRecordId: this.selectedRecordId,
        selectedValue: this.selectedValue
      }
    });
    this.dispatchEvent(passEventr);
  }
}