public class demo {
    public class BookIssueandReturnsWrapper {
        @AuraEnabled public String Name;
        @AuraEnabled public String BookId;
        @AuraEnabled public String BookName;
        @AuraEnabled public String BookStatus;
        @AuraEnabled public String BookStatusinreturns;
        @AuraEnabled public String Candidate;
        @AuraEnabled public Date DateofIssue;
        @AuraEnabled public Date DateofReturn;
        @AuraEnabled public Date DueDate;
        @AuraEnabled public String EmployeeName;
        @AuraEnabled public String IssuedBy;
        @AuraEnabled public Decimal OverDueBy;
        @AuraEnabled public String StudentName;
        @AuraEnabled public String Id;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<BookIssueandReturnsWrapper> allBorrowedBooks(String recordId, String candidateType) {
        List<BookIssueandReturnsWrapper> data = new List<BookIssueandReturnsWrapper>();
        
        String query = 'SELECT Id, Name, educx__Book_Id__r.Name, educx__Book_Id__r.educx__Title_of_the_book__c, educx__Book_Id__r.educx__Status__c, educx__Candidate__c, '
                    + 'educx__Date_of_Issue__c, educx__Date_of_Return__c, educx__Book_Status__c, educx__Due_Date__c, educx__Employee_Id__r.educx__Employee_Name__c, '
                    + 'educx__Issued_By__r.educx__Employee_Name__c, educx__OverDue_By__c, educx__Student_Id__r.educx__Name_of_The_Candidate__c '
                    + 'FROM educx__Book_Issue_and_Returns__c WHERE ';
                    
        if (candidateType == 'student') {
            query += 'educx__Student_Id__r.educx__Hall_Ticket_No__c = :recordId AND educx__Book_Id__r.educx__Status__c != \'In Stock\' AND educx__Book_Status__c != \'Returned\'';
        } else if (candidateType == 'employee') {
            query += 'educx__Employee_Id__c = :recordId AND educx__Book_Id__r.educx__Status__c != \'In Stock\' AND educx__Book_Status__c != \'Returned\'';
        }
        
        List<educx__Book_Issue_and_Returns__c> borrowedBooksDetails = Database.query(query);
        
        for (educx__Book_Issue_and_Returns__c borrowedBooksDetail : borrowedBooksDetails) {
            BookIssueandReturnsWrapper wrapper = new BookIssueandReturnsWrapper();
            wrapper.Name = borrowedBooksDetail.Name;
            wrapper.BookId = borrowedBooksDetail.educx__Book_Id__r.Name;
            wrapper.BookName = borrowedBooksDetail.educx__Book_Id__r.educx__Title_of_the_book__c;
            wrapper.BookStatusinreturns = borrowedBooksDetail.educx__Book_Status__c;
            wrapper.BookStatus = borrowedBooksDetail.educx__Book_Id__r.educx__Status__c;
            wrapper.Candidate = borrowedBooksDetail.educx__Candidate__c;
            wrapper.DateofIssue = borrowedBooksDetail.educx__Date_of_Issue__c;
            wrapper.DateofReturn = borrowedBooksDetail.educx__Date_of_Return__c;
            wrapper.DueDate = borrowedBooksDetail.educx__Due_Date__c;
            wrapper.EmployeeName = borrowedBooksDetail.educx__Employee_Id__r.educx__Employee_Name__c;
            wrapper.IssuedBy = borrowedBooksDetail.educx__Issued_By__r.educx__Employee_Name__c;
            wrapper.OverDueBy = borrowedBooksDetail.educx__OverDue_By__c;
            wrapper.StudentName = borrowedBooksDetail.educx__Student_Id__r.educx__Name_of_The_Candidate__c;
            wrapper.Id = borrowedBooksDetail.Id;
            
            if (borrowedBooksDetail.educx__OverDue_By__c > 0) {
                wrapper.BookStatus = 'Not Returned';
            }
    
            data.add(wrapper);
        }
        return data;
    }
}