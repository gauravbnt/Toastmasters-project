import React, { useState } from 'react';
import { Container, Card, Tab, Tabs } from 'react-bootstrap';
import ProfileEditForm from '../components/ProfileEditForm';
import PasswordChangeForm from '../components/PasswordChangeForm';

const Profile = () => {
  const [key, setKey] = useState('profile');

  return (
    <Container className="py-4">
      <Card>
        <Card.Header>
          <Tabs
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
          >
            <Tab eventKey="profile" title="Profile Information">
              <ProfileEditForm />
            </Tab>
            <Tab eventKey="password" title="Change Password">
              <PasswordChangeForm />
            </Tab>
          </Tabs>
        </Card.Header>
      </Card>
    </Container>
  );
};

export default Profile;
