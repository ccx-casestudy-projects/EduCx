public class StudentController {
    //student record creation from registration form
    @AuraEnabled 
    public static String insertStudentData(String studentData){
		Map<String,Object> params=(Map<String,Object>) JSON.deserializeUntyped(studentData);
		System.debug(params);
		Set<String> DecimalFields = new Set<String>{};
        Set<String> integerFields = new Set<String>{'educx__Parent_Income__c','educx__Agreement_Fee__c'};
        Set<String> dateFields = new Set<String>{'educx__Joining_Date__c','educx__Date_of_Birth__c'};
        Set<String> BooleanFields = new Set<String>{'educx__IsFirstYear__c','educx__Is_RTF__c'};
        educx__Student__c Stud = new educx__Student__c();
         for(String s:params.KeySet()){
             Object value = params.get(s);
             if(integerFields.contains(s)){
                Stud.put(s,Integer.valueOf(value));
             }
             else if(BooleanFields.contains(s)){
               Stud.put(s, Boolean.valueOf(String.valueOf(value)));
             }
             else if(DecimalFields.contains(s)){
               // Decimal d=(Decimal)Integer.valueOf(value);
               Stud.put(s, Decimal.valueOf(String.valueOf(value)));
             }
             else if(dateFields.contains(s)){
                 Date dateValue= Date.valueOf(String.valueOf(value));
                 Stud.put(s,dateValue);
             }
             else{
                    Stud.put(s,value);
             }
             
         }
         insert Stud;
         System.debug('Stud=>'+Stud);
         return Stud.Id;

    }
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getExistingAttachments(String StdId) {
        System.debug('StdId: ' + StdId);
        Map<String, String> attachmentsMap = new Map<String, String>();
    
        // Query for all ContentDocumentLinks related to the student record
        List<ContentDocumentLink> contentDocumentLinks = [
            SELECT ContentDocumentId, ContentDocument.Title 
            FROM ContentDocumentLink 
            WHERE LinkedEntityId = :StdId
        ];
    
        System.debug('contentDocumentLinks: ' + contentDocumentLinks);
    
        // Iterate over the ContentDocumentLink records to get the ContentDocument Ids and Titles
        for (ContentDocumentLink cdl : contentDocumentLinks) {
            attachmentsMap.put(cdl.ContentDocument.Title, cdl.ContentDocumentId);
        }
    
        System.debug('attachmentsMap: ' + attachmentsMap);
    
        return attachmentsMap;
    }

    @AuraEnabled
    public static String getContentDocumentId(String contentVersionId) {
        // Query to get the ContentDocumentId using the ContentVersionId
        System.debug('ContentVersionId'+ContentVersionId);
        ContentVersion contentVersion = [
            SELECT ContentDocumentId 
            FROM ContentVersion 
            WHERE Id = :contentVersionId
            LIMIT 1
        ];
        System.debug('ContentDocumentId'+contentVersion.ContentDocumentId);

        return contentVersion.ContentDocumentId;
    }
    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> getContentDocumentLinks(String contentDocumentId) {
        // Query to get all ContentDocumentLink records associated with the ContentDocumentId
        return [
            SELECT Id, LinkedEntityId, ContentDocumentId
            FROM ContentDocumentLink
            WHERE ContentDocumentId = :contentDocumentId
        ];
    }

	//Promoting student to next year/next sem
     @AuraEnabled
    public static void promoteStudents(List<Id> selectedStudents) {
        try {
            System.debug('Selected Students: ' + selectedStudents);
    
            List<educx__Student__c> studentsToUpdate = [SELECT Id, educx__Year__c, educx__Semester__c, educx__Status__c,
                                                        educx__Course_Code__r.educx__Course_Duration__c
                                                        FROM educx__Student__c WHERE Id IN :selectedStudents];
    
            System.debug('Students to Update: ' + studentsToUpdate);
    
            for (educx__Student__c student : studentsToUpdate) {
                System.debug('Processing Student: ' + student.Id + ' Year: ' + student.educx__Year__c + ' Semester: ' + student.educx__Semester__c);
            
                // Extract the first character of the course duration (e.g., "2 Years" -> 2)
                Integer courseDuration = Integer.valueOf(student.educx__Course_Code__r.educx__Course_Duration__c.substring(0, 1));
                Integer studentYear = Integer.valueOf(student.educx__Year__c.substring(0, 1));
                System.debug('Course Duration: ' + courseDuration + ' years');
                System.debug('Student Year: ' + studentYear);
    
                // Check if the student is in the final semester of the final year
                if (studentYear == courseDuration && student.educx__Semester__c == 'II') {
                    student.educx__Status__c = 'Passed Out';
                } else if (student.educx__Semester__c == 'I') {
                    // If the student is in the first semester, move them to the second semester
                    student.educx__Semester__c = 'II';
                } else if (student.educx__Semester__c == 'II') {
                    student.educx__Semester__c = 'I';
                    if (student.educx__Year__c == '1st Year') {
                        student.educx__Year__c = '2nd Year';
                    } else if (student.educx__Year__c == '2nd Year') {
                        student.educx__Year__c = '3rd Year';
                    } else if (student.educx__Year__c == '3rd Year') {
                        student.educx__Year__c = '4th Year';
                    }
                }
            }
            update studentsToUpdate;
            System.debug('Students Updated Successfully');
        } catch (Exception e) {
            System.debug('Error in promoteStudents: ' + e.getMessage());
            throw new AuraHandledException('Error promoting students: ' + e.getMessage());
        }
    }
    //get Student details wrt AY selection
    @AuraEnabled(cacheable=true)
    public static List<educx__Student__c> getStudentsByAcademicYear(String academicYear,String searchKey) {
    String key = '%' + searchKey + '%';

    List<educx__Academic_Year__c> AYs=[SELECT Id, Name,educx__Academic_year__c FROM educx__Academic_Year__c
            								where educx__Academic_year__c=:academicYear];
        if (academicYear == null || academicYear == 'None') {
            // Return all students if no specific academic year is selected
            return [
                SELECT Id,Name, educx__Name_of_The_Candidate__c, educx__Hall_Ticket_No__c, educx__Email__c, 
                       educx__Phone_Number__c,educx__Course_Code__c, 
                educx__Course__c, educx__Course_Name__c, educx__Year__c, educx__Semester__c,educx__Status__c
                FROM educx__Student__c 
                where educx__Status__c!='Passed Out'
            ];
        } else {
            // Return students filtered by the selected academic year
            return [
                SELECT Id,Name, educx__Name_of_The_Candidate__c, educx__Hall_Ticket_No__c, educx__Email__c, 
                       educx__Phone_Number__c,educx__Course_Code__c, 
                educx__Course__c, educx__Course_Name__c, educx__Year__c, educx__Semester__c,educx__Status__c
                FROM educx__Student__c
                WHERE Id IN (
                SELECT educx__Student__c 
                FROM educx__Academic_Year__c
                WHERE Id in :AYs) AND educx__Status__c!='Passed Out'
            
            ];
        }
    }
   	//retrieving student details acc to AY,Course,Yr,Sem filters
   	@AuraEnabled(cacheable=true)
	public static List<educx__Student__c> getStudentsByFilter(String academicYear,String courseCode,String course,String courseName,String year,String sem) {
     List<educx__Academic_Year__c> AYs=[SELECT Id, Name,educx__Academic_year__c FROM educx__Academic_Year__c
            								where educx__Academic_year__c=:academicYear];
        if (academicYear == null || academicYear == 'None') {
            // Return all students if no specific academic year is selected
            return [
                SELECT Id,Name, educx__Name_of_The_Candidate__c, educx__Hall_Ticket_No__c, educx__Course_Code__c, 
                educx__Course__c, educx__Course_Name__c, educx__Year__c, educx__Semester__c,educx__Status__c
                FROM educx__Student__c 
                where educx__Course_Code__c = :courseCode AND educx__Course__c =:course AND educx__Course_Name__c=:courseName
                AND educx__Year__c =:year AND educx__Semester__c=:sem AND educx__Status__c!='Passed Out'
            ];
        } else {
            // Return students filtered by the selected academic year
            return [
                SELECT Id,Name, educx__Name_of_The_Candidate__c, educx__Hall_Ticket_No__c, educx__Course_Code__c, 
                educx__Course__c, educx__Course_Name__c, educx__Year__c, educx__Semester__c,educx__Status__c
                FROM educx__Student__c
                WHERE Id IN (
                SELECT educx__Student__c 
                FROM educx__Academic_Year__c
                WHERE Id in :AYs) AND educx__Course_Code__c = :courseCode AND educx__Course__c =:course AND educx__Course_Name__c=:courseName
                AND educx__Year__c =:year AND educx__Semester__c=:sem AND educx__Status__c!='Passed Out'
            
            ];
        }
    }
  	//usage: DisplayStudentsInAY component ,for displaying student acc to AY picklist values
    @AuraEnabled(cacheable=true)
    public static List<String> getAcademicYearPicklistValues() {
        Integer currentYear = Date.today().year();
          //  Integer currentYear = 2026;
        
        // Get the picklist values for the Academic_Year__c field
        Schema.DescribeFieldResult fieldResult = educx__Academic_Year__c.educx__Academic_year__c.getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
        
        List<String> allValues = new List<String>();
        
        // Collect all values
        for (Schema.PicklistEntry entry : picklistEntries) {
            allValues.add(entry.getValue());
        }
        Map<Integer, String> yearMap = new Map<Integer, String>();
        
        for (String value : allValues) {
            String[] years = value.split('-');
            if (years.size() == 2) {
                Integer startYear = Integer.valueOf(years[0]);
                yearMap.put(startYear, value);
            }
        }
        
        // Filter years that are less than or equal to the current year
        List<Integer> filteredYears = new List<Integer>();
        for (Integer year : yearMap.keySet()) {
            if (year <= currentYear) {
                filteredYears.add(year);
            }
        }
        
        // Sort years in descending order
        filteredYears.sort();
        // Reverse 
        List<Integer> reversedYears = new List<Integer>();
        for (Integer i = filteredYears.size() - 1; i >= 0; i--) {
            reversedYears.add(filteredYears.get(i));
        }
        
        // get previous 10 years
        List<String> result = new List<String>();
        result.add('None');
        for (Integer year : reversedYears) {
                result.add(yearMap.get(year));
        }
        
        return result;
    }

    //usage: StudentDetailPreview ,for populating previous study details values in preview page
    @AuraEnabled(cacheable=true)
    public static List<educx__Previous_Study_Details__c> getPreviousStudyDetails(Id studentId) {
        System.debug('Fetching Previous Study Details for Student Id: ' + studentId);
        List<educx__Previous_Study_Details__c> studyDetails = [
            SELECT Id, educx__Student__c, educx__Course__c, educx__School_College__c, educx__Year_of_Passing__c, educx__Place__c
            FROM educx__Previous_Study_Details__c
            WHERE educx__Student__c = :studentId
        ];
        System.debug('Study Details Returned: ' + studyDetails);
        return studyDetails;
    }

    //usage: StudentRegistration ,for populating course details on coursecode selctn
    @AuraEnabled(cacheable=true)
    public static Course__c populateCourseDetails(Id courseId) {
        return [
            SELECT Id,educx__Course__c,educx__Course_Name__c
            FROM Course__c 
            WHERE Id=:courseId
            LIMIT 1
        ];
    }
    //Bulk Student Data Insertion
    @AuraEnabled
    public static void uploadCSVFile(String csvContent) {
        List<educx__Student__c> studentsToInsert = new List<educx__Student__c>();
        String[] lines = csvContent.split('\n');
        String[] fieldNames = new String[] { 
            'educx__Name_of_The_Candidate__c', 'educx__Hall_Ticket_No__c','educx__ICET_Rank__c',
            'educx__Admission_Type__c', 'educx__SSC_Registration_No__c', 'educx__Year__c',
            'educx__Semester__c', 'educx__Date_of_Birth__c', 'educx__Joining_Date__c',
            'educx__Parent_Income__c', 'educx__Agreement_Fee__c','educx__Phone_Number__c','educx__Email__c','educx__SSC_Year_of_Passing__c',
          'educx__ICET_Hall_Ticket_No__c','educx__Identification_Mark_1__c','educx__Identification_Mark_2__c',
                'educx__Course_Code__c','educx__Course__c','educx__Course_Name__c','educx__Aadhar_Number__c','educx__Father_Phone__c'
        };
    
        System.debug('Field Names: ' + fieldNames);
    
        for (Integer i = 1; i < lines.size(); i++) {
            String[] fields = lines[i].split(','); // Split using comma
            System.debug('Processing line: ' + i + ' Fields: ' + fields);
            if (fields.size() == fieldNames.size()) {
                educx__Student__c acc = new educx__Student__c();
                for (Integer j = 0; j < fieldNames.size(); j++) {
                    if (j < fields.size() && String.isNotBlank(fields[j])) {
                        String fieldName = fieldNames[j];
                        String fieldValue = fields[j].replace('"', '').trim();
                        
                        // Handle Date fields
                           if (fieldName.contains('educx__Date_of_Birth__c') || fieldName.contains('educx__Joining_Date__c')) {
                            try {
                                Date dateValue;
                                if (fieldValue.length() == 10 && fieldValue.contains('-')) {
                                    // Date is in dd-MM-yyyy format
                                    String[] dateParts = fieldValue.split('-');
                                    if (dateParts.size() == 3) {
                                        String formattedDate = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0]; // Convert to yyyy-MM-dd
                                        dateValue = Date.valueOf(formattedDate);
                                    } else {
                                        throw new IllegalArgumentException('Invalid date format');
                                    }
                                } else {
                                    dateValue = Date.valueOf(fieldValue); // Assuming the date is in yyyy-MM-dd format
                                }
                                acc.put(fieldName, dateValue);
                            } catch (Exception e) {
                                System.debug('Error parsing date for field ' + fieldName + ' with value ' + fieldValue + ': ' + e.getMessage());
                            }
                        } else if (fieldName.contains('Parent_Income__c') || fieldName.contains('Agreement_Fee__c')) {
                            try {
                                Decimal decimalValue = Decimal.valueOf(fieldValue);
                                acc.put(fieldName, decimalValue);
                            } catch (Exception e) {
                                System.debug('Error parsing decimal for field ' + fieldName + ' with value ' + fieldValue);
                            }
                        } else {
                            acc.put(fieldName, fieldValue);
                        }
                    }
                }
                studentsToInsert.add(acc);
            } else {
                System.debug('Mismatch at line ' + i + '. Expected ' + fieldNames.size() + ' fields, but got ' + fields.size());
            }
        }
        
        System.debug('Number of students to insert: ' + studentsToInsert.size());
        if (!studentsToInsert.isEmpty()) {
            insert studentsToInsert;
        }
    }
	@AuraEnabled(Cacheable=true)
    public static List<Course__c> getCourses(){
        return [
            SELECT Id,Name,educx__Course__c,educx__Course_Name__c
            FROM Course__c 
            ];
    }


    //Generate Hall Ticket No
   /* public static void AutoPopulateHallTktNo(List<educx__Student__c> newList) {
        List<educx__Student__c> students = [
            SELECT Id, educx__Course_Code__c, educx__Hall_Ticket_No__c, educx__Course_Code__r.Name
            FROM educx__Student__c
            WHERE Id IN :newList
        ];
        
        Integer currentYear = System.today().year();
        String currentYearStr = String.valueOf(currentYear).substring(2);
    
        // Map to store the maximum roll number for each course in the current year
        Map<String, Integer> courseToMaxRollMap = new Map<String, Integer>();
    
        // Query to get all relevant student records with Hall Ticket Numbers for the current year
        List<educx__Student__c> studentsWithHallTickets = [
            SELECT Id, educx__Course_Code__c, educx__Hall_Ticket_No__c, educx__Course_Code__r.Name
            FROM educx__Student__c
            WHERE educx__Hall_Ticket_No__c LIKE :('%' + currentYearStr + '%')
        ];
    
        // Extract and calculate the maximum roll numbers for each course in the current year
        for (educx__Student__c student : studentsWithHallTickets) {
            String courseId = student.educx__Course_Code__c;
            String hallTicketNo = student.educx__Hall_Ticket_No__c;
    
            // Extract the roll number from the hall ticket number
            Integer currentRollNo;
            try {
                String rollNoStr = hallTicketNo.substring(hallTicketNo.lastIndexOf('-') + 1);
                currentRollNo = Integer.valueOf(rollNoStr);
            } catch (Exception e) {
                continue; // Skip invalid hall ticket numbers
            }
    
            // Update the maximum roll number for the course
            if (!courseToMaxRollMap.containsKey(courseId) || courseToMaxRollMap.get(courseId) < currentRollNo) {
                courseToMaxRollMap.put(courseId, currentRollNo);
            }
        }
    
        // Loop through the new student records to assign hall ticket numbers
        for (educx__Student__c student : students) {
            String courseId = student.educx__Course_Code__c;
            Integer newRollNo = 1;
    
            // Check if the course already has a maximum roll number for the current year
            if (courseToMaxRollMap.containsKey(courseId)) {
                newRollNo = courseToMaxRollMap.get(courseId) + 1;
            }
    
            // Update the map with the new roll number
            courseToMaxRollMap.put(courseId, newRollNo);
    
            // Format the roll number to be three digits with leading zeros if it's less than 1000
            String formattedRollNo;
            if (newRollNo < 1000) {
                formattedRollNo = String.valueOf(newRollNo).leftPad(3, '0');
            } else {
                formattedRollNo = String.valueOf(newRollNo);
            }
    
            // Assign the hall ticket number
            student.educx__Hall_Ticket_No__c = '3124-' + currentYearStr + '-' + student.educx__Course_Code__r.Name + '-' + formattedRollNo;
        }
    
        // Update the student records
        update students;
    }*/
}