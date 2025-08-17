import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthProvider';
import { Spinner, Center, Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button, VStack, useToast } from '@chakra-ui/react';
import { Suspense, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const toast = useToast();
  const location = useLocation();

  useEffect(() => {
    if (user?.email_confirmed_at && location.state?.fromVerification) {
      toast({
        title: 'Email Verified',
        description: 'Your email has been successfully verified.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [user?.email_confirmed_at, location.state]);

  if (loading) {
    return (
      <Box minH="calc(100vh - 60px)">
        <Center h="100%" py={20}>
          <Spinner size="xl" color="green.500" thickness="4px" />
        </Center>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.email_confirmed_at) {
    const resendVerification = async () => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!
      });
      
      if (error) throw error;
      
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox for the verification link.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    };

    return (
      <Box minH="calc(100vh - 60px)" p={4}>
        <Alert
          status="warning"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Email Verification Required
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Please verify your email address to access this page.
            Check your inbox for the verification link.
          </AlertDescription>
          <Button
            onClick={resendVerification}
            colorScheme="yellow"
            size="sm"
            mt={4}
          >
            Resend Verification Email
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Suspense fallback={
      <Box minH="calc(100vh - 60px)">
        <Center h="100%" py={20}>
          <Spinner size="xl" color="green.500" thickness="4px" />
        </Center>
      </Box>
    }>
      {children}
    </Suspense>
  );
};
