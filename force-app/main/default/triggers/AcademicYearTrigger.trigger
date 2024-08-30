/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 08-06-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
trigger AcademicYearTrigger on educx__Academic_Year__c (after insert,after update,after delete) {
    AcademicYearTriggerHandler.runTrigger(Trigger.operationType, Trigger.new, Trigger.oldMap,trigger.old);
}