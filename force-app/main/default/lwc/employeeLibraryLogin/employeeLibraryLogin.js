import { LightningElement, track ,wire,api} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchEmployeeById from '@salesforce/apex/BookController.searchEmployeeById';


export default class EmployeeLibraryLogin extends NavigationMixin(LightningElement) {
    @track inputEmpId=null;
    errorMessage = '';
    numberCheck=false;
    @track isEmployeeAvailable=false;
     @track employeeResult;
     @track employeeData;
     @api candidateType;
    
    clearInput() {
        this.inputEmpId = null;
    }

    handleEmployeeIdChange(event) {
        this.inputEmpId = event.target.value;
        event.preventDefault();
        const inputCmp = this.template.querySelector('lightning-input');
        const regex = /^EMP-\d{4}$/;
        if (!regex.test(this.inputEmpId)) {
            inputCmp.setCustomValidity('Invalid Id');
            this.numberCheck=false;
        } else {
            inputCmp.setCustomValidity('');
            this.numberCheck=true; 
        }
        inputCmp.reportValidity();
    }

  handleLogin() {
        if(this.numberCheck ){
            console.log('Logged in with id:', this.inputEmpId);
         this.callSearchEmployeeById();
          
        }
        else{
            this.callingError();
        }
    }

callSearchEmployeeById() {
    
    searchEmployeeById({empId: this.inputEmpId })
            .then(result => {
                this.employeeResult = result;
                console.log(this.inputEmpId);
                console.log(this.employeeResult);
                if (result) {
                    this.employeeData = result;
                    console.log('employee data' + this.employeeData.Name);
                    
                    if (this.employeeData != undefined && this.employeeData != null) {
                        this.isEmployeeAvailable = true;
                        console.log('isEmployeeAvailable data' + this.isEmployeeAvailable);
                    }
                    this.error = undefined;
                    console.log('Retrieved Employee data:', this.employeeData);
                    if (this.isEmployeeAvailable) {
                        this.handleNavigate();
                        console.log('Logged in with Id:', this.inputEmpId);
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
                this.isEmployeeAvailable = false;
                this.employeeData = undefined;
                console.error('Error fetching employee data:', error);
                this.callingError();
            });
    }
   handleNavigate() {
        console.log('employee id'+this.employeeData.Id)
        var compDefinition = {
          
            componentDef: "c:employeeLibraryData",
            attributes: {
                employeeName: this.employeeData.educx__Employee_Name__c,
                employeeId:this.employeeData.Id,
                employeeLogin:this.employeeData.Name,
                candidateType:this.candidateType
              
            }
        };
        var encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    }

   
    handleBack(){
        var compDefinition = {
          
            componentDef: "c:libraryMainCmp",
            attributes: {
                employeeData: this.employeeData
            
            }
        };
        var encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    }
    callingError(){
         const event = new ShowToastEvent({
            title: 'Error!',
            message: 'Please Enter Valid ID.',
            variant: 'error'
        });
        this.dispatchEvent(event);

        
    }
        
}