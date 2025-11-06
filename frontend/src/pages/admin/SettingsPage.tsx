import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/common/Button';

const SettingsContainer = styled.div`
  max-width: 800px;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #00a859;
  padding-bottom: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #00a859;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #00a859;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #00a859;
  }
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'FreshRoute',
    storeDescription: 'Your trusted online grocery store in Zimbabwe',
    email: 'support@freshroute.co.zw',
    phone: '+263 xxx xxx xxx',
    address: 'Harare, Zimbabwe',
    currency: 'ZWL',
    taxRate: '15',
    freeShippingThreshold: '5000',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    orderNotifications: true,
    lowStockNotifications: true,
    newCustomerNotifications: true,
  });

  const handleStoreChange = (field: string, value: string) => {
    setStoreSettings({ ...storeSettings, [field]: value });
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings({ ...notificationSettings, [field]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <SettingsContainer>
      {saved && <SuccessMessage>Settings saved successfully!</SuccessMessage>}

      <Section>
        <SectionTitle>Store Information</SectionTitle>

        <FormGroup>
          <Label>Store Name</Label>
          <Input
            type="text"
            value={storeSettings.storeName}
            onChange={(e) => handleStoreChange('storeName', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Store Description</Label>
          <Textarea
            value={storeSettings.storeDescription}
            onChange={(e) => handleStoreChange('storeDescription', e.target.value)}
          />
          <HelpText>This will appear on your homepage and marketing materials</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Contact Email</Label>
          <Input
            type="email"
            value={storeSettings.email}
            onChange={(e) => handleStoreChange('email', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Contact Phone</Label>
          <Input
            type="tel"
            value={storeSettings.phone}
            onChange={(e) => handleStoreChange('phone', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Store Address</Label>
          <Textarea
            value={storeSettings.address}
            onChange={(e) => handleStoreChange('address', e.target.value)}
          />
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Business Settings</SectionTitle>

        <FormGroup>
          <Label>Currency</Label>
          <Select
            value={storeSettings.currency}
            onChange={(e) => handleStoreChange('currency', e.target.value)}
          >
            <option value="ZWL">ZWL - Zimbabwean Dollar</option>
            <option value="USD">USD - US Dollar</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Tax Rate (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={storeSettings.taxRate}
            onChange={(e) => handleStoreChange('taxRate', e.target.value)}
          />
          <HelpText>Default tax rate applied to all orders</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Free Shipping Threshold (ZWL)</Label>
          <Input
            type="number"
            value={storeSettings.freeShippingThreshold}
            onChange={(e) => handleStoreChange('freeShippingThreshold', e.target.value)}
          />
          <HelpText>Orders above this amount get free shipping</HelpText>
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Notification Preferences</SectionTitle>

        <FormGroup>
          <Label>
            <input
              type="checkbox"
              checked={notificationSettings.orderNotifications}
              onChange={(e) => handleNotificationChange('orderNotifications', e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Email notifications for new orders
          </Label>
        </FormGroup>

        <FormGroup>
          <Label>
            <input
              type="checkbox"
              checked={notificationSettings.lowStockNotifications}
              onChange={(e) => handleNotificationChange('lowStockNotifications', e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Email notifications for low stock items
          </Label>
        </FormGroup>

        <FormGroup>
          <Label>
            <input
              type="checkbox"
              checked={notificationSettings.newCustomerNotifications}
              onChange={(e) =>
                handleNotificationChange('newCustomerNotifications', e.target.checked)
              }
              style={{ marginRight: '0.5rem' }}
            />
            Email notifications for new customer registrations
          </Label>
        </FormGroup>
      </Section>

      <ButtonGroup>
        <Button onClick={handleSave}>Save Settings</Button>
      </ButtonGroup>
    </SettingsContainer>
  );
};

export default SettingsPage;
