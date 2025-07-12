import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/');
  };

  const handleSwitchMode = () => {
    navigate('/signup');
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      mode="login"
      onSwitchMode={handleSwitchMode}
    />
  );
};

export default SignInPage;