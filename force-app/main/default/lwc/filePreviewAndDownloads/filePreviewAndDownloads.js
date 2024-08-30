import { LightningElement, api, wire } from 'lwc';
import {NavigationMixin} from 'lightning/navigation'
export default class FilePreviewAndDownloads extends NavigationMixin(LightningElement) {
    
    @api recordId;
    filesList =[]
    // @wire(getRelatedFilesByRecordId, {recordId: '$recordId'})
    // wiredResult({data, error}){ 
    //     if(data){ 
    //         console.log(data)
    //         this.filesList = Object.keys(data).map(item=>({"label":data[item],
    //          "value": item,
    //          "url":`/sfc/servlet.shepherd/document/download/${item}`
    //         }))
    //         console.log(this.filesList)
    //     }
    //     if(error){ 
    //         console.log(error)
    //     }
    // }
    previewHandler(event){
        console.log(event.target.dataset.id)
        this[NavigationMixin.Navigate]({ 
            type:'standard__namedPage',
            attributes:{ 
                pageName:'filePreview'
            },
            state:{ 
                selectedRecordId: event.target.dataset.id
            }
        })
    }
    closeModal() {
        // Fire custom event to notify parent component
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
    }
}