import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './printdetails.css';

export default function PrintDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shipmentId, shipmentData } = location.state || {};
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      // Dynamically import the libraries
      const [jsPDFModule, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      const jsPDF = jsPDFModule.default;
      const html2canvas = html2canvasModule.default;

      const element = printRef.current;
      
      // Show loading state
      const originalText = event.target.innerHTML;
      event.target.innerHTML = '⏳ Generating PDF...';
      event.target.disabled = true;

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `shipment-report-${shipmentId || 'unknown'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Restore button state
      event.target.innerHTML = originalText;
      event.target.disabled = false;

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      
      // Restore button state on error
      const button = event.target;
      button.innerHTML = '📄 Export PDF';
      button.disabled = false;
    }
  };

  const handleExportWord = async () => {
    try {
      const element = printRef.current;
      
      // Show loading state
      const originalText = event.target.innerHTML;
      event.target.innerHTML = '⏳ Generating Word Document...';
      event.target.disabled = true;

      // Get the HTML content
      const content = element.innerHTML;
      
      // Create a Blob with HTML content that Word can open
      const blob = new Blob([`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Shipment Report #${shipmentId}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6;
              color: #333;
            }
            .report-header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .section-title {
              background: #f5f5f5;
              padding: 12px 20px;
              margin: 30px 0 20px 0;
              font-weight: bold;
              border-left: 4px solid #000000ff;
            }
            .info-grid {
              display: table;
              width: 100%;
              margin-bottom: 20px;
            }
            .info-card {
              border: 1px solid #e9ecef;
              padding: 20px;
              margin: 10px;
              display: table-cell;
              background: #f8f9fa;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `], { type: 'application/msword' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shipment-report-${shipmentId || 'unknown'}-${new Date().toISOString().split('T')[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Restore button state
      event.target.innerHTML = originalText;
      event.target.disabled = false;

    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Error generating Word document. Please try again.');
      
      // Restore button state on error
      const button = event.target;
      button.innerHTML = '📝 Export Word';
      button.disabled = false;
    }
  };

  if (!shipmentData) {
    return (
      <div className="print-details-container">
        <div className="loading-state">
          <p>Loading shipment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-details-container">
      <div className="print-header no-print">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Print Shipment Details</h1>
        <div className="print-actions">
          <button className="btn-secondary" onClick={handleExportWord}>
            📝 Export Word
          </button>
          {/* <button className="btn-secondary" onClick={handleExportPDF}>
            📄 Export PDF
          </button> */}
          <button className="btn-primary" onClick={handlePrint}>
            🖨️ Print Report
          </button>
        </div>
      </div>

      <div className="print-content" ref={printRef}>
        <div className="printable-report">
          <div className="report-header">
            <h1>Shipment Report</h1>
            <div className="report-meta">
              <p><strong>Report Generated:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Shipment ID:</strong> #{shipmentId}</p>
            </div>
          </div>

          <div className="shipment-overview">
            <h2 className="section-title">Shipment Overview</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>Route Information</h3>
                <p><strong>Origin:</strong> {shipmentData.origin}</p>
                <p><strong>Destination:</strong> {shipmentData.destination}</p>
                <p><strong>ETA:</strong> {shipmentData.eta}</p>
                <p><strong>Status:</strong> {shipmentData.status}</p>
              </div>
              <div className="info-card">
                <h3>Vehicle Details</h3>
                <p><strong>Vehicle Type:</strong> {shipmentData.vehicleType}</p>
                <p><strong>Truck Model:</strong> {shipmentData.truckType || shipmentData.truck}</p>
                <p><strong>Container:</strong> {shipmentData.container}</p>
                <p><strong>Priority:</strong> {shipmentData.priority ? 'High' : 'Standard'}</p>
              </div>
            </div>
          </div>

          <div className="page-break"></div>

          <div className="load-details">
            <h2 className="section-title">Load Details</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>Cargo Information</h3>
                <p><strong>Description:</strong> {shipmentData.loadDescription || shipmentData.load}</p>
                <p><strong>Weight:</strong> {shipmentData.weight}</p>
                <p><strong>Special Requirements:</strong> {shipmentData.priority ? 'High Priority Handling' : 'Standard'}</p>
              </div>
              <div className="info-card">
                <h3>Timeline</h3>
                <p><strong>Created:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> Just now</p>
                <p><strong>Current Progress:</strong> {shipmentData.progress || 30}%</p>
              </div>
            </div>
          </div>

          {shipmentData.driver && (
            <div className="driver-section">
              <h2 className="section-title">Driver Information</h2>
              <div className="info-card">
                <p><strong>Name:</strong> {shipmentData.driver.name}</p>
                <p><strong>Phone:</strong> {shipmentData.driver.phone}</p>
                <p><strong>License:</strong> {shipmentData.driver.license}</p>
                <p><strong>Vehicle:</strong> {shipmentData.driver.vehicle}</p>
              </div>
            </div>
          )}

          <div className="footer">
            <p><em>Generated by Shipment Tracker System</em></p>
            <p><em>Confidential - For authorized use only</em></p>
          </div>
        </div>
      </div>

      <div className="print-preview no-print">
        <h3>Print Preview</h3>
        <div className="preview-note">
          <p>Click "Print Report" to open the print dialog. The preview above shows how the document will appear when printed.</p>
        </div>
      </div>
    </div>
  );
}