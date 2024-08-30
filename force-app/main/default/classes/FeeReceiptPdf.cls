public with sharing class FeeReceiptPdf {

    @AuraEnabled(cacheable=true)
    public static List<PaymentDetailsWrapper> getPaymentDetails(List<Id> recordId) {
        List<educx__Payment_Details__c> paymentDetailsList = [
            SELECT Id, CreatedDate, educx__Payment__r.educx__Student_Hall_Ticket_No__c,
                   educx__Payment__r.educx__Student__r.educx__Course__c,
                   educx__Payment__r.educx__Student__r.educx__Name_of_The_Candidate__c,
                   educx__Fee_Type__c, educx__Amount_Paid__c, educx__Payment_Type__c, educx__Payment__r.educx__Student__c, Name
            FROM educx__Payment_Details__c
            WHERE Id IN :recordId
        ];

        List<PaymentDetailsWrapper> paymentDetailsData = new List<PaymentDetailsWrapper>();

        for (educx__Payment_Details__c paymentDetails : paymentDetailsList) {
            PaymentDetailsWrapper wrapper = new PaymentDetailsWrapper();
            wrapper.paymentDetailDate = paymentDetails.CreatedDate.date(); // Assuming you have a Name field in educx__Payment_Details__c
            wrapper.studentName = paymentDetails.educx__Payment__r.educx__Student__r.educx__Name_of_The_Candidate__c;
            wrapper.studentHallicket = paymentDetails.educx__Payment__r.educx__Student_Hall_Ticket_No__c;
            wrapper.studentCourseName = paymentDetails.educx__Payment__r.educx__Student__r.educx__Course__c; // Assuming Course_Name is the API name of the Course field
            wrapper.typeOfFee = paymentDetails.educx__Fee_Type__c;
            wrapper.amountPaid = paymentDetails.educx__Amount_Paid__c;
            wrapper.paymentType= paymentDetails.educx__Payment_Type__c;
            wrapper.studentId= paymentDetails.educx__Payment__r.educx__Student__c;
            wrapper.studentAutoNumber = paymentDetails.Name;
            paymentDetailsData.add(wrapper);
        }

        return paymentDetailsData;
    }

    public class PaymentDetailsWrapper {
        @AuraEnabled public Date paymentDetailDate;
        @AuraEnabled public String studentName;
        @AuraEnabled public String studentHallicket;
        @AuraEnabled public String studentCourseName;
        @AuraEnabled public String typeOfFee;
        @AuraEnabled public Double amountPaid;
        @AuraEnabled public String paymentType;
        @AuraEnabled public String studentId;
        @AuraEnabled public String studentAutoNumber;
    }
}