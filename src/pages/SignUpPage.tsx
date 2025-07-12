import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
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
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      <AuthModal
        isOpen={isOpen}
        onClose={handleClose}
        mode="signup"
        onSwitchMode={handleSwitchMode}
      />
    </div>
  );
};

export default SignUpPage;