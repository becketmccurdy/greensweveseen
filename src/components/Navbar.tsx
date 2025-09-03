import { Box, Flex, Button, Link as ChakraLink, HStack, Text, Avatar } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Box bg="green.500" px={6} py={4}>
      <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
        <HStack spacing={8}>
          <ChakraLink as={RouterLink} to="/" color="white" fontWeight="bold" fontSize="xl">
            🏌️ GreensWeveSeen
          </ChakraLink>
          {user && (
            <HStack spacing={6}>
              <Button
                as={RouterLink}
                to="/dashboard"
                variant="ghost"
                color="white"
                leftIcon={<Text>📊</Text>}
                _hover={{ bg: "green.600" }}
                size="sm"
                borderRadius="md"
                border="1px solid"
                borderColor="green.400"
              >
                Dashboard
              </Button>
              <Button
                as={RouterLink}
                to="/track-course"
                variant="ghost"
                color="white"
                leftIcon={<Text>⊕</Text>}
                _hover={{ bg: "green.600" }}
                size="sm"
                borderRadius="md"
                border="1px solid"
                borderColor="green.400"
              >
                Track Round
              </Button>
              <Button
                as={RouterLink}
                to="/friends"
                variant="ghost"
                color="white"
                leftIcon={<Text>👥</Text>}
                _hover={{ bg: "green.600" }}
                size="sm"
                borderRadius="md"
                border="1px solid"
                borderColor="green.400"
              >
                Friends
              </Button>
            </HStack>
          )}
        </HStack>
        {user ? (
          <HStack spacing={3}>
            <Avatar size="sm" name={user.email} bg="green.300" color="green.800" />
            <Text color="white" fontSize="sm" fontWeight="medium">
              {user.email?.split('@')[0]?.toUpperCase() || 'JD'}
            </Text>
            <Button 
              variant="ghost" 
              color="white" 
              size="sm"
              onClick={handleLogout}
              _hover={{ bg: "green.600" }}
            >
              Logout
            </Button>
          </HStack>
        ) : (
          <Button as={RouterLink} to="/login" colorScheme="whiteAlpha" size="sm">
            Login
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default Navbar;
