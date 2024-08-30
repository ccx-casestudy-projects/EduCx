import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import displayEmployeeRecords from '@salesforce/apex/EmployeeController.displayEmployeeRecords';
import searchEmployee from '@salesforce/apex/EmployeeController.searchEmployees';
import { refreshApex } from '@salesforce/apex';
import EmpObj from '@salesforce/schema/Employees__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

const columns = [
  { label: 'ID', fieldName: 'Name', type: 'text' },
    { label: 'Employee Name', fieldName: 'educx__Employee_Name__c', type: 'button', initialWidth: 250, },
     { label: 'Email', fieldName: 'educx__Email__c', type: 'email' },
    { label: 'Phone', fieldName: 'educx__Phone__c', type: 'phone' },
    { label: 'Designation', fieldName: 'educx__Designation__c', type: 'text' },
    { label: 'Qualification', fieldName: 'educx__Qualifications__c', type: 'text' },
    { label: 'Specialization', fieldName: 'educx__Specialization__c', type: 'text' },
     {
      type: "button-icon",initialWidth: 1,
      typeAttributes: {name: "edit",title: "View",disabled: false,value: "edit",iconPosition: "left",
      variant: "brand",iconName: "action:edit"}
  },
];

export default class StudentInformation extends LightningElement {
  @track recordTypeData = [];
  rectypevalue;
  @wire(getObjectInfo, { objectApiName: EmpObj })
  objectInfo({ data, error }) {
    if (data) {
      this.recordTypeData = Object.keys(data.recordTypeInfos).map(key => ({
        Id: key,
        Name: data.recordTypeInfos[key].name
      }));
    } else if (error) {
      this.error = error;
    }
  }

  addNewEmployee() {
    Showrectype.open({
      size: 'large',
      empRecTypeData: this.recordTypeData,
      showEdit: true
    }).then((result) => {
      this.rectypevalue = result;
      console.log('This is from Parent ' + result);
    });
  }

  @track newEmp = false;
  handleAddNewEmp() {
    this.newEmp = true;
  }

  closeModal(event) {
    this.newEmp = false;
    return refreshApex(this.wiredRackList);
  }

  handleEditEmp() {
    this.showEditScreen = true;
  }

  handleModalClose(event) {
    this.showEditScreen = false;
    this.selectedRecordId = null;
  }

  @api ware;
  selectedRecordId;
  columns = columns;
  @track employees = [];

  @track currentPage = 1;
  @track pageSize = 5;
  @track totalRecords = 0;
  @track paginatedEmployees = [];

  @wire(displayEmployeeRecords)
  wareList(result) {
    this.wiredWareList = result;
    if (result.data) {
      this.employees = result.data;
      this.totalRecords = result.data.length;
      this.updatePaginatedEmployees();
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.employees = [];
    }
  }

  updatePaginatedEmployees() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    this.paginatedEmployees = this.employees.slice(start, end);
  }

  handleNextPage() {
    if ((this.currentPage * this.pageSize) < this.totalRecords) {
      this.currentPage++;
      this.updatePaginatedEmployees();
    }
  }

  handlePreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedEmployees();
    }
  }

  handleFirstPage() {
    this.currentPage = 1;
    this.updatePaginatedEmployees();
  }

  handleLastPage() {
    this.currentPage = Math.ceil(this.totalRecords / this.pageSize);
    this.updatePaginatedEmployees();
  }

  handleRowAction(event) {
    const action = event.detail.action;
    const row = event.detail.row;
    if (action.name === "clickMe") {
      this.selectedRecordId = row.Id;
      this.showRecScreens = true;
      const modal = this.template.querySelector("c-view-emp-details");
      modal.show();
      return refreshApex(this.refreshRecords);
    }
 if (action.name === "edit") {
      this.selectedRecordId = row.Id;
      const modal = this.template.querySelector("c-edit-employee");
      modal.show();
      this.showEditScreen = true;
    }
  }

  showToast(title, message, variant) {
    this.dispatchEvent(
      new ShowToastEvent({
        title,
        message,
        variant
      })
    );
  }

  get allRowCount() {
    return this.totalRecords;
  }

  get isFirstDisabled() {
    return this.currentPage <= 1;
  }

  get isPreviousDisabled() {
    return this.currentPage <= 1;
  }

  get isNextDisabled() {
    return (this.currentPage * this.pageSize) >= this.totalRecords;
  }

  get isLastDisabled() {
    return (this.currentPage * this.pageSize) >= this.totalRecords;
  }

  get currentPageInfo() {
    const totalPages = Math.ceil(this.totalRecords / this.pageSize);
    return `Page ${this.currentPage} of ${totalPages}`;
  }


  @track newSubToEmp = false;
          assignSubToEmp() {
              this.newSubToEmp = true;
          }
          handleModalCloseFacSub(event) {
              this.newSubToEmp = false;
              return refreshApex(this.wiredRackList);
          }


           searchKey = "";
 @wire(searchEmployee,{ searchKey: "$searchKey" })
  wiredemployees({ error, data }) {
  if (data) {
   
    this.paginatedEmployees = data;
    }
  else if (error) {
    console.error('Error loading books:', error);
 }

}
searchField(event) {
  this.searchKey = event.target.value;
 }
 handleModalClose1(event) {
             this.showRecScreens=false;
          }
}