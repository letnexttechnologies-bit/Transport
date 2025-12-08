import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './reportissue.css';

export default function ReportIssue() {
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
    { id: 'delay', label: 'Delivery Delay', icon: '⏰' },
    { id: 'damage', label: 'Cargo Damage', icon: '🚨' },
    { id: 'lost', label: 'Lost Shipment', icon: '🔍' },
    { id: 'document', label: 'Document Issue', icon: '📄' },
    { id: 'vehicle', label: 'Vehicle Problem', icon: '🚛' },
    { id: 'other', label: 'Other Issue', icon: '❓' }
  ];

  const priorityLevels = [
    { id: 'low', label: 'Low', color: '#28a745' },
    { id: 'medium', label: 'Medium', color: '#ffc107' },
    { id: 'high', label: 'High', color: '#fd7e14' },
    { id: 'urgent', label: 'Urgent', color: '#dc3545' }
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
      alert('Please fill in all required fields');
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
    alert(`Issue reported successfully!\n\nReference: ${issueReport.id}\nOur team will contact you within 24 hours.`);
    
    // Navigate back or to confirmation page
    navigate(-1);
  };

  const selectedIssueType = issueTypes.find(type => type.id === issueData.issueType);

  return (
    <div className="report-issue-container">
      <div className="issue-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Report Issue</h1>
        {shipmentId && (
          <div className="shipment-context">
            Regarding Shipment: <strong>#{shipmentId}</strong>
          </div>
        )}
      </div>

      <div className="issue-content">
        <div className="issue-form">
          <div className="form-section">
            <h2>1. Issue Type</h2>
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
            <h2>2. Priority Level</h2>
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
            <h2>3. Issue Details</h2>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={issueData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please provide a detailed description of the issue..."
                rows="6"
              />
            </div>

            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={issueData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="Your email for follow-up"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>4. Attachments (Optional)</h2>
            <div className="file-upload">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="upload-button">
                📎 Add Files
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
              Send me updates about this issue
            </label>
          </div>
        </div>

        <div className="issue-preview">
          <h3>Issue Summary</h3>
          <div className="preview-card">
            {selectedIssueType && (
              <div className="preview-item">
                <strong>Issue Type:</strong> {selectedIssueType.label}
              </div>
            )}
            <div className="preview-item">
              <strong>Priority:</strong> 
              <span className={`priority-badge priority-${issueData.priority}`}>
                {priorityLevels.find(p => p.id === issueData.priority)?.label}
              </span>
            </div>
            {shipmentId && (
              <div className="preview-item">
                <strong>Shipment:</strong> #{shipmentId}
              </div>
            )}
            {issueData.description && (
              <div className="preview-item">
                <strong>Description:</strong>
                <p>{issueData.description.substring(0, 100)}...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <center>Cancel</center>
        </button>
        <button 
          className="btn-warning" 
          onClick={handleSubmitIssue}
          disabled={!issueData.issueType || !issueData.description}
        >
          🚨 Submit Issue Report
        </button>
      </div>
    </div>
  );
}