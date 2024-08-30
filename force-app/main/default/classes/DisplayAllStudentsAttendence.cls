public with sharing class DisplayAllStudentsAttendence {
    
    
    @AuraEnabled(cacheable=true)                   
    public static List<String> getDataTableHeaders(String academicYear, String course, String courseName, String year, String sem) {
        List<String> listOfSubjects = new List<String>();
        
        // Query to get course subject records based on the criteria
        List<educx__Course_Subject__c> courseSubjectList = [
            SELECT educx__Subject__r.educx__Subject_Name__c 
            FROM educx__Course_Subject__c 
            WHERE educx__Course__r.educx__Course_Name__c = :courseName 
            AND educx__Year__c = :year 
            AND educx__Semester__c = :sem
        ];
        
        // Iterate over the queried records and add subject names to the list
        for (educx__Course_Subject__c courseSubject : courseSubjectList) {
            listOfSubjects.add(courseSubject.educx__Subject__r.educx__Subject_Name__c);
        }
        
        return listOfSubjects;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getCourses() {
        Schema.DescribeFieldResult fieldResult = educx__Course__c.educx__Course__c.getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
        
        List<String> picklistValues = new List<String>();
        picklistValues.add('None');
        for (Schema.PicklistEntry entry : picklistEntries) {
            picklistValues.add(entry.getValue());
        }
        
        return picklistValues;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getCourseNames(String course) {
        List<String> picklistValues = new List<String>();
        picklistValues.add('None');
        
        if (course != null && course != 'None') {
            // Query to get course names based on the selected course
            List<educx__Course__c> courses = [
                SELECT educx__Course_Name__c 
                FROM educx__Course__c 
                WHERE educx__Course__c = :course
            ];
            
            for (educx__Course__c courseRecord : courses) {
                picklistValues.add(courseRecord.educx__Course_Name__c);
            }
        }
        
        return picklistValues;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getCourseYears() {
        Schema.DescribeFieldResult fieldResult = educx__Student__c.educx__Year__c.getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
        
        List<String> picklistValues = new List<String>();
        picklistValues.add('None');
        for (Schema.PicklistEntry entry : picklistEntries) {
            picklistValues.add(entry.getValue());
        }
        
        return picklistValues;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getCourseSem() {
        Schema.DescribeFieldResult fieldResult = educx__Student__c.educx__Semester__c.getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
        
        List<String> picklistValues = new List<String>();
        picklistValues.add('None');
        for (Schema.PicklistEntry entry : picklistEntries) {
            picklistValues.add(entry.getValue());
        }
        
        return picklistValues;
    }
    
    
  @AuraEnabled(cacheable=true)
public static List<educx__attendance__c> getSubjectAttendance(String studentId) {
    List<educx__attendance__c> lst = [
        SELECT educx__Student_Id__c, 
               educx__Student_Id__r.educx__Name_of_The_Candidate__c,
               educx__Course__c, 
               educx__Year__c,
               educx__Semester__c, 
               educx__Student_Hall_Ticket_No__c, 
               educx__Subject__r.Name, 
               educx__Subject__r.educx__Subject_Name__c, 
               educx__Acadmic_Year__c,
               educx__Total_Classes_Attended__c 
        FROM educx__attendance__c     
        WHERE educx__Student_Id__r.educx__Hall_Ticket_No__c =: studentId
    ];
     System.debug('lst'+lst);
    return lst; 
}
    
    @AuraEnabled(cacheable=true)                                  
    public static List<AttendanceWrapper> getAttendanceDetails(String academicYear, String course, String courseName, String year, String sem,String studentId) {
        // Query to get attendance details for the Hall Ticket Numbers
        List<educx__attendance__c> attendanceRecords = new List<educx__attendance__c>();
        
        if(studentId != null && studentId != ''){
            attendanceRecords =  [ 
                SELECT educx__Student_Id__r.educx__Name_of_The_Candidate__c, 
                educx__Student_Hall_Ticket_No__c, 
                educx__Subject__r.educx__Subject_Name__c, 
                educx__Acadmic_Year__c,
                educx__Total_Classes_Attended__c 
                FROM educx__attendance__c 
                WHERE educx__Course__r.educx__Course_Name__c = :courseName  
                AND educx__Year__c = :year  
                AND educx__Semester__c = :sem
                AND educx__Student_Hall_Ticket_No__c =: studentId 
            ];
        } else {  
            attendanceRecords = [ 
                SELECT educx__Student_Id__r.educx__Name_of_The_Candidate__c, 
                educx__Student_Hall_Ticket_No__c, 
                educx__Subject__r.educx__Subject_Name__c, 
                educx__Acadmic_Year__c,
                educx__Total_Classes_Attended__c 
                FROM educx__attendance__c 
                WHERE educx__Course__r.educx__Course_Name__c = :courseName 
                AND educx__Year__c = :year  
                AND educx__Semester__c = :sem 
            ];
        }
        
        // Map to store results
        List<AttendanceWrapper> results = new List<AttendanceWrapper>(); 
        for (educx__attendance__c attendance : attendanceRecords) {
            AttendanceWrapper wrapper = new AttendanceWrapper();
            wrapper.studentName = attendance.educx__Student_Id__r.educx__Name_of_The_Candidate__c;
            wrapper.hallTicketNo = attendance.educx__Student_Hall_Ticket_No__c;
            wrapper.subjectName = attendance.educx__Subject__r.educx__Subject_Name__c;
            wrapper.totalClassesAttended = attendance.educx__Total_Classes_Attended__c;
            results.add(wrapper);
            System.debug('wrapper.hallTicketNo: ' + wrapper.hallTicketNo);
            System.debug('attendanceRecords :::'+attendanceRecords.size());
        }
        
        System.debug(results + ' results');
        System.debug(results.size() + ' results size');
          return results; 
    }
    
    
    
    public class AttendanceWrapper {
        @AuraEnabled public String studentName;
        @AuraEnabled public String hallTicketNo;
        @AuraEnabled public String subjectName;
        @AuraEnabled public Double totalClassesAttended;
    }
}