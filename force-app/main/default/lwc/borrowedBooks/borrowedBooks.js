import { LightningElement, track } from "lwc";
import allBorrowedBooksStuOrEmp from "@salesforce/apex/BookIssueAndReturnController.allBorrowedBooksStuOrEmp";

const PAGE_SIZE = 5;

export default class BorrowedBooks extends LightningElement {
  @track columns = [];
  @track searchKey = "";
  @track borrowedbooks = [];
  @track paginatedBorrowedBooks = [];
  @track totalRecords = 0;
  @track pageNumber = 1;
  @track totalPages = 0;
  @track filteredBooks = [];
  @track isStudent;
  @track radioValue = "Student";

  get options() {
    return [
      { label: "Student", value: "Student" 
      },
      { label: "Employee", value: "Employee" }
    ];
  }

  connectedCallback() {
   this.isStudent = true;
    this.setColumns(true);
    this.userData(this.radioValue);
  }

  setColumns(isStudent) {
    this.columns = [
      { label: "Name", fieldName: "Name", type: "text", hideDefaultActions: true },
      { label: "Book Id", fieldName: "BookName", hideDefaultActions: true },
      { label: "Date of Issue", fieldName: "DateofIssue", type: "Date", hideDefaultActions: true },
      { label: "Date of Return", fieldName: "DateofReturn", type: "Date", hideDefaultActions: true },
      { label: "Status", fieldName: "BookStatus", hideDefaultActions: true }
    ];

    if (isStudent) {
      this.columns.splice(2, 0, { label: "Student", fieldName: "StudentName", hideDefaultActions: true });
    } else {
      this.columns.splice(2, 0, { label: "Employee", fieldName: "EmployeeName", hideDefaultActions: true });
    }
  }

  radioChange(event) {
    this.radioValue = event.detail.value;
    this.isStudent = this.radioValue === "Student";
    this.setColumns(this.isStudent);
    this.userData(this.radioValue);
  }

  userData(radioValue) {
    if (radioValue != null) {
      allBorrowedBooksStuOrEmp({ candidateType: radioValue })
        .then((result) => {
          this.borrowedbooks = result;
          this.filterRecords();
        })
        .catch((error) => {
          this.showToast("Error", "Error fetching borrowed books", "error");
          console.error("Error fetching borrowed books:", error);
        });
    }
  }

  searchField(event) {
    this.searchKey = event.target.value;
    this.filterRecords();
  }

  filterRecords() {
    const regex = new RegExp(this.searchKey, "gi");
    this.filteredBooks = this.borrowedbooks.filter((book) => {
      return (
        regex.test(book.Name) ||
        (book.BookName && regex.test(book.BookName)) ||
        (book.StudentName && regex.test(book.StudentName)) ||
        (book.EmployeeName && regex.test(book.EmployeeName)) ||
        (book.DateofIssue && regex.test(book.DateofIssue)) ||
        (book.DateofReturn && regex.test(book.DateofReturn))
      );
    });

    this.totalRecords = this.filteredBooks.length;
    this.totalPages = Math.ceil(this.totalRecords / PAGE_SIZE);
    this.pageNumber = 1; // Reset to the first page
    this.updateRecordsToDisplay();
  }

  updateRecordsToDisplay() {
    const start = (this.pageNumber - 1) * PAGE_SIZE;
    const end = this.pageNumber * PAGE_SIZE;
    this.paginatedBorrowedBooks = this.filteredBooks.slice(start, end);
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