import { LightningElement, track, wire, api } from 'lwc';
import getStudentPaymentDetails from '@salesforce/apex/DisplayPaymentDetails.getStudentPaymentDetails';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import LightningConfirm from 'lightning/confirm';
import { deleteRecord } from 'lightning/uiRecordApi';



export default class DisplayPaymentDetails extends NavigationMixin(LightningElement) {

    @track paymentDetailColumns = [
        { label: 'Payment Detail  Number', fieldName: 'paymentDetailName', type: 'text' },
        { label: 'Payment Number', fieldName: 'paymentName', type: 'text' },
        { label: 'Date Received', fieldName: 'paymentDetailDate', type: 'date' },
        { label: 'Fee Type', fieldName: 'typeOfFee', type: 'text' },
        { label: 'payment Type', fieldName: 'paymentType', type: 'text' },
        { label: 'Amount Paid', fieldName: 'amountPaid', type: 'currency' },

        {
            type: "button-icon",
            typeAttributes: { name: "edit", variant: "brand", iconName: "action:edit" }
        }
    ];
    @api paymentId;
    @track refreshResult;
    @track paymentDetailData;
    @track isModalOpen = false;
    @track selectedRecordId;
    @track refreshdata
    // renderedCallback() {
    //     this.handlePaymentdetail(this.paymemtId);
    // }
    // handlePaymentdetail() {
    //     getPaymentDetails({ PaymentId:this.paymentId })
    //         .then((result) => {
    //             this.paymentDetailData = result;

    //         })
    // }
    // connectedCallback() {
    //    this.handlePaymentdetail();
    // }

    @wire(getStudentPaymentDetails, { paymentId: '$paymentId' })
    wiredResult(result) {
        this.refreshResult = result;
        if (result.data) {
            this.paymentDetailData = result.data;
            console.log('Payment Detail Data:', JSON.stringify(this.paymentDetailData));
        } else if (result.error) {
            this.showToast('Error', result.error.message, 'error');
        }
    }


    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row.paymentDetailId;

        if (actionName === 'edit') {
            this.selectedRecordId = row;
            console.log('rows id'+this.selectedRecordId);
            this.openModal();
        }
    }

    closeModal() {
        this.isModalOpen = false;
    }

    openModal() {
        this.isModalOpen = true;
    }

    handleRefresh() {
        return refreshApex(this.refreshResult);
    }

    handleSubmitUpdate(event) {

        const fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
        this.showToast("Success!!", "Record updated successfully!!", "success");
        this.closeModal();

    }

    handleSuccess() {
        this.handleRefresh();
    }
    handleError(event) {
        this.showToast('Error', 'error in saving record', 'error');
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }

    handleBackClick()
    {
        console.log('handleback');
         let compDefinition = {
                componentDef: "c:navigationMenu",
                 attributes:
                    {
                        isFeeManagement: true,
                        isStudentManagement : false
                    }
    
                
            };
            let encodedCompDef = btoa(JSON.stringify(compDefinition));
            this[NavigationMixin.Navigate]({
                type: "standard__webPage",
                attributes: {
                    url: "/one/one.app#" + encodedCompDef
                }
            });

    }

}