public class FacultySubjectController {
    public static void validateUniqueAssignments(List<educx__Faculty_Subjects__c> facultySubjects) {
        Set<String> newAssignments = new Set<String>();

        // check for duplicates within the list of new or updated records
        for (educx__Faculty_Subjects__c fs : facultySubjects) {
            if (fs.educx__Subject__c != null && fs.educx__Employee__c != null && fs.educx__Academic_Year__c != null &&
                fs.educx__Course__c != null && fs.educx__Semester__c != null && fs.educx__Year__c != null) 
            {
                String key = fs.educx__Employee__c + '-' + fs.educx__Subject__c + '-' + fs.educx__Academic_Year__c +
                             '-' + fs.educx__Course__c + '-' + fs.educx__Semester__c + '-' + fs.educx__Year__c;
                //System.debug('key for new record' + key);
                if (!newAssignments.add(key)) {
                    fs.addError('This subject has already been assigned to this employee in the same academic year.');
                }
            }
        }

        // Query existing records to find duplicates in the database
        Set<Id> employeeIds = new Set<Id>();
        Set<Id> subjectIds = new Set<Id>();
        Set<String> academicYears = new Set<String>();
        Set<Id> courseIds = new Set<Id>();
        Set<String> semesters = new Set<String>();
        Set<String> years = new Set<String>();

        
        //checking for duplicates within the current list of records
        for (educx__Faculty_Subjects__c fs : facultySubjects) {
            if (fs.educx__Employee__c != null) employeeIds.add(fs.educx__Employee__c);
            if (fs.educx__Subject__c != null) subjectIds.add(fs.educx__Subject__c);
            if (fs.educx__Academic_Year__c != null) academicYears.add(fs.educx__Academic_Year__c);
            if (fs.educx__Course__c != null) courseIds.add(fs.educx__Course__c);
            if (fs.educx__Semester__c != null) semesters.add(fs.educx__Semester__c);
            if (fs.educx__Year__c != null) years.add(fs.educx__Year__c);
        }
        
        //System.debug('Employee IDs: ' + employeeIds);
        //System.debug('Subject IDs: ' + subjectIds);
        //System.debug('Academic Years: ' + academicYears);
        //System.debug('Course IDs: ' + courseIds);
        //System.debug('Semesters: ' + semesters);
        //System.debug('Years: ' + years);

        if (!employeeIds.isEmpty() && !subjectIds.isEmpty() && !academicYears.isEmpty() &&
            !courseIds.isEmpty() && !semesters.isEmpty() && !years.isEmpty()) {

            List<educx__Faculty_Subjects__c> existingRecords = [
                SELECT educx__Employee__c, educx__Subject__c, educx__Academic_Year__c, educx__Course__c, educx__Semester__c, educx__Year__c
                FROM educx__Faculty_Subjects__c
                WHERE educx__Employee__c IN :employeeIds
                AND educx__Subject__c IN :subjectIds
                AND educx__Academic_Year__c IN :academicYears
                AND educx__Course__c IN :courseIds
                AND educx__Semester__c IN :semesters
                AND educx__Year__c IN :years
            ];

            // Generate keys for existing records and check for duplicates
            Set<String> existingAssignments = new Set<String>();
            for (educx__Faculty_Subjects__c existing : existingRecords) {
                String key = existing.educx__Employee__c + '-' + existing.educx__Subject__c + '-' + existing.educx__Academic_Year__c +
                             '-' + existing.educx__Course__c + '-' + existing.educx__Semester__c + '-' + existing.educx__Year__c;
                             
                existingAssignments.add(key);
            }

            // Check for duplicates in new records based on existing records
            for (educx__Faculty_Subjects__c fs : facultySubjects) {
                String key = fs.educx__Employee__c + '-' + fs.educx__Subject__c + '-' + fs.educx__Academic_Year__c +
                             '-' + fs.educx__Course__c + '-' + fs.educx__Semester__c + '-' + fs.educx__Year__c;
                             
                if (existingAssignments.contains(key)) {
                    fs.addError('This subject has already been assigned to this employee in the same academic year, course, semester, and year.');
                }
            }
        }
    }
}