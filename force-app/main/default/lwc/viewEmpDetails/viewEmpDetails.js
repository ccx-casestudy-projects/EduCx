import { LightningElement, api, track, wire } from 'lwc';
import getEmployeeDetails from '@salesforce/apex/EmployeeController.viewEmployeeDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ViewEmpDetails extends LightningElement {
    @track data = [];
    @track showEditScreen = false;
    @api crecordId;
    @api employeeDetails;
    showRecScreens = false;
    @api show() {
        this.showRecScreens = true;
    }
    closeModal() {
        this.showRecScreens = false;
    }
    

    @wire(getEmployeeDetails, { recordId: '$crecordId' })
    wiredEmployeeRec(result) {
        if (result.data) {
            this.employeeDetails = result.data;
        } else if (result.error) {
            console.error('Error fetching data:', result.error);
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}