public without sharing class StudentAttendanceController {
    
   // public static List<Id> subjectIds = new List<Id>();
    
    public class StudentAttendanceWrapper {
        @AuraEnabled public String studentId { get; set; }
        @AuraEnabled public String studentName { get; set; }
        @AuraEnabled public String hallTicketNo { get; set; }
        @AuraEnabled public String courseName { get; set; }
        @AuraEnabled public String year { get; set; }
        @AuraEnabled public String semester { get; set; }
        @AuraEnabled public String studentNameId { get; set;}
        @AuraEnabled public Date dateOfAttendance { get; set; }
        
        public StudentAttendanceWrapper(String studentId, String studentName, String hallTicketNo, String courseName, String year, String semester, String studentNameId) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.hallTicketNo = hallTicketNo;
            this.courseName = courseName;
            this.year = year;
            this.semester = semester;
            this.studentNameId = studentNameId;
            this.dateOfAttendance = dateOfAttendance;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<StudentAttendanceWrapper> getStudents(Id courseId, String year, String semester) {
        System.debug('courseId :::' + courseId);
        System.debug('year :::' + year);   
        
        List<educx__Student__c> academicYears = [
            Select Id,educx__Name_of_The_Candidate__c,Name,educx__Year__c,educx__Semester__c,educx__Course_Code__r.Name,educx__Hall_Ticket_No__c
            From educx__Student__c
            WHERE educx__Course_Code__c = :courseId AND educx__Year__c =: year AND educx__Semester__c =:semester         
        ];
        /* SELECT educx__Year__c, educx__Sem__c, educx__Student__c, educx__Student__r.educx__Name_of_The_Candidate__c,
educx__Student__r.educx__Hall_Ticket_No__c, educx__Student__r.Name, educx__Course__r.Name
FROM educx__Academic_Year__c 
WHERE educx__Course__c = :courseId AND educx__Year__c = :year AND educx__Sem__c = :semester 
];*/
        
        List<StudentAttendanceWrapper> wrappers = new List<StudentAttendanceWrapper>();
        for (educx__Student__c record : academicYears) {
            wrappers.add(new StudentAttendanceWrapper(
                record.Id,
                record.educx__Name_of_The_Candidate__c,
                record.educx__Hall_Ticket_No__c,
                record.educx__Course_Code__r.Name,
                record.educx__Year__c,
                record.educx__Semester__c,
                record.Name
                
            ));
        }
        
        System.debug('wrappers :::' + wrappers);
        return wrappers;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getCourseYearSemester(Id courseId, String year, String semester, string empId ) {
        List<String> subLst = new List<String>();         
        System.debug('courseId :::' + courseId);   
        System.debug('year :::' + year);
        // educx__Employees__c empDetail = [SELECT Id, Name FROM educx__Employees__c];
        
        List<educx__Faculty_Subjects__c > lst = [SELECT Id,educx__Employee__c,educx__Employee__r.Name, educx__Course__c,
                                                 educx__Course__r.educx__Course_Name__c,educx__Subject__r.educx__Subject_Name__c,
                                                 educx__Subject__r.Name, educx__Year__c, educx__Semester__c
                                                 FROM educx__Faculty_Subjects__c 
                                                 WHERE educx__Course__c = :courseId AND educx__Semester__c = :semester
                                                 AND educx__Year__c = :year AND educx__Employee__r.Name =: empId];
        System.debug('lst ::: ' + lst);
        for (educx__Faculty_Subjects__c  cs : lst) {
            if (cs.educx__Subject__c != null) {
                subLst.add(cs.educx__Subject__r.educx__Subject_Name__c);
                //subjectIds.add(cs.educx__Subject__c);
                //  System.debug('edu Map ::: ' + educx__Subject__r.educx__Subject_Name__c);
            }
        }
        System.debug('Subject Lst ::: ' + subLst);
     //   System.debug('Subject subjectIds ::: ' + subjectIds);
        return subLst;
    } 
    
    
    /* 
@AuraEnabled(cacheable=true)
public static List<String> getCourseYearSemester(Id courseId, String year, String semester) {
List<String> subLst = new List<String>();         
System.debug('courseId :::' + courseId);
System.debug('year :::' + year);
// educx__Employees__c empDetail = [SELECT Id, Name FROM educx__Employees__c];

List<educx__Course_Subject__c> lst = [SELECT Id, educx__Course__c, educx__Course__r.educx__Course_Name__c,educx__Subject__r.educx__Subject_Name__c,
educx__Subject__r.Name, educx__Year__c, educx__Semester__c
FROM educx__Course_Subject__c
WHERE educx__Course__c = :courseId AND educx__Semester__c = :semester AND educx__Year__c = :year];
System.debug('lst ::: ' + lst);
for (educx__Course_Subject__c cs : lst) {
if (cs.educx__Subject__c != null) {
subLst.add(cs.educx__Subject__r.educx__Subject_Name__c);
subjectIds.add(cs.educx__Subject__c);
//  System.debug('edu Map ::: ' + educx__Subject__r.educx__Subject_Name__c);
}
}
System.debug('Subject Lst ::: ' + subLst);
System.debug('Subject subjectIds ::: ' + subjectIds);
return subLst;
}
*/
    
    
    @AuraEnabled public static void createAttendanceDetails(
        List<String> recordMap,
        String course,
        String semester,
        String year,
        String subject,
        String employeeCode
    ) {
        System.debug('recordMap ::: ' + recordMap);
        System.debug('course ::: ' + course);
        System.debug('semester ::: ' + semester);
        System.debug('year ::: ' + year);
        System.debug('employeeCode ::: ' + employeeCode);
        System.debug('subject ::: ' + subject);
        
        // Get current date details
        Date currentDate = Date.today();  
        Integer todayDay = currentDate.day(); 
        String currentMonthName = Datetime.newInstance(currentDate.year(), currentDate.month(), 1).format('MMMM');
        String currentYear = String.valueOf(currentDate.year());
  

     

        
        // Retrieve studentss
        List<educx__Student__c> stddata = [SELECT Id FROM educx__Student__c WHERE Id IN :recordMap];
        
        // Retrieve employee details
        educx__Employees__c empDetail = [SELECT Id, Name FROM educx__Employees__c WHERE Name = :employeeCode LIMIT 1];
        
        // Retrieve subject details for the selected subject
        educx__Subject__c selectedSubject = [SELECT Id, educx__Subject_Name__c FROM educx__Subject__c WHERE educx__Subject_Name__c = :subject LIMIT 1];
        
        // Create attendance records only for the subject associated with the employee
        List<educx__Attendance__c> newAttendanceRecords = new List<educx__Attendance__c>();
        Map<String, educx__Attendance__c> existingAttendanceMap = new Map<String, educx__Attendance__c>();
        Set<Id> attendanceIds = new Set<Id>();
        Map<Id,Id> studentAttMap = new Map<Id,Id>();
        List<educx__Attendance__c> existingAttendances = [
            SELECT Id, educx__Student_Id__c
            FROM educx__Attendance__c
            WHERE educx__Student_Id__c IN :stddata
            AND educx__Course__c = :course
            AND educx__Semester__c = :semester
            AND educx__Year__c = :year
            AND educx__Subject__c = :selectedSubject.Id
            AND educx__Employees__c = :empDetail.Id
        ];
        
        for (educx__Attendance__c att : existingAttendances) {
            existingAttendanceMap.put(att.educx__Student_Id__c, att);
        }
        for (educx__Student__c student : stddata) {
            educx__Attendance__c existingAttendance = existingAttendanceMap.get(student.Id);
            system.debug('existingAttendance 134 :: '+existingAttendance);
            if (existingAttendance == null) {
                // Create new attendance record
                educx__Attendance__c newAttendance = new educx__Attendance__c();
                newAttendance.educx__Course__c = course;
                newAttendance.educx__Semester__c = semester;
                newAttendance.educx__Year__c = year;
                newAttendance.educx__Student_Id__c = student.Id;
                newAttendance.educx__Subject__c = selectedSubject.Id;
                newAttendance.educx__Employees__c = empDetail.Id;
                
                newAttendanceRecords.add(newAttendance);
            } else {
                attendanceIds.add(existingAttendance.Id);
            }
        }
        
        if (!newAttendanceRecords.isEmpty()) {
            system.debug('newAttendanceRecords 149 :: '+newAttendanceRecords);
            insert newAttendanceRecords;
            for (educx__Attendance__c newAttendance : newAttendanceRecords) {
                studentAttMap.put(newAttendance.Id,newAttendance.educx__Student_Id__c);
                attendanceIds.add(newAttendance.Id);
            }
        }
        
        // Proceed to create or update AttendanceDetails records for the specific subject
        // Query existing AttendanceDetails records for the current month and year
        List<educx__AttendanceDetails__c> existingAttendanceDetails = [
            SELECT Id, educx__Attendance__c, educx__Months__c, educx__Date_Year__c,educx__Student__c, educx__Day_1__c, educx__Day_2__c, educx__Day_3__c, educx__Day_4__c,
                       educx__Day_5__c, educx__Day_6__c, educx__Day_7__c, educx__Day_8__c, educx__Day_9__c, educx__Day_10__c, educx__Day_11__c, educx__Day_12__c,
                       educx__Day_13__c, educx__Day_14__c, educx__Day_15__c, educx__Day_16__c, educx__Day_17__c, educx__Day_18__c, educx__Day_19__c, educx__Day_20__c,
                       educx__Day_21__c, educx__Day_22__c, educx__Day_23__c, educx__Day_24__c, educx__Day_25__c, educx__Day_26__c, educx__Day_27__c, educx__Day_28__c,
                       educx__Day_29__c, educx__Day_30__c, educx__Day_31__c
            FROM educx__AttendanceDetails__c 
            WHERE educx__Attendance__c IN :attendanceIds AND educx__Months__c = :currentMonthName AND educx__Date_Year__c = :currentYear
        ];
        system.debug('existingAttendanceDetails 160 :: '+existingAttendanceDetails);
        Map<Id, educx__AttendanceDetails__c> attendanceDetailsMap = new Map<Id, educx__AttendanceDetails__c>();
        for (educx__AttendanceDetails__c detail : existingAttendanceDetails) {
            attendanceDetailsMap.put(detail.educx__Attendance__c, detail);
        }
        
        List<educx__AttendanceDetails__c> attendanceDetailsToUpsert = new List<educx__AttendanceDetails__c>();
        for (Id attendance : attendanceIds) {
            educx__AttendanceDetails__c attendanceDetail = attendanceDetailsMap.get(attendance);
            system.debug('attendanceDetai 169 :: '+attendanceDetail);
             system.debug('studentAttMap.get(attendance) :: '+studentAttMap.get(attendance));
            if (attendanceDetail == null) {
                attendanceDetail = new educx__AttendanceDetails__c();
                attendanceDetail.educx__Attendance__c = attendance;
                attendanceDetail.educx__Months__c = currentMonthName;
                attendanceDetail.educx__Date_Year__c = currentYear; // Use String value here
                attendanceDetail.educx__Student__c = studentAttMap.get(attendance);
               
            }
            
            // Update the checkbox for the current day
            String dayField = 'educx__Day_' + todayDay + '__c';
            if (Schema.sObjectType.educx__AttendanceDetails__c.fields.getMap().containsKey(dayField)) {
                attendanceDetail.put(dayField, true);
            } else {
                System.debug('Invalid field: ' + dayField);
            }
            
            attendanceDetailsToUpsert.add(attendanceDetail);
            
        }
        
        if (!attendanceDetailsToUpsert.isEmpty()) {
            System.debug('Attendance details to upsert 189 :: ' + attendanceDetailsToUpsert);
            upsert attendanceDetailsToUpsert;
        }
        handleAttendanceCount(course,semester,subject,employeeCode);
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValuesYear(String sObjectName, String fieldName) {
        System.debug('sObjectName : '+sObjectName +' fieldName : '+fieldName);
        List<String> picklistValues = new List<String>();
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(sObjectName);
        if (sObjectType != null) {
            Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
            Schema.DescribeFieldResult fieldDescribe = sObjectDescribe.fields.getMap().get(fieldName).getDescribe();
            for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                picklistValues.add(entry.getLabel());
            }
        }
        System.debug('picklistValues : '+picklistValues);
        return picklistValues;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValuesSemester(String sObjectName, String fieldName) {
        System.debug('sObjectName : '+sObjectName +' fieldName : '+fieldName);
        List<String> picklistValues = new List<String>(); 
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(sObjectName);
        if (sObjectType != null) {
            Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
            Schema.DescribeFieldResult fieldDescribe = sObjectDescribe.fields.getMap().get(fieldName).getDescribe();
            for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                picklistValues.add(entry.getLabel());
            }
        }
        System.debug('picklistValues : '+picklistValues);
        return picklistValues;
    }
    
    private static void  handleAttendanceCount(String course,String semester,String subject,String employeeCode){
        
        List<educx__Faculty_Subjects__c> facultySubjectsToUpdate = new List<educx__Faculty_Subjects__c>();
        
        List<educx__Faculty_Subjects__c> facultySubject = [SELECT Id, educx__Total_Classes_Conducted__c, educx__Course__c, educx__Employee__r.Name, educx__Subject__c, educx__Semester__c, educx__Year__c 
                                                           FROM educx__Faculty_Subjects__c
                                                           WHERE educx__Course__c = :course 
                                                           AND educx__Semester__c = :semester
                                                           AND educx__Employee__r.Name = :employeeCode 
                                                           AND educx__Subject__r.educx__Subject_Name__c = :subject];
        for(educx__Faculty_Subjects__c fs :facultySubject)
        {
            fs.educx__Total_Classes_Conducted__c+=1;
            facultySubjectsToUpdate.add(fs);
        }
        update facultySubjectsToUpdate;
    }
}