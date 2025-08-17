import { Box, Button, Container, FormControl, FormLabel, Input, VStack, useToast, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, Navigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && !user.email_confirmed_at) {
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: email
        });
        
        if (resendError) throw resendError;
        
        setIsVerificationSent(true);
        toast({
          title: 'Email Verification Required',
          description: 'Please check your email and verify your account before logging in.',
          status: 'warning',
          duration: 10000,
          isClosable: true
        });
      } else {
        navigate('/dashboard');
      }
      
      setIsLoading(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box as="form" onSubmit={handleLogin}>
        <VStack spacing={4}>
          {isVerificationSent && (
            <Box p={4} bg="orange.100" borderRadius="md" width="full">
              <Text color="orange.800">
                Please verify your email before logging in. 
                Check your inbox for the verification link.
              </Text>
            </Box>
          )}
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="green" width="full" isLoading={isLoading}>
            Login
          </Button>
          <Text>Don't have an account? <Button as={RouterLink} to="/register" variant="link" colorScheme="green">Register</Button></Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default Login;
