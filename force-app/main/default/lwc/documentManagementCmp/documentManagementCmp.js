import { LightningElement, wire, track, api } from 'lwc';
import getOrganizationsWithAttachments from '@salesforce/apex/OrganizationController.getOrganizationsWithAttachments';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

export default class OrganizationComponent extends NavigationMixin(LightningElement) {
    @track organizations = [];
    @track error;
    @api organizationType='Document';
    showOrganizationForm = false;
    showOrganizationEditForm = false;
    @track showDeleteModal = false;
    deleteRecordIds;
    recordId;
    documentId;
    @api hideSemister;
    @wire(getOrganizationsWithAttachments)
    wiredOrganizations(result) {
        this.organizationWireResult = result;
        if (result.data) {
            this.organizationsResult = result.data;
            this.iterateOrganizations();
        } else if (result.data == null) {
            this.organizations = false;
        } else if (result.error) {
            this.error = result.error;
        }
    }

    handleDeleteClick(event) {
        this.showDeleteModal = true;
        this.deleteRecordIds = event.target.value;
    }

    handleDelete(event) {
        alert('success');
    }

    iterateOrganizations() {
      
        this.organizations = [];
        this.organizationIdToDocumentIdMap = {}; // New property to store the map

        this.isAdmin = this.organizationsResult[0].currentUserProfile === 'System Administrator';
        this.organizationsResult.forEach(organizationWrapper => {
         
              
                const createdDate = new Date(organizationWrapper.organization.CreatedDate);
              
                const formattedCreatedDate = createdDate.toLocaleDateString('en-GB');

                this.organizations.push({ ...organizationWrapper,formattedCreatedDate: formattedCreatedDate });
                const organizationId = organizationWrapper.organization.Id;
                if (organizationWrapper.files && organizationWrapper.files.length > 0) {
                    this.organizationIdToDocumentIdMap[organizationId] = organizationWrapper.files.map(file => file.ContentDocumentId);
                } else {
                    this.organizationIdToDocumentIdMap[organizationId] = [];
                }
            
        });
    }

    handleViewClick(event) {
        const contentDocumentId = event.target.value;
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview',
                actionName: 'view',
            },
            state: {
                selectedRecordId: contentDocumentId
            }
        });
    }

    handleButtonClick() {
        this.showOrganizationForm = true;
        this.heading = 'New '+this.organizationType;
    }

    handleCloseModal() {
        this.refreshData();
        this.showOrganizationForm = false;
    }

    refreshData() {
        this.showDeleteModal = false;
        this.showOrganizationEditForm = false;
        return refreshApex(this.organizationWireResult);
    }

    handleEditClick(event) {
        this.heading = 'Edit ' + this.organizationType;
        this.showOrganizationEditForm = true;
        this.recordId = event.target.value;
        this.documentId = this.organizationIdToDocumentIdMap[this.recordId];
    }
}