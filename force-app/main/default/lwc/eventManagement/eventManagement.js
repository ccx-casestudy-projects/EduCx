import { LightningElement,track,wire,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import eventholidays from '@salesforce/apex/eventholidayManagementController.eventholidays'
export default class EventManagement extends NavigationMixin(LightningElement) {

@track events = [];
@track dateRange = '';
@track isAdminVisible = false;

   @wire(eventholidays)
    wiredEvents({ error, data }) {
        if (data) {
            this.events = data.map(event => ({
                ...event,
                StartDateTime: new Date(event.StartDateTime),
                EndDateTime: new Date(event.EndDateTime),
                formattedDates: ` (${this.formatDate(event.StartDateTime)} - ${this.formatDate(event.EndDateTime)}) `,
                isNew: this.isEventNew(event.CreatedDate)
            }));
        } else if (error) {
            console.error('Error retrieving events', error);
        }
    }


    formatDate(dateString) {
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${day} ${month}, ${year}`;
    }
    isEventNew(createdDate) {
        const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
        const eventDate = new Date(createdDate);
        const currentDate = new Date();
        return currentDate - eventDate < ONE_WEEK_IN_MS;
    }
    handleToggleAdmin() {
        const compDefinition = {
            componentDef: "c:adminEventManagement",
        };
        
        // Encode the component definition as a URL-safe base64 string
        const encodedCompDef = btoa(JSON.stringify(compDefinition));
        
        // Use the NavigationMixin to navigate to the component
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedCompDef
            }
        });
    }

}