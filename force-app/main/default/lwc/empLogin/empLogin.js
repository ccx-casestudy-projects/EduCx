import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'; //import library for navigation

export default class EmpLogin extends NavigationMixin(LightningElement) {
    handleInputChange(event) {
        this.employeeId = event.target.value;
    }
    
    handleNavigate() {
        var compDefinition = {
            componentDef: "c:empDetailsComp",
            attributes:
            {
                propertyValue: this.employeeId
            }
        };
        // Base64 encode the compDefinition JS object
        var encodedCompDef = btoa(JSON.stringify(compDefinition));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: 
            {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    }
}