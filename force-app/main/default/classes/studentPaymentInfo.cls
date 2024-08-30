public class studentPaymentInfo {
    
    @AuraEnabled( cacheable=true)
    public static studentcourseWrapper studentInfo(string hallticketNo)
    {
        
        educx__Student__c std =[select educx__Hall_Ticket_No__c,educx__Total_Course_Fee__c,educx__Balance_Fee__c,
                                educx__Fee_Paid__c,educx__Name_of_The_Candidate__c,educx__Year__c,educx__Course_Code__r.educx__Course_Name__c,educx__Course_Code__r.educx__Course__c 
                                from educx__Student__c where  educx__Hall_Ticket_No__c=:hallticketNo];
        
        studentcourseWrapper stdcw = new studentcourseWrapper();
        stdcw.stdHallticketno = std.educx__Hall_Ticket_No__c;
        stdcw.stdName = std.educx__Name_of_The_Candidate__c;
        stdcw.stdcourse = std.educx__Course_Code__r.educx__Course__c;
        stdcw.stdcourseName = std.educx__Course_Code__r.educx__Course_Name__c;
        stdcw.stdTotalFee = std.educx__Total_Course_Fee__c;
        stdcw.stdTotalFeeBalance = std.educx__Balance_Fee__c;
        stdcw.stdTotalFeePaid = std.educx__Fee_Paid__c;
        
        return stdcw;
        
        
    }	
    
    @AuraEnabled
    public static List<educx__Payment__c> getStudentPaymentInfo(string hallticketNo ,String recordType){
        List<educx__Payment__c> paymentList = new List<educx__Payment__c>();
        if(recordType == 'Management'){
        	paymentList =[SELECT Id,Name,educx__Student__r.educx__Name_of_The_Candidate__c,educx__Student_Hall_Ticket_No__c,educx__Total_fee__c,educx__Management_Fee__c,educx__Total_Balance__c,educx__Management_Exam_Fee__c,educx__Management_Exam_Fee_Paid__c,
                                                educx__Management_Fee_Balance__c,educx__Management_Fee_Paid__c,educx__Management_Other_Fee__c,educx__Management_Other_Fee_Paid__c,educx__Other_Fee_Balance__c,
                                                educx__Management_Transport_Fee__c,educx__Management_Transport_Fee_Paid__c,RecordType.Name ,educx__Transport_Fee_Balance__c,educx__Exam_Fee_Balance__c
                                                FROM educx__Payment__c 
                                                WHERE educx__Student_Hall_Ticket_No__c =: hallticketNo];
        }
        if(recordType == 'Convenor'){
			paymentList =[SELECT Id,Name,educx__Student__r.educx__Name_of_The_Candidate__c,educx__Student_Hall_Ticket_No__c,educx__Tution_Fee_Balance__c,educx__Tution_Fee_Amount__c,educx__Special_Fee_Balance__c,
						  educx__Special_Fee_Amount__c,educx__Admission_Fee_Balance__c,educx__Admission_Fee_Amount__c,educx__Convenor_University_Fee_Balance__c,educx__Convenor_University_Fee_Paid__c,
                          educx__Convenor_University_Fee__c,educx__Other_Fee_Balance__c,educx__Convenor_Other_Fee__c,educx__Exam_Fee_Balance__c,educx__Transport_Fee_Balance__c,educx__Convenor_Exam_Fee__c,
                          educx__Convenor_Transport_Fee__c FROM educx__Payment__c where educx__Student_Hall_Ticket_No__c =: hallticketNo];
        }
        return paymentList;
    }
    
    @AuraEnabled (cacheable=true)
    public static List<educx__Payment_Details__c> getStudentPaymentDetail(List<Id> paymentIds){
       List<educx__Payment_Details__c> detailsList = [Select Id,educx__Amount_Paid__c,educx__Fee_Type__c,educx__Payment__c,educx__Payment__r.Name,educx__Payment_Type__c,CreatedDate 
                                                      from educx__Payment_Details__c WHERE educx__Payment__c IN :paymentIds  ];
	   return detailsList;    
    }

    @AuraEnabled (cacheable=true)
    public static String getPaymentRecordId(string hallticketNo){
       String recordTypeId = [SELECT Id,educx__Student_Hall_Ticket_No__c,RecordType.Name FROM educx__Payment__c where educx__Student_Hall_Ticket_No__c =:hallticketNo Limit 1].RecordType.Name;
       return recordTypeId;
    }
    
    public class studentcourseWrapper
    {
        
        @AuraEnabled public string stdHallticketno;
        @AuraEnabled public string stdName;
        @AuraEnabled public string stdcourse;
        @AuraEnabled public string stdcourseName;
        @AuraEnabled public decimal stdTotalFee;
        @AuraEnabled public decimal stdTotalFeeBalance;
        @AuraEnabled public decimal stdTotalFeePaid;
    }
}