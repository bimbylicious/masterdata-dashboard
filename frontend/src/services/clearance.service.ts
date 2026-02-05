const API_BASE_URL = 'http://localhost:5000/api';

export type ClearanceType = 'project-hire' | 'contractual';

export class ClearanceService {
  /**
   * Generate and download a clearance form for an employee
   * @param employeeId - The employee's ID
   * @param clearanceType - Either 'project-hire' or 'contractual'
   */
  async generateClearanceForm(employeeId: string, clearanceType: ClearanceType): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/clearance/${employeeId}?type=${clearanceType}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate clearance form');
      }

      // Get the filename from response headers or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'Clearance_Form.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('✅ Clearance form downloaded:', filename);
    } catch (error: any) {
      console.error('❌ Error generating clearance form:', error);
      throw error;
    }
  }
}