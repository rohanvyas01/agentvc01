import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserFlowProvider } from './contexts/UserFlowContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/WorkingDashboard';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingPage from './pages/OnboardingPage';
import SetupSessionPage from './pages/SetupSessionPage';
import { ConversationPage } from './pages/ConversationPage';

function App() {
  return (
    <AuthProvider>
      <UserFlowProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/onboarding"
            element={
              <OnboardingPage />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/setup-session"
            element={
              <ProtectedRoute>
                <SetupSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversation/:sessionId"
            element={
              <ProtectedRoute>
                <ConversationPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </UserFlowProvider>
    </AuthProvider>
  );
}

export default App;

