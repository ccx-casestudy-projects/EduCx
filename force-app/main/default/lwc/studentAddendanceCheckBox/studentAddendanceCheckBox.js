import { LightningElement, api } from 'lwc';

export default class StudentAddendanceCheckBox extends LightningElement {
   @api recordId;
   @api isChecked = false; // Default value should be false

   handleCheckbox(event) {
      const isChecked = event.target.checked;
      const customEvt = new CustomEvent('attendancecheckvalue', {
            detail: {
                    recordId: this.recordId,
                    isChecked: isChecked
            },
            bubbles: true, 
            composed: true 
      });
      this.dispatchEvent(customEvt);
      
      console.log('Event dispatched with details: ' + JSON.stringify({
            recordId: this.recordId,
            isChecked: isChecked
        }));
   }
}