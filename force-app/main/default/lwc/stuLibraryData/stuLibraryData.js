import { LightningElement, track } from "lwc";
import allBorrowedBooksOfStudent from "@salesforce/apex/BookIssueAndReturnController.allBorrowedBooksUser";

const columns = [
  { label: "BIR Id", fieldName: "Name", hideDefaultActions: true },
  { label: "Book Id", fieldName: "BookId", hideDefaultActions: true },
  {
    label: "Title of the book",
    fieldName: "BookName",
    hideDefaultActions: true
  },
  { label: "Status", fieldName: "BookStatus", hideDefaultActions: true },
  {
    label: "Date of Issue",
    fieldName: "DateofIssue",
    type: "date",
    hideDefaultActions: true
  },
  {
    label: "Due Date",
    fieldName: "DueDate",
    type: "date",
    hideDefaultActions: true
  },
  {
    label: "OverDueBy",
    fieldName: "OverDueBy",
    type: "number",
    hideDefaultActions: true
  },
  {
    label: "Return Status",
    fieldName: "BookStatusinreturns",
    hideDefaultActions: true
  }
];

export default class stuLibraryData extends LightningElement {
  @track allbooks;
  columns = columns;

  connectedCallback() {
    let userName = sessionStorage.getItem("UserName");
    allBorrowedBooksOfStudent({ recordId: userName ,candidateType :'student'}).then((result) => {
      if (result) {
        console.log("res :" + JSON.stringify(result));
        this.allbooks = result;
      } else if (result.error) {
        console.error("Error loading books:", result.error);
      }
    });
  }
}