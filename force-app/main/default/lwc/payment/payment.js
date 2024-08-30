import { LightningElement, track, api } from 'lwc';
import getHallTicket from '@salesforce/apex/PaymentHandler.getStudentPayments';
import saveManagementPaymentRecords from '@salesforce/apex/PaymentHandler.saveManagementPaymentRecords';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Payment extends LightningElement {
    @api isModalOpen;
    @track hallTicketNumbers = '';
    @track showPaymentSection = false;
    @track data = [];
    @track paymentManagemntMap = new Map();
    @track paymentId;
    @track dataToSend = [];
    @track recordsWithAmountPaid = [];
    @track studentInfo = [];
    @track isManagementOrSpot = false;
    @track isConvenor = false;
    @track recordsWithFeeAndAmountPaid = [];
    @api paymentRecordId = [];
    @track receiptUpload = false;
    /*@track columns = [
        { label: 'Student Hall Ticket', fieldName: 'studentHallticketno', type: 'text' },
        { label: 'Student Name', fieldName: 'studentName', type: 'text' },
        { label: 'Student Year', fieldName: 'studentYear', type: 'text' },
        { label: 'Management Fee', fieldName: 'managementFee', type: 'text'},
        { label: 'Management Fee Balance', fieldName: 'managementFeeBalance', type: 'text'},
        { label: 'Amount Paid', fieldName: 'amountpaid', type: 'amountpaid', editable: true,typeAttributes: {
                inputvalue: { fieldName: 'inputvalue' },
                recordId: { fieldName: 'Id' }
            }
        }
        
    ];*/

    @track columns = [
        { label: 'Fee Type', fieldName: 'feeType', type: 'text' },
        { label: 'Total Amount', fieldName: 'totalAmt', type: 'number' },
        { label: 'Amount Payable', fieldName: 'amtpayable', type: 'number' },
        {
            label: 'Payment Type', fieldName: 'picklistval', type: 'picklistval', editable: true,
            typeAttributes: {
                selectvalue: { fieldName: 'selectvalue' },
                feeType: { fieldName: 'feeType' }, options: { fieldName: 'options' }
            }
        },
        {
            label: 'Amount Paid', fieldName: 'amountpaid', type: 'amountpaid', editable: true,
            typeAttributes: {
                inputvalue: { fieldName: 'inputvalue' },
                recordId: { fieldName: 'recordId' },
                feeType: { fieldName: 'feeType' },
                class: 'amount-input-text'
            }
        }
    ];
    @track recordType = '';
    // handleOpenModal() {
    //     this.isModalOpen = true;
    // }

    handleCloseModal(event) {
        const custom = new CustomEvent('closemodalatt', {
            detail: false,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(custom);
        this.isModalOpen = false;

    }

    handlePaymentModal() {
        this.showPaymentSection = false;
        const custom = new CustomEvent('closemodalatt', {
            detail: false,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(custom);
    }

    handleInputChange(event) {
        this.hallTicketNumbers = event.target.value;
        console.log('hall-->' + this.hallTicketNumbers);
    }

    //  renderedCallback(){
    //     if(this.template.querySelector('.paymentdatatable')){
    //             const style1 = document.createElement('style');
    //             style1.innerText = '.paymentdatatable .slds-hint-parent .slds-grid .reject-button button {background-color: #ba0517; border-color: #ba0517 !important;}';
    //             this.template.querySelector('.paymentdatatable').appendChild(style1);
    //         }
    // }


    handleSave() {
       
        const isInputsCorrect = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        if (isInputsCorrect && this.hallTicketNumbers ) {
             this.isModalOpen = false;
            getHallTicket({ StdHallTicket: this.hallTicketNumbers })
                .then((result) => {

                    this.data = result;
                    this.studentInfo = result;
                    this.paymentId = result.recordId;
                    console.log('payid--->' + this.paymentId);
                    console.log('hall ticket :: ' + JSON.stringify(result));
                    this.data = [];
                    if (result.admType == 'Management Quota' || result.admType == 'Spot Registration') {
                        this.recordType = 'Management';
                        var rowData1 = { 'recordId': result.recordId, 'feeType': 'Management', 'totalAmt': result.totalFee, 'amtpayable': result.totalFeeBalance, 'amountpaid': 0, 'recordType': 'Management' };
                        var rowData2 = { 'recordId': result.recordId, 'feeType': 'Exam fee', 'totalAmt': result.managementExamFee, 'amtpayable': result.managementExamFeeBal, 'amountpaid': 0, 'recordType': 'Management' };
                        var rowData3 = { 'recordId': result.recordId, 'feeType': 'Other fee', 'totalAmt': result.managementOtherFee, 'amtpayable': result.managementOtherFeeBal, 'amountpaid': 0, 'recordType': 'Management' };
                        var rowData4 = { 'recordId': result.recordId, 'feeType': 'Transport fee', 'totalAmt': result.managementTransportFee, 'amtpayable': result.managementTransportFeeBal, 'amountpaid': 0, 'recordType': 'Management' };
                        this.data.push(rowData1);
                        this.data.push(rowData2);
                        this.data.push(rowData3);
                        this.data.push(rowData4);
                        // console.log('showPaymentSection before ;; '+ this.showPaymentSection);
                        this.showPaymentSection = true;
                        console.log('showPaymentSection ;; ' + this.showPaymentSection);
                        this.isManagementOrSpot = true;
                        this.isConvenor = false;
                    }

                    if (result.admType == 'Convenor Quota') {
                        this.recordType = 'Convenor';
                        var rowData1 = { 'recordId': result.recordId, 'feeType': 'Exam fee', 'totalAmt': result.convenorExamFee, 'amtpayable': result.convenorExamFeeBal, 'amountpaid': 0, 'recordType': 'Convenor' };
                        var rowData2 = { 'recordId': result.recordId, 'feeType': 'Other fee', 'totalAmt': result.convenorOtherFee, 'amtpayable': result.convenorOtherFeeBal, 'amountpaid': 0, 'recordType': 'Convenor' };
                        var rowData3 = { 'recordId': result.recordId, 'feeType': 'Transport fee', 'totalAmt': result.convenorTransportFee, 'amtpayable': result.convenorTransportFeeBal, 'amountpaid': 0, 'recordType': 'Convenor' };
                        var rowData4 = { 'recordId': result.recordId, 'feeType': 'Admission fee', 'totalAmt': result.admissionFee, 'amtpayable': result.admissionBal, 'amountpaid': 0, 'recordType': 'Convenor' };
                        var rowData5 = { 'recordId': result.recordId, 'feeType': 'Special fee', 'totalAmt': result.specialFee, 'amtpayable': result.specialFeeBal, 'amountpaid': 0, 'recordType': 'Convenor' };
                        var rowData6 = { 'recordId': result.recordId, 'feeType': 'Tution fee', 'totalAmt': result.tutionFee, 'amtpayable': result.tutionFeeBal, 'amountpaid': 0, 'recordType': 'Convenor' };
                        var rowData7 = { 'recordId': result.recordId, 'feeType': 'University fee', 'totalAmt': result.universityFee, 'amtpayable': result.universityFeeBal, 'amountpaid': 0, 'recordType': 'Convenor' };
                        this.data.push(rowData1);
                        this.data.push(rowData2);
                        this.data.push(rowData3);
                        this.data.push(rowData4);
                        this.data.push(rowData5);
                        this.data.push(rowData6);
                        this.data.push(rowData7);

                        console.log('data --' + JSON.stringify(this.data));
                        this.showPaymentSection = true;
                        this.isConvenor = true;
                        this.isManagementOrSpot = false;
                    }
                })
                .catch(error => {
                    this.showvalidToast();
                    console.error('Error: ', error);
                    const custom = new CustomEvent('closemodalatt', {
                        detail: false,
                        bubbles: true,
                        composed: true
                    });
                    this.dispatchEvent(custom);

                });
        }

        //this.handleCloseModal();
    }
    handleFeeType(event) {
        const { fee, selectvalue, options } = event.detail;
        this.data = this.data.map(record => {
            if (record.feeType === fee) {
                return { ...record, picklistval: selectvalue };
            } else {
                return record;
            }
        });
          console.log('data from fee--'+JSON.stringify(this.data));
        //  console.log('Fee type picklist :::'+ fee);
        //   console.log('value picklist :::'+selectvalue);
    }

    handleAmountPaid(event) {
        const { inputvalue, fee } = event.detail;
        // console.log('inputvalue: ' + inputvalue);   
        // console.log('fee: ' + fee);
        this.data = this.data.map(record => {
            if (record.feeType === fee) {
                return { ...record, amountpaid: inputvalue };
            } else {
                return record;
            }
        });
        console.log('data from amount--' + JSON.stringify(this.data));
    }


    handleManagementPayment(event) {
        this.recordsWithFeeAndAmountPaid = this.data.filter(record => record.feeType && record.amountpaid >0);
        console.log('from records--'+this.recordsWithFeeAndAmountPaid);
        this.dataToSend =  this.recordsWithFeeAndAmountPaid ;
        console.log('from submit--' + JSON.stringify(this.dataToSend));
        
         if( this.dataToSend.length >0)
        {
            const missingPaymentType = this.dataToSend.some(record => !record.picklistval);
            
            if (missingPaymentType) 
            {
                this.showErrorToast('Error: Payment Type is missing for one or more records.');
            }
             else 
             {
            
            saveManagementPaymentRecords({ recordsMapJson: JSON.stringify(this.dataToSend) })
            .then(result => {
                console.log('Success: ', JSON.stringify(result));
                this.handlePaymentModal();
                if (result != null) {
                    this.showSuccessToast();
                    this.paymentRecordId = result.map(record => record.Id);
                    console.log('payment id' + this.paymentRecordId);
                    this.receiptUpload = true;
                    const custom = new CustomEvent('closemodalatt', {
                        detail: false,
                        bubbles: true,
                        composed: true
                    });
                    this.dispatchEvent(custom);
                }

            })
            .catch(error => {
                console.error('Error: ', error);
                this.showErrorToast();

            });

        }
        }
        
        else
        {
            this.showvalidPaymentToast();
        }
             
    }

    showSuccessToast() {
        const evt = new ShowToastEvent({
            title: 'Payment Successful',
            message: 'payment has been processed successfully',
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
    showErrorToast() {
        const evt = new ShowToastEvent({
            title: 'Payment Failed',
            message: 'There was an issue processing your payment',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
    showvalidToast() {
        const evt = new ShowToastEvent({
            title: 'No Student Found',
            message: 'There is no student associate with this hall ticket !',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
     showvalidPaymentToast() {
        const evt = new ShowToastEvent({
            title: 'No Student Found',
            message: 'Please Enter Amount!',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
    showErrorToast(message) {
    const event = new ShowToastEvent({
        title: 'Error',
        message: message,
        variant: 'error',
        mode: 'dismissable'
    });
    this.dispatchEvent(event);
}
}