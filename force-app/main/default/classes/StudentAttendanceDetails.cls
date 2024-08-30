public class StudentAttendanceDetails {
    public class StudentAttendanceDetailsWrapper {
        @AuraEnabled public String studentId { get; set; }
        @AuraEnabled public String studentName { get; set; }
        @AuraEnabled public String hallTicketNo { get; set; }
        @AuraEnabled public String courseName { get; set; }
        @AuraEnabled public String year { get; set; }
        @AuraEnabled public String semester { get; set; }
        @AuraEnabled public String month { get; set; }
        @AuraEnabled public String subject { get; set; }
        @AuraEnabled public Boolean[] days = new Boolean[31];

        public StudentAttendanceDetailsWrapper(String studentId, String studentName, String hallTicketNo, String courseName, String year, String semester,
                                               String month,String subject, Boolean[] days) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.hallTicketNo = hallTicketNo;
            this.courseName = courseName;
            this.year = year;
            this.semester = semester;
            this.month = month;
            this.subject = subject;
            this.days = days;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<StudentAttendanceDetailsWrapper> getStudentAttendanceDetails(){
        List<educx__Attendance__c> attendanceLst = [
            SELECT Id, educx__Student_Id__r.educx__Name_of_The_Candidate__c, educx__Student_Id__r.educx__Hall_Ticket_No__c, Name, educx__Student_Id__c, educx__Semester__c, educx__Year__c,          
                   educx__Course__r.educx__Course_Name__c, educx__Subject__r.educx__Subject_Name__c,
                   (SELECT Id, educx__Months__c, educx__Day_1__c, educx__Day_2__c, educx__Day_3__c, educx__Day_4__c, educx__Day_5__c, educx__Day_6__c, educx__Day_7__c, educx__Day_8__c, educx__Day_9__c,
                           educx__Day_10__c, educx__Day_11__c, educx__Day_12__c, educx__Day_13__c, educx__Day_14__c, educx__Day_15__c, educx__Day_16__c, educx__Day_17__c, educx__Day_18__c,
                           educx__Day_19__c, educx__Day_20__c, educx__Day_21__c, educx__Day_22__c, educx__Day_23__c, educx__Day_24__c, educx__Day_25__c, educx__Day_26__c, educx__Day_27__c,
                           educx__Day_28__c, educx__Day_29__c, educx__Day_30__c, educx__Day_31__c 
                    FROM educx__AttendanceDetails__r)
            FROM educx__Attendance__c
        ];

        List<StudentAttendanceDetailsWrapper> wrappers = new List<StudentAttendanceDetailsWrapper>();
        for (educx__Attendance__c record : attendanceLst) {
            for (educx__AttendanceDetails__c detail : record.educx__AttendanceDetails__r) {
                Boolean[] days = new Boolean[31];
                days[0] = detail.educx__Day_1__c;
                days[1] = detail.educx__Day_2__c;
                days[2] = detail.educx__Day_3__c;
                days[3] = detail.educx__Day_4__c;
                days[4] = detail.educx__Day_5__c;
                days[5] = detail.educx__Day_6__c;
                days[6] = detail.educx__Day_7__c;
                days[7] = detail.educx__Day_8__c;
                days[8] = detail.educx__Day_9__c;
                days[9] = detail.educx__Day_10__c;
                days[10] = detail.educx__Day_11__c;
                days[11] = detail.educx__Day_12__c;
                days[12] = detail.educx__Day_13__c;
                days[13] = detail.educx__Day_14__c;
                days[14] = detail.educx__Day_15__c;
                days[15] = detail.educx__Day_16__c;
                days[16] = detail.educx__Day_17__c;
                days[17] = detail.educx__Day_18__c;
                days[18] = detail.educx__Day_19__c;
                days[19] = detail.educx__Day_20__c;
                days[20] = detail.educx__Day_21__c;
                days[21] = detail.educx__Day_22__c;
                days[22] = detail.educx__Day_23__c;
                days[23] = detail.educx__Day_24__c;
                days[24] = detail.educx__Day_25__c;
                days[25] = detail.educx__Day_26__c;
                days[26] = detail.educx__Day_27__c;
                days[27] = detail.educx__Day_28__c;
                days[28] = detail.educx__Day_29__c;
                days[29] = detail.educx__Day_30__c;
                days[30] = detail.educx__Day_31__c;

                wrappers.add(new StudentAttendanceDetailsWrapper(
                    record.educx__Student_Id__c,
                    record.educx__Student_Id__r.educx__Name_of_The_Candidate__c,
                    record.educx__Student_Id__r.educx__Hall_Ticket_No__c,
                    record.educx__Course__r.educx__Course_Name__c,
                    record.educx__Year__c, 
                    record.educx__Semester__c,
                    detail.educx__Months__c,
                    record.educx__Subject__r.educx__Subject_Name__c,
                    days
                ));
            }
        }
        
        System.debug('wrappers :::' + wrappers);
        return wrappers;
    }
}