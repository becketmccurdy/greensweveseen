import { Box, Flex, Button, Link as ChakraLink } from '@chakra-ui/react';
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
    <Box bg="green.600" px={4} py={3}>
      <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
        <Flex gap={6}>
          <ChakraLink as={RouterLink} to="/" color="white" fontWeight="bold">
            GreenSWEveSeen
          </ChakraLink>
          {user && (
            <>
              <ChakraLink as={RouterLink} to="/dashboard" color="white">
                Dashboard
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/track-course" color="white">
                Track Course
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/friends" color="white">
                Friends
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/profile" color="white">
                Profile
              </ChakraLink>
            </>
          )}
        </Flex>
        {user ? (
          <Button colorScheme="whiteAlpha" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button as={RouterLink} to="/login" colorScheme="whiteAlpha">
            Login
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default Navbar;
