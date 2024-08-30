trigger EmployeeLeaveDetailsTrigger on educx__Employee_Leave_Details__c (after insert, after update,before insert, before update) 
{
    /*if(trigger.isafter && trigger.isInsert)
    {
        EmployeeLeaveCalculation.empLeaveDetails(trigger.new);
    }*/
     if (Trigger.isAfter) 
     {
        if (Trigger.isInsert || Trigger.isUpdate) 
        {
            EmployeeLeaveCalculation.empLeaveDetails(Trigger.new);
        }
    }
     if (Trigger.isBefore) 
     {
        if (Trigger.isInsert || Trigger.isUpdate) 
        {
            EmployeeLeaveCalculation.validateOverlappingLeave(Trigger.new);
        }
    }
}