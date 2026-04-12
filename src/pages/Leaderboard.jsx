import React, { useEffect, useState } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack,
  Avatar, Badge, SimpleGrid, Spinner, Flex, Button,
  useColorModeValue, Stat, StatLabel, StatNumber,
  CircularProgress, CircularProgressLabel, Divider,
  useToast,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const BADGE_CONFIG = {
  first_report:    { label: 'First Reporter',  emoji: '🌱', color: 'green'  },
  eco_warrior:     { label: 'Eco Warrior',     emoji: '⚔️', color: 'teal'   },
  green_champion:  { label: 'Green Champion',  emoji: '🏆', color: 'yellow' },
  point_collector: { label: 'Point Collector', emoji: '💎', color: 'blue'   },
  super_reporter:  { label: 'Super Reporter',  emoji: '🦸', color: 'purple' },
};

const RANK_META = [
  { emoji: '🥇', podiumColor: '#F6E05E', ringColor: '#D69E2E', height: '140px' },
  { emoji: '🥈', podiumColor: '#E2E8F0', ringColor: '#A0AEC0', height: '100px' },
  { emoji: '🥉', podiumColor: '#FBD38D', ringColor: '#DD6B20', height: '80px'  },
];

// Points breakdown explanation
const POINTS_GUIDE = [
  { action: 'Submit a report',           points: 10,  icon: '📸' },
  { action: 'High priority report found',points: 15,  icon: '🔴' },
  { action: 'Report gets resolved',      points: 25,  icon: '✅' },
  { action: 'First ever report',         points: 20,  icon: '🌱' },
  { action: '5 reports milestone',       points: 30,  icon: '🎯' },
];

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'howto'
  const toast = useToast();

  const pageBg    = useColorModeValue('gray.50', 'gray.900');
  const cardBg    = useColorModeValue('white', 'gray.800');
  const subtleBg  = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lbRes, myRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/gamification/leaderboard`),
        fetch(`${BACKEND_URL}/api/gamification/my-stats`, { credentials: 'include' }),
      ]);
      const lbData = await lbRes.json();
      const myData = await myRes.json();
      if (lbData.status === 'success') setLeaders(lbData.data);
      if (myData.status === 'success') setMyStats(myData.data);
    } catch (err) {
      console.error('Leaderboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync points for all existing reports that were submitted before gamification was added
  const syncMyPoints = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gamification/sync`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast({
          title: `Points synced! +${data.data.pointsAdded} points added`,
          description: `Found ${data.data.reportCount} existing reports`,
          status: 'success',
          duration: 4000,
          isClosable: true,
          position: 'top-right',
        });
        await fetchData(); // refresh
      }
    } catch (err) {
      toast({ title: 'Sync failed', status: 'error', duration: 3000 });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <Box minH="100vh" bg={pageBg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color="gray.500">Loading leaderboard…</Text>
        </VStack>
      </Box>
    );
  }

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  // Reorder for podium: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  const nextBadgeProgress = () => {
    if (!myStats?.nextBadge) return 100;
    const nb = myStats.nextBadge;
    if (nb.minPoints > 0) return Math.min(100, ((myStats.points || 0) / nb.minPoints) * 100);
    if (nb.minReports > 0) return Math.min(100, ((myStats.totalReports || 0) / nb.minReports) * 100);
    return 0;
  };

  return (
    <Box bg={pageBg} minH="100vh" pb={16}>
      {/* Hero Banner */}
      <Box
        bgGradient="linear(135deg, green.600, teal.500, green.400)"
        py={12} px={6}
        position="relative"
        overflow="hidden"
      >
        {/* Decorative circles */}
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            position="absolute"
            borderRadius="full"
            border="2px solid"
            borderColor="whiteAlpha.200"
            w={`${80 + i * 60}px`}
            h={`${80 + i * 60}px`}
            top={`${-20 + i * 10}px`}
            right={`${-20 + i * 15}px`}
          />
        ))}
        <Container maxW="container.lg" position="relative">
          <VStack spacing={2}>
            <Text fontSize="5xl">🏆</Text>
            <Heading color="white" fontSize={{ base: '3xl', md: '4xl' }} textAlign="center">
              Community Leaderboard
            </Heading>
            <Text color="whiteAlpha.800" textAlign="center" fontSize="lg">
              Report waste. Earn points. Make your city cleaner.
            </Text>

            {/* Tab selector */}
            <HStack mt={4} bg="whiteAlpha.200" p={1} borderRadius="xl" spacing={1}>
              {[{ id: 'board', label: '🏅 Rankings' }, { id: 'howto', label: '⭐ How to Earn' }].map(tab => (
                <Button
                  key={tab.id}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  bg={activeTab === tab.id ? 'white' : 'transparent'}
                  color={activeTab === tab.id ? 'green.700' : 'white'}
                  _hover={{ bg: activeTab === tab.id ? 'white' : 'whiteAlpha.300' }}
                  borderRadius="lg"
                  fontWeight="bold"
                >
                  {tab.label}
                </Button>
              ))}
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.lg" mt={-6}>
        <AnimatePresence mode="wait">
          {activeTab === 'board' ? (
            <MotionBox key="board" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* My Stats Card */}
              {myStats && (
                <Box bg={cardBg} borderRadius="2xl" boxShadow="xl" p={6} mb={6} borderWidth="1px" borderColor={borderColor}>
                  <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                    <Text fontWeight="bold" fontSize="lg" color="green.600">Your Progress</Text>
                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={syncMyPoints}
                      isLoading={syncing}
                      loadingText="Syncing…"
                      title="Sync points for reports submitted before gamification was enabled"
                    >
                      🔄 Sync My Points
                    </Button>
                  </Flex>

                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={5}>
                    {[
                      { label: 'Points',  value: myStats.points || 0,        color: 'green', suffix: 'pts' },
                      { label: 'Rank',    value: `#${myStats.rank}`,          color: 'teal',  suffix: ''    },
                      { label: 'Reports', value: myStats.totalReports || 0,   color: 'blue',  suffix: ''    },
                      { label: 'Badges',  value: myStats.badges?.length || 0, color: 'purple',suffix: ''    },
                    ].map(({ label, value, color, suffix }) => (
                      <Box key={label} p={4} bg={subtleBg} borderRadius="xl" textAlign="center">
                        <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                        <Text fontSize="2xl" fontWeight="extrabold" color={`${color}.500`}>
                          {value}{suffix && <Text as="span" fontSize="sm" ml={1}>{suffix}</Text>}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>

                  {/* Badge progress */}
                  {myStats.nextBadge && (
                    <Box p={4} bg={subtleBg} borderRadius="xl">
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="bold">
                          Next: {BADGE_CONFIG[myStats.nextBadge.id]?.emoji} {BADGE_CONFIG[myStats.nextBadge.id]?.label || myStats.nextBadge.label}
                        </Text>
                        <Text fontSize="sm" color="gray.500">{Math.round(nextBadgeProgress())}%</Text>
                      </Flex>
                      <Box bg={useColorModeValue('gray.200', 'gray.600')} borderRadius="full" h="8px">
                        <Box
                          bg="green.400" borderRadius="full" h="8px"
                          w={`${nextBadgeProgress()}%`}
                          transition="width 0.8s ease"
                        />
                      </Box>
                      <Text fontSize="xs" color="gray.400" mt={1}>{myStats.nextBadge.description}</Text>
                    </Box>
                  )}

                  {/* Earned badges */}
                  {myStats.badges?.length > 0 && (
                    <HStack mt={4} flexWrap="wrap" gap={2}>
                      {myStats.badges.map(b => {
                        const cfg = BADGE_CONFIG[b.id] || {};
                        return (
                          <Badge key={b.id} colorScheme={cfg.color || 'green'} px={3} py={1} borderRadius="full" fontSize="xs">
                            {cfg.emoji} {cfg.label || b.id}
                          </Badge>
                        );
                      })}
                    </HStack>
                  )}
                </Box>
              )}

              {/* Podium — Top 3 */}
              {top3.length > 0 && (
                <Box bg={cardBg} borderRadius="2xl" boxShadow="xl" p={8} mb={6} borderWidth="1px" borderColor={borderColor}>
                  <Text fontWeight="bold" fontSize="lg" color="gray.600" textAlign="center" mb={8}>
                    Top Performers
                  </Text>
                  <Flex justify="center" align="end" gap={{ base: 3, md: 8 }}>
                    {podiumOrder.map((user) => {
                      const meta = RANK_META[user.rank - 1];
                      const isFirst = user.rank === 1;
                      return (
                        <MotionBox
                          key={user.rank}
                          initial={{ opacity: 0, y: 40 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: user.rank * 0.1 }}
                          textAlign="center"
                          flex={isFirst ? 1.2 : 1}
                          maxW={isFirst ? '160px' : '130px'}
                        >
                          {isFirst && (
                            <MotionBox
                              animate={{ y: [0, -8, 0] }}
                              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                              fontSize="2xl" mb={1}
                            >
                              👑
                            </MotionBox>
                          )}
                          <Avatar
                            src={user.picture}
                            name={user.name}
                            size={isFirst ? 'lg' : 'md'}
                            mb={2}
                            ring={3}
                            ringColor={meta.ringColor}
                            boxShadow={isFirst ? `0 0 20px ${meta.ringColor}66` : 'none'}
                          />
                          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{user.name}</Text>
                          <Text fontSize="xs" color="green.500" fontWeight="bold">{user.points} pts</Text>
                          <Text fontSize="xs" color="gray.400">{user.totalReports} reports</Text>

                          {/* Podium block */}
                          <Box
                            h={meta.height}
                            bg={meta.podiumColor}
                            borderTopRadius="lg"
                            mt={3}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            _dark={{ opacity: 0.8 }}
                          >
                            <Text fontSize="2xl">{meta.emoji}</Text>
                            <Box
                              position="absolute"
                              bottom={2}
                              fontSize="xs"
                              fontWeight="bold"
                              color={useColorModeValue('gray.600', 'gray.800')}
                            >
                              #{user.rank}
                            </Box>
                          </Box>
                        </MotionBox>
                      );
                    })}
                  </Flex>
                </Box>
              )}

              {/* Full Rankings List */}
              {leaders.length === 0 ? (
                <Box bg={cardBg} borderRadius="2xl" p={12} textAlign="center" boxShadow="md">
                  <Text fontSize="4xl" mb={3}>🌱</Text>
                  <Text fontSize="xl" fontWeight="bold" color="gray.600">No rankings yet</Text>
                  <Text color="gray.400" mt={2}>Submit reports to earn points and appear here!</Text>
                  <Text fontSize="sm" color="gray.400" mt={4}>
                    Already submitted reports? Click "Sync My Points" above to add your existing points.
                  </Text>
                </Box>
              ) : (
                <Box bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
                  <Box px={6} py={4} borderBottomWidth="1px" borderColor={borderColor}>
                    <Text fontWeight="bold" color="gray.600">All Rankings</Text>
                  </Box>
                  <VStack spacing={0} align="stretch" divider={<Divider />}>
                    {leaders.map((user, idx) => {
                      const isTopThree = idx < 3;
                      const meta = RANK_META[idx];
                      return (
                        <MotionBox
                          key={user.rank}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                        >
                          <Box
                            px={6} py={4}
                            _hover={{ bg: subtleBg }}
                            transition="all 0.2s"
                            bg={isTopThree ? `${['yellow', 'gray', 'orange'][idx]}`.includes('yellow') ? useColorModeValue('yellow.50', 'yellow.900') + '20' : 'transparent' : 'transparent'}
                          >
                            <HStack spacing={4}>
                              {/* Rank */}
                              <Box w="36px" textAlign="center" flexShrink={0}>
                                {isTopThree
                                  ? <Text fontSize="xl">{meta?.emoji}</Text>
                                  : <Text fontWeight="bold" color="gray.400" fontSize="sm">#{user.rank}</Text>
                                }
                              </Box>

                              {/* Avatar */}
                              <Avatar src={user.picture} name={user.name} size="sm" flexShrink={0} />

                              {/* Name + badges */}
                              <Box flex={1} minW={0}>
                                <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{user.name}</Text>
                                <HStack spacing={1} mt={1} flexWrap="wrap">
                                  {(user.badges || []).slice(0, 3).map(bid => {
                                    const cfg = BADGE_CONFIG[bid];
                                    return cfg ? (
                                      <Badge key={bid} colorScheme={cfg.color} fontSize="10px" px={1}>
                                        {cfg.emoji}
                                      </Badge>
                                    ) : null;
                                  })}
                                </HStack>
                              </Box>

                              {/* Stats */}
                              <VStack spacing={0} align="end" flexShrink={0}>
                                <Text fontWeight="extrabold" color="green.500" fontSize="lg">
                                  {user.points}
                                  <Text as="span" fontSize="xs" color="gray.400" ml={1}>pts</Text>
                                </Text>
                                <Text fontSize="xs" color="gray.400">{user.totalReports} reports</Text>
                              </VStack>

                              {/* Points bar */}
                              <Box w="80px" display={{ base: 'none', md: 'block' }}>
                                <Box bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="full" h="6px">
                                  <Box
                                    bg="green.400" borderRadius="full" h="6px"
                                    w={`${leaders[0]?.points > 0 ? (user.points / leaders[0].points) * 100 : 0}%`}
                                  />
                                </Box>
                              </Box>
                            </HStack>
                          </Box>
                        </MotionBox>
                      );
                    })}
                  </VStack>
                </Box>
              )}
            </MotionBox>
          ) : (
            /* How to Earn Tab */
            <MotionBox key="howto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Box bg={cardBg} borderRadius="2xl" boxShadow="xl" p={6} mb={6} mt={6} borderWidth="1px" borderColor={borderColor}>
                <Text fontWeight="bold" fontSize="xl" mb={6} color="green.600">How Points Work</Text>
                <VStack spacing={3} align="stretch">
                  {POINTS_GUIDE.map(({ action, points, icon }) => (
                    <Box key={action} p={4} bg={subtleBg} borderRadius="xl">
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Text fontSize="2xl">{icon}</Text>
                          <Text fontSize="sm" fontWeight="medium">{action}</Text>
                        </HStack>
                        <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                          +{points} pts
                        </Badge>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Box bg={cardBg} borderRadius="2xl" boxShadow="xl" p={6} borderWidth="1px" borderColor={borderColor}>
                <Text fontWeight="bold" fontSize="xl" mb={6} color="green.600">Badges You Can Earn</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {Object.entries(BADGE_CONFIG).map(([id, cfg]) => (
                    <Box key={id} p={4} bg={subtleBg} borderRadius="xl" borderLeftWidth="4px" borderColor={`${cfg.color}.400`}>
                      <HStack spacing={3}>
                        <Text fontSize="2xl">{cfg.emoji}</Text>
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">{cfg.label}</Text>
                          <Badge colorScheme={cfg.color} fontSize="xs" mt={1}>{id.replace(/_/g, ' ')}</Badge>
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            </MotionBox>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default Leaderboard;