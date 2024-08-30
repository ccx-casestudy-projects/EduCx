@isTest
public class StudentAttendanceControllerTest {
    
    @testSetup
    static void setup() {
        // Create a course
        educx__Course__c course = new educx__Course__c(educx__Course_Name__c = 'Computer Science');
        insert course;

        // Create a subject
        educx__Subject__c subject = new educx__Subject__c(educx__Subject_Name__c = 'Mathematics');
        insert subject;

        // Create an employee
        educx__Employees__c employee = new educx__Employees__c(educx__Employee_Name__c = 'John Doe');
        insert employee;

        // Create a student
        educx__Student__c student = new educx__Student__c(
            educx__Name_of_The_Candidate__c = 'Jane Doe',
            educx__Hall_Ticket_No__c = 'HT123456',
            educx__Course_Code__c = course.Id,
            educx__Year__c = '2024',
            educx__Semester__c = 'Fall'
        );
        insert student;

        // Create a Faculty Subject record
        educx__Faculty_Subjects__c facultySubject = new educx__Faculty_Subjects__c(
            educx__Employee__c = employee.Id,
            educx__Course__c = course.Id,
            educx__Subject__c = subject.Id,
            educx__Year__c = '2024',
            educx__Semester__c = 'Fall'
        );
        insert facultySubject;
    }
    
    @isTest
    static void testGetStudents() {
        educx__Course__c course = [SELECT Id FROM educx__Course__c LIMIT 1];
        
        List<StudentAttendanceController.StudentAttendanceWrapper> students = 
            StudentAttendanceController.getStudents(course.Id, '2024', 'Fall');
        
        System.assertEquals(1, students.size(), 'There should be one student retrieved');
        System.assertEquals('Jane Doe', students[0].studentName, 'Student name should match');
    }
    
    @isTest
    static void testGetCourseYearSemester() {
        educx__Course__c course = [SELECT Id FROM educx__Course__c LIMIT 1];
        educx__Employees__c employee = [SELECT Name FROM educx__Employees__c LIMIT 1];
        
        List<String> subjects = 
            StudentAttendanceController.getCourseYearSemester(course.Id, '2024', 'Fall', employee.Name);
        
        System.assertEquals(1, subjects.size(), 'There should be one subject retrieved');
        System.assertEquals('Mathematics', subjects[0], 'Subject name should match');
    }
    
    @isTest
    static void testCreateAttendanceDetails() {
        educx__Course__c course = [SELECT Id FROM educx__Course__c LIMIT 1];
        educx__Subject__c subject = [SELECT educx__Subject_Name__c FROM educx__Subject__c LIMIT 1];
        educx__Employees__c employee = [SELECT Name FROM educx__Employees__c LIMIT 1];
        educx__Student__c student = [SELECT Id FROM educx__Student__c LIMIT 1];
        
        List<String> studentIds = new List<String>{student.Id};
        
        Test.startTest();
        StudentAttendanceController.createAttendanceDetails(
            studentIds, 
            course.Id, 
            'Fall', 
            '2024', 
            subject.educx__Subject_Name__c, 
            employee.Name
        );
        Test.stopTest();
        
        // Assert that attendance record was created
        List<educx__Attendance__c> attendances = [
            SELECT Id, educx__Course__c, educx__Semester__c, educx__Year__c, educx__Subject__c, educx__Student_Id__c
            FROM educx__Attendance__c
            WHERE educx__Student_Id__c = :student.Id
        ];
        System.assertEquals(1, attendances.size(), 'There should be one attendance record created');
        
        // Assert that attendance detail was created
        List<educx__AttendanceDetails__c> attendanceDetails = [
            SELECT Id, educx__Attendance__c, educx__Months__c, educx__Date_Year__c
            FROM educx__AttendanceDetails__c
            WHERE educx__Attendance__c = :attendances[0].Id
        ];
        System.assertEquals(1, attendanceDetails.size(), 'There should be one attendance detail record created');
        System.assertEquals(Date.today().year(), Integer.valueOf(attendanceDetails[0].educx__Date_Year__c), 'Attendance detail year should match current year');
    }
    
    @isTest
    static void testGetPicklistValuesYear() {
        List<String> years = StudentAttendanceController.getPicklistValuesYear('educx__Student__c', 'educx__Year__c');
        System.assertNotEquals(0, years.size(), 'Picklist values for Year should not be empty');
    }
    
    @isTest
    static void testGetPicklistValuesSemester() {
        List<String> semesters = StudentAttendanceController.getPicklistValuesSemester('educx__Student__c', 'educx__Semester__c');
        System.assertNotEquals(0, semesters.size(), 'Picklist values for Semester should not be empty');
    }
    
    @isTest
    static void testHandleAttendanceCount() {
        educx__Course__c course = [SELECT Id FROM educx__Course__c LIMIT 1];
        educx__Subject__c subject = [SELECT educx__Subject_Name__c FROM educx__Subject__c LIMIT 1];
        educx__Employees__c employee = [SELECT Name FROM educx__Employees__c LIMIT 1];
        
        Test.startTest();
        StudentAttendanceController.createAttendanceDetails(
            new List<String>(), 
            course.Id, 
            'Fall', 
            '2024', 
            subject.educx__Subject_Name__c, 
            employee.Name
        );
        Test.stopTest();
        
        // Verify that the Total Classes Conducted count increased
        educx__Faculty_Subjects__c facultySubject = [
            SELECT educx__Total_Classes_Conducted__c 
            FROM educx__Faculty_Subjects__c 
            WHERE educx__Course__c = :course.Id 
            AND educx__Subject__r.educx__Subject_Name__c = :subject.educx__Subject_Name__c 
            AND educx__Employee__r.Name = :employee.Name
        ];
        System.assertEquals(1, facultySubject.educx__Total_Classes_Conducted__c, 'Total Classes Conducted should be incremented by 1');
    }
}