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
  Heading
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CourseTracker = () => {
  const [courseName, setCourseName] = useState('');
  const [score, setScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playingPartners, setPlayingPartners] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('golf_rounds').insert({
        course_name: courseName,
        score: parseInt(score),
        date_played: new Date().toISOString(),
        playing_partners: playingPartners.split(',').map(p => p.trim()),
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Golf round recorded successfully!',
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
      <Heading mb={6}>Track New Round</Heading>
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Course Name</FormLabel>
            <Input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Score</FormLabel>
            <NumberInput min={0}>
              <NumberInputField
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter your score"
              />
            </NumberInput>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Playing Partners</FormLabel>
            <Input
              value={playingPartners}
              onChange={(e) => setPlayingPartners(e.target.value)}
              placeholder="Enter names, separated by commas"
            />
          </FormControl>

          <Button 
              type="submit" 
              colorScheme="green" 
              width="full"
              isLoading={isSubmitting}
              loadingText="Saving round...">
            Save Round
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default CourseTracker;
