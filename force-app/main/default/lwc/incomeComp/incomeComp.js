import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import displayIncomeRecords from '@salesforce/apex/IncomeController.displayIncomeRecords';
import saveIncome from '@salesforce/apex/IncomeController.saveIncome';
import { deleteRecord } from "lightning/uiRecordApi";
import LightningConfirm from "lightning/confirm";
import { refreshApex } from '@salesforce/apex';



const columns = [
  { label: 'Name', fieldName: 'Name', type: 'text' },
  { label: 'Student Name', fieldName: 'educx__Student_Id__r.educx__Name_of_The_Candidate__c', apiName: 'educx__Student_Id__r.educx__Name_of_The_Candidate__c', type: 'text' },
  { label: 'Amount Received', fieldName: 'educx__Amount_Received__c', type: 'text' },
  { label: 'Source', fieldName: 'educx__Source__c', type: 'text' },
  { label: 'Date Received', fieldName: 'educx__Date_Received__c', type: 'date' },
  {
    type: "button-icon", initialWidth: 1,
    typeAttributes: { name: "edit", title: "View", disabled: false, value: "edit", iconPosition: "left", variant: "brand", iconName: "action:edit" }
  },
  {
    type: "button-icon", initialWidth: 1,
    typeAttributes: { name: "del", title: "View", disabled: false, value: "view1", iconPosition: "left", variant: "border-filled", iconName: "action:delete" }
  }
];

export default class IncomeComp extends LightningElement {

  //Adding new Employee
  
  @track filterIncome;
  @track showEditIncome = false;
  @track incomeRecordId = '';
  @track currentPage = 1;
  pageSize = 10;
  @track totalPages = 0;
  @track paginatedRecords = [];
  @track isPrevDisabled = true;
  @track isNextDisabled = true;
  @track IncomeTarget = 'educx__Student__c';
  @track studentId;
  @track amountReceived;
  @track source;
  @track dateReceived;
  @track isIncomeCreate = false;
  @track error;
  @track searchKey;
  @track searchDate;
 
  closeModal(event) {
    this.showEditIncome = false;

  }
  //Editing Employee
  handleEditEmp() {
    this.showEditScreen = true;
  }
  handleModalClose(event) {
    this.showEditScreen = false;
    //return refreshApex(this.wiredRackList);
  }

  @api ware;
  selectedRecordId;
  columns = columns;
  @track incomeRecords = [];


  @wire(displayIncomeRecords) wareList(result) {
    this.wiredWareList = result;
    if (result.data) {
      this.filterIncome = this.formatDataSet(result.data);
      this.incomeRecords = this.filterIncome;
      this.updatePaginationInfo();
    }
    else if (result.error) {
      this.error = result.error;
      this.incomeRecords = [];
    }
  }

  displayCourses = {
    educx__Student__c: {
      additionalFields: ['educx__Name_of_The_Candidate__c']
    }
  }
  matchingCourses = {
    educx__Student__c: {
      additionalFields: [{ fieldPath: 'educx__Name_of_The_Candidate__c' }]
    }
  }
  get displayIncome() {
    return this.displayCourses[this.IncomeTarget];
  }
  get matchingIncome() {
    return this.matchingCourses[this.IncomeTarget];
  }

  handleOnChange(event) {
    if (event.target.label === 'Student') {
      this.studentId = event.detail.recordId;
      console.log('student id ' + this.studentId);
    }

    if (event.target.label === 'Amount Received') {
      this.amountReceived = event.detail.value;
      console.log('amountReceived ' + this.amountReceived);
    }
    if (event.target.label === 'Source') {
      this.source = event.detail.value;
      console.log('source' + this.source);
    }

    if (event.target.label === 'Date Received') {
      this.dateReceived = event.detail.value;
      console.log('date received--' + this.dateReceived);
      
    }
  }

  handleSubmitUpdate(event) {

  const fields = event.detail.fields;
  this.template.querySelector('lightning-record-edit-form').submit(fields);
  this.showToast("Success!!", "income Record updated successfully!!", "success");
    this.closeModal();
    this.handleRefresh();

}

handleSuccessUpdate() {

  
  this.handleRefresh();
}


  handleCreate() {
    this.isIncomeCreate = true;
  }
  handleIncomeModal() {
    this.isIncomeCreate = false;
  }

  handleIncomeSave(event)
  { 

       const incomeRecord = {
            educx__Student_Id__c: this.studentId,
            educx__Source__c: this.source,
            educx__Amount_Received__c: this.amountReceived,
            educx__Date_Received__c :this.dateReceived

        };
        
        saveIncome({ incomeRecordToInsert: incomeRecord })
            .then(() => {
                 this.showToast("Success!!", "income Record Created successfully!!", "success");
                this.handleRefresh();
                this.handleIncomeModal();
            })
            .catch(error => {
                 this.showToast("Error", "There was an error saving Income record.", "error");
                console.error('Error saving Income Record:', error);
            });

  }


  handleRowAction(event) {
    const action = event.detail.action;
    const row = event.detail.row;

    console.log('actions-->' + JSON.stringify(action.name));
    console.log('rows-->' + JSON.stringify(row.Id));
    if (action.name === "edit") {
      this.incomeRecordId = row.Id;
      this.showEditIncome = true;
      console.log('income record id-->' + this.incomeRecordId);

    }


    if (action.name === "del") {
      this.selectedRecordId = row.Id;
      const result = LightningConfirm.open({
        label: "Are you sure you want to delete the record? ",
        theme: "error"
      }).then((result) => {
        if (result) {
          deleteRecord(this.selectedRecordId)
            .then(() => {
              this.showToast("Success!!", "Record deleted Successfully!!", "success");
              this.handleRefresh();
            })
            .catch((error) => {
              console.error(error);
              this.showToast("Error!!", "Error Occurred!!", "error");
            });
        }
      });
    }

  }
  handleRefresh() {

    refreshApex(this.wiredWareList);
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

  
   formatIndianNumber(amount) {
    let amountString = amount.toString();
    let lastThree = amountString.slice(-3);
    let otherNumbers = amountString.slice(0, -3);
    if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
    }
    otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return otherNumbers + lastThree;
}

get AllRowCount() {
    if (this.incomeRecords && Array.isArray(this.incomeRecords)) {
        const totalAmount = this.incomeRecords.reduce((total, record) => total + (record.educx__Amount_Received__c || 0), 0);
        return this.formatIndianNumber(totalAmount);
    }
    return 0;
}


  

  updatePaginationInfo() {
    this.totalPages = Math.ceil(this.incomeRecords.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.incomeRecords.length);
    this.paginatedRecords = this.incomeRecords.slice(startIndex, endIndex);
    this.isPrevDisabled = this.currentPage === 1;
    this.isFirstPage = this.currentPage === 1;
    this.isLastPage = this.currentPage === this.totalPages;
    this.isNextDisabled = this.currentPage === this.totalPages;
  }

  handlePrevious() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.updatePaginationInfo();
    }
  }

  handleNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.updatePaginationInfo();
    }
  }

  handleFirstPage() {
    this.currentPage = 1;
    this.updatePaginationInfo();
  }

  handleLastPage() {
    this.currentPage = this.totalPages;
    this.updatePaginationInfo();
  }

  // updateSearch(event) {
  //       this.searchKey = event.target.value;
  //       console.log('search key'+this.searchKey);
  //       const regex = new RegExp(this.searchKey, 'gi');
  //       this.incomeRecords = this.filterIncome.filter(row => {
  //          const studentName = row.educx__Student_Id__r ? row.educx__Student_Id__r.educx__Name_of_The_Candidate__c : '';
  //       const source = row.educx__Source__c || '';

  //       return regex.test(studentName) || regex.test(source);
  //       });
  //       this.currentPage = 1;
  //       this.updatePaginationInfo()
  //   }

  handleSearchChange(event) {
        this.searchKey = event.target.value;
        this.filterRecords();
    }

    handleDateChange(event) {
        this.searchDate = event.target.value;
        this.filterRecords();
    }

    filterRecords() {
    // Get the search text

    // Create regex for search key
    const regex = new RegExp(this.searchKey, 'gi');

    // Filter records by both search key and date
    const filterDate = this.searchDate ? new Date(this.searchDate).toDateString() : null;
    this.incomeRecords = this.filterIncome.filter(row => {
        const studentName = row.educx__Student_Id__r ? row.educx__Student_Id__r.educx__Name_of_The_Candidate__c : '';
        const source = row.educx__Source__c || '';
        const recordDate = row.educx__Date_Received__c ? new Date(row.educx__Date_Received__c).toDateString() : null;
        
        // Check if the record matches both search key and date criteria
        const matchesSearch = regex.test(studentName) || regex.test(source);
        const matchesDate = !filterDate || recordDate === filterDate;

        return matchesSearch && matchesDate;
    });

    // Update pagination if needed
    this.currentPage = 1;
    this.updatePaginationInfo();
}



  formatDataSet(data) {
    return data.map(item => {
      const row = { ...item };
      this.columns.forEach(column => {
        if (column.apiName) {
          const fieldName = column.fieldName;
          const apiFields = column.apiName.split('.');
          if (apiFields.length > 1) {
            const apiObject = apiFields[0];
            const apiField = apiFields[1];
            row[fieldName] = item[apiObject] && item[apiObject][apiField] ? item[apiObject][apiField] : '';
          }
        }
      });
      return row;
    });
  }

}