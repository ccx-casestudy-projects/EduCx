import { LightningElement, wire, track, api } from 'lwc';
import getNoticesWithAttachments from '@salesforce/apex/NoticeController.getNoticesWithAttachments';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

export default class NoticeComponent extends NavigationMixin(LightningElement) {
    @track notices = [];
    @track error;
    @api noticeType;
    showNoticeForm = false;
    showNoticeEditForm = false;
    @track showDeleteModal = false;
    deleteRecordIds;
    recordId;
    documentId;
    @api hideSemister;
    @wire(getNoticesWithAttachments)
    wiredNotices(result) {
        this.noticeWireResult = result;
        if (result.data) {
            this.noticesResult = result.data;
            this.iterateNotices();
        } else if (result.data == null) {
            this.notices = false;
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

    iterateNotices() {
        this.heading = 'New ' + this.noticeType;
        this.notices = [];
        this.noticeIdToDocumentIdMap = {}; // New property to store the map

        this.isAdmin = this.noticesResult[0].currentUserProfile === 'System Administrator';
        this.noticesResult.forEach(noticeWrapper => {
            if (noticeWrapper.notice.educx__Type__c === this.noticeType) {
                let isNew = false;
                const createdDate = new Date(noticeWrapper.notice.CreatedDate);
                const today = new Date();
                const timeDiff = Math.abs(today.getTime() - createdDate.getTime());
                const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                if (dayDiff <= 7) {
                    isNew = true;
                }

                const formattedCreatedDate = createdDate.toLocaleDateString('en-GB');

                this.notices.push({ ...noticeWrapper, isNew: isNew, formattedCreatedDate: formattedCreatedDate });
                const noticeId = noticeWrapper.notice.Id;
                if (noticeWrapper.files && noticeWrapper.files.length > 0) {
                    this.noticeIdToDocumentIdMap[noticeId] = noticeWrapper.files.map(file => file.ContentDocumentId);
                } else {
                    this.noticeIdToDocumentIdMap[noticeId] = [];
                }
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
        this.showNoticeForm = true;
        this.heading = this.noticeType;
    }

    handleCloseModal() {
        this.refreshData();
        this.showNoticeForm = false;
    }

    refreshData() {
        this.showDeleteModal = false;
        this.showNoticeEditForm = false;
        return refreshApex(this.noticeWireResult);
    }

    handleEditClick(event) {
        this.heading = 'Edit ' + this.noticeType;
        this.showNoticeEditForm = true;
        this.recordId = event.target.value;
        this.documentId = this.noticeIdToDocumentIdMap[this.recordId];
    }
}