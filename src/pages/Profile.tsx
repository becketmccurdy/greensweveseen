import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Heading,
  Text,
  Avatar,
  HStack,
  Spinner,
  FormErrorMessage,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { EditIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../lib/AuthProvider';
import { supabase } from '../lib/supabase';

const Profile = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadAvatar = async () => {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
      setIsInitialLoad(false);
    };

    loadAvatar();
  }, [user]);

  const validateFile = (file: File): string | null => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image';
    }

    if (file.size > MAX_SIZE) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const error = validateFile(file);
    if (error) {
      toast({
        title: 'Invalid File',
        description: error,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      onClose();
      toast({
        title: 'Success',
        description: 'Profile picture updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
    setIsUploading(false);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password updated successfully',
        status: 'success',
        duration: 3000,
      });
      setNewPassword('');
      setConfirmPassword('');
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
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Box position="relative" display="inline-block">
            {isInitialLoad ? (
              <Spinner size="xl" color="green.500" thickness="4px" />
            ) : (
              <>
            <Avatar 
              size="2xl" 
              name={user?.email} 
              mb={4} 
              src={avatarUrl || undefined}
              cursor="pointer"
              onClick={onOpen}
              opacity={isUploading ? 0.5 : 1}
              transition="opacity 0.2s"
            />
            {isUploading && (
              <Spinner
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                size="lg"
                color="green.500"
                thickness="4px"
              />
            )}
            <IconButton
              aria-label="Edit profile picture"
              icon={<EditIcon />}
              position="absolute"
              bottom="0"
              right="0"
              size="sm"
              rounded="full"
              colorScheme="green"
              onClick={onOpen}
              isLoading={isUploading}
              disabled={isUploading}
            />
              </>
            )}
          </Box>
          <Heading size="lg" mb={2}>Profile</Heading>
          <Text fontSize="lg" color="gray.600">{user?.email}</Text>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Profile Picture</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <Box position="relative" width="full">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    hidden
                    ref={fileInputRef}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    width="full"
                    colorScheme="green"
                    isLoading={isUploading}
                  >
                    Choose File
                  </Button>
                </Box>
                {isUploading && (
                  <Box width="full">
                    <Text mb={2} fontSize="sm">{Math.round(uploadProgress)}% uploaded</Text>
                    <Progress value={uploadProgress} size="sm" colorScheme="green" />
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Box as="form" onSubmit={handlePasswordUpdate}>
          <VStack spacing={6}>
            <Heading size="md">Change Password</Heading>
            <FormControl isInvalid={!!passwordErrors.newPassword}>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordErrors({...passwordErrors, newPassword: ''});
                }}
                placeholder="Enter new password"
              />
              <FormErrorMessage>{passwordErrors.newPassword}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!passwordErrors.confirmPassword}>
              <FormLabel>Confirm New Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordErrors({...passwordErrors, confirmPassword: ''});
                }}
                placeholder="Confirm new password"
              />
              <FormErrorMessage>{passwordErrors.confirmPassword}</FormErrorMessage>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Password must contain at least 8 characters, one uppercase letter,
                one lowercase letter, and one number.
              </Text>
            </FormControl>
            <Button
              type="submit"
              colorScheme="green"
              width="full"
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Update Password
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile;
