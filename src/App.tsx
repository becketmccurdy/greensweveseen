import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseTracker from './pages/CourseTracker';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import JoinInvitation from './pages/JoinInvitation';
import { AuthProvider } from './lib/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const theme = extendTheme({});

function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <Router>
          <AuthProvider>
          <Box minH="100vh">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/track-course" element={
                <ProtectedRoute>
                  <CourseTracker />
                </ProtectedRoute>
              } />
              <Route path="/edit-round/:id" element={
                <ProtectedRoute>
                  <CourseTracker />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/friends" element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              } />
              <Route path="/join/:inviteCode" element={<JoinInvitation />} />
            </Routes>
          </Box>
          </AuthProvider>
        </Router>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;
