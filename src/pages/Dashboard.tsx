import React, { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Text,
  useToast,
  Spinner,
  Badge,
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
  TabPanel,
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Image,
  Flex,
  Divider,
  Skeleton
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons';
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

// Helper to fetch a course-themed image (Unsplash Source API)
const getCourseImage = (name: string) => `https://source.unsplash.com/800x400/?golf,course,${encodeURIComponent(name)}`;

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
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="xl" color="gray.800">My Golf Dashboard</Heading>
            <Text color="gray.600">Track your progress and improve your game</Text>
          </VStack>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            size="lg"
            onClick={() => navigate('/track-course')}
            borderRadius="md"
            px={6}
          >
            Track New Round
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg="gradient(to-br, green.50, green.100)" borderLeft="4px solid" borderLeftColor="green.500">
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">Average Score</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color="green.600">
                  {isLoading ? <Skeleton height="36px" width="60px" /> : stats.averageScore || '-'}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  📊 Last 10 rounds
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg="gradient(to-br, blue.50, blue.100)" borderLeft="4px solid" borderLeftColor="blue.500">
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">Total Rounds</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color="blue.600">
                  {isLoading ? <Skeleton height="36px" width="60px" /> : stats.totalRounds}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  🏌️ Rounds played
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg="gradient(to-br, purple.50, purple.100)" borderLeft="4px solid" borderLeftColor="purple.500">
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">Best Score</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color="purple.600">
                  {isLoading ? <Skeleton height="36px" width="60px" /> : stats.bestScore || '-'}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  🏆 Personal best
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg="gradient(to-br, orange.50, orange.100)" borderLeft="4px solid" borderLeftColor="orange.500">
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">Recent Trend</StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold">
                  {isLoading ? (
                    <Skeleton height="32px" width="80px" />
                  ) : stats.recentTrend ? (
                    <Badge
                      colorScheme={{
                        improving: 'green',
                        steady: 'blue',
                        declining: 'orange'
                      }[stats.recentTrend]}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {stats.recentTrend === 'improving' ? '📈 Improving' : 
                       stats.recentTrend === 'steady' ? '➡️ Steady' : '📉 Declining'}
                    </Badge>
                  ) : (
                    <Text color="gray.400">-</Text>
                  )}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  📈 Performance trend
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
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
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {rounds.map((round) => (
                  <Card 
                    key={round.id} 
                    borderRadius="xl" 
                    shadow="md" 
                    _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Image
                      src={getCourseImage(round.course_name)}
                      alt={`${round.course_name} course image`}
                      borderTopRadius="xl"
                      height="140px"
                      width="100%"
                      objectFit="cover"
                    />
                    <CardBody p={6}>
                      <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1} flex={1}>
                            <Heading size="md" color="gray.800" noOfLines={2}>
                              🏌️ {round.course_name}
                            </Heading>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(round.date_played).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Text>
                          </VStack>
                          <VStack spacing={2} align="end">
                            <Badge
                              colorScheme={round.score <= (stats.averageScore || 100) ? 'green' : 'orange'}
                              fontSize="xl"
                              px={4}
                              py={2}
                              borderRadius="full"
                              fontWeight="bold"
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
                                color="gray.400"
                                _hover={{ color: "gray.600", bg: "gray.100" }}
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
                          </VStack>
                        </HStack>
                        
                        <Divider />
                        
                        <HStack spacing={4} justify="space-between">
                          {round.holes && (
                            <HStack spacing={1}>
                              <Text fontSize="sm" color="gray.500">⛳</Text>
                              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                {round.holes} holes
                              </Text>
                            </HStack>
                          )}
                          {round.playing_partners.length > 0 && (
                            <HStack spacing={1}>
                              <Text fontSize="sm" color="gray.500">👥</Text>
                              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                {round.playing_partners.length} player{round.playing_partners.length > 1 ? 's' : ''}
                              </Text>
                            </HStack>
                          )}
                        </HStack>
                        
                        {round.playing_partners.length > 0 && (
                          <Box>
                            <Text fontSize="xs" color="gray.500" mb={2} textTransform="uppercase" letterSpacing="wide">
                              Playing Partners
                            </Text>
                            <HStack spacing={2} flexWrap="wrap">
                              {round.playing_partners.map((partner, idx) => (
                                <Badge 
                                  key={idx} 
                                  colorScheme="blue" 
                                  variant="subtle"
                                  borderRadius="md"
                                  px={2}
                                  py={1}
                                  fontSize="xs"
                                >
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
