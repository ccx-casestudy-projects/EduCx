trigger AttendanceTrigger on educx__AttendanceDetails__c (after insert, after update, after delete) {
    if (Trigger.isInsert || Trigger.isUpdate) {
        AttendanceTriggerHandler.updateAttendanceSummary(Trigger.new);
    }
    if (Trigger.isDelete) {
        AttendanceTriggerHandler.updateAttendanceSummary(Trigger.old);
    }
}