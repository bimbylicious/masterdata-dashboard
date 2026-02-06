interface ClearanceData {
    employeeName: string;
    position: string;
    department: string;
    clearanceType: 'project-hire' | 'contractual';
}
export declare class PDFService {
    private templatePath;
    constructor();
    /**
     * Fill the actual clearance form PDF with employee data
     * Page 1 = Project Hire Employee
     * Page 2 = Contractual Employee
     */
    fillClearanceForm(data: ClearanceData): Promise<Buffer>;
}
export {};
