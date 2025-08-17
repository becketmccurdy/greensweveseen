import { Box, Heading, Text, Button, Container, VStack, Spinner, Center } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthProvider';

const Home = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Center h="calc(100vh - 60px)">
        <Spinner size="xl" color="green.500" />
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={6} color="green.600">
          Welcome to GreenSWEveSeen
        </Heading>
        <Text fontSize="xl" mb={8}>
          Track your golf adventures with friends and family
        </Text>
        <Button
          colorScheme="green"
          size="lg"
          onClick={() => navigate('/login')}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
