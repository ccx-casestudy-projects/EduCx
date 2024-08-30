import { LightningElement,api } from 'lwc';
export default class PaymentInputBox extends LightningElement {

    @api recordId;
    @api inputvalue;
    @api feeType;

    

    handleInputValue(event){
        const input= event.detail.value;
         let selectedData = {inputvalue: input, fee:this.feeType};
        const customevt = new CustomEvent('amountpaidvalue',{
            detail:selectedData,
            bubbles: true, 
            composed: true 
      });
      this.dispatchEvent(customevt);
      
    }

}