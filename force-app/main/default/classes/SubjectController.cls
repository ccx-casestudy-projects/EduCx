public class SubjectController {
    @AuraEnabled(cacheable=true)
    public static List<educx__Subject__c> getSubjects() {
        List<educx__Subject__c> subjects = new List<educx__Subject__c>();
        try {
                subjects = [
                    SELECT Name, educx__Subject_Name__c,educx__Has_Elective__c
                    FROM educx__Subject__c
                    ORDER BY CreatedDate DESC
                ];
        
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving subjects: ' + e.getMessage());
        }
        
        return subjects;
    }
    
    @AuraEnabled
    public static void createCourseSubjects(List<Id> subjectIds, Id courseId, String year, String semester) {
    List<educx__Course_Subject__c> courseSubjects = new List<educx__Course_Subject__c>();

    try {
        if (subjectIds == null || subjectIds.isEmpty() || courseId == null || String.isBlank(year) || String.isBlank(semester)) {
            throw new AuraHandledException('Fields cannot be null or empty');
        } else {
            for (Id subjectId : subjectIds) {
                educx__Course_Subject__c cs = new educx__Course_Subject__c(
                    educx__Subject__c = subjectId,
                    educx__Course__c = courseId,
                    educx__Year__c = year,
                    educx__Semester__c = semester
                );
                courseSubjects.add(cs);
            }
            if (!courseSubjects.isEmpty()) {
                insert courseSubjects;
            }
        }
        } catch (DmlException e) {
        throw new AuraHandledException('Error creating course subjects: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static List<educx__Elective__c> getElectivesBySubjects(Id subjectId) {
        if (subjectId == null) {
            throw new AuraHandledException('Subjects Id cannot be null');
        }
        
        List<educx__Elective__c> electives = new List<educx__Elective__c>();
        
        try {
            electives = [
                SELECT Id, Name
                FROM educx__Elective__c
                WHERE educx__Subject__c = :subjectId 
            ];
            
            for (educx__Elective__c e : electives) {
                System.debug('elective ' + e.Name);
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving course subjects: ' + e.getMessage());
        }
        
        return electives;
    }
    
}