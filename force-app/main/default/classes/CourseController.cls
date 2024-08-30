public class CourseController {
    
    @AuraEnabled(cacheable=true)
    public static List<educx__Course__c> getAllCourses() {
        List<educx__Course__c> courses = new List<educx__Course__c>();
       
        try {
                courses = [
                    SELECT Name, educx__Course__c, educx__Course_Name__c , educx__Course_Level__c, educx__Medium__c, educx__Course_Duration__c,educx__Sanctioned_Intake__c
                    FROM educx__Course__c 
                    ORDER BY CreatedDate DESC
                ];
            
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving courses: ' + e.getMessage());
        }
        
        return courses;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<educx__Course_Subject__c> getSubjectsByCourse(Id courseId) {
        if (courseId == null) {
            throw new AuraHandledException('Course ID cannot be null');
        }
        
        List<educx__Course_Subject__c> courseSubjects = new List<educx__Course_Subject__c>();
        
        try {
            courseSubjects = [
                SELECT Id, educx__Subject__r.Name, educx__Subject__r.educx__Subject_Name__c,
                educx__Course__r.educx__Course_Name__c, educx__Year__c, educx__Semester__c
                FROM educx__Course_Subject__c
                WHERE educx__Course__r.Id = :courseId 
                ORDER BY educx__Year__c ASC, educx__Semester__c ASC
            ];
            
            for (educx__Course_Subject__c e : courseSubjects) {
                System.debug('subject: ' + e.educx__Subject__r.Name);
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving course subjects: ' + e.getMessage());
        }
        
        return courseSubjects;
    }
    
    @AuraEnabled
    public static void createCourseSubjects(List<Id> courseIds, Id subjectId, String year, String semester) {
        if ((courseIds == null || courseIds.isEmpty()) || subjectId == null || String.isBlank(year) || String.isBlank(semester)) {
            throw new AuraHandledException('Fields cannot be null or empty');
        }

        List<educx__Course_Subject__c> courseSubjects = new List<educx__Course_Subject__c>();
        
        try {
            for (Id courseId : courseIds) {
                educx__Course_Subject__c cs = new educx__Course_Subject__c(
                    educx__Course__c = courseId,
                    educx__Subject__c = subjectId,
                    educx__Year__c = year,
                    educx__Semester__c = semester
                );
                courseSubjects.add(cs);
            }
            
            if (!courseSubjects.isEmpty()) {
                insert courseSubjects;
            }
        } catch (DmlException e) {
            throw new AuraHandledException('Error creating course subjects: ' + e.getMessage());
        }
    }
    
}