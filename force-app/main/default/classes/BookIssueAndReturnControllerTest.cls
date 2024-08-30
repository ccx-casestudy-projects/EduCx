@IsTest
public class BookIssueAndReturnControllerTest {

    @TestSetup
    static void setupTestData() {
         educx__Course__c Course = new educx__Course__c(
   		 Name = '701'
		);
		insert Course;
        
        // Create sample books
        Book__c book1 = new Book__c(educx__Status__c='Issued', educx__Title_of_the_book__c='Sample Book 1');
        Book__c book2 = new Book__c(educx__Status__c='Issued', educx__Title_of_the_book__c='Sample Book 2');
        Book__c book3 = new Book__c(educx__Status__c='In Stock', educx__Title_of_the_book__c='Sample Book 3');
        insert new List<Book__c>{book1, book2,book3};
            
      //student
 	 educx__Student__c student = new educx__Student__c(
    educx__Name_of_The_Candidate__c = 'John Doe',
    educx__Hall_Ticket_No__c = 'HT123',
    educx__ICET_Rank__c = '345',
    educx__Aadhar_Number__c = '2443 2312 1233',
    educx__ICET_Hall_Ticket_No__c = '8743568',
    educx__Identification_Mark_1__c = 'mole on right hand',
    educx__Identification_Mark_2__c = 'mole on hand',
     educx__Parent_Income__c = 8326.0,  
    educx__Date_of_Birth__c = Date.today()-900,
    educx__Email__c = 'ashu@gmail.com', 
    educx__Phone_Number__c = '8726423543', 
    educx__SSC_Year_of_Passing__c = '2020',
    educx__SSC_Registration_No__c = '735r2875t',
    educx__Course_Code__c = course.Id,
    educx__Course__c = 'B.Ed.',
            educx__Father_Phone__c='8792347889',
    educx__Joining_Date__c = Date.today()-20, 
    educx__Year__c = '1st Year',
    educx__Semester__c = 'I'
		);
		insert student;
        
    // Create test data for educx__Employees__c
        	educx__Employees__c employee = new educx__Employees__c(
            educx__Employee_Name__c = 'Jane Smith', 
            educx__Father_s_Name__c = 'Jan',  
            educx__Designation__c = 'Librarian', 
            educx__Aadhar_Number__c = '8374 9283 8374', 
            educx__Pan__c = 'ASDHU5678H',  
            educx__Qualifications__c = 'B.Ed.', 
            educx__Years_of_Experience__c = '2',  
            educx__Employee_Type__c = 'Teaching',  
            educx__Email__c = 'ashu@gmail.com',  
            educx__Phone__c = '8726423543',  
            educx__Date_of_Birth__c = Date.newInstance(2000, 5, 22)  
        );
        insert employee;
        
        // Create sample book issues
        educx__Book_Issue_and_Returns__c issue1 = new educx__Book_Issue_and_Returns__c(
            educx__Book_Id__c = book1.Name,
            educx__Student_Id__c = student.Id,
            educx__Candidate__c = 'Student',
            educx__Book_Status__c=null,
            educx__Date_of_Return__c=null,
            educx__Date_of_Issue__c = Date.today().addDays(-10)
        );
		insert issue1;
        educx__Book_Issue_and_Returns__c issue2 = new educx__Book_Issue_and_Returns__c(
            educx__Book_Id__c = book2.Name,
            educx__Employee_Id__c = employee.Id,
            educx__Candidate__c = 'Employee',
            educx__Date_of_Issue__c = Date.today().addDays(-8)
        );
		insert issue2;
       
    }

   @IsTest
    static void testAllBorrowedBooks() {
       Test.startTest();
    List<BookIssueAndReturnController.BookIssueandReturnsWrapper> result = BookIssueAndReturnController.allBorrowedBooks('Sample Book 1');
    Test.stopTest();

    System.assertNotEquals(0, result.size(), 'The result should not be empty');
    System.assertEquals(1, result.size(), 'There should be 1 borrowed book with the title "Sample Book 1"');
}
/*
  @IsTest
    static void testAllBorrowedBooksOfStudent() {
        // Get a sample student
        educx__Student__c student = [SELECT id,educx__Hall_Ticket_No__c FROM educx__Student__c WHERE educx__Hall_Ticket_No__c = 'HT123' LIMIT 1];

        Test.startTest();
        List<BookIssueAndReturnController.BookIssueandReturnsWrapper> result = BookIssueAndReturnController.allBorrowedBooksOfStudent(student.educx__Hall_Ticket_No__c);
        Test.stopTest();

      
        System.assertEquals(1, result.size(), 'There should be 1 borrowed book for the student');
        //System.assertEquals('Not Returned', result[0].BookStatus, 'The book should be marked as Not Returned if overdue');
    }

    @IsTest
	static void testAllBorrowedBooksOfEmployee() {
    educx__Employees__c employee = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'Jane Smith' LIMIT 1];
    Test.startTest();
    List<BookIssueAndReturnController.BookIssueandReturnsWrapper> result = BookIssueAndReturnController.allBorrowedBooksOfEmployee(employee.Id);
    Test.stopTest();

    System.debug('Result size: ' + result.size());
    for (BookIssueAndReturnController.BookIssueandReturnsWrapper wrapper : result) {
        System.debug('Book ID: ' + wrapper.BookId);
        System.debug('Book Status: ' + wrapper.BookStatus);
    }
    System.assertEquals(1, result.size(), 'There should be 1 borrowed book for the employee');
    // System.assertEquals('Not Returned', result[0].BookStatus, 'The book should be marked as Not Returned if overdue');
	}
    */
 @isTest
    static void testReturnBook() {
         educx__Book_Issue_and_Returns__c bookIssue = [SELECT Id,Name, educx__Candidate__c FROM educx__Book_Issue_and_Returns__c WHERE educx__Candidate__c = 'Student' LIMIT 1];
    	Book__c book = [SELECT Id, educx__Status__c FROM Book__c WHERE educx__Status__c = 'In Stock' LIMIT 1];
        
        educx__Book_Issue_and_Returns__c bookReturn = new educx__Book_Issue_and_Returns__c(
            educx__Book_Id__c = book.Id,
            educx__Book_Status__c = 'Returned',
            educx__Date_of_Return__c = Date.today()
        );
        insert bookReturn;
        // Call the method
        Test.startTest();
        BookIssueAndReturnController.returnBook(bookIssue.Id);
        Test.stopTest();
        
        // Verify results
        educx__Book_Issue_and_Returns__c updatedBookIssue = [SELECT Id, educx__Book_Status__c, educx__Date_of_Return__c FROM educx__Book_Issue_and_Returns__c WHERE Id = :bookReturn.Id LIMIT 1];
        educx__Book__c updatedBook = [SELECT Id, Status__c FROM educx__Book__c WHERE Id = :book.Id LIMIT 1];
        System.debug('Returned'+updatedBookIssue.educx__Book_Status__c);
        //System.assertEquals('Returned', updatedBookIssue.educx__Book_Status__c, 'The book status should be "Returned".');
        //System.assertNotEquals(null, updatedBookIssue.educx__Date_of_Return__c, 'The date of return should not be null.');
        //System.assertEquals('In Stock', updatedBook.Status__c, 'The book status should be "In Stock".');
    }
    /*
 @IsTest
static void testIssueBook() {
    // Get a sample student created in the setup method
    educx__Student__c student = [SELECT Id FROM educx__Student__c WHERE educx__Hall_Ticket_No__c = 'HT123' LIMIT 1];
    
    // Get a sample book that is in stock
    Book__c book = [SELECT Id, educx__Status__c FROM Book__c WHERE educx__Status__c = 'In Stock' LIMIT 1];

    Test.startTest();
    BookIssueAndReturnController.issueBook(book.Id, student.Id, 'Student');
    Test.stopTest();

    // Verify that the book status has changed to 'Issued'
    Book__c issuedBook = [SELECT educx__Status__c FROM Book__c WHERE Id = :book.Id LIMIT 1];
    System.assertEquals('Issued', issuedBook.educx__Status__c, 'The book should be marked as Issued');
}

    @IsTest
    static void testIssueBookForEmployee() {
        // Get a sample employee and book
        educx__Employees__c employee = [SELECT Id FROM educx__Employees__c WHERE educx__Employee_Name__c = 'Jane Smith' LIMIT 1];
        Book__c book = [SELECT Id, educx__Status__c FROM Book__c WHERE educx__Status__c = 'In Stock' LIMIT 1];

        Test.startTest();
        BookIssueAndReturnController.issueBookForEmployee(book.Id, employee.Id, 'Employee');
        Test.stopTest();

        Book__c issuedBook = [SELECT educx__Status__c FROM Book__c WHERE Id = :book.Id LIMIT 1];
        System.assertEquals('Issued', issuedBook.educx__Status__c, 'The book should be marked as Issued');
    }*/
}