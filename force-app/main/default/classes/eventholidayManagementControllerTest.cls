@isTest
public class eventholidayManagementControllerTest {
    private static Event createTestEvent(String subject, DateTime startDateTime, DateTime endDateTime) {
        Event testEvent = new Event(
            Subject = subject,
            StartDateTime = startDateTime,
            EndDateTime = endDateTime,
            Location = 'Test Location'
        );
        insert testEvent;
        return testEvent;
    }
    
    @isTest
    static void testEventHolidays() {
        DateTime startDateTime = DateTime.now();
        DateTime endDateTime = startDateTime.addHours(2);
        createTestEvent('Test Event 1', startDateTime, endDateTime);
        createTestEvent('Test Event 2', startDateTime.addMonths(5), endDateTime.addMonths(5));
        createTestEvent('Test Event 3', startDateTime.addMonths(7), endDateTime.addMonths(7)); // Outside the 6 months window

        Test.startTest();
        List<Event> events = eventholidayManagementController.eventholidays();
        Test.stopTest();
        
        System.assertEquals(2, events.size(), 'Should return 2 events within 6 months');
    }

    @isTest
    static void testEventTableData() {
        DateTime startDateTime = DateTime.now();
        DateTime endDateTime = startDateTime.addHours(2);
        Event testEvent = createTestEvent('Test Event 4', startDateTime, endDateTime);

        Test.startTest();
        List<Event> events = eventholidayManagementController.eventTableData();
        Test.stopTest();

        System.assert(events.size() > 0, 'There should be at least one event returned');
        System.assertEquals(testEvent.Id, events[0].Id, 'The first event should be the test event created');
    }

    @isTest
    static void testSaveEvent() {
        DateTime startDateTime = DateTime.now();
        DateTime endDateTime = startDateTime.addHours(2);
        Event newEvent = new Event(
            Subject = 'New Test Event',
            StartDateTime = startDateTime,
            EndDateTime = endDateTime,
            Location = 'New Location'
        );

        Test.startTest();
        Event savedEvent = eventholidayManagementController.saveEvent(newEvent);
        Test.stopTest();

        System.assertNotEquals(null, savedEvent.Id, 'Saved event should have an Id');
        System.assertEquals('New Test Event', savedEvent.Subject, 'Subject should match the input');
    }

    @isTest
    static void testDeleteEvent() {
        DateTime startDateTime = DateTime.now();
        DateTime endDateTime = startDateTime.addHours(2);
        Event testEvent = createTestEvent('Test Event to Delete', startDateTime, endDateTime);
        
        List<String> eventIds = new List<String> {testEvent.Id};

        Test.startTest();
        eventholidayManagementController.deleteEvent(eventIds);
        Test.stopTest();

        Event deletedEvent;
        try {
            deletedEvent = [SELECT Id FROM Event WHERE Id = :testEvent.Id LIMIT 1];
        } catch (System.QueryException e) {
            System.debug('No event found: ' + e.getMessage());
            deletedEvent = null;
        }
        System.assertEquals(null, deletedEvent, 'The event should be deleted');
    }
}