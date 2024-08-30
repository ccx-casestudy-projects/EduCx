trigger FacultySubjectsTrigger on educx__Faculty_Subjects__c (before insert)
{
            FacultySubjectController.validateUniqueAssignments(Trigger.new);
 }