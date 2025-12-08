import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './contactsupport.css';

export default function ContactSupport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shipmentId, shipmentData } = location.state || {};
  
  const [contactMethod, setContactMethod] = useState('phone');
  const [message, setMessage] = useState('');

  const contactOptions = [
    {
      id: 'phone',
      icon: '📞',
      title: 'Phone Support',
      description: 'Call our 24/7 support line',
      details: '+1 (800) 123-4567',
      action: 'Call Now'
    },
    {
      id: 'email',
      icon: '📧',
      title: 'Email Support',
      description: 'Send us an email',
      details: 'support@shipmenttracker.com',
      action: 'Send Email'
    },
    {
      id: 'chat',
      icon: '💬',
      title: 'Live Chat',
      description: 'Chat with our support team',
      details: 'Available 24/7',
      action: 'Start Chat'
    }
  ];

  const handleContactAction = () => {
    const method = contactOptions.find(opt => opt.id === contactMethod);
    
    switch(contactMethod) {
      case 'phone':
        window.open(`tel:${method.details}`, '_self');
        break;
      case 'email':
        const subject = `Support Request - Shipment ${shipmentId}`;
        const body = `Shipment ID: ${shipmentId}\n\nIssue Description:\n${message}`;
        window.open(`mailto:${method.details}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        break;
      case 'chat':
        alert('Live chat would open here. In a real app, this would connect to your chat service.');
        break;
      default:
        break;
    }
  };

  const selectedMethod = contactOptions.find(opt => opt.id === contactMethod);

  return (
    <div className="contact-support-container">
      <div className="support-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Contact Support</h1>
        {shipmentId && (
          <div className="shipment-context">
            Regarding Shipment: <strong>#{shipmentId}</strong>
          </div>
        )}
      </div>

      <div className="support-content">
        <div className="contact-methods">
          <h2>Choose Contact Method</h2>
          <div className="method-grid">
            {contactOptions.map(method => (
              <div
                key={method.id}
                className={`method-card ${contactMethod === method.id ? 'active' : ''}`}
                onClick={() => setContactMethod(method.id)}
              >
                <div className="method-icon">{method.icon}</div>
                <div className="method-info">
                  <h3>{method.title}</h3>
                  <p>{method.description}</p>
                  <span className="method-details">{method.details}</span>
                </div>
                <div className="method-action">
                  {method.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="message-section">
          <h2>Describe Your Issue</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please describe the issue you're experiencing with your shipment..."
            rows="6"
          />
          
          {shipmentData && (
            <div className="shipment-preview">
              <h4>Shipment Details:</h4>
              <div className="shipment-info">
                <span><strong>Route:</strong> {shipmentData.origin} → {shipmentData.destination}</span>
                <span><strong>Status:</strong> {shipmentData.status}</span>
                <span><strong>Vehicle:</strong> {shipmentData.vehicleType}</span>
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleContactAction}
            disabled={!message && contactMethod !== 'phone'}
          >
            {selectedMethod?.action}
          </button>
        </div>
      </div>
    </div>
  );
}