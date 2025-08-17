import { Box, Button, Container, FormControl, FormLabel, Input, VStack, useToast, Heading, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, Navigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

const Register = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Registration successful! Please check your email for verification.',
        status: 'success',
        duration: 5000,
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box as="form" onSubmit={handleRegister}>
        <VStack spacing={6}>
          <Heading>Create Account</Heading>
          <Box p={4} bg="blue.50" borderRadius="md" width="full">
            <VStack spacing={2} align="start">
              <Heading size="sm" color="blue.700">Email Verification Required</Heading>
              <Text color="blue.600">
                After registration, you'll need to verify your email address before you can log in.
                Please check your inbox for the verification link.
              </Text>
            </VStack>
          </Box>
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
          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="green"
            width="full"
            isLoading={isLoading}
            loadingText="Creating account..."
          >
            Register
          </Button>
          <Button
            as={RouterLink}
            to="/login"
            variant="link"
            colorScheme="green"
          >
            Already have an account? Login
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default Register;
