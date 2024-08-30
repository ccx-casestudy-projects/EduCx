import { LightningElement, track, wire,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import displayEmployeeRecords from '@salesforce/apex/ExpenditureController.displayExpenditureRecords';
import { deleteRecord } from "lightning/uiRecordApi";
import LightningConfirm from "lightning/confirm";
import { refreshApex } from '@salesforce/apex';



const columns = [
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'Expense Type', fieldName: 'educx__Expense_type__c', type: 'text' },
    { label: 'Amount Spent', fieldName: 'educx__Amount_Spent__c', type: 'text'},
    { label: 'Date Spent', fieldName: 'educx__Date_Spent__c', type: 'date' },
    {
      type: "button-icon",initialWidth: 1,
      typeAttributes: {name: "edit",title: "View",disabled: false,value: "edit",iconPosition: "left",variant: "brand",iconName: "action:edit"}
  },
  {
      type: "button-icon",initialWidth: 1,
      typeAttributes: {name: "del",title: "View",disabled: false,value: "view1",iconPosition: "left",variant: "border-filled",iconName: "action:delete"}
  }
  ];

export default class ExpenditureComp extends LightningElement {
  
  //Adding new Employee
    @track newEmp = false;
    handleAddNewEmp() 
    {
        this.newEmp = true;
    }
    closeModal(event) 
    {
       this.newEmp = false;
       return refreshApex(this.wiredRackList);
    }
    //Editing Employee
     handleEditEmp() 
    {
        this.showEditScreen = true;
    }
    handleModalClose(event) 
    {
       this.showEditScreen = false;
       //return refreshApex(this.wiredRackList);
    }
    
    @api ware;
    selectedRecordId;
    columns = columns;
     @track employees = [];
  

    @wire(displayEmployeeRecords) wareList(result) {
      this.wiredWareList = result;
      if (result.data)
         {
        this.employees = result.data;
        this.error = undefined;
      } 
      else if (result.error) 
        {
        this.error = result.error;
        this.employees = [];
      }
    }

       

 //Edit and delete buttons click
  handleRowAction(event) {
    const action = event.detail.action;
    const row = event.detail.row;
    if (action.name === "edit") {
      this.selectedRecordId = row.Id;
      const modal = this.template.querySelector("c-edit-expenditure");
      modal.show();
      this.showEditScreen = true;
    }
    if (action.name === "del") {
      this.selectedRecordId = row.Id;
      const result = LightningConfirm.open({
        label: "Are you sure you want to delete the record? Please confirm",
        theme: "error"
      }).then((result) => {
        if (result) {
          deleteRecord(this.selectedRecordId)
            .then(() => {
              this.showToast("Success!!", "Record deleted Successfully!!", "success");
              this.handleWareHouse();
            })
            .catch((error) => {
              console.error(error);
              this.showToast("Error!!", "Error Occurred!!", "error");
            });
        }
      });
    }
    
  }
   handleWareHouse(event){
     
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

  //Counting Number of Warehouse Records
  get AllRowCount() {
    if (this.employees) {
      return this.employees.length;
    }
    return 0;
  }
 
}