import LightningDatatable from "lightning/datatable"; 
import checkboxtemplate from "./checkbox.html";

export default class CustomDatatable extends LightningDatatable {
    
    static customTypes = {
        attendancecheck: {
            template: checkboxtemplate,
            typeAttributes: ['recordId', 'isChecked']
        }
    };


}