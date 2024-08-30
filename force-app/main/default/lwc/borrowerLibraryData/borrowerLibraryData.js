import { LightningElement, track, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import allBorrowedBooksUser from '@salesforce/apex/BookIssueAndReturnController.allBorrowedBooksUser';
import returnBook from '@salesforce/apex/BookIssueAndReturnController.returnBook';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';

export default class BorrowerLibraryData extends LightningElement {
   @api columns = [
        { label: "BIR Id", fieldName: "Name", hideDefaultActions: true },
        { label: "Book Id", fieldName: "BookId", hideDefaultActions: true },
        { label: "Title of the book", fieldName: "BookName", hideDefaultActions: true },
        { label: "Status", fieldName: "BookStatus", hideDefaultActions: true },
        { label: "Date of Issue", fieldName: "DateofIssue", type: "date", hideDefaultActions: true },
        { label: "Due Date", fieldName: "DueDate", type: "date", hideDefaultActions: true },
        { label: "OverDueBy", fieldName: "OverDueBy", type: "number", hideDefaultActions: true },
        {
            type: "button",
            initialWidth: 90,
            typeAttributes: {
                name: "Return",
                title: "Return",
                value: "return",
                label: 'Return',
                variant: "brand"
            }
        }
    ];

    @api candidateName;
    @api candidateIdS;
    @api candidateId;
    @api candidateType;
    @track allbooks;
    @track wiredBooksResult;
    @track isStudent = false;
    @track isEmployee = false;
    @api show;
    
    
    connectedCallback() {
        this.loadBorrowerData();
    }

    loadBorrowerData() {
        if (this.candidateType === 'student') {
            this.isStudent = true;
            this.isEmployee = false;
        } else if (this.candidateType === 'employee') {
            this.isStudent = false;
            this.isEmployee = true;
        }

        this.refreshData();
    }

    @wire(allBorrowedBooksUser, { recordId: '$candidateId', candidateType: '$candidateType' })
    wiredbooks(result) {
        this.wiredBooksResult = result;
        if (result.data) {
            this.allbooks = result.data;
            console.log(this.allbooks + ' bookslist');
        } else if (result.error) {
            console.error('Error loading books:', result.error);
        }
    }

    refreshData() {
        return refreshApex(this.wiredBooksResult);
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'Return') {
           
             LightningConfirm.open({
                label: "Are you sure you want to return the book",
                theme: 'alt-inverse'
              }).then((result) => {
                if (result) {
                    this.returnBook(row.Id);
                //this.returnBook(bookId);
                }
            }); 
            
    }
}

    get disableIssueButton() {
        if (this.isStudent) {
            return !(this.allbooks && this.allbooks.length < 3);
        } else if (this.isEmployee) {
            return !(this.allbooks && this.allbooks.length < 5);
        }
        return true;
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
                this.refreshData();
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

    handleIssue() {
        const modal = this.template.querySelector("c-issue-books-for-candidate");
        modal.show();
        this.refreshData();
    }

    get allbooksLength() {
        return this.allbooks ? this.allbooks.length : 0;
    }
}