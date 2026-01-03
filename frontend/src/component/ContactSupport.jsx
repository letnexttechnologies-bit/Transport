import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/contactsupport.css';

export default function ContactSupport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { shipmentId, shipmentData } = location.state || {};
  
  const [contactMethod, setContactMethod] = useState('phone');
  const [message, setMessage] = useState('');

  const contactOptions = [
    {
      id: 'phone',
      icon: '📞',
      title: t('contactSupport.phoneSupport'),
      description: t('contactSupport.call247Support'),
      details: '+1 (800) 123-4567',
      action: t('contactSupport.callNow')
    },
    {
      id: 'email',
      icon: '📧',
      title: t('contactSupport.emailSupport'),
      description: t('contactSupport.sendUsEmail'),
      details: 'support@shipmenttracker.com',
      action: t('contactSupport.sendEmail')
    },
    {
      id: 'chat',
      icon: '💬',
      title: t('contactSupport.liveChat'),
      description: t('contactSupport.chatWithSupport'),
      details: t('contactSupport.available247'),
      action: t('contactSupport.startChat')
    }
  ];

  const handleContactAction = () => {
    const method = contactOptions.find(opt => opt.id === contactMethod);
    
    switch(contactMethod) {
      case 'phone':
        window.open(`tel:${method.details}`, '_self');
        break;
      case 'email':
        const subject = t('contactSupport.supportRequestSubject', { shipmentId });
        const body = t('contactSupport.supportRequestBody', { shipmentId, message });
        window.open(`mailto:${method.details}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        break;
      case 'chat':
        alert(t('contactSupport.liveChatAlert'));
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
          {t('contactSupport.back')}
        </button>
        <h1>{t('contactSupport.title')}</h1>
        {shipmentId && (
          <div className="shipment-context">
            {t('contactSupport.regardingShipment')} <strong>#{shipmentId}</strong>
          </div>
        )}
      </div>

      <div className="support-content">
        <div className="contact-methods">
          <h2>{t('contactSupport.chooseContactMethod')}</h2>
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
          <h2>{t('contactSupport.describeIssue')}</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('contactSupport.issuePlaceholder')}
            rows="6"
          />
          
          {shipmentData && (
            <div className="shipment-preview">
              <h4>{t('contactSupport.shipmentDetails')}</h4>
              <div className="shipment-info">
                <span><strong>{t('contactSupport.route')}</strong> {shipmentData.origin} → {shipmentData.destination}</span>
                <span><strong>{t('contactSupport.status')}</strong> {shipmentData.status}</span>
                <span><strong>{t('contactSupport.vehicle')}</strong> {shipmentData.vehicleType}</span>
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            {t('contactSupport.cancel')}
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