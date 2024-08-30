import { LightningElement,track,api,wire } from 'lwc';
import getPreviousStudyDetails from '@salesforce/apex/StudentController.getPreviousStudyDetails';
import LightningConfirm from 'lightning/confirm';
import populateCourseDetails from '@salesforce/apex/StudentController.populateCourseDetails';

export default class StudentDetailPreview extends LightningElement {
    @api recordId;
    @track uploadedFiles = {};
    @api previewDetails=false;
    closePreviewPopUp(){
        const closeFormEvent = new CustomEvent('close');
        this.dispatchEvent(closeFormEvent);
        this.previewDetails=false;
    }
    
    @track itemList = [];

    connectedCallback() {
        if (this.recordId) {
            this.fetchPreviousStudyDetails();
        } else {
            console.error('recordId is not defined');
        }
    }

    @track StdAdmType;
    @track StdCourse;
    @track StdCourseName;
    StdAdmTypeChange(event) {
        this.StdAdmType = event.target.value;
    }
    get isManagementQuota() {
        return this.StdAdmType !== 'Management Quota' && this.StdAdmType !== 'Spot Registration';
    }

    updateFeeFieldsState() {
        const feeFields = this.template.querySelectorAll('.fee-field');
        feeFields.forEach(field => {
            field.disabled = !this.isManagementQuota;
        });
    }
    get isCommAddressDisabled() {
        return this.IsAddressSame;
    }
    CommunicationStreetChange(event) {
        this.communicationStreet = event.target.value;
    }

    CommunicationCityChange(event) {
        this.communicationCity = event.target.value;
    }

    CommunicationStateChange(event) {
        this.communicationState = event.target.value;
    }

    CommunicationPostalCodeChange(event) {
        this.communicationPostalCode = event.target.value;
    }

    CommunicationCountryChange(event) {
        this.communicationCountry = event.target.value;
    }
    PermanentStreetChange(event) {
        this.permanentStreet = event.target.value;
    }
    PermanentCityChange(event) {
        this.permanentCity = event.target.value;
    }

    PermanentStateChange(event) {
        this.permanentState = event.target.value;
    }

    PermanentPostalCodeChange(event) {
        this.permanentPostalCode = event.target.value;
    }

    PermanentCountryChange(event) {
        this.permanentCountry = event.target.value;
    }
    @track IsAddressSame = false;
    IsAddressSameChange(event) {
        this.IsAddressSame = event.target.value;
        if (this.IsAddressSame) {
            this.communicationStreet = this.permanentStreet;
            this.communicationCity = this.permanentCity;
            this.communicationState = this.permanentState;
            this.communicationPostalCode = this.permanentPostalCode;
            this.communicationCountry = this.permanentCountry;
        }
        else {
            this.communicationStreet = '';
            this.communicationCity = '';
            this.communicationState = '';
            this.communicationPostalCode = '';
            this.communicationCountry = '';
        }
    }
    
    StdCourseCodeChange(event) {
        this.StdCourseCode = event.target.value;
        populateCourseDetails({ courseId: this.StdCourseCode })
            .then(result => {
                if (result) {
                    this.StdCourse = result.educx__Course__c;
                    this.StdCourseName = result.educx__Course_Name__c;
                } else {
                    this.StdCourse = '';
                    this.StdCourseName = '';
                }
            })
            .catch(error => {
                console.log('error fetching course details');
            });
    }
    fetchPreviousStudyDetails() {
        getPreviousStudyDetails({ studentId: this.recordId })
            .then(result => {
                // Ensure that there are always 7 rows
                const defaultRows = new Array(7).fill({}).map((_, index) => ({
                    keyIndex: index,
                    educx__Student__c: this.recordId,
                    ...result[index] // Populate with existing records if available
                }));

                this.itemList = defaultRows;
            })
            .catch(error => {
                console.error('Error fetching study details', error);
                this.showToast('Error fetching study details.', error.body.message, 'error');
            });
    }

    handleSuccessStudentCreation(){
        this.template.querySelector('c-toast-message').showToast('Changes saved successfully.', '', 'success');
        this.closePreviewPopUp();
    }
    handleError(){
         this.template.querySelector('c-toast-message').showToast('Error saving changes.', '', 'error');
    }
    async handleConfirmClick() {
        const result = await LightningConfirm.open({
            variant: 'header',
            theme: 'alt-inverse',
            label: 'Please Confirm !!!',
            message: 'Do you want to save the Changes ??',
            class: 'custom-confirm-modal'
        });
        if(result){
            this.handleSubmitData();
           // this.closePreviewPopUp();
             
        }
        
    }
    handleSubmitData(event){
         let isValid = true;
            this.template.querySelectorAll('lightning-input-field').forEach(element => {
                isValid = isValid && element.reportValidity();
            });

            if (isValid) {
            this.template.querySelectorAll('lightning-record-edit-form[data-id="psd"]').forEach(element => {
                element.submit();
            });
            }
            this.template.querySelector('lightning-record-edit-form[data-id="Std1"]').submit();
            //this.template.querySelector('lightning-record-edit-form[data-id="Std2"]').submit();
            
            this.handleSuccessStudentCreation();
              
    }
}