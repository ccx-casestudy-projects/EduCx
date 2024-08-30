import { LightningElement,track,wire } from 'lwc';
import getAllBooks from "@salesforce/apex/BookController.getAllBooks";
export default class LibraryMainCmp extends LightningElement {
   
    @track totalbookscount;
    @track isAllBooksVisible = false;
    @track isBorrowedBooksVisible = false;
    @track isBorrowVisible = false;
    @track isAddBookVisible = false;
    @track isOverdueVisible=false;

    connectedCallback(){
    this.isAllBooksVisible = true;
}


     @wire(getAllBooks)
  wiredbooks({ error, data }) {
    //this.refreshRecords=data;
  if (data) {
    this.totalbookscount = data;
    }
  else if (error) {
    console.error('Error loading books:', error);
 }

}
 get TotalBooksCount() {
    if (this.totalbookscount) {
      return this.totalbookscount.length;
    }
    return 0;
  }
  get IssuedBooksCount() {
    if (this.totalbookscount) {
      return this.totalbookscount.filter(
        (record) => record.educx__Status__c === "Issued"
      ).length;
    }
    return 0;
  }
  get OverduebooksCount() {
    if (this.totalbookscount) {
      return this.totalbookscount.filter(
        (record) => record.educx__Status__c === "Not Returned"
      ).length;
    }
    return 0;
  }


    handleFlowButtonClick(event) {
        const buttonvalue = event.currentTarget.value;

        this.isAllBooksVisible = false;
        this.isBorrowedBooksVisible = false;
        this.isBorrowVisible = false;
        this.isAddBookVisible = false;
        this.isOverdueVisible=false;
       

        switch(buttonvalue) {
            case 'Allbooks':
                this.isAllBooksVisible = true;
                break;
            case 'Borrowedbooks':
                this.isBorrowedBooksVisible = true;
                break;
            case 'Borrowbook':
                this.isBorrowVisible = true;
                break;
            case 'Addbook':
                this.isAddBookVisible = true;
                break;
            case 'overduebook':
                  this.isOverdueVisible = true;
                  break;
         
            default:
             this.isAllBooksVisible = true;
                break;
        }
    }
}