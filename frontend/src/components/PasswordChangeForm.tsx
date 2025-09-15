import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const PasswordChangeForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    try {
      await axios.put('/api/user/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setMessage('Password updated successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage('Failed to update password');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3">
      {message && <Alert variant="info">{message}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Current Password</Form.Label>
        <Form.Control
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>New Password</Form.Label>
        <Form.Control
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Confirm New Password</Form.Label>
        <Form.Control
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        />
      </Form.Group>
      <Button type="submit" variant="primary">
        Change Password
      </Button>
    </Form>
  );
};

export default PasswordChangeForm;
