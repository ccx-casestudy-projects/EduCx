@isTest
global class CourseControllerTest {

    @testVisible private static educx__Course__c course1;
    @testVisible private static educx__Course__c course2;
    @testVisible private static educx__Subject__c subject1;
    @testVisible private static educx__Subject__c subject2;
    @testVisible private static educx__Course_Subject__c courseSubject1;
    @testVisible private static educx__Course_Subject__c courseSubject2;
    @testVisible private static String searchKey;
    @testVisible private static Id courseId;
    @testVisible private static Id subjectId;

    @testSetup
    private static void setup() {

    course1 = new educx__Course__c(Name = 'Code 1',educx__Course__c='B.Com',educx__Course_Name__c = 'General' ,educx__Course_Level__c = 'UG' ,educx__Medium__c = 'English',educx__Course_Duration__c = '1 Year');
    course2 = new educx__Course__c(Name = 'Code 2',educx__Course__c='B.A.',educx__Course_Name__c = 'Economics/Pol.Science/History' ,educx__Course_Level__c = 'UG' ,educx__Medium__c = 'Telugu',educx__Course_Duration__c = '2 Years');
    insert new List<educx__Course__c>{course1, course2};
    course1=[select Name, educx__Course__c, educx__Course_Name__c, educx__Course_Level__c, educx__Medium__c, educx__Course_Duration__c 
                    FROM educx__Course__c WHERE id=:course1.id ];
    course2=[select Name, educx__Course__c, educx__Course_Name__c, educx__Course_Level__c, educx__Medium__c, educx__Course_Duration__c 
                    FROM educx__Course__c WHERE id=:course2.id ];
        
    subject1 = new educx__Subject__c(Name = 'Sub Code1',educx__Subject_Name__c = 'Subject Name1');
    subject2 = new educx__Subject__c(Name = 'Sub Code2',educx__Subject_Name__c = 'Subject Name2');
    insert new List<educx__Subject__c>{subject1, subject2};
    subject1=[select Name , educx__Subject_Name__c from educx__Subject__c
              WHERE id=:subject1.id];  
    subject2=[select Name , educx__Subject_Name__c from educx__Subject__c
              WHERE id=:subject2.id];
        
    courseSubject1 = new educx__Course_Subject__c(educx__Course__c = course1.Id, educx__Subject__c = subject1.Id, educx__Year__c = '1st Year', educx__Semester__c = 'I');
    courseSubject2 = new educx__Course_Subject__c(educx__Course__c = course1.Id, educx__Subject__c = subject2.Id, educx__Year__c = '2nd Year', educx__Semester__c = 'II');
    insert new List<educx__Course_Subject__c>{courseSubject1, courseSubject2};
        
    searchKey = 'Code';
    }

    @isTest
    static void testGetAllCoursesWithKey() {
        setup();
        Test.startTest();
        List<educx__Course__c> result = CourseController.getAllCourses(searchKey);
        Test.stopTest();
        System.assertNotEquals(0, result.size(), 'Courses should be returned');
    }
    
     @isTest
    static void testGetAllCoursesWithoutKey() {
        setup();
        Test.startTest();
        List<educx__Course__c> result = CourseController.getAllCourses(null);
        Test.stopTest();
        System.assertNotEquals(0, result.size(), 'Courses should not be returned');
    }
    
    @isTest
    static void testGetSubjectsByCourseWithId() {
        setup();
        Test.startTest();
        List<educx__Course_Subject__c> result = CourseController.getSubjectsByCourse(course1.id);
        Test.stopTest();
        System.assertNotEquals(0, result.size(), 'Subjects should be returned');
    }
    
    @isTest
    static void testGetSubjectsByCourseWithoutId() {
    setup();
    try {
            Test.startTest();
            List<educx__Course_Subject__c> result = CourseController.getSubjectsByCourse(null);
            Test.stopTest();
            System.assert(false, 'An exception should have been thrown for passing null values');
        } catch (AuraHandledException e) {
            //System.assertEquals('Fields cannot be null or empty', e.getMessage(), 'Exception message mismatch');
        }
    }
    
    @isTest
    static void testCreateCourseSubjectsWithId() {
        setup();
        List<Id> courseIds = new List<Id>{course1.id,course2.id};

        Test.startTest();
       CourseController.createCourseSubjects(courseIds, subject1.id, courseSubject1.educx__Year__c , courseSubject1.educx__Semester__c);
        Test.stopTest();
        
    }
    
   @isTest
   static void testCreateCourseSubjectsWithNull() {
    setup();
    try {
        Test.startTest();
        CourseController.createCourseSubjects(null, null, null, null);
        Test.stopTest();
        System.assert(false, 'An exception should have been thrown for passing null values');
    } catch (AuraHandledException e) {
        //System.assertEquals('Fields cannot be null or empty', e.getMessage(), 'Exception message mismatch');
    }
    }
}