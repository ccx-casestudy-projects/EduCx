trigger StudentTrigger on educx__Student__c(after insert, after update,before insert,before update,before delete,after undelete) 
{
    StudentTriggerHandler.runTrigger(Trigger.operationType, Trigger.new, Trigger.oldMap);
}