import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/printdetails.css';

export default function PrintDetails() {
  const { t } = useTranslation();
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
      event.target.innerHTML = t('printDetails.generatingPDF');
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
      alert(t('printDetails.errorGeneratingPDF'));
      
      // Restore button state on error
      const button = event.target;
      button.innerHTML = t('printDetails.exportPDF');
      button.disabled = false;
    }
  };

  const handleExportWord = async () => {
    try {
      const element = printRef.current;
      
      // Show loading state
      const originalText = event.target.innerHTML;
      event.target.innerHTML = t('printDetails.generatingWord');
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
      alert(t('printDetails.errorGeneratingWord'));
      
      // Restore button state on error
      const button = event.target;
      button.innerHTML = t('printDetails.exportWord');
      button.disabled = false;
    }
  };

  if (!shipmentData) {
    return (
      <div className="print-details-container">
        <div className="loading-state">
          <p>{t('printDetails.loadingShipmentData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-details-container">
      <div className="print-header no-print">
        <button className="back-button" onClick={() => navigate(-1)}>
          {t('printDetails.back')}
        </button>
        <h1>{t('printDetails.title')}</h1>
        <div className="print-actions">
          <button className="btn-secondary" onClick={handleExportWord}>
            {t('printDetails.exportWord')}
          </button>
          {/* <button className="btn-secondary" onClick={handleExportPDF}>
            {t('printDetails.exportPDF')}
          </button> */}
          <button className="btn-primary" onClick={handlePrint}>
            {t('printDetails.printReport')}
          </button>
        </div>
      </div>

      <div className="print-content" ref={printRef}>
        <div className="printable-report">
          <div className="report-header">
            <h1>{t('printDetails.shipmentReport')}</h1>
            <div className="report-meta">
              <p><strong>{t('printDetails.reportGenerated')}</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>{t('printDetails.shipmentId')}</strong> #{shipmentId}</p>
            </div>
          </div>

          <div className="shipment-overview">
            <h2 className="section-title">{t('printDetails.shipmentOverview')}</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>{t('printDetails.routeInformation')}</h3>
                <p><strong>{t('printDetails.origin')}</strong> {shipmentData.origin}</p>
                <p><strong>{t('printDetails.destination')}</strong> {shipmentData.destination}</p>
                <p><strong>{t('printDetails.eta')}</strong> {shipmentData.eta}</p>
                <p><strong>{t('printDetails.status')}</strong> {shipmentData.status}</p>
              </div>
              <div className="info-card">
                <h3>{t('printDetails.vehicleDetails')}</h3>
                <p><strong>{t('printDetails.vehicleType')}</strong> {shipmentData.vehicleType}</p>
                <p><strong>{t('printDetails.truckModel')}</strong> {shipmentData.truckType || shipmentData.truck}</p>
                <p><strong>{t('printDetails.container')}</strong> {shipmentData.container}</p>
                <p><strong>{t('printDetails.priority')}</strong> {shipmentData.priority ? t('printDetails.high') : t('printDetails.standard')}</p>
              </div>
            </div>
          </div>

          <div className="page-break"></div>

          <div className="load-details">
            <h2 className="section-title">{t('printDetails.loadDetails')}</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>{t('printDetails.cargoInformation')}</h3>
                <p><strong>{t('printDetails.description')}</strong> {shipmentData.loadDescription || shipmentData.load}</p>
                <p><strong>{t('printDetails.weight')}</strong> {shipmentData.weight}</p>
                <p><strong>{t('printDetails.specialRequirements')}</strong> {shipmentData.priority ? t('printDetails.highPriorityHandling') : t('printDetails.standard')}</p>
              </div>
              <div className="info-card">
                <h3>{t('printDetails.timeline')}</h3>
                <p><strong>{t('printDetails.created')}</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>{t('printDetails.lastUpdated')}</strong> {t('printDetails.justNow')}</p>
                <p><strong>{t('printDetails.currentProgress')}</strong> {shipmentData.progress || 30}%</p>
              </div>
            </div>
          </div>

          {shipmentData.driver && (
            <div className="driver-section">
              <h2 className="section-title">{t('printDetails.driverInformation')}</h2>
              <div className="info-card">
                <p><strong>{t('printDetails.name')}</strong> {shipmentData.driver.name}</p>
                <p><strong>{t('printDetails.phone')}</strong> {shipmentData.driver.phone}</p>
                <p><strong>{t('printDetails.license')}</strong> {shipmentData.driver.license}</p>
                <p><strong>{t('printDetails.vehicle')}</strong> {shipmentData.driver.vehicle}</p>
              </div>
            </div>
          )}

          <div className="footer">
            <p><em>{t('printDetails.generatedBy')}</em></p>
            <p><em>{t('printDetails.confidential')}</em></p>
          </div>
        </div>
      </div>

      <div className="print-preview no-print">
        <h3>{t('printDetails.printPreview')}</h3>
        <div className="preview-note">
          <p>{t('printDetails.printPreviewNote')}</p>
        </div>
      </div>
    </div>
  );
}