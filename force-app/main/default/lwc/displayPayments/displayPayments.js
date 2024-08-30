import { LightningElement, track, wire, api } from 'lwc';
import getAllPayments from '@salesforce/apex/DisplayPaymentDetails.getAllPayments';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';

const baseColumns = [
    { label: 'Payment  Number', fieldName: 'Name', type: 'text',sortable: "true" },
    { label: 'Hallticket', fieldName: 'educx__Student_Hall_Ticket_No__c', type: 'text' ,sortable: "true"},
    { label: 'Student Name', fieldName: 'educx__Student__r.educx__Name_of_The_Candidate__c',apiName:'educx__Student__r.educx__Name_of_The_Candidate__c', type: 'text', sortable: "true" },
    { label: 'Year', fieldName: 'educx__Year__c', type: 'text',sortable: "true" },
    { label: 'Total Fee ', fieldName: 'educx__Total_fee__c', type: 'currency' },
     { label: 'Total Fee Paid ', fieldName: 'educx__Total_Amount_Paid__c', type: 'currency' },
    { label: 'Total Fee Balance', fieldName: 'educx__Total_Balance__c', type: 'currency' },
    {
        type: "button",
        typeAttributes: { name: "View",label:"Detail", variant: "brand" }
    }
];

export default class DisplayPayments extends NavigationMixin(LightningElement) {

    


    @track paymentscreen = false;
    columns = baseColumns;
    @track data = [];
    @track filterPayment;
    @track paymentRecords=[];
    @track paymentDetails = [];
    @track currentPage = 1;
    pageSize = 10;
    @track totalPages = 0;
    @track paginatedRecords = [];
    @track isPrevDisabled = true;
    @track isNextDisabled = true;
    @track paginatedPaymentDetails = [];
    @track searchKey;
    selectedPaymentIds = []; // Store selected rows
     @track sortBy;
    @track sortDirection;

    // For search text
    searchName(event) {
        this.enteredName = event.target.value;
        this.updateSearch();
    }

    @track wiredPaymentResults;
    
    

    @wire(getAllPayments) wiredResults(result) {
    this.wiredWareList = result;
    if (result.data) {
      this.filterPayment = this.formatDataSet(result.data);
      this.paymentRecords = this.filterPayment;
      this.updatePaginationInfo();
    }
    else if (result.error) {
      this.error = result.error;
      this.paymentRecords = [];
    }
  }

  doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.paginatedRecords));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.paginatedRecords = parseData;
    }    

    
    updatePaginationInfo() {
    this.totalPages = Math.ceil(this.paymentRecords.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.paymentRecords.length);
    this.paginatedRecords = this.paymentRecords.slice(startIndex, endIndex);
    console.log('paginated records'+JSON.stringify(this.paginatedRecords));
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

    
    handleClick() {
        this.paymentscreen = true;
        console.log('payment screen--' + this.paymentscreen);
    }

    
    @track isModalOpen = false;
    handleRowAction(event) {
        const action = event.detail.action.name;
        this.rowid = event.detail.row.Id;
       if (event.detail.action.name == 'View') 
        {
            let compDefinition =  
                {   
                    componentDef: "c:displayPaymentDetails",  
                     attributes:
                {
                  paymentId:this.rowid
                } 
                };
    
                let encodedCompDef = btoa(JSON.stringify(compDefinition));
                  this[NavigationMixin.Navigate]({
                  type: "standard__webPage",
                  attributes:  
                    {  
                       url: "/one/one.app#" + encodedCompDef   
                    }  
                }); 
        }
    }

    // handleRowAction(event) {
    
    //         this.rowid = event.detail.row.Id;
            
    //     
    //     }

    
    handleSuccess() {
        this.showToast('Success', 'Record updated successfully', 'success');
        this.isModalOpen = false;
        return refreshApex(this.wiredPaymentResults);
    }

    
    handleError(event) {
        console.error('Error updating record: ', event.detail.message);
    }
    handleCloseModal1() {
        this.isModalOpen = false;
    }

    
    handleCloseModal(event) {
        this.paymentscreen = event.detail.detail;
        return refreshApex(this.wiredPaymentResults); 
    }

    
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        this.selectedPaymentIds = selectedRows.map(row => {
            return row.Id;
        });
    }

    
    async handleDelete() {
        if (this.selectedPaymentIds.length === 0) {
            this.showToast('No records selected.', 'Please select records to delete.', 'warning');
            return;
        }

        const result = await LightningConfirm.open({
            variant: 'header',
            theme: 'error',
            label: 'Please Confirm',
            message: 'Are you sure you want to delete the selected records?',
        });

        if (result) {
            try {
                const deletePromises = [];
                this.selectedPaymentIds.forEach(paymentId => {
                    deletePromises.push(deleteRecord(paymentId));
                });
                await Promise.all(deletePromises);

                this.showToast('Records Deleted Successfully.', '', 'success');
                console.log('Records deleted successfully.');
                // Clear the selected IDs after deletion
                this.selectedPaymentIds = [];

                // Refresh the data after successful deletion
                await refreshApex(this.wiredPaymentResults);
                this.updatePagination();
                this.adjustPageAfterDelete();
            } catch (error) {
                this.showToast('Error deleting records.', '', 'error');
            }
        }
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;
        console.log('earch key'+this.searchKey);
        this.filterRecords();
    }

    filterRecords() {
    console.log('inside filter');
    const regex = new RegExp(this.searchKey, 'gi');
    this.paymentRecords = this.filterPayment.filter(row => {
        const isMatch = regex.test(row.Name) || 
                        regex.test(row.educx__Student__r.educx__Name_of_The_Candidate__c) || 
                        regex.test(row.educx__Student_Hall_Ticket_No__c) || 
                        regex.test(row.educx__Year__c);
        console.log('match'+JSON.stringify(this.paymentRecords));
        return isMatch;
    });

    // Update pagination if needed
    this.currentPage = 1;
    this.updatePaginationInfo();
}

    //adjusting pagination after delete
    adjustPageAfterDelete() {
        const totalPages = this.totalPages;
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }
        this.updatePaginationInfo();
    }

    //Show toast function
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
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