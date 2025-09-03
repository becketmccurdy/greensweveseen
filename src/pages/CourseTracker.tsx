import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  NumberInput,
  NumberInputField,
  useToast,
  Heading,
  FormErrorMessage,
  Text,
  HStack,
  IconButton,
  RadioGroup,
  Radio,
  Stack,
  Checkbox,
  CheckboxGroup,
  Divider,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Image
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { geocodeAddress } from '../utils/googleMaps';

// Helper to fetch a course-themed image (Unsplash Source API)
const getCourseImage = (name: string) => `https://source.unsplash.com/800x400/?golf,course,${encodeURIComponent(name)}`;

const CourseTracker = () => {
  const [courseName, setCourseName] = useState('');
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playingPartners, setPlayingPartners] = useState('');
  const [holes, setHoles] = useState('18');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
      loadRoundData(id);
    }
    fetchFriends();
  }, [isEditing, id]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend_profile:profiles!friendships_friend_id_fkey(id, email)
        `)
        .eq('status', 'accepted');

      if (error) throw error;
      setFriends(data || []);
    } catch (error: any) {
      console.error('Error fetching friends:', error);
    }
  };

  const loadRoundData = async (roundId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('golf_rounds')
        .select('*')
        .eq('id', roundId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setCourseName(data.course_name);
        setScore(data.score.toString());
        setDate(data.date_played);
        setPlayingPartners(data.playing_partners?.join(', ') || '');
        setHoles(data.holes?.toString() || '18');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load round data',
        status: 'error',
        duration: 3000,
      });
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!courseName.trim()) newErrors.courseName = 'Course name is required';
    if (!score) newErrors.score = 'Score is required';
    else if (isNaN(parseInt(score)) || parseInt(score) < 1 || parseInt(score) > 199) {
      newErrors.score = 'Score must be between 1 and 199';
    }
    if (!date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please check the form for errors',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Geocode the course name to get coordinates
      setIsGeocodingAddress(true);
      const coordinates = await geocodeAddress(`${courseName} golf course`);
      setIsGeocodingAddress(false);

      const roundData = {
        course_name: courseName,
        score: parseInt(score),
        date_played: date,
        playing_partners: playingPartners ? playingPartners.split(',').map(p => p.trim()) : [],
        holes: parseInt(holes),
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null,
        user_id: user.id
      };

      let roundResult: any;
      if (isEditing && id) {
        roundResult = await supabase
          .from('golf_rounds')
          .update(roundData)
          .eq('id', id)
          .select()
          .single();
      } else {
        roundResult = await supabase
          .from('golf_rounds')
          .insert(roundData)
          .select()
          .single();
      }

      if (roundResult.error) throw roundResult.error;

      // Handle sharing with friends
      if (selectedFriends.length > 0 && roundResult.data) {
        const sharedRoundsData = selectedFriends.map((friendId: string) => ({
          round_id: roundResult.data.id,
          shared_with: friendId
        }));

        const { error: shareError } = await supabase
          .from('shared_rounds')
          .insert(sharedRoundsData);

        if (shareError) {
          console.error('Error sharing round:', shareError);
          // Don't throw error here - round was saved successfully
          toast({
            title: 'Round saved, but sharing failed',
            description: 'Your round was saved but could not be shared with friends',
            status: 'warning',
            duration: 3000,
          });
        }
      }

      toast({
        title: 'Success',
        description: isEditing ? 'Golf round updated successfully!' : 'Golf round recorded successfully!',
        status: 'success',
        duration: 3000,
      });
      setIsSubmitting(false);
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <HStack mb={8} justify="space-between" width="full">
        <IconButton
          aria-label="Back to dashboard"
          icon={<ChevronLeftIcon />}
          variant="ghost"
          size="lg"
          onClick={() => navigate('/dashboard')}
        />
        <VStack spacing={1}>
          <Heading size="xl" color="gray.800">
            {isEditing ? '✏️ Edit Round' : '⛳ Track New Round'}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {isEditing ? 'Update your golf round details' : 'Record your latest golf round'}
          </Text>
        </VStack>
        <Box w={12} /> {/* Spacer for alignment */}
      </HStack>
      
      <Card shadow="lg" borderRadius="xl">
        <CardHeader>
          <Heading size="md" color="gray.700">Round Details</Heading>
        </CardHeader>
        <CardBody>
          <Box as="form" onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!errors.courseName}>
                <FormLabel fontWeight="semibold" color="gray.700">🏌️ Course Name</FormLabel>
                <Input
                  value={courseName}
                  onChange={(e) => {
                    setCourseName(e.target.value);
                    setErrors({...errors, courseName: ''});
                  }}
                  placeholder="Enter course name"
                  size="lg"
                  borderRadius="md"
                />
                <FormErrorMessage>{errors.courseName}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.score}>
                <FormLabel fontWeight="semibold" color="gray.700">⛳ Score</FormLabel>
                <NumberInput min={1} max={199}>
                  <NumberInputField
                    value={score}
                    onChange={(e) => {
                      setScore(e.target.value);
                      setErrors({...errors, score: ''});
                    }}
                    placeholder="Enter your score (1-199)"
                    borderRadius="md"
                  />
                </NumberInput>
                <FormErrorMessage>{errors.score}</FormErrorMessage>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Enter your total score for the round (1-199)
                </Text>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.date}>
                <FormLabel fontWeight="semibold" color="gray.700">📅 Date Played</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setErrors({...errors, date: ''});
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  size="lg"
                  borderRadius="md"
                />
                <FormErrorMessage>{errors.date}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">🕳️ Number of Holes</FormLabel>
                <RadioGroup value={holes} onChange={setHoles}>
                  <Stack direction="row" spacing={8}>
                    <Radio value="9" size="lg" colorScheme="green">
                      <Text fontWeight="medium">9 holes</Text>
                    </Radio>
                    <Radio value="18" size="lg" colorScheme="green">
                      <Text fontWeight="medium">18 holes</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </SimpleGrid>

            <Divider my={6} />

            <VStack spacing={6} align="stretch">
              <Card variant="outline" borderRadius="xl">
                <CardHeader pb={0}>
                  <Heading size="sm" color="gray.700">🏞️ Course Preview</Heading>
                </CardHeader>
                <CardBody>
                  {courseName ? (
                    <Image
                      src={getCourseImage(courseName)}
                      alt={`${courseName} course preview`}
                      borderRadius="md"
                      height="200px"
                      width="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Text color="gray.500">Enter a course name to preview a course image</Text>
                  )}
                </CardBody>
              </Card>

              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">👥 Playing Partners</FormLabel>
                <Input
                  value={playingPartners}
                  onChange={(e) => setPlayingPartners(e.target.value)}
                  placeholder="Enter names, separated by commas"
                  size="lg"
                  borderRadius="md"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Optional: List the people you played with
                </Text>
              </FormControl>

              {friends.length > 0 && (
                <FormControl>
                  <FormLabel fontWeight="semibold" color="gray.700">🤝 Share with Friends</FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    Select friends to share this round with. They'll be able to see your score and details.
                  </Text>
                  <CheckboxGroup
                    value={selectedFriends}
                    onChange={(values) => setSelectedFriends(values as string[])}
                  >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      {friends.map((friend) => (
                        <Checkbox key={friend.friend_id} value={friend.friend_id} colorScheme="green">
                          <HStack spacing={2}>
                            <Text>{friend.friend_profile?.email || 'Unknown Friend'}</Text>
                            <Badge colorScheme="green" size="sm" borderRadius="full">Friend</Badge>
                          </HStack>
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </FormControl>
              )}

              <Button 
                type="submit" 
                colorScheme="green" 
                size="xl"
                py={6}
                borderRadius="xl"
                isLoading={isSubmitting || isLoading || isGeocodingAddress}
                loadingText={
                  isGeocodingAddress ? 'Finding course location...' : 
                  isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : 
                  'Loading...'
                }
                fontWeight="bold"
                fontSize="lg"
              >
                {isEditing ? '✅ Update Round' : '💾 Save Round'}
              </Button>
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </Container>
  );
};

export default CourseTracker;
