import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';

interface InvitationData {
  id: string;
  inviter_id: string;
  invite_code: string;
  email?: string;
  expires_at: string;
  used_at?: string;
  inviter_profile?: {
    email: string;
  };
}

const JoinInvitation: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (inviteCode) {
      fetchInvitation();
    }
  }, [inviteCode]);

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('friend_invitations')
        .select('*')
        .eq('invite_code', inviteCode)
        .is('used_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Invalid or expired invitation link');
        } else {
          throw error;
        }
        return;
      }

      // Check if invitation is expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        return;
      }

      // Fetch inviter profile from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', data.inviter_id)
        .single();

      const invitationWithProfile = {
        ...data,
        inviter_profile: profile
      };

      setInvitation(invitationWithProfile as InvitationData);
    } catch (error: any) {
      setError('Failed to load invitation');
      console.error('Error fetching invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!invitation) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to login with invitation code
      navigate(`/login?invite=${inviteCode}`);
      return;
    }

    // Check if user is trying to accept their own invitation
    if (user.id === invitation.inviter_id) {
      toast({
        title: 'Cannot accept own invitation',
        description: 'You cannot accept your own friend invitation',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsAccepting(true);
    try {
      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${invitation.inviter_id}),and(user_id.eq.${invitation.inviter_id},friend_id.eq.${user.id})`)
        .single();

      if (existingFriendship) {
        toast({
          title: 'Already friends',
          description: 'You are already friends with this user',
          status: 'info',
          duration: 3000,
        });
        navigate('/friends');
        return;
      }

      // Create friendship (both directions)
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert([
          {
            user_id: user.id,
            friend_id: invitation.inviter_id,
            status: 'accepted'
          },
          {
            user_id: invitation.inviter_id,
            friend_id: user.id,
            status: 'accepted'
          }
        ]);

      if (friendshipError) throw friendshipError;

      // Mark invitation as used
      const { error: updateError } = await supabase
        .from('friend_invitations')
        .update({
          used_at: new Date().toISOString(),
          used_by: user.id
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      toast({
        title: 'Friend added!',
        description: `You are now friends with ${invitation.inviter_profile?.email}`,
        status: 'success',
        duration: 3000,
      });

      navigate('/friends');
    } catch (error: any) {
      toast({
        title: 'Error accepting invitation',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.sm" py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" />
          <Text>Loading invitation...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.sm" py={20}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Invalid Invitation</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  if (!invitation) {
    return (
      <Container maxW="container.sm" py={20}>
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <AlertTitle>Invitation Not Found</AlertTitle>
            <AlertDescription>
              The invitation link you're looking for doesn't exist or has been used.
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.sm" py={20}>
      <VStack spacing={6}>
        <VStack spacing={2} textAlign="center">
          <Heading size="lg" color="green.600">
            🏌️ Golf Tracker Invitation
          </Heading>
          <Text color="gray.600">
            You've been invited to join Golf Tracker!
          </Text>
        </VStack>

        <Card>
          <CardBody>
            <VStack spacing={4} textAlign="center">
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="semibold">
                  {invitation.inviter_profile?.email || 'A friend'} wants to connect
                </Text>
                <Text color="gray.600">
                  Join Golf Tracker to track your rounds together and see each other's progress!
                </Text>
              </VStack>

              {invitation.email && (
                <Box bg="green.50" p={3} borderRadius="md" w="full">
                  <Text fontSize="sm" color="green.700">
                    This invitation was sent to: {invitation.email}
                  </Text>
                </Box>
              )}

              <VStack spacing={3} w="full">
                <Button
                  colorScheme="green"
                  size="lg"
                  w="full"
                  onClick={acceptInvitation}
                  isLoading={isAccepting}
                  loadingText="Accepting..."
                >
                  Accept Invitation
                </Button>
                
                <Text fontSize="sm" color="gray.500">
                  By accepting, you'll become friends and can view each other's golf rounds
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <VStack spacing={2} textAlign="center">
          <Text fontSize="sm" color="gray.500">
            Don't have an account? You'll be prompted to sign up after accepting.
          </Text>
          <Text fontSize="xs" color="gray.400">
            Invitation expires on {new Date(invitation.expires_at).toLocaleDateString()}
          </Text>
        </VStack>
      </VStack>
    </Container>
  );
};

export default JoinInvitation;
