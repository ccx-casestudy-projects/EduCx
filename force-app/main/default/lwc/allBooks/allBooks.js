import { LightningElement, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { deleteRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import LightningConfirm from "lightning/confirm";
import getAllBooks from "@salesforce/apex/BookController.getAllBooks";

const columns = [
  { label: "Name", fieldName: "Name", type: "text", hideDefaultActions: 'true' },
  { label: "Title of the book", fieldName: "educx__Title_of_the_book__c", hideDefaultActions: 'true' },
  { label: "Author", fieldName: "educx__Author__c", hideDefaultActions: 'true' },
  { label: "Price", fieldName: "educx__Price__c", type: "currency", hideDefaultActions: 'true' },
  { label: "Status", fieldName: "educx__Status__c", hideDefaultActions: 'true' },
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
  {
    type: "button-icon",
    initialWidth: 1,
    typeAttributes: {
      name: "del",
      title: "View",
      disabled: false,
      value: "view1",
      iconPosition: "left",
      variant: "border-filled",
      iconName: "action:delete"
    }
  }
];

const PAGE_SIZE = 5;

export default class AllBooks extends LightningElement {
  columns = columns;
  @track allbooks = [];
  @track filteredBooks = [];
  @track recordsToDisplay = [];
  searchKey = "";
  selectedRecordId;
  @track allbooks1 = [];

  // Pagination properties
  @track pageNumber = 1; 
  @track totalPages = 0;
  @track totalRecords = 0;

  @wire(getAllBooks)
  wiredBooks({ error, data }) {
    this.allbooks1 = data;
    if (data) {
      this.allbooks = data;
      this.filterRecords(); // Initial filter to populate recordsToDisplay
    } else if (error) {
      console.error('Error loading books:', error);
    }
  }

  handleSearchChange(event) {
    this.searchKey = event.target.value;
    this.filterRecords();
  }

  filterRecords() {
    const regex = new RegExp(this.searchKey, 'gi');
    this.filteredBooks = this.allbooks.filter(row => {
      return regex.test(row.Name) || 
             regex.test(row.educx__Title_of_the_book__c) ||
             regex.test(row.educx__Author__c) || 
             regex.test(row.educx__Price__c) || 
             regex.test(row.educx__Status__c);
    });

    this.totalRecords = this.filteredBooks.length;
    this.totalPages = Math.ceil(this.totalRecords / PAGE_SIZE);
    this.pageNumber = 1; // Reset to the first page
    this.updateRecordsToDisplay();
  }

  updateRecordsToDisplay() {
    const start = (this.pageNumber - 1) * PAGE_SIZE;
    const end = this.pageNumber * PAGE_SIZE;
    this.recordsToDisplay = this.filteredBooks.slice(start, end);
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.updateRecordsToDisplay();
    }
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.updateRecordsToDisplay();
    }
  }

  firstPage() {
    this.pageNumber = 1;
    this.updateRecordsToDisplay();
  }

  lastPage() {
    this.pageNumber = this.totalPages;
    this.updateRecordsToDisplay();
  }

  get bDisableFirst() {
    return this.pageNumber === 1;
  }

  get bDisableLast() {
    return this.pageNumber === this.totalPages;
  }

  handleRowAction(event) {
    const action = event.detail.action;
    const row = event.detail.row;

    if (action.name === "edit") {
      this.selectedRecordId = row.Id;
      //alert(this.selectedRecordId);
      const modal = this.template.querySelector("c-update-added-book");
      modal.show();
      this.showRecScreen = true;
    } else if (action.name === "del") {
      this.selectedRecordId = row.Id;
      LightningConfirm.open({
        label: "Are you sure you want to delete this Record?",
        theme: "error"
      }).then((result) => {
        if (result) {
          deleteRecord(this.selectedRecordId)
            .then(() => {
              this.showToast("Success!!", "Deleted Successfully!!", "success");
              this.filterRecords(); // Reapply filter after deletion
              return refreshApex(this.allbooks1);
            })
            .catch((error) => {
              console.error(error);
              this.showToast("Error!!", "Activated orders can't be deleted", "error");
            });
        }
      });
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
}