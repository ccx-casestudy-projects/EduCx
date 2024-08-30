import { LightningElement, track ,wire,api} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import searchStudentsByHallticketNumber from '@salesforce/apex/BookController.searchStudentsByHallticketNumber';


export default class StudentHallTicketLogin extends NavigationMixin(LightningElement) {
    @track inputHallTicketNumber=null;
    errorMessage = '';
    numberCheck=false;
    @track isStudentAvailable=false;
     @track studentResult;
     @track studentData;
     @api candidateType;
    
    clearInput() {
        this.inputHallTicketNumber = null;
    }

    handlehallticketNumberChange(event) {
        this.inputHallTicketNumber = event.target.value;
        event.preventDefault();
        const inputCmp = this.template.querySelector('lightning-input');
        const regex = /^\d{10}$/; // Assuming phone number format is 10 digits
        if (!regex.test(this.inputHallTicketNumber)) {
            inputCmp.setCustomValidity('Invalid hallticket number');
            this.numberCheck=false;
        } else {
            inputCmp.setCustomValidity('');
            this.numberCheck=true; // Reset custom validity if valid
        }
        inputCmp.reportValidity();
    }

    //handle navigate function
    handleNavigate() {
        console.log('student id'+this.studentData.Id)
        var compDefinition = {
          
            componentDef: "c:studentLibraryData",
            attributes: {
                studentName: this.studentData.educx__Name_of_The_Candidate__c,
                studentId:this.studentData.Id,
                studentHallTicket:this.studentData.educx__Hall_Ticket_No__c,
                candidateType:this.candidateType
              
            }
        };
        // Base64 encode the compDefinition JS object
        var encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    
    }


callSearchStudentByHallticketNumber() {
    
    searchStudentsByHallticketNumber({ hallticket: this.inputHallTicketNumber })
            .then(result => {
                this.studentResult = result;
                console.log(this.inputHallTicketNumber);
                console.log(this.studentResult);
                if (result) {
                    this.studentData = result;
                    console.log('student data' + this.studentData.Name);
                    
                    if (this.studentData != undefined && this.studentData != null) {
                        this.isStudentAvailable = true;
                        console.log('isStudentAvailable data' + this.isStudentAvailable);
                    }
                    this.error = undefined;
                    console.log('Retrieved student data:', this.studentData);
                    if (this.isStudentAvailable) {
                        this.handleNavigate();
                        // For demonstration purposes, we'll just log the phone number
                        console.log('Logged in with hallticket number:', this.inputHallTicketNumber);
                    } else {
                        this.callingError();
                    }
                }
                else{
                     this.callingError();
                }
            })
            .catch(error => {
                this.error = error;
                this.isStudentAvailable = false;
                this.studentData = undefined;
                console.error('Error fetching student data:', error);
                this.callingError();
            });
    }



    //handle login function 
    handleLogin() {
       
        // Check if the phone number is valid
        if(this.numberCheck ){
            console.log('Logged in with hallticket number:', this.inputHallTicketNumber);
         this.callSearchStudentByHallticketNumber();
          
        }
        else{
            this.callingError();
        }
       
       
    }

    //handle back
    handleBack(){
        var compDefinition = {
          
            componentDef: "c:libraryMainCmp",
            attributes: {
                studentData: this.studentData
            
            }
        };
        // Base64 encode the compDefinition JS object
        var encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    }

    //callingError
    callingError(){
         const event = new ShowToastEvent({
            title: 'Error!',
            message: 'Please Enter Valid hallticket.',
            variant: 'error'
        });
        this.dispatchEvent(event);

        
    }
        
}