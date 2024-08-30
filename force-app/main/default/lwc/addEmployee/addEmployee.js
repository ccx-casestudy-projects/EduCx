import { LightningElement,api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation'; 
export default class AddEmployee extends NavigationMixin(LightningModal)  {
   
   
    @api empRecTypeId;
    @api empRecTypeName;
    @api newEmp ;
    empObject = 'educx__Employees__c';

    closeModal()
     {
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
        this.close();
    }
    handleCancel() {
        this.close();
    }

    handleSuccess(event) {
        //alert('Success');
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Employee Record created with ID: ' + event.detail.id,
            variant: 'success',
        });
        this.dispatchEvent(toastEvent);
        this.closeModal();
        return refreshApex(this.refreshResult);
    }
    get employeetype()
    {
         if(this.empRecTypeName=="Teaching Employee")
            {
               return "Teaching Employee";
            }
           else if(this.empRecTypeName=="Non Teaching Employee")
            {
               return "Non Teaching Employee";
            }
            else{
                return false;
            }
    }
       //Specialization and Is Ratified details for Teaching Employee
        get isSpecialization(){
            if(this.empRecTypeName=="Teaching Employee")
            {
                console.log("is teaching Employee true : "+this.empRecTypeName)
               return true;
            }
           else if(this.empRecTypeName=="Non Teaching Employee")
            {
                console.log("is non teaching Employee true : "+this.empRecTypeName)
               return false;
            }
            else
            {
                return false;
            }
        }

        
}