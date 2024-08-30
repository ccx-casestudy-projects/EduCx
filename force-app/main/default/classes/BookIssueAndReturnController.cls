public class BookIssueAndReturnController {

 @AuraEnabled(cacheable=true)
    public static List<BookIssueandReturnsWrapper> allBorrowedBooks() {
        List<BookIssueandReturnsWrapper> data = new List<BookIssueandReturnsWrapper>();
       
        for(educx__Book_Issue_and_Returns__c borrowedBooksDetails : [SELECT Id,Name, educx__Book_Id__r.educx__Title_of_the_book__c, educx__Candidate__c,
        educx__Date_of_Issue__c, educx__Date_of_Return__c, educx__Book_Id__r.educx__Status__c,
        educx__Due_Date__c, educx__Employee_Id__r.educx__Employee_Name__c,educx__Issued_By__r.educx__Employee_Name__c,
        educx__OverDue_By__c,educx__Student_Id__r.educx__Name_of_The_Candidate__c
        FROM educx__Book_Issue_and_Returns__c] ){
                                             
            BookIssueAndReturnsWrapper wrapper = new BookIssueAndReturnsWrapper();
            wrapper.Name = borrowedBooksDetails.Name;
            wrapper.BookName = borrowedBooksDetails.educx__Book_Id__r.educx__Title_of_the_book__c;
            wrapper.BookStatus = borrowedBooksDetails.educx__Book_Id__r.educx__Status__c;
            wrapper.Candidate = borrowedBooksDetails.educx__Candidate__c;
            wrapper.DateofIssue = borrowedBooksDetails.educx__Date_of_Issue__c;
            wrapper.DateofReturn = borrowedBooksDetails.educx__Date_of_Return__c;
            wrapper.DueDate = borrowedBooksDetails.educx__Due_Date__c;
            wrapper.EmployeeName = borrowedBooksDetails.educx__Employee_Id__r.educx__Employee_Name__c;
            wrapper.IssuedBy = borrowedBooksDetails.educx__Issued_By__r.educx__Employee_Name__c ;
            wrapper.OverDueBy = borrowedBooksDetails.educx__OverDue_By__c;
            wrapper.StudentName = borrowedBooksDetails.educx__Student_Id__r.educx__Name_of_The_Candidate__c ;
            wrapper.Id = borrowedBooksDetails.Id ;
                                             
            data.add(wrapper);
        }
        
        return data;
    }
    @AuraEnabled(cacheable=true)
    public static List<BookIssueandReturnsWrapper> allBorrowedBooksStuOrEmp(string candidateType) {
        List<BookIssueandReturnsWrapper> data = new List<BookIssueandReturnsWrapper>();
       
        for(educx__Book_Issue_and_Returns__c borrowedBooksDetails : [SELECT Id,Name, educx__Book_Id__r.educx__Title_of_the_book__c, educx__Candidate__c,
        educx__Date_of_Issue__c, educx__Date_of_Return__c, educx__Book_Id__r.educx__Status__c,
        educx__Due_Date__c, educx__Employee_Id__r.educx__Employee_Name__c,educx__Issued_By__r.educx__Employee_Name__c,
        educx__OverDue_By__c,educx__Student_Id__r.educx__Name_of_The_Candidate__c
        FROM educx__Book_Issue_and_Returns__c WHERE educx__Candidate__c=:candidateType ] ){
                                             
            BookIssueAndReturnsWrapper wrapper = new BookIssueAndReturnsWrapper();
            wrapper.Name = borrowedBooksDetails.Name;
            wrapper.BookName = borrowedBooksDetails.educx__Book_Id__r.educx__Title_of_the_book__c;
            wrapper.BookStatus = borrowedBooksDetails.educx__Book_Id__r.educx__Status__c;
            wrapper.Candidate = borrowedBooksDetails.educx__Candidate__c;
            wrapper.DateofIssue = borrowedBooksDetails.educx__Date_of_Issue__c;
            wrapper.DateofReturn = borrowedBooksDetails.educx__Date_of_Return__c;
            wrapper.DueDate = borrowedBooksDetails.educx__Due_Date__c;
            wrapper.EmployeeName = borrowedBooksDetails.educx__Employee_Id__r.educx__Employee_Name__c;
            wrapper.IssuedBy = borrowedBooksDetails.educx__Issued_By__r.educx__Employee_Name__c ;
            wrapper.OverDueBy = borrowedBooksDetails.educx__OverDue_By__c;
            wrapper.StudentName = borrowedBooksDetails.educx__Student_Id__r.educx__Name_of_The_Candidate__c ;
            wrapper.Id = borrowedBooksDetails.Id ;
                                             
            data.add(wrapper);
        }
        
        return data;
    }
    public class BookIssueandReturnsWrapper {
        @AuraEnabled public String Name;
        @AuraEnabled public String BookId;
        @AuraEnabled public String BookName;
        @AuraEnabled public String Hallticket;
        @AuraEnabled public String Empname;
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
    public static List<BookIssueandReturnsWrapper> allBorrowedBooksUser(String recordId, String candidateType) {
        List<BookIssueandReturnsWrapper> data = new List<BookIssueandReturnsWrapper>();
        
        String query = 'SELECT Id, Name, educx__Book_Id__r.Name, educx__Book_Id__r.educx__Title_of_the_book__c, educx__Book_Id__r.educx__Status__c, educx__Candidate__c, '
                    + 'educx__Date_of_Issue__c, educx__Date_of_Return__c, educx__Book_Status__c, educx__Due_Date__c, educx__Employee_Id__r.educx__Employee_Name__c, '
                    + 'educx__Issued_By__r.educx__Employee_Name__c,educx__Employee_Id__r.Name, educx__OverDue_By__c, educx__Student_Id__r.educx__Name_of_The_Candidate__c,educx__Student_Id__r.educx__Hall_Ticket_No__c '
                    + 'FROM educx__Book_Issue_and_Returns__c WHERE ';
                    
        if (candidateType == 'student') {
            query += 'educx__Student_Id__r.educx__Hall_Ticket_No__c = :recordId AND educx__Book_Id__r.educx__Status__c != \'In Stock\' AND educx__Book_Status__c != \'Returned\'';
        } else if (candidateType == 'employee') {
            query += 'educx__Employee_Id__r.Name = :recordId AND educx__Book_Id__r.educx__Status__c != \'In Stock\' AND educx__Book_Status__c != \'Returned\'';
        }
        
        List<educx__Book_Issue_and_Returns__c> borrowedBooksDetails = Database.query(query);
        
        for (educx__Book_Issue_and_Returns__c borrowedBooksDetail : borrowedBooksDetails) {
            BookIssueandReturnsWrapper wrapper = new BookIssueandReturnsWrapper();
            wrapper.Name = borrowedBooksDetail.Name;
            wrapper.BookId = borrowedBooksDetail.educx__Book_Id__r.Name;
            wrapper.Hallticket = borrowedBooksDetail.educx__Student_Id__r.educx__Hall_Ticket_No__c;
            wrapper.Empname = borrowedBooksDetail.educx__Employee_Id__r.Name;
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
           
    
            data.add(wrapper);
        }
        return data;
    }

    @AuraEnabled
    public static void issueBook(Id bookId, Id personId, String candidateType) {
        educx__Book_Issue_and_Returns__c newIssue = new educx__Book_Issue_and_Returns__c();
        newIssue.educx__Book_Id__c = bookId;
        newIssue.educx__Date_of_Issue__c = Date.today();
        newIssue.educx__Candidate__c = candidateType;
    
        if (candidateType == 'student') {
            newIssue.educx__Student_Id__c = personId;
        } else if (candidateType == 'employee') {
            newIssue.educx__Employee_Id__c = personId;
        } else {
            throw new AuraHandledException('Invalid candidate type.');
        }
        
        insert newIssue;
    
        // Update book status
        Book__c book = [SELECT Id, educx__Status__c FROM Book__c WHERE Id = :bookId LIMIT 1];
        if (book.Id != null && book.educx__Status__c == 'In Stock') {
            book.educx__Status__c = 'Issued';
            update book;
        }
    }

@AuraEnabled
    public static void returnBook(String bookId) {
        try {
            educx__Book_Issue_and_Returns__c bookRecord = [
                SELECT Id, educx__Book_Id__c, educx__Book_Id__r.Status__c, educx__Book_Status__c,educx__Date_of_Return__c
                FROM educx__Book_Issue_and_Returns__c
                WHERE Id = :bookId AND  (educx__Book_Id__r.Status__c='Issued' OR  educx__Book_Id__r.Status__c='Not Returned')
                LIMIT 1
            ];
            
            bookRecord.educx__Book_Id__r.Status__c = 'In Stock';
            bookRecord.educx__Date_of_Return__c = Date.today();
            bookRecord.educx__Book_Status__c='Returned';

            update bookRecord.educx__Book_Id__r;
            update bookRecord;
        } catch (Exception e) {
            throw new AuraHandledException('Failed to return the book: ' + e.getMessage());
        }
    }
   
}