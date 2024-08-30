public class PaymentHandler {
    private static final Map<String, String> feeMapping = new Map<String, String>{
        'Management' => 'Management Fee',
            'Other fee' => 'Other Fee',
            'Exam fee' => 'Exam Fee',
            'Transport fee' => 'Transportation Fee',
            'Admission fee' => 'Admission Fee',
            'Tution fee' => 'Tution Fee',
            'Transport fee' => 'Transportation Fee',
            'University fee' => 'Univeristy Fee',
            'Special fee' =>'Special Fee'
            };
                
                private static final Map<String, String> recordTypeMapping = new Map<String, String>{
                    'Management' => '012al0000020Q4bAAE',
                        'Convenor' => '012al0000020Q9RAAU'
                        };   
                            @AuraEnabled(cacheable=true)
                            public static PaymentWrapper getStudentPayments(string StdHallTicket ) {
                                
                                PaymentWrapper pw = new PaymentWrapper();
                                Set<Id> courseIds = new Set<Id>();
                                educx__Student__c std = [select educx__Course_Code__c,educx__Hall_Ticket_No__c from educx__Student__c where educx__Hall_Ticket_No__c=:StdHallTicket];
                                if(std!= null)
                                {
                                    
                                    
                                    educx__Course__c studentRelatedCourse=[ select id,educx__Course__c,name,educx__Course_Duration__c,educx__Course_Level__c,educx__Course_Name__c
                                                                           from educx__Course__c where id =:std.educx__Course_Code__c  ];
                                    for(educx__Payment__c studentRelatedPayment:[select Id,educx__Student__c,educx__Student__r.educx__Name_of_The_Candidate__c,educx__Student__r.educx__Hall_Ticket_No__c,
                                                                                 educx__Student__r.educx__Admission_Type__c,educx__Management_Fee__c,educx__Year__c,educx__Total_Amount_Paid__c,educx__Management_Fee_Balance__c,
                                                                                 educx__Student_Hall_Ticket_No__c,educx__Management_Transport_Fee__c,educx__Tution_Fee_Amount__c,educx__Tution_Fee_Balance__c,
                                                                                 educx__Transport_Fee_Balance__c,educx__Other_Fee_Balance__c,educx__Exam_Fee_Balance__c,educx__Total_Balance__c,
                                                                                 educx__Management_Exam_Fee__c,educx__Management_Other_Fee__c,educx__Total_fee__c,educx__Admission_Fee_Amount__c,
                                                                                 educx__Special_Fee_Amount__c,educx__Special_Fee_Balance__c,educx__Admission_Fee_Balance__c,educx__Convenor_Transport_Fee__c,
                                                                                 educx__Convenor_Exam_Fee__c,educx__Convenor_Other_Fee__c,educx__Convenor_University_Fee__c,educx__Convenor_University_Fee_Paid__c,
                                                                                 educx__Convenor_University_Fee_Balance__c                                                           
                                                                                 from educx__Payment__c where educx__Student_Hall_Ticket_No__c=:StdHallTicket limit 1])
                                        
                                        
                                    {
                                        if(studentRelatedPayment.educx__Student__r.educx__Admission_Type__c!=null)
                                        {
                                            pw.recordId = studentRelatedPayment.Id;
                                            pw.studentHallticketno = studentRelatedPayment.educx__Student__r.educx__Hall_Ticket_No__c;
                                            pw.studentName = studentRelatedPayment.educx__Student__r.educx__Name_of_The_Candidate__c;
                                            pw.studentYear = studentRelatedPayment.educx__Year__c;
                                            pw.stdRelatedCourse = studentRelatedCourse.educx__Course_Name__c;
                                            pw.managementFee = studentRelatedPayment.educx__Management_Fee__c;
                                            pw.managementFeeBal = studentRelatedPayment.educx__Management_Fee_Balance__c;
                                            pw.totalFee = studentRelatedPayment.educx__Total_fee__c;
                                            pw.totalFeeBalance = studentRelatedPayment.educx__Total_Balance__c;
                                            pw.totalAmountPaid = studentRelatedPayment.educx__Total_Amount_Paid__c;
                                            pw.admType = studentRelatedPayment.educx__Student__r.educx__Admission_Type__c;
                                            pw.managementTransportFee = studentRelatedPayment.educx__Management_Transport_Fee__c;
                                            pw.managementExamFee = studentRelatedPayment.educx__Management_Exam_Fee__c;
                                            pw.managementOtherFee = studentRelatedPayment.educx__Management_Other_Fee__c;
                                            pw.managementTransportFeeBal = studentRelatedPayment.educx__Transport_Fee_Balance__c;
                                            pw.managementExamFeeBal = studentRelatedPayment.educx__Exam_Fee_Balance__c;
                                            pw.managementOtherFeeBal = studentRelatedPayment.educx__Other_Fee_Balance__c; 
                                            pw.convenorTransportFee = studentRelatedPayment.educx__Convenor_Transport_Fee__c;
                                            pw.convenorTransportFeeBal = studentRelatedPayment.educx__Transport_Fee_Balance__c;
                                            pw.convenorExamFee = studentRelatedPayment.educx__Convenor_Exam_Fee__c;
                                            pw.convenorExamFeeBal = studentRelatedPayment.educx__Exam_Fee_Balance__c;
                                            pw.convenorOtherFee = studentRelatedPayment.educx__Convenor_Other_Fee__c;
                                            pw.convenorOtherFeeBal = studentRelatedPayment.educx__Other_Fee_Balance__c;
                                            pw.specialFee = studentRelatedPayment.educx__Special_Fee_Amount__c;
                                            pw.specialFeeBal = studentRelatedPayment.educx__Special_Fee_Balance__c;
                                            pw.tutionFee = studentRelatedPayment.educx__Tution_Fee_Amount__c;
                                            pw.tutionFeeBal = studentRelatedPayment.educx__Tution_Fee_Balance__c;
                                            pw.admissionFee = studentRelatedPayment.educx__Admission_Fee_Amount__c;
                                            pw.admissionBal = studentRelatedPayment.educx__Admission_Fee_Balance__c;
                                            pw.universityFee = studentRelatedPayment.educx__Convenor_University_Fee__c;
                                            pw.universityFeeBal = studentRelatedPayment.educx__Convenor_University_Fee_Paid__c;
                                            pw.universityFeePaid = studentRelatedPayment.educx__Convenor_University_Fee_Balance__c;
                                        }
                                        //system.debug('pw recors--->'+pw);
                                    }
                                }
                                
                                return pw;
                                
                            }
    
    @AuraEnabled
    public static list<educx__Payment_Details__c> saveManagementPaymentRecords(String recordsMapJson) {
        try {
            List<paymentDetailsWrapper> pdwList = (List<paymentDetailsWrapper>) JSON.deserialize(recordsMapJson, List<paymentDetailsWrapper>.class);
            List<educx__Payment_Details__c> paymentDetailRecordsToInsert = new List<educx__Payment_Details__c>();
            
            for (paymentDetailsWrapper pdw : pdwList) {
                System.debug('paymentId'+pdw.recordId);
                System.debug(' pdw.Amount  '+ pdw.amountpaid);
                Decimal amountPaidDecimal = pdw.amountpaid != null ?Decimal.valueOf( pdw.amountpaid) : 0;
                educx__Payment_Details__c paymentDetailRecord = new educx__Payment_Details__c();
                
                paymentDetailRecord.educx__Payment__c = pdw.recordId;
                paymentDetailRecord.educx__Payment_Type__c = pdw.picklistval;
                paymentDetailRecord.RecordTypeId =recordTypeMapping.get(pdw.recordType);
                paymentDetailRecord.educx__Amount_Paid__c = amountPaidDecimal;
                if (feeMapping.containsKey(pdw.feeType)) {
                    paymentDetailRecord.educx__Fee_Type__c = feeMapping.get(pdw.feeType);
                } 
                
                paymentDetailRecordsToInsert.add(paymentDetailRecord);
                //insert paymentDetailRecord;
            }
            
            if (!paymentDetailRecordsToInsert.isEmpty()) {
                insert paymentDetailRecordsToInsert;
                
            }
            return paymentDetailRecordsToInsert;
            
            
        } catch (Exception e) {
            throw new AuraHandledException('Error deserializing JSON: ' + e.getMessage());
        }
    }
    
    public class paymentDetailsWrapper {
        @AuraEnabled public String recordId;
        @AuraEnabled public String feeType;
        @AuraEnabled public String totalAmt;
        @AuraEnabled public String amtpayable;
        @AuraEnabled public String amountpaid;
        @AuraEnabled public String recordType;
        @AuraEnabled public String picklistval;
    }
    
    
    public class PaymentWrapper {
        @AuraEnabled public string recordId;
        @AuraEnabled public string studentHallticketno;
        @AuraEnabled public string studentName;
        @AuraEnabled public String studentYear;
        @AuraEnabled public Decimal managementFee;
        @AuraEnabled public Decimal managementFeeBal;
        @AuraEnabled public Decimal totalFeeBalance;
        @AuraEnabled public Decimal totalAmountPaid;
        @AuraEnabled public Decimal totalFee;
        @AuraEnabled public Decimal managementTransportFee;
        @AuraEnabled public Decimal managementTransportFeeBal;
        @AuraEnabled public Decimal managementExamFee;
        @AuraEnabled public Decimal managementExamFeeBal;
        @AuraEnabled public Decimal managementOtherFee;
        @AuraEnabled public Decimal managementOtherFeeBal;
        @AuraEnabled public String admType;
        @AuraEnabled public String stdRelatedCourse;
        @AuraEnabled public Decimal convenorTransportFee;
        @AuraEnabled public Decimal convenorTransportFeeBal;
        @AuraEnabled public Decimal convenorExamFee;
        @AuraEnabled public Decimal convenorExamFeeBal;
        @AuraEnabled public Decimal convenorOtherFee;
        @AuraEnabled public Decimal convenorOtherFeeBal;
        @AuraEnabled public Decimal specialFee;
        @AuraEnabled public Decimal specialFeeBal;
        @AuraEnabled public Decimal tutionFee;
        @AuraEnabled public Decimal tutionFeeBal;
        @AuraEnabled public Decimal admissionFee;
        @AuraEnabled public Decimal admissionBal;
        @AuraEnabled public Decimal universityFee;
        @AuraEnabled public Decimal universityFeeBal;
        @AuraEnabled public Decimal universityFeePaid;
    }
}