import { useState, useEffect } from 'react';
import SplashScreen from './components/utils/splash';
import OnboardingFlow from './components/utils/steps';
import HomeScreen from './layouts/home';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import OwnerLayout from './layouts/owner/ownerLayout';
import OwnerAnnonces from './layouts/owner/OwnerAnnonces';
import UserLayout from './layouts/etudiant/UserLayout';
import UserProperties from './layouts/etudiant/UserProperties';
import UserDashboard from './layouts/etudiant/userDashboard';



const NonStudentDashboard = () => (
  <div className="min-h-screen bg-blue-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Non-Student Dashboard</h1>
      <p className="text-gray-600">Welcome to non-student dashboard!</p>
    </div>
  </div>
);

const OwnerDashboard = () => (
  <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Owner Dashboard</h1>
      <p className="text-gray-600">Welcome to owner dashboard!</p>
    </div>
  </div>
);

function AppContent() {
  const [currentView, setCurrentView] = useState<'splash' | 'onboarding' | 'main'>('splash');
  const [isLoading, setIsLoading] = useState(true);
  const { isAuth } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Authentication status:', isAuth);

        // Check if onboarding was completed
        const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

        // If user is authenticated, go directly to main
        if (isAuth) {
          console.log('User is authenticated, skipping to main');
          setCurrentView('main');
          return;
        }

        // If onboarding was completed, go to main
        if (onboardingCompleted) {
          console.log('Onboarding already completed, going to main');
          setCurrentView('main');
        } else {
          console.log('Showing splash screen for new user');
          setCurrentView('splash');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setCurrentView('main'); // Fallback to main view on error
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
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

  // Show loading state while checking authentication and onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render appropriate content based on current view and authentication status
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
            {/* Public routes - only accessible when not authenticated */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/login" element={<HomeScreen />} />
              <Route path="/register" element={<HomeScreen />} />
            </Route>

            {/* Protected routes - only accessible when authenticated */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'non-student']} />}>
              <Route path="/user/*" element={<UserLayout />}>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="properties" element={<UserProperties />} />
                <Route index element={<Navigate to="/user/dashboard" replace />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="annonces" element={<AnnoncesManagement />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="feedbacks" element={<FeedBackAdmin />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['non-student']} />}>
              <Route path="/nonstudent/dashboard" element={<NonStudentDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
              <Route path="/owner/*" element={<OwnerLayout />}>
                <Route path="dashboard" element={<OwnerDashboard />} />
                <Route path="annonces" element={<OwnerAnnonces />} />
                {/* <Route path="create-annonce" element={<CreateAnnonceModal />} />
                <Route path="reservations" element={<OwnerReservations />} />
                <Route path="profile" element={<OwnerProfile />} /> */}
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Redirect root to home when not authenticated, or to appropriate dashboard when authenticated */}
            <Route
              path="/"
              element={
                isAuth ?
                  <Navigate to="/student/dashboard" replace /> :
                  <Navigate to="/" replace />
              }
            />

            {/* Catch all route */}
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