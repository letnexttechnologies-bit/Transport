import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/reportissue.css';

export default function ReportIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { shipmentId, shipmentData } = location.state || {};
  
  const [issueData, setIssueData] = useState({
    issueType: '',
    priority: 'medium',
    description: '',
    contactEmail: '',
    attachments: [],
    followUp: true
  });

  const issueTypes = [
    { id: 'delay', label: t('reportIssue.deliveryDelay'), icon: '⏰' },
    { id: 'damage', label: t('reportIssue.cargoDamage'), icon: '🚨' },
    { id: 'lost', label: t('reportIssue.lostShipment'), icon: '🔍' },
    { id: 'document', label: t('reportIssue.documentIssue'), icon: '📄' },
    { id: 'vehicle', label: t('reportIssue.vehicleProblem'), icon: '🚛' },
    { id: 'other', label: t('reportIssue.otherIssue'), icon: '❓' }
  ];

  const priorityLevels = [
    { id: 'low', label: t('reportIssue.low'), color: '#28a745' },
    { id: 'medium', label: t('reportIssue.medium'), color: '#ffc107' },
    { id: 'high', label: t('reportIssue.high'), color: '#fd7e14' },
    { id: 'urgent', label: t('reportIssue.urgent'), color: '#dc3545' }
  ];

  const handleInputChange = (field, value) => {
    setIssueData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setIssueData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setIssueData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitIssue = () => {
    if (!issueData.issueType || !issueData.description) {
      alert(t('reportIssue.fillRequiredFields'));
      return;
    }

    const issueReport = {
      id: `ISSUE-${Date.now()}`,
      shipmentId,
      ...issueData,
      timestamp: new Date().toISOString(),
      status: 'submitted'
    };

    // Save to localStorage
    const existingIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
    existingIssues.push(issueReport);
    localStorage.setItem('reportedIssues', JSON.stringify(existingIssues));

    // Show confirmation
    alert(t('reportIssue.issueReportedSuccess', { issueId: issueReport.id }));
    
    // Navigate back or to confirmation page
    navigate(-1);
  };

  const selectedIssueType = issueTypes.find(type => type.id === issueData.issueType);

  return (
    <div className="report-issue-container">
      <div className="issue-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          {t('reportIssue.back')}
        </button>
        <h1>{t('reportIssue.title')}</h1>
        {shipmentId && (
          <div className="shipment-context">
            {t('reportIssue.regardingShipment')} <strong>#{shipmentId}</strong>
          </div>
        )}
      </div>

      <div className="issue-content">
        <div className="issue-form">
          <div className="form-section">
            <h2>{t('reportIssue.issueType')}</h2>
            <div className="issue-type-grid">
              {issueTypes.map(type => (
                <div
                  key={type.id}
                  className={`type-card ${issueData.issueType === type.id ? 'active' : ''}`}
                  onClick={() => handleInputChange('issueType', type.id)}
                >
                  <div className="type-icon">{type.icon}</div>
                  <div className="type-label">{type.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>{t('reportIssue.priorityLevel')}</h2>
            <div className="priority-grid">
              {priorityLevels.map(priority => (
                <div
                  key={priority.id}
                  className={`priority-card ${issueData.priority === priority.id ? 'active' : ''}`}
                  onClick={() => handleInputChange('priority', priority.id)}
                  style={{ borderColor: priority.color }}
                >
                  <div 
                    className="priority-indicator"
                    style={{ backgroundColor: priority.color }}
                  ></div>
                  <div className="priority-label">{priority.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>{t('reportIssue.issueDetails')}</h2>
            <div className="form-group">
              <label>{t('reportIssue.description')}</label>
              <textarea
                value={issueData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('reportIssue.descriptionPlaceholder')}
                rows="6"
              />
            </div>

            <div className="form-group">
              <label>{t('reportIssue.contactEmail')}</label>
              <input
                type="email"
                value={issueData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder={t('reportIssue.emailPlaceholder')}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>{t('reportIssue.attachments')}</h2>
            <div className="file-upload">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="upload-button">
                {t('reportIssue.addFiles')}
              </label>
              
              {issueData.attachments.length > 0 && (
                <div className="attachments-list">
                  {issueData.attachments.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <span className="file-name">{file.name}</span>
                      <button 
                        className="remove-file"
                        onClick={() => removeAttachment(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={issueData.followUp}
                onChange={(e) => handleInputChange('followUp', e.target.checked)}
              />
              {t('reportIssue.sendUpdates')}
            </label>
          </div>
        </div>

        <div className="issue-preview">
          <h3>{t('reportIssue.issueSummary')}</h3>
          <div className="preview-card">
            {selectedIssueType && (
              <div className="preview-item">
                <strong>{t('reportIssue.issueTypeLabel')}</strong> {selectedIssueType.label}
              </div>
            )}
            <div className="preview-item">
              <strong>{t('reportIssue.priorityLabel')}</strong> 
              <span className={`priority-badge priority-${issueData.priority}`}>
                {priorityLevels.find(p => p.id === issueData.priority)?.label}
              </span>
            </div>
            {shipmentId && (
              <div className="preview-item">
                <strong>{t('reportIssue.shipmentLabel')}</strong> #{shipmentId}
              </div>
            )}
            {issueData.description && (
              <div className="preview-item">
                <strong>{t('reportIssue.descriptionLabel')}</strong>
                <p>{issueData.description.substring(0, 100)}...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <center>{t('reportIssue.cancel')}</center>
        </button>
        <button 
          className="btn-warning" 
          onClick={handleSubmitIssue}
          disabled={!issueData.issueType || !issueData.description}
        >
          {t('reportIssue.submitIssueReport')}
        </button>
      </div>
    </div>
  );
}