import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  margin: 0 0 30px;
  color: #1a1a2e;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  background-color: #667eea;
  color: white;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const InfoBox = styled.div`
  background-color: #e7f3ff;
  border-left: 4px solid #667eea;
  padding: 15px;
  margin: 20px 0;
  border-radius: 5px;
`;

const Settings: React.FC = () => {
  return (
    <Container>
      <Title>Settings</Title>

      <Section>
        <SectionTitle>Store Information</SectionTitle>
        <FormGroup>
          <Label>Store Name</Label>
          <Input type="text" defaultValue="FreshRoute" />
        </FormGroup>
        <FormGroup>
          <Label>Store Email</Label>
          <Input type="email" defaultValue="admin@freshroute.zw" />
        </FormGroup>
        <FormGroup>
          <Label>Store Phone</Label>
          <Input type="tel" defaultValue="+263 xxx xxxx" />
        </FormGroup>
        <Button>Save Store Information</Button>
      </Section>

      <Section>
        <SectionTitle>Notifications</SectionTitle>
        <FormGroup>
          <Label>
            <input type="checkbox" defaultChecked /> Email notifications for new orders
          </Label>
        </FormGroup>
        <FormGroup>
          <Label>
            <input type="checkbox" defaultChecked /> Email notifications for low stock
          </Label>
        </FormGroup>
        <FormGroup>
          <Label>
            <input type="checkbox" /> SMS notifications for critical alerts
          </Label>
        </FormGroup>
        <Button>Save Notification Preferences</Button>
      </Section>

      <Section>
        <SectionTitle>Tax & Shipping</SectionTitle>
        <FormGroup>
          <Label>Default Tax Rate (%)</Label>
          <Input type="number" defaultValue="15" step="0.01" />
        </FormGroup>
        <FormGroup>
          <Label>Free Shipping Threshold ($)</Label>
          <Input type="number" defaultValue="100" />
        </FormGroup>
        <FormGroup>
          <Label>Standard Shipping Cost ($)</Label>
          <Input type="number" defaultValue="10" step="0.01" />
        </FormGroup>
        <Button>Save Tax & Shipping Settings</Button>
      </Section>

      <InfoBox>
        <strong>Note:</strong> These settings are for demonstration purposes. In a production
        environment, these would be connected to a backend API.
      </InfoBox>
    </Container>
  );
};

export default Settings;
