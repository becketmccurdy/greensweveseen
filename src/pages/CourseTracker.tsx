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
  Stack
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CourseTracker = () => {
  const [courseName, setCourseName] = useState('');
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playingPartners, setPlayingPartners] = useState('');
  const [holes, setHoles] = useState('18');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
      loadRoundData(id);
    }
  }, [isEditing, id]);

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

      const roundData = {
        course_name: courseName,
        score: parseInt(score),
        date_played: date,
        playing_partners: playingPartners ? playingPartners.split(',').map(p => p.trim()) : [],
        holes: parseInt(holes),
        user_id: user.id
      };

      let error;
      if (isEditing && id) {
        const result = await supabase
          .from('golf_rounds')
          .update(roundData)
          .eq('id', id);
        error = result.error;
      } else {
        const result = await supabase
          .from('golf_rounds')
          .insert(roundData);
        error = result.error;
      }

      if (error) throw error;

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
    <Container maxW="container.sm" py={8}>
      <HStack mb={6} justify="space-between" width="full">
        <IconButton
          aria-label="Back to dashboard"
          icon={<ChevronLeftIcon />}
          variant="ghost"
          onClick={() => navigate('/dashboard')}
        />
        <Heading size="lg">{isEditing ? 'Edit Round' : 'Track New Round'}</Heading>
        <Box w={8} /> {/* Spacer for alignment */}
      </HStack>
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired isInvalid={!!errors.courseName}>
            <FormLabel>Course Name</FormLabel>
            <Input
              value={courseName}
              onChange={(e) => {
                setCourseName(e.target.value);
                setErrors({...errors, courseName: ''});
              }}
              placeholder="Enter course name"
            />
            <FormErrorMessage>{errors.courseName}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.score}>
            <FormLabel>Score</FormLabel>
            <NumberInput min={1} max={199}>
              <NumberInputField
                value={score}
                onChange={(e) => {
                  setScore(e.target.value);
                  setErrors({...errors, score: ''});
                }}
                placeholder="Enter your score (1-199)"
              />
            </NumberInput>
            <FormErrorMessage>{errors.score}</FormErrorMessage>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Enter your total score for the round (1-199)
            </Text>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.date}>
            <FormLabel>Date Played</FormLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErrors({...errors, date: ''});
              }}
              max={new Date().toISOString().split('T')[0]}
            />
            <FormErrorMessage>{errors.date}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Number of Holes</FormLabel>
            <RadioGroup value={holes} onChange={setHoles}>
              <Stack direction="row" spacing={6}>
                <Radio value="9">9 holes</Radio>
                <Radio value="18">18 holes</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Playing Partners</FormLabel>
            <Input
              value={playingPartners}
              onChange={(e) => setPlayingPartners(e.target.value)}
              placeholder="Enter names, separated by commas"
            />
            <Text fontSize="sm" color="gray.500" mt={1}>
              Optional: List the people you played with
            </Text>
          </FormControl>

          <Button 
              type="submit" 
              colorScheme="green" 
              width="full"
              isLoading={isSubmitting || isLoading}
              loadingText={isEditing ? "Updating round..." : "Saving round..."}>
            {isEditing ? 'Update Round' : 'Save Round'}
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default CourseTracker;
