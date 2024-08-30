import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import eventTableData from '@salesforce/apex/eventholidayManagementController.eventTableData';
import deleteEvent from '@salesforce/apex/eventholidayManagementController.deleteEvent';
import saveEvent from '@salesforce/apex/eventholidayManagementController.saveEvent';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
const columns = [
  { label: 'Event Name', fieldName: 'Subject', type: 'text' },
  { label: 'Start Date & Time', fieldName: 'StartDateTime', type: 'date' },
  { label: 'End Date & Time', fieldName: 'EndDateTime', type: 'date' },
  { label: 'Venue', fieldName: 'Location', type: 'text' }
];

export default class AdminEventManagement extends NavigationMixin(LightningElement) {
  @track columns = columns;
  @track eventData;
  @track selectedRows = [];
  @track isModalOpen = false;
  @track selectedEventId;
  @track modalTitle = '';
  @track refreshResult;
  @track searchValue;
  @track filterEventData;
  @track subject;
  @track startDateTime;
  @track endDateTime;
  @track location;
  @track checkValue;

  @wire(eventTableData)
  wiredEvent({ error, data }) {
    if (data) {
      data = data.map(eve => ({
        ...eve,
        StartDateTime: new Date(eve.StartDateTime),
        EndDateTime: new Date(eve.EndDateTime)
      }));
      this.filterEventData = data;
      this.eventData = this.filterEventData;
      console.log('eventData', this.eventData);
    } else if (error) {
      console.error('Error loading events:', error);
    }
  }

  handleCreate() {
    this.isModalOpen = true;
    this.modalTitle = 'New Event';
    this.selectedEventId = null;
    this.subject = '';
    this.startDateTime = '';
    this.endDateTime = '';
    this.checkValue = false;
    this.location = '';
  }

  handleEdit() {
    const selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
    if (selectedRows.length !== 1) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error',
          message: 'Please select one record to edit',
          variant: 'error',
        })
      );
      return;
    }
    const selectedEvent = selectedRows[0];
    this.isModalOpen = true;
    this.modalTitle = 'Edit Event';
    this.selectedEventId = selectedEvent.Id;
    this.subject = selectedEvent.Subject;
    this.startDateTime = selectedEvent.StartDateTime.toISOString().substring(0, 16);
    this.endDateTime = selectedEvent.EndDateTime.toISOString().substring(0, 16);
    this.checkValue = selectedEvent.IsAllDayEvent;
    this.location = selectedEvent.Location;
  }

  handleSave(event) {
    event.preventDefault();
    const fields = {
        Id: this.selectedEventId,
        Subject: this.subject,
        StartDateTime: this.startDateTime,
        EndDateTime: this.endDateTime,
        Location: this.location
    };

    saveEvent({ event: fields })
        .then(result => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `Event ${this.selectedEventId ? 'updated' : 'created'} successfully`,
                    variant: 'success',
                })
            );
            this.refreshData();
            this.handleCloseModal();
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error saving event',
                    message: error.body.message,
                    variant: 'error',
                })
            );
        });
}


  updateSearch(event) {
    var regex = new RegExp(event.target.value, 'gi')
    this.eventData = this.filterEventData.filter(
      row => regex.test(row.Subject)
    );
  }

  handleCloseModal() {
    this.isModalOpen = false;
  }

  handleDelete() {
    const selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
    const selectedIds = selectedRows.map((row) => row.Id);
    if (selectedIds.length === 0) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error',
          message: 'Please select at least one record to delete',
          variant: 'error',
        })
      );
      return;
    }
    deleteEvent({ eventIds: selectedIds })
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Success',
            message: 'Event(s) deleted',
            variant: 'success',
          })
        );
        return this.refreshData();
      })
      .catch((error) => {
        console.error('Error deleting Event:', error);
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Error deleting event',
            message: error.body.message,
            variant: 'error',
          })
        );
      });
  }

  refreshData() {
    return refreshApex(this.refreshResult);
  }

  handleInputChange(event) {
    const field = event.target.name;
    if (field === 'subject') {
      this.subject = event.target.value;
    } else if (field === 'startDateTime') {
      this.startDateTime = event.target.value;
    } else if (field === 'endDateTime') {
      this.endDateTime = event.target.value;
    } else if (field === 'All Day') {
      this.checkValue = event.target.value;
    }else if (field === 'location') {
      this.location = event.target.value;
    }
  }
  handleBackClick() {
    let compDefinition = {
      componentDef: "c:navigationMenu",
    };
    let encodedCompDef = btoa(JSON.stringify(compDefinition));
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: "/one/one.app#" + encodedCompDef
      }
    });
  }
}