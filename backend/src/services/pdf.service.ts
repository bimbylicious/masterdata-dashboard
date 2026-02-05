import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES Module compatibility: Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ClearanceData {
  employeeName: string;
  position: string;
  department: string;
  clearanceType: 'project-hire' | 'contractual';
}

export class PDFService {
  private templatePath: string;

  constructor() {
    // Path to the clearance template PDF
    this.templatePath = path.join(__dirname, '../../templates/Clearance_Form.pdf');
  }

  /**
   * Fill the actual clearance form PDF with employee data
   * Page 1 = Project Hire Employee
   * Page 2 = Contractual Employee
   */
  async fillClearanceForm(data: ClearanceData): Promise<Buffer> {
    try {
      console.log(`📄 Filling clearance form (${data.clearanceType}) for:`, data.employeeName);

      // Check if template exists
      if (!fs.existsSync(this.templatePath)) {
        throw new Error('Clearance form template not found. Please place Clearance_Form.pdf in backend/templates/');
      }

      // Load the template PDF
      const existingPdfBytes = fs.readFileSync(this.templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Get the appropriate page (0-indexed)
      // Page 0 = Project Hire, Page 1 = Contractual
      const pageIndex = data.clearanceType === 'project-hire' ? 0 : 1;
      const page = pdfDoc.getPages()[pageIndex];
      
      // Get page dimensions
      const { width, height } = page.getSize();
      console.log(`📏 Page size: ${width}x${height}`);
      
      // Embed font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // PDF coordinate system: y=0 is at BOTTOM of page
      // Standard Letter: 612 x 792 points
      
      // Fine-tuned coordinates based on your form
      // Measuring from the image, adjusting for better alignment
      
      // Starting Y position (from bottom) - adjust this to move all fields up/down
      const startY = height - 153; // Moved up a bit from previous 122
      
      // X position where text should start (after the label)
      const nameX = 126;        // X position for "Name of Employee :"
      const positionX = 126;    // X position for "Position :"
      const deptX = 127;        // X position for "Section/Department :"
      
      // Vertical spacing between lines
      const lineSpacing = 14;   // Space between each field
      
      // Font size
      const fontSize = 8;      // Slightly larger for better readability
      
      console.log(`📍 Positioning at Y=${startY}, line spacing=${lineSpacing}`);
      
      // Draw employee name
      page.drawText(data.employeeName, {
        x: nameX,
        y: startY,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      console.log(`✏️  Name: "${data.employeeName}" at (${nameX}, ${startY})`);

      // Draw position
      page.drawText(data.position, {
        x: positionX,
        y: startY - lineSpacing,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      console.log(`✏️  Position: "${data.position}" at (${positionX}, ${startY - lineSpacing})`);

      // Draw department
      page.drawText(data.department, {
        x: deptX,
        y: startY - (lineSpacing * 2),
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      console.log(`✏️  Department: "${data.department}" at (${deptX}, ${startY - (lineSpacing * 2)})`);

      console.log('✅ Text fields filled successfully');

      // Extract only the filled page to create single-page PDF
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
      newPdf.addPage(copiedPage);

      const pdfBytes = await newPdf.save();
      console.log('✅ Clearance form PDF generated');
      
      return Buffer.from(pdfBytes);

    } catch (error: any) {
      console.error('❌ Error filling clearance form:', error);
      throw new Error(`Failed to fill clearance form: ${error.message}`);
    }
  }
}