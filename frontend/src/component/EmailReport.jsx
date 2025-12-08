import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './emailreport.css';

export default function EmailReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shipmentId, shipmentData } = location.state || {};
  
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: `Shipment Report - ${shipmentId}`,
    message: '',
    includeDocuments: true,
    reportType: 'summary'
  });

  const reportTypes = [
    { id: 'summary', label: 'Summary Report', description: 'Basic shipment overview' },
    { id: 'detailed', label: 'Detailed Report', description: 'Complete shipment details' },
    { id: 'financial', label: 'Financial Report', description: 'Costs and invoices' },
    { id: 'tracking', label: 'Tracking Report', description: 'Location and status history' }
  ];

  const handleInputChange = (field, value) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendEmail = () => {
    const { recipient, subject, message, reportType } = emailData;
    
    if (!recipient) {
      alert('Please enter recipient email address');
      return;
    }

    const baseMessage = `Shipment Report - ${shipmentId}

Route: ${shipmentData?.origin} → ${shipmentData?.destination}
Status: ${shipmentData?.status}
Vehicle Type: ${shipmentData?.vehicleType}
ETA: ${shipmentData?.eta}

${message}

---
This is an automated report from Shipment Tracker.
Report Type: ${reportTypes.find(r => r.id === reportType)?.label}`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(baseMessage)}`;
    window.open(mailtoLink, '_blank');
    
    // Save email history
    const emailHistory = JSON.parse(localStorage.getItem('emailReports') || '[]');
    emailHistory.push({
      shipmentId,
      recipient,
      subject,
      timestamp: new Date().toISOString(),
      reportType
    });
    localStorage.setItem('emailReports', JSON.stringify(emailHistory));
    
    alert('Email client opened with pre-filled report!');
  };

  const handleQuickTemplate = (templateType) => {
    const templates = {
      summary: `Please find the summary report for shipment ${shipmentId} attached.`,
      urgent: `URGENT: Requires immediate attention for shipment ${shipmentId}`,
      update: `Status update for shipment ${shipmentId}`
    };
    
    setEmailData(prev => ({
      ...prev,
      message: templates[templateType] || ''
    }));
  };

  return (
    <div className="email-report-container">
      <div className="email-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Email Report</h1>
        {shipmentId && (
          <div className="shipment-context">
            Shipment: <strong>#{shipmentId}</strong>
          </div>
        )}
      </div>

      <div className="email-content">
        <div className="email-form">
          <div className="form-group">
            <label>Recipient Email *</label>
            <input
              type="email"
              value={emailData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Report Type</label>
            <div className="report-type-grid">
              {reportTypes.map(type => (
                <div
                  key={type.id}
                  className={`type-card ${emailData.reportType === type.id ? 'active' : ''}`}
                  onClick={() => handleInputChange('reportType', type.id)}
                >
                  <h4>{type.label}</h4>
                  <p>{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              value={emailData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Add your message here..."
              rows="8"
            />
          </div>

          <div className="quick-templates">
            <h4>Quick Templates:</h4>
            <div className="template-buttons">
              <button onClick={() => handleQuickTemplate('summary')}>Summary</button>
              <button onClick={() => handleQuickTemplate('urgent')}>Urgent</button>
              <button onClick={() => handleQuickTemplate('update')}>Update</button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={emailData.includeDocuments}
                onChange={(e) => handleInputChange('includeDocuments', e.target.checked)}
              />
              Include supporting documents
            </label>
          </div>
        </div>

        <div className="email-preview">
          <h3>Preview</h3>
          <div className="preview-content">
            <p><strong>To:</strong> {emailData.recipient || 'recipient@example.com'}</p>
            <p><strong>Subject:</strong> {emailData.subject}</p>
            <div className="preview-message">
              {emailData.message || 'Your message will appear here...'}
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button 
          className="btn-primary" 
          onClick={handleSendEmail}
          disabled={!emailData.recipient}
        >
          📧 Open Email Client
        </button>
      </div>
    </div>
  );
}