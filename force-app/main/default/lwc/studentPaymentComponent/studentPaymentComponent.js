import { LightningElement,wire,track } from 'lwc';
import studentInfo from '@salesforce/apex/studentPaymentInfo.studentInfo'; 
import getPaymentRecordId from '@salesforce/apex/studentPaymentInfo.getPaymentRecordId';
import getStudentPaymentInfo from '@salesforce/apex/studentPaymentInfo.getStudentPaymentInfo';
import getStudentPaymentDetail from '@salesforce/apex/studentPaymentInfo.getStudentPaymentDetail';

export default class StudentPaymentComponent extends LightningElement {
    @track studentInfo;
    @track stdhallticket;
    @track recordTypeName ='';
    @track paymentData =[];
    @track paymentIds=[];
    @track paymentDetail =[];
    managementColumns = [
        { label: 'Payment No ', fieldName: 'Name', type: 'text' },
         { label: 'Total Fee', fieldName: 'educx__Total_fee__c', type: 'text' },
        { label: 'Total Balance', fieldName: 'educx__Total_Balance__c', type: 'text' },
        { label: 'Management Fee', fieldName: 'educx__Management_Fee__c', type: 'text' },
        { label: 'Management Balance', fieldName: 'educx__Management_Fee_Balance__c', type: 'text' },
        { label: 'Exam Fee', fieldName: 'educx__Management_Exam_Fee__c', type: 'text' },
        { label: 'Exam Balance', fieldName: 'educx__Exam_Fee_Balance__c', type: 'text' },
        { label: 'Transport Fee', fieldName: 'educx__Management_Transport_Fee__c', type: 'text' },
        { label: 'Transport Balance', fieldName: 'educx__Transport_Fee_Balance__c', type: 'text' },
        { label: 'Other Fee', fieldName: 'educx__Management_Other_Fee__c', type: 'text' },
        { label: 'Other Balance', fieldName: 'educx__Other_Fee_Balance__c', type: 'text' }
    ];

    convenorColumns =[
        { label: 'Payment No', fieldName: 'Name', type: 'text' },
        { label: 'Tution Fee', fieldName: 'educx__Tution_Fee_Amount__c', type: 'text' },
        { label: 'Tution Balance', fieldName: 'educx__Tution_Fee_Balance__c', type: 'text' },
        { label: 'Special Fee', fieldName: 'educx__Special_Fee_Amount__c', type: 'text' },
        { label: 'Special Balance', fieldName: 'educx__Special_Fee_Balance__c', type: 'text' },
        { label: 'Admission Fee', fieldName: 'educx__Admission_Fee_Amount__c', type: 'text' },
        { label: 'Admission Balance', fieldName: 'educx__Admission_Fee_Balance__c', type: 'text' },
        { label: 'University Fee', fieldName: 'educx__Convenor_University_Fee__c', type: 'text' },
        { label: 'University Balance', fieldName: 'educx__Convenor_University_Fee_Balance__c', type: 'text' },
        { label: 'Other Fee', fieldName: 'educx__Convenor_Other_Fee__c', type: 'text' },
        { label: 'Other Balance', fieldName: 'educx__Other_Fee_Balance__c', type: 'text' },
        { label: 'Exam Fee', fieldName: 'educx__Convenor_Exam_Fee__c', type: 'text' },
        { label: 'Exam Balance', fieldName: 'educx__Exam_Fee_Balance__c', type: 'text' },
        { label: 'Transport Fee', fieldName: 'educx__Convenor_Transport_Fee__c', type: 'text' },
        { label: 'Transport Balance', fieldName: 'educx__Transport_Fee_Balance__c', type: 'text' }
    ];
                                                
    @track paymentDetailColumns = [
        { label: 'Payment No', fieldName: 'educx__Payment__r.Name',apiName:'educx__Payment__r.Name', type: 'text' },
        { label: 'Fee Type', fieldName: 'educx__Fee_Type__c', type: 'text' },
        { label: 'Payment Type ', fieldName: 'educx__Payment_Type__c', type: 'text' },
        { label: 'Amount Paid', fieldName: 'educx__Amount_Paid__c', type: 'text' },
        { label: 'Payment Date', fieldName: 'CreatedDate', type: 'Date' }
    ];

    // @wire(studentInfo, { hallticketNo: '$stdhallticket' })
    // wiredOrders({ error, data }) {
    //     if (data) {
    //         this.studentInfo = data;
    //         console.log('student data-->'+JSON.stringify(this.studentInfo));
    //         if(this.studentInfo){
    //             this.handlePaymentRecordId();
    //         }
            
    //     } else if (error) {
    //        // this.showToast('Error', 'Failed to load data', 'error');
    //     }
    // }
    connectedCallback() {
        this.stdhallticket = sessionStorage.getItem("UserName");
        console.log('this.stdhallticket :'+this.stdhallticket);
        studentInfo({ hallticketNo: this.stdhallticket})
            .then((result) => {
                this.studentInfo = result;
                    console.log('student data-->'+JSON.stringify(this.studentInfo));
                    if(this.studentInfo){
                        this.handlePaymentRecordId();
                    }
            })
            .catch((error)=>{
                console.log('error-->'+JSON.stringify(error));
            })
    }

    handlePaymentRecordId(){
        getPaymentRecordId({hallticketNo: this.stdhallticket})
        .then((result) => {
                this.recordTypeName = result;
                console.log('this.recordTypeName--> '+this.recordTypeName);
                if(this.recordTypeName){
                    getStudentPaymentInfo({hallticketNo: this.stdhallticket,recordType : this.recordTypeName})
                    .then((result) =>{
                        this.paymentIds = result.map(item => item.Id);
                        this.paymentData =result;
                            console.log('this.paymentData--> '+JSON.stringify(this.paymentData));
                            console.log('this.paymentIds--> '+JSON.stringify(this.paymentIds));
                        if(this.paymentData){
                            getStudentPaymentDetail({paymentIds :this.paymentIds})
                            .then((result) =>{
                                 this.paymentDetail = this.formatDataSet(result);
                                  this.paymentDetails = this.paymentDetail.map(detail => {
                                    return {
                                        ...detail,
                                        CreatedDate: new Date(detail.CreatedDate).toLocaleDateString()
                                    };
                                });
                                console.log('this.paymentDetail--> '+JSON.stringify(this.paymentDetail));
                            })
                        }
                    })
                }
        })
    }
    
    get columns() {
        return this.recordTypeName === 'Management' ? this.managementColumns : this.convenorColumns;
    }

    formatDataSet(result) {
    return result.map(item => {
      const row = { ...item };
      this.paymentDetailColumns.forEach(column => {
        if (column.apiName) {
          const fieldName = column.fieldName;
          const apiFields = column.apiName.split('.');
          if (apiFields.length > 1) {
            const apiObject = apiFields[0];
            const apiField = apiFields[1];
            row[fieldName] = item[apiObject] && item[apiObject][apiField] ? item[apiObject][apiField] : '';
          }
        }
      });
      return row;
    });
  }


}