public class AttendanceTriggerHandler { 

    public static void updateAttendanceSummary(List<educx__AttendanceDetails__c> attendanceDetailsList) {
        // Map to store the cumulative attendance per Attendance record
        Map<Id, Integer> attendanceIdToTotalDays = new Map<Id, Integer>();

        // Collect Attendance IDs from attendance details
        Set<Id> attendanceIds = new Set<Id>();
        for (educx__AttendanceDetails__c detail : attendanceDetailsList) {
            if (detail.educx__Attendance__c != null) {
                attendanceIds.add(detail.educx__Attendance__c);
            }
        }

        // If there are no attendance IDs, exit early
        if (attendanceIds.isEmpty()) {
            return;
        }

        // Retrieve all relevant AttendanceDetails records for these Attendance IDs
        List<educx__AttendanceDetails__c> allDetails = [SELECT Id, educx__Attendance__c, educx__TodayDayPresent__c 
                                                        FROM educx__AttendanceDetails__c 
                                                        WHERE educx__Attendance__c IN :attendanceIds];

        // Calculate the total days attended for each attendance record
        for (educx__AttendanceDetails__c detail : allDetails) {
            Id attendanceId = detail.educx__Attendance__c;
            Integer daysPresent = detail.educx__TodayDayPresent__c != null ? detail.educx__TodayDayPresent__c.intValue() : 0;
            if (!attendanceIdToTotalDays.containsKey(attendanceId)) {
                attendanceIdToTotalDays.put(attendanceId, 0);
            }
            attendanceIdToTotalDays.put(attendanceId, attendanceIdToTotalDays.get(attendanceId) + daysPresent);
        }

        // Update the educx__Total_Classes_Attended__c field in the educx__Attendance__c records
        List<educx__Attendance__c> attendancesToUpdate = new List<educx__Attendance__c>();
        for (Id attendanceId : attendanceIdToTotalDays.keySet()) {
            Integer totalDays = attendanceIdToTotalDays.get(attendanceId);
            educx__Attendance__c attendance = new educx__Attendance__c(
                Id = attendanceId,
                educx__Total_Classes_Attended__c = totalDays
            );
            attendancesToUpdate.add(attendance);
        }

        // Update the records in the database
        if (!attendancesToUpdate.isEmpty()) {
            update attendancesToUpdate;
        }
    }
}