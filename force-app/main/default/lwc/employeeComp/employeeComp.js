import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import displayEmployeeRecords from '@salesforce/apex/EmployeeController.displayEmployeeRecords';
import { refreshApex } from '@salesforce/apex';
import EmpObj from '@salesforce/schema/Employees__c';
import Showrectype from 'c/selectRecordType';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

const columns = [
  { label: 'ID', fieldName: 'Name', type: 'text' },
  { 
    label: 'Employee Name', 
    fieldName: 'educx__Employee_Name__c', 
    type: 'button', 
    typeAttributes: {
      label: { fieldName: "educx__Employee_Name__c" },
      name: "clickMe",
      variant: "base"
    }
  },
  { label: 'Email', fieldName: 'educx__Email__c', type: 'email' },
  { label: 'Phone', fieldName: 'educx__Phone__c', type: 'phone' },
  { label: 'Designation', fieldName: 'educx__Designation__c', type: 'text' },
  { label: 'Qualification', fieldName: 'educx__Qualifications__c', type: 'text' },
  { label: 'Specialization', fieldName: 'educx__Specialization__c', type: 'text' },
  { label: 'Date of joining', fieldName: 'educx__Date_of_joining__c', type: 'date' },
  { label: 'Status', fieldName: 'educx__Status__c', type: 'text' },
  {
    type: "button-icon", 
    initialWidth: 1,
    typeAttributes: {
      name: "edit",
      title: "View",
      disabled: false,
      value: "edit",
      iconPosition: "left",
      variant: "brand",
      iconName: "action:edit"
    }
  },
];

export default class EmployeeComp extends LightningElement {
  @track recordTypeData = [];
  rectypevalue;
  selectedRecordId;
  columns = columns;
  @track employees = [];
  @track currentPage = 1;
  @track pageSize = 5;
  @track totalRecords = 0;
  @track paginatedEmployees = [];
  searchKey = "";

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
      size: 'small',
      empRecTypeData: this.recordTypeData,
      showEdit: true
    }).then((result) => {
      this.rectypevalue = result;
      console.log('Record type from Parent comp ' + result);
    });
  }


  @wire(displayEmployeeRecords)
  wiredEmployees(result) {
    this.wiredEmpList = result;
    if (result.data) {
      // Filter out employees whose status is not 'Working' or 'Resigned'
      this.employees = result.data.filter(emp => emp.educx__Status__c === 'Working' || emp.educx__Status__c === 'Resigned');
      this.filteredEmployees = this.employees;
      this.totalRecords = this.filteredEmployees.length;
      this.updatePaginatedEmployees();
    } else if (result.error) {
      this.showToast('Error', 'Error fetching employee records', 'error');
      this.employees = [];
    }
  }

  handleSearchKeyChange(event) {
    this.searchKey = event.target.value.toLowerCase();
    this.filterEmployees();
    this.currentPage = 1;
    this.updatePaginatedEmployees();
  }
    
  filterEmployees() {
    this.filteredEmployees = this.searchKey ? 
      this.employees.filter(emp => emp.educx__Employee_Name__c.toLowerCase().includes(this.searchKey)||
      emp.Name.toLowerCase().includes(this.searchKey)||
      emp.educx__Status__c.toLowerCase().includes(this.searchKey)||
       emp.educx__Designation__c.toLowerCase().includes(this.searchKey)) : 
      this.employees;
    this.totalRecords = this.filteredEmployees.length;
    this.currentPage = 1;
    this.updatePaginatedEmployees();
  }

  updatePaginatedEmployees() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    this.paginatedEmployees = this.filteredEmployees.slice(start, end);
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

  @track newEmp = false;
  handleAddNewEmp() {
    this.newEmp = true;
  }

  closeModal(event) {
    this.newEmp = false;
    return refreshApex(this.wiredEmpList);
  }

  handleEditEmp() {
    this.showEditScreen = true;
  }

  handleModalClose(event) {
    this.showEditScreen = false;
    this.selectedRecordId = null;
  }

  @track newSubToEmp = false;
  assignSubToEmp() {
    this.newSubToEmp = true;
  }

  handleModalCloseFacSub(event) {
    this.newSubToEmp = false;
    return refreshApex(this.wiredEmpList);
  }

  handleModalClose1(event) {
    this.showRecScreens = false;
  }

  @track searchEmp = false;
  handleSearchEmp(event) {
    this.searchEmp = false;
  }

  searchEmployeess() {
    this.searchEmp = true;
  }
}