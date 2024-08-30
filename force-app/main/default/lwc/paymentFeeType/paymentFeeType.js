import { LightningElement,wire,track,api } from 'lwc';
import getPicklistValuesFeetype from '@salesforce/apex/PaymentDetailTriggerHandler.getPicklistValuesFeetype';
// import { getObjectInfo } from 'lightning/uiObjectInfoApi';
// import { getPicklistValues } from 'lightning/uiObjectInfoApi';
// import PaymentObj from '@salesforce/schema/Payment_Details__c';
// import paymenttypeField from '@salesforce/schema/Payment_Details__c.Payment_Type__c';
export default class PaymentFeeType extends LightningElement {
    @track paymentType = '';
    @track paymendtDetailObj = 'educx__Payment_Details__c';
    @track paymentDetailType = 'educx__Payment_Type__c';
    @api feetypeoption;
    @api feeType;
    @api picklistvalue;

    @wire(getPicklistValuesFeetype, { sObjectName: '$paymendtDetailObj', fieldName: '$paymentDetailType' })
    typePicklistValues1({ error, data }) {
        if (data) {
            this.feetypeoption = data.map(value => ({ label: value, value: value }));
            console.log('fee options--'+this.feetypeoption);
        }else if(error){
            console.log('error in year :: '+error);
        }
    }

    

    // @wire(getObjectInfo, { objectApiName: PaymentObj })
    // objectInfo;

    // @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: paymenttypeField })
    // typePicklistValues1({ error, data }) {
    //     if (data) {
    //         this.feetypeoption = data.values;
    //     }
    // }

    handleFeetypeChange(event) {
        this.picklistvalue = event.target.value;
        console.log('selected Year :: ' + this.year);
        let feeSelectedData = {fee:this.feeType , selectvalue:this.picklistvalue,options : this.feetypeoption };
        const customevt = new CustomEvent('paymenttypevalue',{
            detail:feeSelectedData,
            bubbles: true, 
            composed: true 
      });
      this.dispatchEvent(customevt);
    }

}