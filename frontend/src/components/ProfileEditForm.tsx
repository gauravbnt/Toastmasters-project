import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ProfileEditForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user/profile');
        setFormData(response.data);
      } catch (error) {
        setMessage('Failed to load user data');
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/user/profile', formData);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Failed to update profile');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3">
      {message && <Alert variant="info">{message}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Full Name</Form.Label>
        <Form.Control
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Phone</Form.Label>
        <Form.Control
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </Form.Group>
      <Button type="submit" variant="primary">
        Update Profile
      </Button>
    </Form>
  );
};

export default ProfileEditForm;
