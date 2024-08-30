public class StudentTriggerHandler {
    
    public static void runTrigger(System.TriggerOperation operation,List<educx__Student__c> newStudentList,Map<Id, educx__Student__c> oldStudentMap) 
    {
        List<educx__Student__c> promotedStudents=new List<educx__Student__c>();
        List<educx__Student__c> studentPayments = new List<educx__Student__c>();
        List<educx__Student__c> studentsWithUpdatedYear   = new List<educx__Student__c>();
        Boolean yearChanged = false;
        switch on operation
        {
            when AFTER_INSERT 
            {
                studentTriggerHelper.createAcademicYearRecord(newStudentList);
                
                for(educx__Student__c std:newStudentList)
                {
                    
                    if(std.educx__Hall_Ticket_No__c != null )
                    {
                        studentPayments.add(std);
                    }
                    
                }
                
                if(!studentPayments.isEmpty())
                {	
                    studentTriggerHelper.createPaymentRecord(newStudentList);
                    
                }
                
                
            }
            when AFTER_UPDATE 
            {
                
                for(educx__Student__c std:newStudentList)
                {
                    educx__Student__c oldStudentRec=oldStudentMap.get(std.Id);
                    system.debug('old student'+oldStudentRec.educx__Hall_Ticket_No__c);
                    system.debug('new student'+std.educx__Hall_Ticket_No__c);
                    if(oldStudentRec.educx__Year__c!=std.educx__Year__c || oldStudentRec.educx__Semester__c!=std.educx__Semester__c)
                    {
                        promotedStudents.add(std);
                    }
                    if (oldStudentRec.educx__Year__c != std.educx__Year__c && std.educx__Hall_Ticket_No__c!=null)
                    {
                        studentsWithUpdatedYear.add(std);
                        
                    }
                    if (oldStudentRec.educx__Hall_Ticket_No__c != std.educx__Hall_Ticket_No__c)
                    {
                        studentPayments.add(std);
                        
                    }
                }
                if(!promotedStudents.isEmpty()){
                    studentTriggerHelper.createAcademicYearRecord(promotedStudents);
                    
                }
                if (!studentsWithUpdatedYear.isEmpty() ) 
                {
                    studentTriggerHelper.createPaymentRecord(studentsWithUpdatedYear);
                    
                }
                
                
                if(!studentPayments.isEmpty())
                {
                    studentTriggerHelper.createPaymentRecord(studentPayments);
                }
                
                
            }
        }
    }
}