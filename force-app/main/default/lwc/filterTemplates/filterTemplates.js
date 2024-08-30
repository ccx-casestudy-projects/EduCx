import { LightningElement, track, api } from 'lwc';

export default class FilterTemplates extends LightningElement {
    @api selectedRows;

    @track filteredBonafideDegreeCourses = [];
    @track filteredBonafideMBACourses = [];
    @track filteredBonafideBedCourses = [];

    @track filteredTCDegreeCourses = [];
    @track filteredTCMBACourses = [];
    @track filteredTCBedCourses = [];

    @track generateBonafideDegreeCourses = false;
    @track generateBonafideMBACourses = false;
    @track generateBonafideBedCourses = false;
    @track generateTCDegreeCourses = false;
    @track generateTCMBACourses = false;
    @track generateTCBedCourses = false;

    connectedCallback() {
        this.filterRecords();
    }

    filterRecords() {
       // alert(this.selectedRows);
        // Ensure selectedRows is always an array
        const records = Array.isArray(this.selectedRows) ? this.selectedRows : [this.selectedRows];

        // Debugging logs
       // console.log('Records:', +records);
        //alert('Records:', records);

        // Filter rows for Bonafide Certificate
        this.filteredBonafideDegreeCourses = records.filter(row =>
            row.educx__Document_Type__c === 'Bonafide Certificate' &&
            ['B.A.', 'B.Com', 'B.Sc.'].includes(row.educx__Student_ID__r.educx__Course__c)
        );
        this.filteredBonafideMBACourses = records.filter(row =>
            row.educx__Document_Type__c === 'Bonafide Certificate' &&
            row.educx__Student_ID__r.educx__Course__c === 'M.B.A.'
        );
        this.filteredBonafideBedCourses = records.filter(row =>
            row.educx__Document_Type__c === 'Bonafide Certificate' &&
            row.educx__Student_ID__r.educx__Course__c === 'B.Ed.'
        );

        //alert(JSON.stringify(this.filteredBonafideBedCourses));

        // Filter rows for Transfer Certificate(TC)
        this.filteredTCDegreeCourses = records.filter(row =>
            row.educx__Document_Type__c === 'Transfer Certificate(TC)' &&
            ['B.A.', 'B.Com.', 'B.Sc.'].includes(row.educx__Student_ID__r.educx__Course__c)
        );
        this.filteredTCMBACourses = records.filter(row =>
            row.educx__Document_Type__c === 'Transfer Certificate(TC)' &&
            row.educx__Student_ID__r.educx__Course__c === 'M.B.A.'
        );
        this.filteredTCBedCourses = records.filter(row =>
            row.educx__Document_Type__c === 'Transfer Certificate(TC)' &&
            row.educx__Student_ID__r.educx__Course__c === 'B.Ed.'
        );

        this.setGenerateFlags();
    }

    setGenerateFlags() {
        this.generateBonafideDegreeCourses = this.filteredBonafideDegreeCourses.length > 0;
        this.generateBonafideMBACourses = this.filteredBonafideMBACourses.length > 0;
        this.generateBonafideBedCourses = this.filteredBonafideBedCourses.length > 0;
      // alert('this.generateBonafideBedCourses==>'+this.generateBonafideBedCourses);
        this.generateTCDegreeCourses = this.filteredTCDegreeCourses.length > 0;
        this.generateTCMBACourses = this.filteredTCMBACourses.length > 0;
        this.generateTCBedCourses = this.filteredTCBedCourses.length > 0;
       // alert('this.generateTCBedCourses==>'+this.generateTCBedCourses);
    }
}