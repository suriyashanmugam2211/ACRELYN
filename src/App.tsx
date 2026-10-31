import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { SavedPage } from './pages/SavedPage';
import { ComparePage } from './pages/ComparePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// Admin imports
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPropertiesPage } from './pages/admin/AdminPropertiesPage';
import { AdminPropertyForm } from './pages/admin/AdminPropertyForm';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Scroll to top component on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Public layout wrapper with Navbar & Footer
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] text-[#17211D]">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/explore"
          element={
            <PublicLayout>
              <ExplorePage />
            </PublicLayout>
          }
        />
        <Route
          path="/property/:id"
          element={
            <PublicLayout>
              <PropertyDetailPage />
            </PublicLayout>
          }
        />
        <Route
          path="/saved"
          element={
            <PublicLayout>
              <SavedPage />
            </PublicLayout>
          }
        />
        <Route
          path="/compare"
          element={
            <PublicLayout>
              <ComparePage />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          }
        />
        <Route
          path="/faq"
          element={
            <PublicLayout>
              <FaqPage />
            </PublicLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <PublicLayout>
              <PrivacyPage />
            </PublicLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <PublicLayout>
              <TermsPage />
            </PublicLayout>
          }
        />

        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="properties" element={<AdminPropertiesPage />} />
          <Route path="properties/new" element={<AdminPropertyForm />} />
          <Route path="properties/:id/edit" element={<AdminPropertyForm />} />
          <Route path="enquiries" element={<AdminEnquiriesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 CATCH-ALL */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <div className="max-w-md mx-auto text-center py-24 px-4 space-y-4">
                <h1 className="font-serif text-3xl font-bold text-[#0B3D2E]">Page Not Found</h1>
                <p className="text-xs text-[#647067]">The requested address does not exist on Acrelyn.</p>
                <a
                  href="/"
                  className="inline-block px-4 py-2 bg-[#0B3D2E] text-white text-xs font-semibold rounded-lg"
                >
                  Return to Homepage
                </a>
              </div>
            </PublicLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
