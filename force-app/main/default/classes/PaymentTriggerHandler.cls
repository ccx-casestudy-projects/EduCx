public class PaymentTriggerHandler {
    public static void handlePayments(List<educx__Payment__c> payments) {
        Set<Id> studentIds = new Set<Id>();
        Map<Id, educx__Payment__c> paymentMap = new Map<Id, educx__Payment__c>();
        Set<Id> courseIds = new Set<Id>();
        
        for (educx__Payment__c payment : payments) {
            if (payment.educx__Student__c != null) {
                studentIds.add(payment.educx__Student__c);
                paymentMap.put(payment.educx__Student__c, payment);
            }
        }
        
        List<educx__Student__c> studentsToUpdate = [
            SELECT Id, educx__Agreement_Fee__c, educx__Fee_Type__c, educx__Total_Course_Fee__c, 
            educx__Balance_Fee__c, educx__Admission_Type__c, educx__Course_Code__c, 
            educx__Year__c
            FROM educx__Student__c  
            WHERE Id IN :studentIds  AND educx__Admission_Type__c !=null
        ];
        
        List<educx__Academic_Year__c> studentAcademicYears = [
            SELECT educx__Year__c, educx__Student__c 
            FROM educx__Academic_Year__c 
            WHERE educx__Student__c IN :studentIds
        ];
        
        Map<Id, String> studentAcademicYearMap = new Map<Id, String>();
        for (educx__Academic_Year__c academicYear : studentAcademicYears) {
            studentAcademicYearMap.put(academicYear.educx__Student__c, academicYear.educx__Year__c);
        }
         Map<String, Id> feeStructureRecordTypes = new Map<String, Id>();
        for (RecordType rt : [SELECT Id, DeveloperName FROM RecordType WHERE SObjectType = 'educx__Fee_Structure__c']) {
            feeStructureRecordTypes.put(rt.DeveloperName, rt.Id);
        }
        if (!studentsToUpdate.isEmpty()) {
            
            for (educx__Student__c student : studentsToUpdate) {
                if (student.educx__Course_Code__c != null) {
                    courseIds.add(student.educx__Course_Code__c);
                }
            }
            
            Map<Id, educx__Course__c> courseMap = new Map<Id, educx__Course__c>();
            if (!courseIds.isEmpty()) {
                for (educx__Course__c course : [SELECT Id, educx__Course_Duration__c FROM educx__Course__c   WHERE Id IN :courseIds])
                {
                    courseMap.put(course.Id, course);
                }
            }
            
             
            
            List<educx__Student__c> studentsToUpdateList = new List<educx__Student__c>();
            for (educx__Student__c student : studentsToUpdate) 
            {
                educx__Payment__c payment = paymentMap.get(student.Id);
                system.debug('payment'+payment);
                if (payment != null &&
                    studentAcademicYearMap.get(student.Id) == payment.educx__Year__c &&
                    student.educx__Year__c == payment.educx__Year__c &&
                   (student.educx__Total_Course_Fee__c == 0 || student.educx__Total_Course_Fee__c == null ))
                {
                    educx__Course__c course = courseMap.get(student.educx__Course_Code__c);
                    Integer courseDurationYears ; 
                    if (course != null && course.educx__Course_Duration__c != null)
                    {
                        courseDurationYears = Integer.valueOf(course.educx__Course_Duration__c.split(' ')[0]);
                        system.debug('course dutation--'+courseDurationYears);
                    }
                    
                    String recordTypeName;
                    if (student.educx__Admission_Type__c == 'Convenor Quota') {
                        recordTypeName = 'Convenor_Record_Type';
                    } else if (student.educx__Admission_Type__c == 'Management Quota') {
                        recordTypeName = 'Management_Record_Type';
                    } else {
                        continue; 
                    }

                    
                    if (student.educx__Agreement_Fee__c > 0 && (student.educx__Admission_Type__c =='Management Quota'|| student.educx__Admission_Type__c == 'Spot Registration'))
                    {
                        system.debug('inside if');
                        if (student.educx__Fee_Type__c == 'Per Course') 
                        {
                            student.educx__Total_Course_Fee__c = 
                                (student.educx__Total_Course_Fee__c != null ? student.educx__Total_Course_Fee__c : 0) + 
                                student.educx__Agreement_Fee__c;
                            
                            student.educx__Balance_Fee__c = 
                                (student.educx__Balance_Fee__c != null ? student.educx__Balance_Fee__c : 0) + 
                                student.educx__Agreement_Fee__c;
                        } 
                        else if (student.educx__Fee_Type__c == 'Per Year') 
                        {
                            student.educx__Total_Course_Fee__c = 
                                (student.educx__Total_Course_Fee__c != null ? student.educx__Total_Course_Fee__c : 0) + 
                                (student.educx__Agreement_Fee__c * courseDurationYears);
                            
                            student.educx__Balance_Fee__c = 
                                (student.educx__Balance_Fee__c != null ? student.educx__Balance_Fee__c : 0) + 
                                (student.educx__Agreement_Fee__c * courseDurationYears);
                        }
                    }
                    
                    else if ((student.educx__Agreement_Fee__c == null || student.educx__Agreement_Fee__c == 0 ) && student.educx__Fee_Type__c == null)
                    {
                        system.debug('inside else if');
                        
                        if (student.educx__Admission_Type__c == 'Convenor Quota' || student.educx__Admission_Type__c == 'Management Quota')
                        {
                            system.debug('total fee'+payment.educx__Total_fee__c);
                            student.educx__Total_Course_Fee__c = payment.educx__Total_fee__c * courseDurationYears;
                            student.educx__Balance_Fee__c = payment.educx__Total_fee__c * courseDurationYears;
                            
                        }
                        
                    }
                    studentsToUpdateList.add(student);
                    system.debug('student list'+studentsToUpdateList);
                    
                }
            }
            
            if (!studentsToUpdateList.isEmpty()) {
                try {
                    update studentsToUpdateList;
                } catch (Exception e) {
                    throw new AuraHandledException(e.getMessage());
                }
            }
            else
            {
                return;
            }
        }
    }
    
    public static void updateStudentPaymentInfo(List<educx__Payment__c> payments) {
        Set<Id> studentIds = new Set<Id>();
        Map<Id, educx__Payment__c> paymentMap = new Map<Id, educx__Payment__c>();
        
        for (educx__Payment__c payment : payments) {
            if (payment.educx__Student__c != null) {
                studentIds.add(payment.educx__Student__c);
                paymentMap.put(payment.educx__Student__c, payment);
            }
        }
        
        
        List<educx__Student__c> studentsToUpdate = [
            SELECT Id, educx__Agreement_Fee__c, educx__Fee_Type__c, educx__Total_Course_Fee__c, 
            educx__Balance_Fee__c, educx__Admission_Type__c, educx__Course_Code__c, educx__Year__c
            FROM educx__Student__c  
            WHERE Id IN :studentIds 
            AND educx__Admission_Type__c != null 
        ];
        
        
        List<educx__Academic_Year__c> studentAcademicYears = [
            SELECT educx__Year__c, educx__Student__c
            FROM educx__Academic_Year__c 
            WHERE educx__Student__c IN :studentIds
        ];
        
        Map<Id, String> studentAcademicYearMap = new Map<Id, String>();
        for (educx__Academic_Year__c academicYear : studentAcademicYears) {
            studentAcademicYearMap.put(academicYear.educx__Student__c, academicYear.educx__Year__c);
        }
        
        
        Set<Id> courseIds = new Set<Id>();
        for (educx__Student__c student : studentsToUpdate) {
            if (student.educx__Course_Code__c != null) {
                courseIds.add(student.educx__Course_Code__c);
            }
        }
        
        Map<Id, educx__Course__c> courseMap = new Map<Id, educx__Course__c>();
        if (!courseIds.isEmpty()) {
            List<educx__Course__c> courses = [
                SELECT Id, educx__Course_Duration__c 
                FROM educx__Course__c 
                WHERE Id IN :courseIds
            ];
            
            for (educx__Course__c course : courses) {
                courseMap.put(course.Id, course);
            }
        }
        
        
        Map<Id, Decimal> studentTotalPaidMap = new Map<Id, Decimal>();
        
        
        for (educx__Payment__c payment : payments) {
            if (payment.educx__Student__c != null) {
                Decimal totalPaid = studentTotalPaidMap.get(payment.educx__Student__c);
                if (totalPaid == null) {
                    totalPaid = 0;
                }
                studentTotalPaidMap.put(payment.educx__Student__c, totalPaid + payment.educx__Total_Amount_Paid__c);
            }
        }
        
        for (educx__Student__c student : studentsToUpdate) {
            educx__Payment__c payment = paymentMap.get(student.Id);
            educx__Course__c course = courseMap.get(student.educx__Course_Code__c);
            
            if (payment != null && 
                studentAcademicYearMap.get(student.Id) == payment.educx__Year__c && 
                student.educx__Year__c == payment.educx__Year__c) {
                    
                    Decimal totalPaid = studentTotalPaidMap.get(student.Id);
                    if (totalPaid == null) {
                        totalPaid = 0;
                    }
                    
                    student.educx__Fee_Paid__c = totalPaid;
                    student.educx__Balance_Fee__c = student.educx__Total_Course_Fee__c - totalPaid; 
                }
        }
        
        if (!studentsToUpdate.isEmpty()) {
            try {
                update studentsToUpdate;
            } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        }
    }
    
    
}