import { LightningElement, wire, api, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import allBorrowedBooksOfStudent from '@salesforce/apex/BookIssueAndReturnController.allBorrowedBooksUser';
import returnBook from '@salesforce/apex/BookIssueAndReturnController.returnBook';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const columns = [
      { label: "BIR Id", fieldName: "Name", hideDefaultActions: true },
  { label: "Book Id", fieldName: "BookId", hideDefaultActions: true },
    { label: "Title of the book", fieldName: "BookName", hideDefaultActions: true },
    { label: "Status", fieldName: "BookStatus" ,hideDefaultActions: true },
    { label: "Date of Issue", fieldName: "DateofIssue", type: "date", hideDefaultActions: true },
    { label: "Due Date", fieldName: "DueDate", type: "date", hideDefaultActions: true },
    { label: "OverDueBy", fieldName: "OverDueBy", type: "number", hideDefaultActions: true },
    //{ label: "Return Status", fieldName: "BookStatusinreturns",  hideDefaultActions: true },
    {
        type: "button",
        initialWidth: 90,
        typeAttributes: {
            name: "Return",
            title: "Return",
            disabled: false,
            value: "return",
            label: 'Return',
            variant: "brand"
        }
    }
];
export default class StudentLibraryData extends LightningElement {
    @api studentName ;
    @api studentId;
    @api studentHallTicket;
    @track allbooks;
    @track wiredBooksResult;
    columns = columns;
    @api candidateType;


    @wire(allBorrowedBooksOfStudent, { recordId: '$studentHallTicket' ,candidateType:'$candidateType'})
   wiredbooks(result) {
    this.wiredBooksResult = result; 
    if (result.data) {
      this.allbooks = result.data;
    } else if (result.error) {
      console.error('Error loading books:', result.error);
    }
  }
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'Return') {
            this.returnBook(row.Id);
        }
    }
  get disableIssueButton() {
        return !(this.allbooks && this.allbooks.length < 3);
    }
    returnBook(bookId) {
        returnBook({ bookId })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Book returned successfully',
                        variant: 'success'
                    })
                );
                   return refreshApex(this.wiredBooksResult); 
                
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error returning book',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }
    showRecScreen;
    handleIssue(){
        this.showRecScreen = true;
        const modal = this.template.querySelector("c-issue-books-for-candidate");
        modal.show();
        return refreshApex(this.wiredBooksResult);
    }
    get allbooksLength() {
        return this.allbooks ? this.allbooks.length : 0;
    }
}