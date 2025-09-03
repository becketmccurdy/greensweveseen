import {
  Container,
  Heading,
  SimpleGrid,
  Text,
  Card,
  CardBody,
  Stack,
  useToast,
  Button,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Skeleton,
  Badge,
  Box,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MapView from '../components/MapView';
import { loadGoogleMapsAPI } from '../utils/googleMaps';

interface GolfRound {
  id: string;
  course_name: string;
  date_played: string;
  score: number;
  playing_partners: string[];
  holes?: number;
  latitude?: number;
  longitude?: number;
}

interface Stats {
  averageScore: number;
  bestScore: number;
  totalRounds: number;
  recentTrend: 'improving' | 'steady' | 'declining' | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<GolfRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ 
    averageScore: 0,
    bestScore: 0,
    totalRounds: 0,
    recentTrend: null
  });
  const [deleteRoundId, setDeleteRoundId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    fetchRounds();
    loadGoogleMapsAPI().then(() => setIsMapLoaded(true)).catch(() => setIsMapLoaded(false));
  }, []);

  const handleDeleteRound = async () => {
    if (!deleteRoundId) return;
    
    try {
      const { error } = await supabase
        .from('golf_rounds')
        .delete()
        .eq('id', deleteRoundId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Golf round deleted successfully',
        status: 'success',
        duration: 3000,
      });
      
      fetchRounds(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
    
    setDeleteRoundId(null);
    onClose();
  };

  const handleEditRound = (roundId: string) => {
    navigate(`/edit-round/${roundId}`);
  };

  const toast = useToast();

  const calculateStats = (rounds: GolfRound[]) => {
    if (rounds.length === 0) return;

    const scores = rounds.map(r => r.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const bestScore = Math.min(...scores);
    
    // Calculate trend based on last 3 rounds
    let recentTrend: Stats['recentTrend'] = null;
    if (rounds.length >= 3) {
      const recent = rounds.slice(0, 3).map(r => r.score);
      const trend = recent[0] - recent[2];
      if (trend < 0) recentTrend = 'improving';
      else if (trend > 0) recentTrend = 'declining';
      else recentTrend = 'steady';
    }

    setStats({
      averageScore,
      bestScore,
      totalRounds: rounds.length,
      recentTrend
    });
  };

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
    
    if (data) {
      setRounds(data);
      calculateStats(data);
    }
    setIsLoading(false);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading>My Golf Rounds</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            onClick={() => navigate('/track-course')}
          >
            Track Round
          </Button>
        </HStack>

        <Card>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatLabel>Average Score</StatLabel>
                <StatNumber>{isLoading ? <Skeleton height="24px" width="60px" /> : stats.averageScore || '-'}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Best Score</StatLabel>
                <StatNumber>{isLoading ? <Skeleton height="24px" width="60px" /> : stats.bestScore || '-'}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total Rounds</StatLabel>
                <StatNumber>{isLoading ? <Skeleton height="24px" width="60px" /> : stats.totalRounds}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Recent Trend</StatLabel>
                <StatNumber>
                  {isLoading ? (
                    <Skeleton height="24px" width="60px" />
                  ) : stats.recentTrend ? (
                    <Badge
                      colorScheme={{
                        improving: 'green',
                        steady: 'blue',
                        declining: 'orange'
                      }[stats.recentTrend]}
                    >
                      {stats.recentTrend.charAt(0).toUpperCase() + stats.recentTrend.slice(1)}
                    </Badge>
                  ) : '-'}
                </StatNumber>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>
        <Tabs colorScheme="green">
          <TabList>
            <Tab>Rounds List</Tab>
            <Tab>Map View</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height="200px" borderRadius="md" />
                ))
              ) : rounds.length === 0 ? (
                <Card>
                  <CardBody textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                        No Rounds Recorded Yet
                      </Text>
                      <Text color="gray.500">
                        Start tracking your golf rounds to see your stats and progress!
                      </Text>
                      <Button
                        leftIcon={<AddIcon />}
                        colorScheme="green"
                        size="lg"
                        onClick={() => navigate('/track-course')}
                      >
                        Track Your First Round
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {rounds.map((round) => (
                  <Card key={round.id}>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Heading size="md">{round.course_name}</Heading>
                          <HStack spacing={2}>
                            <Badge
                              colorScheme={round.score <= stats.averageScore ? 'green' : 'orange'}
                              fontSize="lg"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              {round.score}
                            </Badge>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<ChevronDownIcon />}
                                variant="ghost"
                                size="sm"
                                aria-label="Options"
                              />
                              <MenuList>
                                <MenuItem
                                  icon={<EditIcon />}
                                  onClick={() => handleEditRound(round.id)}
                                >
                                  Edit Round
                                </MenuItem>
                                <MenuItem
                                  icon={<DeleteIcon />}
                                  onClick={() => {
                                    setDeleteRoundId(round.id);
                                    onOpen();
                                  }}
                                  color="red.500"
                                >
                                  Delete Round
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Text color="gray.600">
                            {new Date(round.date_played).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Text>
                          {round.holes && (
                            <Text fontSize="sm" color="gray.500">
                              {round.holes} holes
                            </Text>
                          )}
                        </VStack>
                        {round.playing_partners.length > 0 && (
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>Played with:</Text>
                            <HStack spacing={2}>
                              {round.playing_partners.map((partner, idx) => (
                                <Badge key={idx} colorScheme="blue" variant="subtle">
                                  {partner}
                                </Badge>
                              ))}
                            </HStack>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
              )}
            </TabPanel>
            
            <TabPanel px={0}>
              {rounds.length === 0 ? (
                <Card>
                  <CardBody textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                        No Courses to Display
                      </Text>
                      <Text color="gray.500">
                        Add some golf rounds to see them on the map!
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : isMapLoaded ? (
                <MapView rounds={rounds} height="500px" />
              ) : (
                <Box height="500px" display="flex" alignItems="center" justifyContent="center">
                  <VStack spacing={4}>
                    <Spinner size="lg" color="green.500" />
                    <Text color="gray.600">Loading map...</Text>
                  </VStack>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Golf Round
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this golf round? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteRound} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </VStack>
    </Container>
  );
};

export default Dashboard;
