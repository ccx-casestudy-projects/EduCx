public class EducxTestDataFactory {
     
  // Create test data for Book__c
       public static Map<String, Object> BookDataFactory() {
        
        Map<String, Object> AllObjects = new Map<String, Object>();
        
        List<Book__c> books = new List<Book__c>();
        
        for (Integer i = 0; i < 5; i++) {
            books.add(new Book__c(
                educx__Author__c = 'Author' + i, 
                educx__Date_of_purchase__c = Date.today(),  
                educx__Edition__c = 'Edition' + i,  
                educx__Price__c = 100 + i, 
                educx__Status__c = 'In Stock',  
                educx__Title_of_the_book__c = 'Title' + i,  
                educx__Number_of_Copies__c = 10  
            ));
        }
        
        Book__c singleBook = new Book__c(
            educx__Author__c = 'Single Author', 
            educx__Date_of_purchase__c = Date.today(),  
            educx__Edition__c = 'Single Edition',  
            educx__Price__c = 150, 
            educx__Status__c = 'In Stock',  
            educx__Title_of_the_book__c = 'Single Title',  
            educx__Number_of_Copies__c = 5  
        );
        
        books.add(singleBook);
        
        insert books;
        
        AllObjects.put('AllBooks', books);
        AllObjects.put('singleBook', singleBook);
        
        return AllObjects;
    }

}