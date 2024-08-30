public with sharing class studentTriggerHelper {
	//creating AY record on student creation/promoting to next year /sem trigger
    public static void createAcademicYearRecord(List<educx__Student__c> promotedStudents){
        List<educx__Academic_Year__c> academicYearsToInsert = new List<educx__Academic_Year__c>();
        Integer currentYear = Date.today().year();//2024
        String currentYearPrefix = currentYear + '-';//2024-
    
        // Getting the picklist values for the academic year field to be populated to AY record for that student
        List<String> picklistValues = StudentController.getAcademicYearPicklistValues();
        String academicYearValue = '';
        for (String value : picklistValues) {
            if (value.startsWith(currentYearPrefix)) {
                academicYearValue = value;
                break;
            }
        }
    
        if (academicYearValue == '') {
            System.debug('No matching academic year picklist value found for the current year.');
        }
        
        for (educx__Student__c student : promotedStudents) {
            educx__Academic_Year__c academicYear = new educx__Academic_Year__c();
            academicYear.educx__Student__c = student.Id;
            academicYear.educx__Academic_year__c = academicYearValue ; 
            academicYear.educx__Course__c = student.educx__Course_Code__c;
            academicYear.educx__Sem__c = student.educx__Semester__c;
            academicYear.educx__Year__c = student.educx__Year__c;
            academicYear.educx__Hall_Ticket_No__c = student.educx__Hall_Ticket_No__c;
    
            academicYearsToInsert.add(academicYear);
        }
        if (!academicYearsToInsert.isEmpty()) {
            System.debug('academicYearsToInsert =>'+academicYearsToInsert); 
            insert academicYearsToInsert;
        }
    }
    public static void createPaymentRecord(List<educx__Student__c> students) {
        Map<String, Id> feeStructureRecordTypes = new Map<String, Id>();
        Map<String, Id> paymentRecordTypes = new Map<String, Id>();
        Map<Id, educx__Academic_Year__c> studentAcademicYearMap = new Map<Id, educx__Academic_Year__c>();
        Map<Id, educx__Student__c> studentHallTicketMap = new Map<Id, educx__Student__c>();
        Set<Id> studentIds = new Set<Id>();
        Set<Id> courseId = new Set<Id>();
        List<educx__Payment__c> studentPayments = new List<educx__Payment__c>();
        Map<String, Map<String, educx__Fee_Structure__c>> feeStructureMap = new Map<String, Map<String, educx__Fee_Structure__c>>();
        
        for (educx__Student__c studentRec : students) {
            if (studentRec.educx__Admission_Type__c != null && studentRec.educx__Course_Code__c != null &&
                (studentRec.educx__Admission_Type__c == 'Management Quota' || 
                 studentRec.educx__Admission_Type__c == 'Spot Registration' || 
                 (studentRec.educx__Admission_Type__c == 'Convenor Quota' && 
                  (studentRec.educx__Is_RTF__c == false || studentRec.educx__Is_RTF__c == true))))
            {
                system.debug('inside student'+students);
                courseId.add(studentRec.educx__Course_Code__c);
                studentIds.add(studentRec.Id);
            }
        }
        
        if (!courseId.isEmpty()) {
            
            for (RecordType rt : [SELECT Id, DeveloperName FROM RecordType WHERE SObjectType = 'educx__Fee_Structure__c']) {
                feeStructureRecordTypes.put(rt.DeveloperName, rt.Id);
            }
            
            
            for (RecordType rt : [SELECT Id, DeveloperName FROM RecordType WHERE SObjectType = 'educx__Payment__c']) {
                paymentRecordTypes.put(rt.DeveloperName, rt.Id);
            }
            
            
            List<educx__Course__c> studentRelatedCourse = [
                SELECT Id, educx__Course_Name__c, educx__Course_Duration__c 
                FROM educx__Course__c 
                WHERE Id IN :courseId
            ];
            
            
            List<educx__Fee_Structure__c> courseRelatedFee = [
                SELECT Id, educx__CourseCode__r.educx__Course__c, educx__CourseCode__c,
                educx__Special_Fee__c, educx__Tution_Fee__c, educx__Management_Fee__c,
                educx__CourseCode__r.educx__Course_Duration__c,educx__Other_Fee__c,
                educx__Admission_Fee__c, educx__Year__c, RecordTypeId
                FROM educx__Fee_Structure__c 
                WHERE educx__CourseCode__c IN :courseId
            ];
            
            
            for (educx__Academic_Year__c academicYear : [ 
                SELECT educx__Student__c, educx__Year__c 
                FROM educx__Academic_Year__c 
                WHERE educx__Student__c IN :studentIds 
                ORDER BY CreatedDate DESC
            ]) {
                if (!studentAcademicYearMap.containsKey(academicYear.educx__Student__c)) {
                    studentAcademicYearMap.put(academicYear.educx__Student__c, academicYear);
                }
            }
            
            
            for (educx__Student__c student : [
                SELECT Id, educx__Hall_Ticket_No__c 
                FROM educx__Student__c 
                WHERE Id IN :studentIds
            ]) {
                if (!studentHallTicketMap.containsKey(student.Id)) {
                    studentHallTicketMap.put(student.Id, student);
                }
            }
            
            
            for (educx__Fee_Structure__c fest : courseRelatedFee) {
                String courseCode = fest.educx__CourseCode__c;
                String recordTypeYearKey = fest.RecordTypeId + '_' + fest.educx__Year__c;
                
                if (!feeStructureMap.containsKey(courseCode)) {
                    feeStructureMap.put(courseCode, new Map<String, educx__Fee_Structure__c>());
                }
                
                feeStructureMap.get(courseCode).put(recordTypeYearKey, fest);
                system.debug('fstmap-->'+feeStructureMap);
            }
            
            
            for (educx__Student__c std : students) {
                Id relevantFeeStructureRecordTypeId;
                String recordTypeYearKey;
                
                if (std.educx__Admission_Type__c == 'Management Quota' || std.educx__Admission_Type__c == 'Spot Registration') {
                    relevantFeeStructureRecordTypeId = feeStructureRecordTypes.get('Management_Record_Type');
                } else if (std.educx__Admission_Type__c == 'Convenor Quota') {
                    relevantFeeStructureRecordTypeId = feeStructureRecordTypes.get('Convenor_Record_Type');
                }
                
                
                recordTypeYearKey = relevantFeeStructureRecordTypeId + '_' + studentAcademicYearMap.get(std.Id)?.educx__Year__c;
                
                educx__Fee_Structure__c relevantFeeStructure = feeStructureMap.get(std.educx__Course_Code__c)?.get(recordTypeYearKey);
                
                if (relevantFeeStructure != null) {
                    educx__Payment__c stdPayment = new educx__Payment__c();
                    stdPayment.educx__Student__c = std.Id;
                    
                    Id relevantPaymentRecordTypeId;
                    if (std.educx__Admission_Type__c == 'Management Quota' || std.educx__Admission_Type__c == 'Spot Registration') 
                    {
                        relevantPaymentRecordTypeId = paymentRecordTypes.get('Management_Record_Type');
                        stdPayment.RecordTypeId = relevantPaymentRecordTypeId;
                        
                        if (std.educx__Agreement_Fee__c != null && std.educx__Fee_Type__c != null ) 
                        {
                            Integer courseDurationYears = Integer.valueOf(relevantFeeStructure.educx__CourseCode__r.educx__Course_Duration__c.split(' ')[0]);
                            if (std.educx__Fee_Type__c == 'Per Year') 
                            {
                                stdPayment.educx__Management_Fee__c = std.educx__Agreement_Fee__c;
                            } 
                            else if (std.educx__Fee_Type__c == 'Per Course') 
                            {
                                stdPayment.educx__Management_Fee__c = std.educx__Agreement_Fee__c / courseDurationYears;
                            }
                        } 
                        else 
                        {
                            stdPayment.educx__Management_Fee__c = ( std.educx__Agreement_Fee__c >0 )
                                ? std.educx__Agreement_Fee__c
                                : relevantFeeStructure.educx__Management_Fee__c;
                        }
                    } 
                    else if (std.educx__Admission_Type__c == 'Convenor Quota') 
                    {
                        relevantPaymentRecordTypeId = paymentRecordTypes.get('Convenor_Record_Type');
                        stdPayment.RecordTypeId = relevantPaymentRecordTypeId;
                        stdPayment.educx__Admission_Fee_Amount__c = relevantFeeStructure.educx__Admission_Fee__c;
                        stdPayment.educx__Special_Fee_Amount__c = relevantFeeStructure.educx__Special_Fee__c;
                        stdPayment.educx__Tution_Fee_Amount__c = relevantFeeStructure.educx__Tution_Fee__c;
                        stdPayment.educx__Convenor_Other_Fee__c = relevantFeeStructure.educx__Other_Fee__c;
                    }
                    
                    stdPayment.educx__Year__c = studentAcademicYearMap.get(std.Id)?.educx__Year__c;
                    stdPayment.educx__Student_Hall_Ticket_No__c = studentHallTicketMap.get(std.Id)?.educx__Hall_Ticket_No__c;
                    
                    studentPayments.add(stdPayment);
                }
            }
            
            if (!studentPayments.isEmpty()) {
                insert studentPayments;
            }
        }
    }
}