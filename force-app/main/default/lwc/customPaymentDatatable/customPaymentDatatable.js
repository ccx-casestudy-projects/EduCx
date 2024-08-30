import LightningDatatable from "lightning/datatable"; 
import inputboxtemplate from "./inputbox.html";
import paymenttypetemplate from "./paymenttype.html";

export default class CustomPaymentDatatable extends LightningDatatable {
     static customTypes = {
        amountpaid: {
            template: inputboxtemplate,
            typeAttributes: ['recordId', 'inputvalue','feeType']
        },
         picklistval: {
            template: paymenttypetemplate,
            typeAttributes: [ 'feeType','selectvalue','options']
        }
    };
}