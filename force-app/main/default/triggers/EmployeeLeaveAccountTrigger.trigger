trigger EmployeeLeaveAccountTrigger on educx__Employee_Leave_Account__c (before insert,After insert)
{
    if(trigger.isbefore && trigger.isInsert)
    {
        EmployeeLeaveCalculation.beforeleaveRecCreation(trigger.new);
    }
}