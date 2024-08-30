public class DisplayPaymentDetails {
    
    @AuraEnabled(cacheable=true)
    public static StudentPaymentWrapper getStudentPaymentDetails(String paymentId) {
        
        List<educx__Payment_Details__c> paymentDetailsList = [
            SELECT Id, Name,
            educx__Payment__r.educx__Student_Hall_Ticket_No__c,
            educx__Payment__c ,
            educx__Payment__r.educx__Student__r.educx__Name_of_The_Candidate__c,
            educx__Payment__r.educx__Year__c, 
            educx__Fee_Type__c, 
            educx__Amount_Paid__c,
            RecordType.Name, 
            educx__Payment__r.educx__Total_Amount_Paid__c,
            educx__Payment__r.educx__Total_Balance__c,                                  
            educx__Payment__r.educx__Total_fee__c,
            educx__Payment_Type__c,educx__Payment__r.Name,
            CreatedDate
            FROM educx__Payment_Details__c
            where educx__Payment__c =:PaymentId
            Order By CreatedDate ASC
        ];
        
        
        StudentPaymentWrapper studentPaymentData = new StudentPaymentWrapper();
        
        
        for (educx__Payment_Details__c paymentDetail : paymentDetailsList) {
            PaymentDetailsWrapper paymentWrapper = new PaymentDetailsWrapper();
            paymentWrapper.paymentDetailName = paymentDetail.Name;
            paymentWrapper.paymentName = paymentDetail.educx__Payment__r.Name;
            paymentWrapper.amountPaid = paymentDetail.educx__Amount_Paid__c;
            paymentWrapper.typeOfFee = paymentDetail.educx__Fee_Type__c;
            paymentWrapper.paymentType = paymentDetail.educx__Payment_Type__c;
            paymentWrapper.paymentDetailId = paymentDetail.Id;
            paymentWrapper.paymentDetailDate  =  paymentDetail.CreatedDate;
            
            
            studentPaymentData.paymentDetailsList.add(paymentWrapper);
            
            
            if (studentPaymentData.studentName == null) {
                studentPaymentData.studentName = paymentDetail.educx__Payment__r.educx__Student__r.educx__Name_of_The_Candidate__c;
                studentPaymentData.studentHallTicket = paymentDetail.educx__Payment__r.educx__Student_Hall_Ticket_No__c;
                studentPaymentData.studentCourseYear = paymentDetail.educx__Payment__r.educx__Year__c;
                studentPaymentData.totalAmountPaid = paymentDetail.educx__Payment__r.educx__Total_Amount_Paid__c;
                studentPaymentData.totalAmountBalance = paymentDetail.educx__Payment__r.educx__Total_Balance__c;
                studentPaymentData.totalAmountFee = paymentDetail.educx__Payment__r.educx__Total_fee__c;
            }
        }
        
        return studentPaymentData;
    }
    
    @AuraEnabled(cacheable=true)
    public static list<educx__Payment__c> getAllPayments()
    {
        
        return[select id,educx__Student__r.educx__Name_of_The_Candidate__c,Name, educx__Year__c,educx__Student_Hall_Ticket_No__c,educx__Total_Amount_Paid__c,educx__Total_Balance__c,educx__Total_fee__c 
               from educx__Payment__c 
               where educx__Student__r.name!= null and educx__Student_Hall_Ticket_No__c!= null];
    }
    
    //get passed out students for almanac
    @AuraEnabled(cacheable=true)
    public static List<educx__Student__c > getPassedOutStudentAndAcademicYearDetails() {
        // Get the passed out students
        List<educx__Student__c> students = [
            SELECT Id, Name, educx__Name_of_The_Candidate__c, educx__Hall_Ticket_No__c, educx__Email__c, 
            educx__Phone_Number__c, educx__Course_Code__c, educx__Course__c, educx__Course_Name__c, 
            educx__Year__c, educx__Semester__c, educx__Current_Academic_Year__c , educx__Status__c
            FROM educx__Student__c 
            WHERE educx__Status__c = 'Passed Out' ORDER BY educx__Course__c];
        
        return students;
        
    }
    
    public class StudentPaymentWrapper {
        @AuraEnabled public String studentName;
        @AuraEnabled public String studentHallTicket;
        @AuraEnabled public String studentCourseYear;
        @AuraEnabled public Double totalAmountPaid;
        @AuraEnabled public Double totalAmountBalance;
        @AuraEnabled public Double totalAmountFee;
        @AuraEnabled public List<PaymentDetailsWrapper> paymentDetailsList = new List<PaymentDetailsWrapper>();
    }
    
    
    public class PaymentDetailsWrapper {
        @AuraEnabled public String paymentDetailName;
        @AuraEnabled public String paymentDetailId;
        @AuraEnabled public String paymentName;
        @AuraEnabled public Double amountPaid;
        @AuraEnabled public String paymentType;
        @AuraEnabled public Datetime  paymentDetailDate;
        @AuraEnabled public String typeOfFee;
    }
    
    
}