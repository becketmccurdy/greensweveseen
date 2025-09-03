import React, { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Text,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Badge,
  Avatar,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useClipboard,
  Flex,
  Divider,
  Stack
} from '@chakra-ui/react';
import { AddIcon, CopyIcon, CheckIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { supabase } from '../lib/supabase';

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_profile?: {
    id: string;
    email: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
}

interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  requester_profile?: UserProfile;
}

interface Invitation {
  id: string;
  invite_code: string;
  email?: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

interface FriendRound {
  id: string;
  course_name: string;
  score: number;
  date_played: string;
  holes?: number;
  user_id: string;
  user_profile?: {
    email: string;
  };
}

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [friendRounds, setFriendRounds] = useState<FriendRound[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSearchOpen,
    onOpen: onSearchOpen,
    onClose: onSearchClose,
  } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchFriends();
    fetchInvitations();
    fetchFriendRounds();
    fetchFriendRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend_profile:profiles!friendships_friend_id_fkey(id, email)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setFriends(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching friends',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('friend_invitations')
        .select('*')
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching invitations',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchFriendRounds = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get friend IDs
      const { data: friendships, error: friendsError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      if (friendships && friendships.length > 0) {
        const friendIds = friendships.map(f => f.friend_id);
        
        const { data, error } = await supabase
          .from('golf_rounds')
          .select(`
            *,
            user_profile:profiles!golf_rounds_user_id_fkey(id, email)
          `)
          .in('user_id', friendIds)
          .order('date_played', { ascending: false })
          .limit(20);

        if (error) throw error;
        setFriendRounds(data || []);
      } else {
        setFriendRounds([]);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching friend rounds',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const fetchFriendRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester_profile:profiles!friendships_user_id_fkey(id, email)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setFriendRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', `%${searchQuery}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      
      // Filter out existing friends and pending requests
      const existingFriendIds = friends.map(f => f.friend_id);
      const pendingRequestIds = friendRequests.map(r => r.user_id);
      
      const filteredResults = (data || []).filter(profile => 
        !existingFriendIds.includes(profile.id) && 
        !pendingRequestIds.includes(profile.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error: any) {
      toast({
        title: 'Error searching users',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
    setIsSearching(false);
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Friend request sent!',
        description: 'Your friend request has been sent',
        status: 'success',
        duration: 3000,
      });

      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== friendId));
    } catch (error: any) {
      toast({
        title: 'Error sending friend request',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const acceptFriendRequest = async (requestId: string, requesterId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update the original request to accepted
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create the reciprocal friendship
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: requesterId,
          status: 'accepted'
        });

      if (insertError) throw insertError;

      toast({
        title: 'Friend request accepted!',
        description: 'You are now friends',
        status: 'success',
        duration: 3000,
      });

      fetchFriends();
      fetchFriendRequests();
    } catch (error: any) {
      toast({
        title: 'Error accepting friend request',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Friend request declined',
        status: 'info',
        duration: 3000,
      });

      fetchFriendRequests();
    } catch (error: any) {
      toast({
        title: 'Error declining friend request',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const createInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsCreatingInvite(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('friend_invitations')
        .insert({
          inviter_id: user.id,
          email: inviteEmail.trim()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Invitation created!',
        description: `Invitation link created for ${inviteEmail}`,
        status: 'success',
        duration: 3000,
      });

      setInviteEmail('');
      onClose();
      fetchInvitations();
    } catch (error: any) {
      toast({
        title: 'Error creating invitation',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
    setIsCreatingInvite(false);
  };

  const InviteCard: React.FC<{ invitation: Invitation }> = ({ invitation }) => {
    const inviteUrl = `${window.location.origin}/join/${invitation.invite_code}`;
    const { onCopy, hasCopied } = useClipboard(inviteUrl);

    return (
      <Card>
        <CardBody>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">
                  {invitation.email || 'General Invitation'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Code: {invitation.invite_code}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                </Text>
              </VStack>
              <Button
                leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                colorScheme={hasCopied ? 'green' : 'blue'}
                size="sm"
                onClick={onCopy}
              >
                {hasCopied ? 'Copied!' : 'Copy Link'}
              </Button>
            </HStack>
            <Box bg="gray.50" p={2} borderRadius="md" fontSize="sm">
              <Text isTruncated>{inviteUrl}</Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  const FriendCard: React.FC<{ friend: Friend }> = ({ friend }) => (
    <Card 
      borderRadius="xl" 
      shadow="md" 
      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      border="1px solid"
      borderColor="gray.200"
    >
      <CardBody p={6}>
        <HStack spacing={4}>
          <Avatar 
            size="lg" 
            name={friend.friend_profile?.email} 
            bg="green.400" 
            color="white"
            fontWeight="bold"
          />
          <VStack align="start" spacing={2} flex={1}>
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              {friend.friend_profile?.email?.split('@')[0]?.toUpperCase() || 'UNKNOWN USER'}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3}>
                🤝 Friend
              </Badge>
              <Text fontSize="sm" color="gray.500">
                Since {new Date(friend.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {friend.friend_profile?.email || 'No email available'}
            </Text>
          </VStack>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<ChevronDownIcon />}
              variant="ghost"
              size="sm"
              color="gray.400"
              _hover={{ color: "gray.600", bg: "gray.100" }}
            />
            <MenuList>
              <MenuItem>👀 View Rounds</MenuItem>
              <MenuItem color="red.500">🗑️ Remove Friend</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </CardBody>
    </Card>
  );

  const FriendRoundCard: React.FC<{ round: FriendRound }> = ({ round }) => (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">{round.course_name}</Text>
              <Text fontSize="sm" color="gray.500">
                by {round.user_profile?.email || 'Unknown'}
              </Text>
            </VStack>
            <Badge
              colorScheme="green"
              fontSize="lg"
              px={3}
              py={1}
              borderRadius="full"
            >
              {round.score}
            </Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">
              {new Date(round.date_played).toLocaleDateString()}
            </Text>
            {round.holes && (
              <Text fontSize="sm" color="gray.500">
                {round.holes} holes
              </Text>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="xl" color="gray.800">👥 Friends & Social</Heading>
            <Text color="gray.600">Connect with friends and share your golf journey</Text>
          </VStack>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            onClick={onOpen}
          >
            Invite Friend
          </Button>
        </HStack>

        <Tabs colorScheme="green">
          <TabList>
            <Tab>My Friends ({friends.length})</Tab>
            <Tab>Friend Requests ({friendRequests.length})</Tab>
            <Tab>Find Friends</Tab>
            <Tab>Friend Activity</Tab>
            <Tab>Invitations ({invitations.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {friends.length === 0 ? (
                <Card>
                  <CardBody textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                        No Friends Yet
                      </Text>
                      <Text color="gray.500">
                        Search for friends or invite your golf buddies to track rounds together!
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {friends.map((friend) => (
                    <FriendCard key={friend.id} friend={friend} />
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            <TabPanel px={0}>
              {friendRequests.length === 0 ? (
                <Card>
                  <CardBody textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                        No Friend Requests
                      </Text>
                      <Text color="gray.500">
                        You don't have any pending friend requests
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {friendRequests.map((request) => (
                    <Card key={request.id}>
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">
                                {request.requester_profile?.email || 'Unknown User'}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Sent {new Date(request.created_at).toLocaleDateString()}
                              </Text>
                            </VStack>
                            <Badge colorScheme="orange">Pending</Badge>
                          </HStack>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => acceptFriendRequest(request.id, request.user_id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => declineFriendRequest(request.id)}
                            >
                              Decline
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardBody>
                    <VStack spacing={4}>
                      <Text fontSize="lg" fontWeight="semibold">
                        Search for Friends
                      </Text>
                      <HStack w="full">
                        <Input
                          placeholder="Search by email address..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                        />
                        <Button
                          colorScheme="green"
                          onClick={searchUsers}
                          isLoading={isSearching}
                          loadingText="Searching..."
                        >
                          Search
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {searchResults.length > 0 && (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {searchResults.map((user) => (
                      <Card key={user.id}>
                        <CardBody>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">{user.email}</Text>
                              <Badge colorScheme="blue" size="sm">User</Badge>
                            </VStack>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => sendFriendRequest(user.id)}
                            >
                              Add Friend
                            </Button>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}

                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <Card>
                    <CardBody textAlign="center" py={8}>
                      <Text color="gray.500">
                        No users found matching "{searchQuery}"
                      </Text>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              {isLoading ? (
                <VStack spacing={4}>
                  <Spinner size="lg" color="green.500" />
                  <Text color="gray.600">Loading friend activity...</Text>
                </VStack>
              ) : friendRounds.length === 0 ? (
                <Card>
                  <CardBody textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                        No Friend Activity
                      </Text>
                      <Text color="gray.500">
                        Your friends haven't recorded any rounds yet, or you don't have any friends added.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      {friendRounds.map((round) => (
                        <FriendRoundCard key={round.id} round={round} />
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>

                <TabPanel px={0}>
                  {invitations.length === 0 ? (
                    <Card>
                      <CardBody textAlign="center" py={12}>
                        <VStack spacing={4}>
                          <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                            No Active Invitations
                          </Text>
                          <Text color="gray.500">
                            Create invitation links to share with friends
                          </Text>
                          <Button
                            leftIcon={<AddIcon />}
                            colorScheme="green"
                            onClick={onOpen}
                          >
                            Create Invitation
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {invitations.map((invitation) => (
                        <InviteCard key={invitation.id} invitation={invitation} />
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Invite a Friend</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text color="gray.600">
                  Send an invitation link to your friend. They can use this link to join and connect with you.
                </Text>
                <FormControl>
                  <FormLabel>Friend's Email (Optional)</FormLabel>
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Leave empty to create a general invitation link
                  </Text>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={createInvitation}
                isLoading={isCreatingInvite}
                loadingText="Creating..."
              >
                Create Invitation
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default Friends;
