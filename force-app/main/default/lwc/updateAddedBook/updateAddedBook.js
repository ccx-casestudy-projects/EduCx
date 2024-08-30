import { LightningElement, api, wire } from 'lwc';
import editRecordsRefresh from '@salesforce/apex/BookController.getAllBooks';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
 
export default class UpdateAddedBook extends LightningElement {
    @api crecordId;
 
   showEditScreen = false;
   @api show(){
    this.showEditScreen = true;
   }
   closeModal() {   
    this.showEditScreen = false;
}

 
//Update automatically in main page after editing in edit page
refreshResult;
@wire(editRecordsRefresh)
getData(result){
this.refreshResult=result;
}
   
handleSuccess() {
    const toastEvent = new ShowToastEvent({
        title: 'Success',
        message: 'Book Record updated successfully.',
        variant: 'success',
    });
    this.dispatchEvent(toastEvent);
 
    this.closeModal();
    return refreshApex(this.refreshResult);
}
}