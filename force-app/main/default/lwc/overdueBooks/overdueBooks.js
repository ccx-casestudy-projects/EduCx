import { LightningElement, track, wire } from "lwc";
import getAllBooks from "@salesforce/apex/BookIssueAndReturnController.allBorrowedBooks";
const columns = [
  {label: "Name",fieldName: "Name",type: "text",hideDefaultActions: 'true' },
  { label: "Bookd Id",fieldName: "BookName",hideDefaultActions: 'true' },
 {label: "Student",fieldName: "StudentName",hideDefaultActions: 'true' },
  {label: "Employee",fieldName: "EmployeeName",hideDefaultActions: 'true' },
  {label: "Status",fieldName: "BookStatus",hideDefaultActions: 'true' },
  {label: "Date of Issue",fieldName: "DateofIssue", type: "Date",hideDefaultActions: 'true' },
{ label: "Date of Return", fieldName: "DateofReturn", type: "Date",hideDefaultActions: 'true' },
 { label: "Overdue By", fieldName: "OverDueBy", type: "Date",hideDefaultActions: 'true' },
 
];
const PAGE_SIZE = 5;
export default class OverdueBooks extends LightningElement {
    columns=columns;
    searchKey = "";
    @track allbooks;
    @track filteredBooks = [];

     // Pagination properties
     @track pageNumber = 1; 
     @track totalPages = 0;
     @track paginatedOverdueBooks = [];
     @track totalRecords = 0;

refreshRecords;
 @wire(getAllBooks)
  wiredbooks({ error, data }) {
    this.refreshRecords=data;
  if (data) {
    this.allbooks = data.filter(
        (record) => record.BookStatus === "Not Returned");
      this.filterRecords();
    }
  else if (error) {
    console.error('Error loading books:', error);
 }

}
searchField(event) {
  this.searchKey = event.target.value;
   this.filterRecords();
  this.firstPage();
 }
filterRecords() {
    const regex = new RegExp(this.searchKey, 'gi');
    this.filteredBooks = this.allbooks.filter(row => {
      return regex.test(row.Name) || 
             (row.BookName && regex.test(row.BookName)) ||
               (row.StudentName && regex.test(row.StudentName)) ||
               (row.EmployeeName && regex.test(row.EmployeeName)) ||
               (row.DateofIssue && regex.test(row.DateofIssue)) ||
                 (row.OverDueBy && regex.test(row.OverDueBy)) 
    });
    this.totalRecords = this.filteredBooks.length;
    this.totalPages = Math.ceil(this.totalRecords / PAGE_SIZE);
    this.pageNumber = 1; // Reset to the first page
    this.updateRecordsToDisplay();
}
 updateRecordsToDisplay() {
  const start = (this.pageNumber - 1) * PAGE_SIZE;
    const end = this.pageNumber * PAGE_SIZE;
  this.paginatedOverdueBooks = this.filteredBooks.slice(start, end);
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

}