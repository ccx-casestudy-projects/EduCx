public with sharing class eventholidayManagementController {
    @AuraEnabled(cacheable=true)
    public static list<Event> eventholidays(){
        Date today = Date.today();
        Date sixMonthsLater = today.addMonths(6);
        return [SELECT Id, Subject, StartDateTime, EndDateTime, Location, CreatedDate 
                FROM Event 
                WHERE StartDateTime >= :today AND StartDateTime < :sixMonthsLater 
                ORDER BY StartDateTime];
    }

    @AuraEnabled(cacheable=true)
    public static list<Event> eventTableData(){
        return [SELECT Id, Subject, StartDateTime, EndDateTime, Location, CreatedDate 
                FROM Event ORDER BY StartDateTime];
    }

    @AuraEnabled
    public static Event saveEvent(Event event) {
        System.debug('Event received: ' + event);
        try {
            upsert event;
            System.debug('Event saved successfully: ' + event);
            return event;
        } catch (Exception e) {
            System.debug('Error saving event: ' + e.getMessage());
            throw new AuraHandledException('Error saving event: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteEvent(List<String> eventIds) {
        try {
            List<Event> eventToDelete = [SELECT Id FROM Event WHERE Id IN :eventIds];
            if (!eventToDelete.isEmpty()) {
                delete eventToDelete;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting Events: ' + e.getMessage());
        }
    }
}