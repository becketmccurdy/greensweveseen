import { useState, useRef } from 'react';
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
} from '@chakra-ui/react';
import { useAuth } from '../lib/AuthProvider';
import { supabase } from '../lib/supabase';

const Profile = () => {
  const { user } = useAuth();

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

      setAvatarUrl(publicUrl);
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
            <Avatar 
              size="2xl" 
              name={user?.email} 
              mb={4} 
              src={avatarUrl || undefined}
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
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
            <Button
              position="absolute"
              bottom="0"
              right="0"
              size="sm"
              rounded="full"
              colorScheme="green"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              disabled={isUploading}
            >
              Edit
            </Button>
            <Input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </Box>
          <Heading size="lg" mb={2}>Profile</Heading>
          <Text fontSize="lg" color="gray.600">{user?.email}</Text>
        </Box>

        <Box as="form" onSubmit={handlePasswordUpdate}>
          <VStack spacing={6}>
            <Heading size="md">Change Password</Heading>
            <FormControl>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Confirm New Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
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
