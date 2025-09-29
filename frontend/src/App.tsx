import { useState, useEffect } from 'react';
import SplashScreen from './components/utils/splash';
import OnboardingFlow from './components/utils/steps';
import HomeScreen from './layouts/home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFoundPage from './components/utils/foundPage';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './AuthStore/store';
import PublicRoute from './AuthStore/publicRole';
import ProtectedRoute from './AuthStore/protectedRole';
import { useSelector } from 'react-redux';
import type { RootState } from './AuthStore/store';
import AdminLayout from './layouts/admin/adminLayout';
import AdminDashboard from './layouts/admin/components/AdminDashboard';
import UsersManagement from './layouts/admin/components/userManagement';
import AnnoncesManagement from './layouts/admin/components/AnnoncesManagement';
import AdminReports from './layouts/admin/components/AdminReports';
import FeedBackAdmin from './layouts/admin/components/AdminFeedBack';

const StudentDashboard = () => (
  <div className="min-h-screen bg-green-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Dashboard</h1>
      <p className="text-gray-600">Welcome to student dashboard!</p>
    </div>
  </div>
);

const NonStudentDashboard = () => (
  <div className="min-h-screen bg-blue-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Non-Student Dashboard</h1>
      <p className="text-gray-600">Welcome to non-student dashboard!</p>
    </div>
  </div>
);

function AppContent() {
  const [currentView, setCurrentView] = useState<'splash' | 'onboarding' | 'main'>('splash');
  const { isAuth } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('Authentication status:', isAuth);
    console.log('Onboarding completed:', localStorage.getItem('onboardingCompleted'));

    if (isAuth) {
      console.log('User is authenticated, skipping to main');
      setCurrentView('main');
      return;
    }

    const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

    if (onboardingCompleted) {
      console.log('Onboarding already completed, going to main');
      setCurrentView('main');
    } else {
      console.log('Showing splash screen for new user');
      setCurrentView('splash');
    }
  }, [isAuth]);

  const handleSplashFinish = () => {
    console.log('Splash finished, showing onboarding');
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = () => {
    console.log('Onboarding completed');
    localStorage.setItem('onboardingCompleted', 'true');
    setCurrentView('main');
  };

  const handleOnboardingSkip = () => {
    console.log('Onboarding skipped');
    localStorage.setItem('onboardingCompleted', 'true');
    setCurrentView('main');
  };

  if (isAuth) {
    return (
      <Router>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/annonces" element={<AnnoncesManagement />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/feedbacks" element={<FeedBackAdmin />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['non-student']} />}>
            <Route path="/nonstudent/dashboard" element={<NonStudentDashboard />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    );
  }

  return (
    <>
      {currentView === 'splash' && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}

      {currentView === 'onboarding' && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {currentView === 'main' && (
        <Router>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/login" element={<HomeScreen />} />
              <Route path="/register" element={<HomeScreen />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;