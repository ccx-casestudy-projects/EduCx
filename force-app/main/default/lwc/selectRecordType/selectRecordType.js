import { LightningElement, api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import MyCreateForm from 'c/addEmployee';
import { NavigationMixin } from 'lightning/navigation';

export default class SelectRecordType extends NavigationMixin(LightningModal) {
    @api empRecTypeData = []; // it is a map of rectypeId and name
    selectedRecordTypeId;
    @api isITEmpRecord;
    selectedvalue;
    @api showEdit;
    @track showError = false;
    @track errorMessage = '';

    get isShowEdit() {
        return this.showEdit;
    }

    get options() {
        return [
            { label: 'Teaching Employee', value: 'Teaching Employee' },
            { label: 'Non Teaching Employee', value: 'Non Teaching Employee' },
        ];
    }

    handleChange(event) {
        this.selectedvalue = event.detail.value;
        this.showError = false; // Reset the error message when a selection is made
    }

    handleOkay() {
        if (!this.selectedvalue) {
            this.showError = true;
            this.errorMessage = 'Please select a record type before proceeding.';
            return;
        }

        const foundRecordType = this.empRecTypeData.find(recordType => recordType.Name === this.selectedvalue);

        if (foundRecordType) {
            this.selectedRecordTypeId = foundRecordType.Id;
            console.log(`Found record type with Id ${this.selectedRecordTypeId} and Name '${this.selectedvalue}'`);
        } else {
            console.log(`No record type found with Name '${this.selectedvalue}'`);
        }

        MyCreateForm.open({
            empRecTypeId: this.selectedRecordTypeId,
            empRecTypeName: this.selectedvalue,
            newEmp: true
        })
        .then((result) => {
            this.rectypevalue = result;
            console.log('This is from create form ' + result);
        });

        this.close();
        this.isShowEdit = false;
    }

    handleCancel() {
        console.log('this is from handle cancel');
        this.close();
    }
}