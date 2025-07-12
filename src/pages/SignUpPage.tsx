import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/');
  };

  const handleSwitchMode = () => {
    navigate('/signin');
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      mode="signup"
      onSwitchMode={handleSwitchMode}
    />
  );
};

export default SignUpPage;