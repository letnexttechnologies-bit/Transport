import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/emailreport.css';

export default function EmailReport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { shipmentId, shipmentData } = location.state || {};
  
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: t('emailReport.shipmentReportSubject', { shipmentId }),
    message: '',
    includeDocuments: true,
    reportType: 'summary'
  });

  const reportTypes = [
    { id: 'summary', label: t('emailReport.summaryReport'), description: t('emailReport.basicShipmentOverview') },
    { id: 'detailed', label: t('emailReport.detailedReport'), description: t('emailReport.completeShipmentDetails') },
    { id: 'financial', label: t('emailReport.financialReport'), description: t('emailReport.costsAndInvoices') },
    { id: 'tracking', label: t('emailReport.trackingReport'), description: t('emailReport.locationAndStatusHistory') }
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
      alert(t('emailReport.enterRecipientEmail'));
      return;
    }

    const baseMessage = t('emailReport.shipmentReportBody', {
      shipmentId,
      origin: shipmentData?.origin,
      destination: shipmentData?.destination,
      status: shipmentData?.status,
      vehicleType: shipmentData?.vehicleType,
      eta: shipmentData?.eta,
      message,
      reportType: reportTypes.find(r => r.id === reportType)?.label
    });

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
    
    alert(t('emailReport.emailClientOpened'));
  };

  const handleQuickTemplate = (templateType) => {
    const templates = {
      summary: t('emailReport.summaryTemplate', { shipmentId }),
      urgent: t('emailReport.urgentTemplate', { shipmentId }),
      update: t('emailReport.updateTemplate', { shipmentId })
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
          {t('emailReport.back')}
        </button>
        <h1>{t('emailReport.title')}</h1>
        {shipmentId && (
          <div className="shipment-context">
            {t('emailReport.shipment')} <strong>#{shipmentId}</strong>
          </div>
        )}
      </div>

      <div className="email-content">
        <div className="email-form">
          <div className="form-group">
            <label>{t('emailReport.recipientEmail')}</label>
            <input
              type="email"
              value={emailData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder={t('emailReport.emailPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('emailReport.subject')}</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t('emailReport.reportType')}</label>
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
            <label>{t('emailReport.message')}</label>
            <textarea
              value={emailData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={t('emailReport.messagePlaceholder')}
              rows="8"
            />
          </div>

          <div className="quick-templates">
            <h4>{t('emailReport.quickTemplates')}</h4>
            <div className="template-buttons">
              <button onClick={() => handleQuickTemplate('summary')}>{t('emailReport.summary')}</button>
              <button onClick={() => handleQuickTemplate('urgent')}>{t('emailReport.urgent')}</button>
              <button onClick={() => handleQuickTemplate('update')}>{t('emailReport.update')}</button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={emailData.includeDocuments}
                onChange={(e) => handleInputChange('includeDocuments', e.target.checked)}
              />
              {t('emailReport.includeDocuments')}
            </label>
          </div>
        </div>

        <div className="email-preview">
          <h3>{t('emailReport.preview')}</h3>
          <div className="preview-content">
            <p><strong>{t('emailReport.to')}</strong> {emailData.recipient || 'recipient@example.com'}</p>
            <p><strong>{t('emailReport.subject')}</strong> {emailData.subject}</p>
            <div className="preview-message">
              {emailData.message || t('emailReport.yourMessageWillAppear')}
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          {t('emailReport.cancel')}
        </button>
        <button 
          className="btn-primary" 
          onClick={handleSendEmail}
          disabled={!emailData.recipient}
        >
          {t('emailReport.openEmailClient')}
        </button>
      </div>
    </div>
  );
}