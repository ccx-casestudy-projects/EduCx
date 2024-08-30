import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getInStockBooks from '@salesforce/apex/BookController.getAllBooks';
import issueBookForEmployee from '@salesforce/apex/BookIssueAndReturnController.issueBook'; 
const columns = [
  { label: 'Name', fieldName: 'Name', type: 'text', hideDefaultActions: true },
  { label: 'Title of the book', fieldName: 'educx__Title_of_the_book__c', hideDefaultActions: true },
  { label: 'Author', fieldName: 'educx__Author__c', hideDefaultActions: true },
  { label: 'Price', fieldName: 'educx__Price__c', type: 'currency', hideDefaultActions: true },
  { label: 'Status', fieldName: 'educx__Status__c', hideDefaultActions: true },
  {
    type: 'button',
    typeAttributes: {
      name: 'issue',
      title: 'Issue',
      disabled: false,
      value: 'issue',
      label: 'Issue',
      variant: 'brand',
    },
  },
];

export default class IssueBooksForEmployee extends LightningElement {
  @track showRecScreen = false;
  @track columns = columns;
  @track selectedRecordId;
  @track allbooks;
  @track wiredBooksResult; 

  @api employeeId; 
  @api candidateType; 

  @api show() {
    alert(this.candidateType);
    this.showRecScreen = true;
  }

  closeModal() {
    
    this.showRecScreen = false;
  }
  searchKey = "";
  @wire(getInStockBooks,{ searchKey: "$searchKey" })
  wiredbooks(result) {
    this.wiredBooksResult = result; 
    if (result.data) {
      this.allbooks = result.data.filter(
        (record) => record.educx__Status__c === "In Stock");
        console.log(this.allbooks+'instock booksS');
    } else if (result.error) {
      console.error('Error loading books:', result.error);
    }
  }
  searchField(event) {
    this.searchKey = event.target.value;
   }
  handleRowAction(event) {
    const action = event.detail.action;
    const row = event.detail.row;

    if (action.name === 'issue') {
      this.selectedRecordId = row.Id;
      this.issueBookToEmployee(this.selectedRecordId);
    }
  }

  issueBookToEmployee(bookId) {
    issueBookForEmployee({ bookId: bookId, personId: this.employeeId, candidateType: this.candidateType })
      .then(() => {
        this.showToast('Success', 'Book issued successfully', 'success');
        this.closeModal();
        return refreshApex(this.wiredBooksResult); // Refresh the data
      })
      .catch((error) => {
        this.showToast('Error', 'Error issuing book: ' + error.body.message, 'error');
      });
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
    });
    this.dispatchEvent(event);
  }
}