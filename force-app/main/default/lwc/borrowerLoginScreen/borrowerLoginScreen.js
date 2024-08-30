import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import searchEmployeeById from '@salesforce/apex/BookController.searchEmployeeById';
import searchStudentsByHallticketNumber from '@salesforce/apex/BookController.searchStudentsByHallticketNumber';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class UnifiedLoginComponent extends NavigationMixin(LightningElement) {
    @track inputEmpId = '';
    @track inputHallTicketNumber = '';
    @track isEmployeeAvailable = false;
    @track isStudentAvailable = false;
    @track employeeData;
    @track studentData;
    @api candidateType;
    numberCheck = false;

    connectedCallback() {
        this.isEmployeeAvailable = this.candidateType === 'employee';
        this.isStudentAvailable = this.candidateType === 'student';
    }

    handleEmployeeIdChange(event) {
        this.inputEmpId = event.target.value;
        this.validateEmployeeId();
    }

    handleHallTicketNumberChange(event) {
        this.inputHallTicketNumber = event.target.value;
        this.validateHallTicketNumber();
    }

    validateEmployeeId() {
        const inputCmp = this.template.querySelector('lightning-input[data-id="empId"]');
        const regex = /^EMP-\d{4}$/;
        if (!regex.test(this.inputEmpId)) {
            inputCmp.setCustomValidity('Invalid Id');
            this.numberCheck = false;
        } else {
            inputCmp.setCustomValidity('');
            this.numberCheck = true;
        }
        inputCmp.reportValidity();
    }

    validateHallTicketNumber() {
        const inputCmp = this.template.querySelector('lightning-input[data-id="hallTicket"]');
        const regex = /^\d{4}-\d{2}-\d{3}-\d{3}$/;
        if (!regex.test(this.inputHallTicketNumber)) {
            inputCmp.setCustomValidity('Invalid hallticket number');
            this.numberCheck = false;
        } else {
            inputCmp.setCustomValidity('');
            this.numberCheck = true;
        }
        inputCmp.reportValidity();
    }

    handleLogin() {
        if (this.candidateType === 'employee' && this.numberCheck) {
            this.callSearchEmployeeById();
        } else if (this.candidateType === 'student' && this.numberCheck) {
            this.callSearchStudentByHallticketNumber();
        } else {
            this.callingError();
        }
    }

    callSearchEmployeeById() {
        searchEmployeeById({ empId: this.inputEmpId })
            .then(result => {
                if (result) {
                    this.employeeData = result;
                    this.handleNavigate();
                } else {
                    this.callingError();
                }
            })
            .catch(error => {
                this.callingError();
                console.error('Error fetching employee data:', error);
            });
    }

    callSearchStudentByHallticketNumber() {
        searchStudentsByHallticketNumber({ hallticket: this.inputHallTicketNumber })
            .then(result => {
                if (result) {
                    this.studentData = result;
                    this.handleNavigate();
                } else {
                    this.callingError();
                }
            })
            .catch(error => {
                this.callingError();
                console.error('Error fetching student data:', error);
            });
    }

    handleNavigate() {
      
        const compDefinition = {
            componentDef: "c:borrowerLibraryData",
            attributes: {
              
                candidateName: this.candidateType === 'employee' ? this.employeeData.educx__Employee_Name__c : this.studentData.educx__Name_of_The_Candidate__c,
                candidateId: this.candidateType === 'employee' ? this.employeeData.Name : this.studentData.educx__Hall_Ticket_No__c,
                candidateIdS: this.candidateType === 'employee' ? this.employeeData.Id : this.studentData.Id,
                candidateType: this.candidateType
            }
            
            
        };
        const encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    }

    handleBack() {
        const compDefinition = {
            componentDef: "c:libraryMainCmp",
            attributes: {
                employeeData: this.employeeData,
                studentData: this.studentData
            }
        };
        const encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    }

    callingError() {
        const event = new ShowToastEvent({
            title: 'Error!',
            message: 'Please Enter Valid ID or Hall Ticket Number.',
            variant: 'error'
        });
        this.dispatchEvent(event);
    }
}