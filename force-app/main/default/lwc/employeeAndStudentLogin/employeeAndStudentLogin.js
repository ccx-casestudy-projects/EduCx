import { LightningElement,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class EmployeeAndStudentLogin extends NavigationMixin(LightningElement) {
    @track selectedLoginType;
    @track showhallticketNumberComponent = false;

    loginOptions = [
        { label: 'Employee ', value: 'employee' },
        { label: 'Student ', value: 'student' }
    ];

    handleLoginTypeChange(event) {
        this.selectedLoginType = event.detail.value;
        this.showhallticketnumberComponent = true;
    }

    handleNext(){
        if(this.selectedLoginType=="employee"){
           
            this.handleNavigateToLogin();

        }
        else if (this.selectedLoginType == "student"){
           
           this.handleNavigateToLogin();
        }
    }

   
    handleNavigateToLogin(){
            var compDefinition = {
          
            componentDef: "c:borrowerLoginScreen",
            attributes: {
               candidateType: this.selectedLoginType
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


   
    /*handleNavigateToStudentLogin() {
        var compDefinition = {
          
            componentDef: "c:studentHallTicketLogin",
            attributes: {
                candidateType: this.selectedLoginType
            }
        };
      
        var encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    
    }*/
}