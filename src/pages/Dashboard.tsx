import { Container, Heading, SimpleGrid, Text, Card, CardBody, Stack, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface GolfRound {
  id: string;
  course_name: string;
  date_played: string;
  score: number;
  playing_partners: string[];
}

const Dashboard = () => {
  const [rounds, setRounds] = useState<GolfRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRounds();
  }, []);

  const toast = useToast();

  const fetchRounds = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('golf_rounds')
      .select('*')
      .order('date_played', { ascending: false });
    
    if (error) {
      toast({
        title: 'Error fetching rounds',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    if (data) setRounds(data);
    setIsLoading(false);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>My Golf Rounds</Heading>
      {isLoading ? (
        <Stack>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Stack spacing={4}>
                  <Heading size="md" opacity={0.3}>Loading...</Heading>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Stack>
      ) : rounds.length === 0 ? (
        <Card>
          <CardBody>
            <Text>No golf rounds recorded yet. Start tracking your games!</Text>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {rounds.map((round) => (
          <Card key={round.id}>
            <CardBody>
              <Stack spacing={2}>
                <Heading size="md">{round.course_name}</Heading>
                <Text>Score: {round.score}</Text>
                <Text>Date: {new Date(round.date_played).toLocaleDateString()}</Text>
                <Text>Playing With: {round.playing_partners.join(', ')}</Text>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
      )}
    </Container>
  );
};

export default Dashboard;
