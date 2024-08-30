@IsTest
public class SubjectControllerTest {
    
    @testVisible private static educx__Course__c course1;
    @testVisible private static educx__Course__c course2;
    @testVisible private static educx__Subject__c subject1;
    @testVisible private static educx__Subject__c subject2;
    @testVisible private static educx__Course_Subject__c courseSubject1;
    @testVisible private static educx__Course_Subject__c courseSubject2;
    @testVisible private static String searchKey;
    @testVisible private static Id courseId;
    @testVisible private static Id subjectId;
    
    private static void setup() {
        // Create test Course
        course1 = new educx__Course__c(Name = 'Code 2',educx__Course__c='B.A.',educx__Course_Name__c = 'Economics/Pol.Science/History' ,educx__Course_Level__c = 'UG' ,educx__Medium__c = 'Telugu',educx__Course_Duration__c = '2 Years');
        insert course1;
        course1=[select Name, educx__Course__c, educx__Course_Name__c, educx__Course_Level__c, educx__Medium__c, educx__Course_Duration__c 
                    FROM educx__Course__c WHERE id=:course1.id ];
         
        // Create test Subjects
        subject1 = new educx__Subject__c(Name = 'Math101', educx__Subject_Name__c = 'Mathematics', educx__Has_Elective__c = false);
        subject2 = new educx__Subject__c(Name = 'Phys102', educx__Subject_Name__c = 'Physics', educx__Has_Elective__c = true);
        insert new List<educx__Subject__c> {subject1, subject2};
        subject1=[select Name , educx__Subject_Name__c,educx__Has_Elective__c from educx__Subject__c
              WHERE id=:subject1.id];  
        subject2=[select Name , educx__Subject_Name__c,educx__Has_Elective__c from educx__Subject__c
              WHERE id=:subject2.id];  
        
        courseSubject1 = new educx__Course_Subject__c(educx__Course__c = course1.Id, educx__Subject__c = subject1.Id, educx__Year__c = '1st Year', educx__Semester__c = 'I');
        courseSubject2 = new educx__Course_Subject__c(educx__Course__c = course1.Id, educx__Subject__c = subject2.Id, educx__Year__c = '2nd Year', educx__Semester__c = 'II');
        insert new List<educx__Course_Subject__c>{courseSubject1, courseSubject2};
       
        searchKey='Math';
    }

    @IsTest
    static void testGetSubjectsWithSearchKey() {
        setup();
        Test.startTest();
        List<educx__Subject__c> result = SubjectController.getSubjects(searchKey);
        Test.stopTest();
        System.assertNotEquals(0, result.size(), 'Subjects should be returned');
    }

    @IsTest
    static void testGetSubjectsWithoutSearchKey() {
        setup();

        Test.startTest();
        List<educx__Subject__c> results = SubjectController.getSubjects(null);
        Test.stopTest();

        System.assertEquals(2, results.size(), 'Expected to find 2 subjects');
    }

    @IsTest
    static void testCreateCourseSubjectsWithValidData() {
        setup();
        List<Id> subjectIds = new List<Id>{subject1.id,subject2.id};
        
        // Test the method with valid data
        Test.startTest();
        SubjectController.createCourseSubjects(subjectIds,course1.id,courseSubject1.educx__Year__c , courseSubject1.educx__Semester__c);
        Test.stopTest();
    }

    @IsTest
    static void testCreateCourseSubjectsWithNullValues() {
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