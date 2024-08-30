import { LightningElement, track, api } from 'lwc';
import getAllEmployees from '@salesforce/apex/EmployeeController.getAllEmployeesOnSearch';
import getEmployeeLeaveAccount from '@salesforce/apex/EmployeeController.getEmployeeLeaveAccount';

export default class SearchEmployee extends LightningElement {
    @api searchEmp = false;
    @track searchTerm = '';
    @track employeeData;
    @track employeeLeaveAccount;
    @track allEmployees = [];
    @track error;
    @track candidateType='employee';
    @track show = true;

    libraryColumns = [
        { label: "BIR Id", fieldName: "Name", hideDefaultActions: true },
        { label: "Book Id", fieldName: "BookId", hideDefaultActions: true },
        { label: "Title of the book", fieldName: "BookName", hideDefaultActions: true },
        { label: "Status", fieldName: "BookStatus", hideDefaultActions: true },
        { label: "Date of Issue", fieldName: "DateofIssue", type: "date", hideDefaultActions: true },
        { label: "Due Date", fieldName: "DueDate", type: "date", hideDefaultActions: true },
        { label: "OverDueBy", fieldName: "OverDueBy", type: "number", hideDefaultActions: true },
        { label: "Return Status", fieldName: "BookStatusinreturns", hideDefaultActions: true }
    ];

    connectedCallback() {
        this.loadAllEmployees();
    }

    loadAllEmployees() {
        getAllEmployees()
            .then(result => {
                this.allEmployees = result;
            })
            .catch(error => {
                console.error('Error loading employees:', error);
                this.error = error;
            });
    }

    handleInputChange(event) {
        this.searchTerm = event.target.value.trim();
        console.log('Search Term:', this.searchTerm);
        if (this.searchTerm) {
            this.filterEmployees();
        } else {
            this.employeeData = null;
            this.employeeLeaveAccount = null;
        }
    }

    filterEmployees() {
        // Filter the allEmployees based on search term
        const searchTermLower = this.searchTerm.toLowerCase();
        const filteredEmployees = this.allEmployees.filter(emp => 
            emp.Name.toLowerCase().includes(searchTermLower) || 
            emp.educx__Employee_Name__c.toLowerCase().includes(searchTermLower)
        );

        if (filteredEmployees.length > 0) {
            this.employeeData = filteredEmployees[0];
            this.fetchEmployeeLeaveAccount();
        } else {
            this.employeeData = null;
            this.employeeLeaveAccount = null;
        }
    }

    fetchEmployeeLeaveAccount() {
        if (this.employeeData) {
            getEmployeeLeaveAccount({ employeeId: this.employeeData.Id })
                .then(result => {
                    this.employeeLeaveAccount = result;
                })
                .catch(error => {
                    console.error('Error fetching leave account:', error);
                    this.error = error;
                });
        }
    }

    get profileImage() {
        return this.employeeData?.educx__Photo__c || "";
    }

    get availedLeaves() {
        return this.employeeLeaveAccount
            ? this.employeeLeaveAccount.educx__Number_of_Availed_Leaves__c
            : 0;
    }

    get balanceLeaves() {
        return this.employeeLeaveAccount
            ? this.employeeLeaveAccount.educx__Number_of_Balance_Leaves__c
            : 0;
    }

    get totalLeaves() {
        return this.employeeLeaveAccount
            ? this.employeeLeaveAccount.educx__Total_Leaves_In_Account__c
            : 0;
    }

    get lossOfPay() {
        return this.employeeLeaveAccount
            ? this.employeeLeaveAccount.educx__Loss_of_Pay__c
            : 0;
    }

    closeModal() {
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
        this.searchEmp = false;
        this.employeeData = null;
        this.employeeLeaveAccount = null;
        this.searchTerm = '';
    }

    handleCancel() {
        this.closeModal();
    }
}