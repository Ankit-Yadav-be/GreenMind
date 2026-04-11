import React, { useEffect, useState } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack,
  Avatar, Badge, SimpleGrid, Spinner, Flex,
  useColorModeValue, Stat, StatLabel, StatNumber,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const BADGE_LABELS = {
  first_report:    { label: 'First Reporter', emoji: '🌱' },
  eco_warrior:     { label: 'Eco Warrior',    emoji: '⚔️' },
  green_champion:  { label: 'Green Champion', emoji: '🏆' },
  point_collector: { label: 'Collector',      emoji: '💎' },
  super_reporter:  { label: 'Super Reporter', emoji: '🦸' },
};

const RANK_COLORS = ['gold', 'silver', '#cd7f32', 'gray.500', 'gray.500'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉', '4', '5', '6', '7', '8', '9', '10'];

const Leaderboard = () => {
  const [leaders, setLeaders]   = useState([]);
  const [myStats, setMyStats]   = useState(null);
  const [loading, setLoading]   = useState(true);

  const cardBg = useColorModeValue('white', 'gray.800');
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const topCardBg = useColorModeValue('green.50', 'green.900');

  useEffect(() => {
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
    fetchData();
  }, []);

  if (loading) {
    return <Box textAlign="center" py={20}><Spinner size="xl" color="green.500" /></Box>;
  }

  const top3 = leaders.slice(0, 3);
  const rest  = leaders.slice(3);

  return (
    <Box bg={pageBg} minH="100vh" py={10}>
      <Container maxW="container.md">
        <Heading textAlign="center" color="green.600" mb={2}>🏆 Leaderboard</Heading>
        <Text textAlign="center" color="gray.500" mb={8}>
          Earn points by reporting waste. Top reporters win badges.
        </Text>

        {/* My Stats Card */}
        {myStats && (
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} mb={8}>
            <Box bg={topCardBg} p={5} borderRadius="2xl" boxShadow="md">
              <Text fontWeight="bold" mb={3} color="green.700">Your Stats</Text>
              <SimpleGrid columns={3} spacing={4}>
                <Stat textAlign="center">
                  <StatLabel fontSize="xs" color="gray.500">Points</StatLabel>
                  <StatNumber color="green.600">{myStats.points}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize="xs" color="gray.500">Rank</StatLabel>
                  <StatNumber color="green.600">#{myStats.rank}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize="xs" color="gray.500">Reports</StatLabel>
                  <StatNumber color="green.600">{myStats.totalReports}</StatNumber>
                </Stat>
              </SimpleGrid>
              {myStats.badges?.length > 0 && (
                <HStack mt={3} flexWrap="wrap">
                  {myStats.badges.map(b => (
                    <Badge key={b.id} colorScheme="green" fontSize="xs">
                      {BADGE_LABELS[b.id]?.emoji} {BADGE_LABELS[b.id]?.label || b.id}
                    </Badge>
                  ))}
                </HStack>
              )}
              {myStats.nextBadge && (
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Next badge: <strong>{BADGE_LABELS[myStats.nextBadge.id]?.label}</strong> — {myStats.nextBadge.description}
                </Text>
              )}
            </Box>
          </MotionBox>
        )}

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <HStack justify="center" align="end" spacing={4} mb={8}>
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((user, i) => {
              const realRank = user.rank;
              const height = realRank === 1 ? '130px' : realRank === 2 ? '100px' : '80px';
              return (
                <MotionBox key={user.rank} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} textAlign="center">
                  <Avatar src={user.picture} name={user.name} size="md" mb={2} ring={2} ringColor={RANK_COLORS[realRank - 1]} />
                  <Text fontSize="sm" fontWeight="bold" noOfLines={1} maxW="80px">{user.name}</Text>
                  <Text fontSize="xs" color="green.600">{user.points} pts</Text>
                  <Box h={height} bg={realRank === 1 ? 'yellow.300' : realRank === 2 ? 'gray.300' : 'orange.300'} borderTopRadius="lg" mt={2} display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="2xl">{RANK_EMOJIS[realRank - 1]}</Text>
                  </Box>
                </MotionBox>
              );
            })}
          </HStack>
        )}

        {/* Full List */}
        <VStack spacing={3} align="stretch">
          {leaders.map((user, idx) => (
            <MotionBox key={user.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
              <Box bg={cardBg} p={4} borderRadius="xl" boxShadow="sm" _hover={{ boxShadow: 'md' }} transition="all 0.2s">
                <HStack spacing={4}>
                  <Text fontWeight="bold" w="28px" textAlign="center" color={idx < 3 ? 'green.500' : 'gray.500'}>
                    {RANK_EMOJIS[idx] || `${idx + 1}`}
                  </Text>
                  <Avatar src={user.picture} name={user.name} size="sm" />
                  <Box flex={1}>
                    <Text fontWeight="bold" fontSize="sm">{user.name}</Text>
                    <HStack spacing={1} flexWrap="wrap">
                      {(user.badges || []).map(bid => (
                        <Text key={bid} fontSize="10px" title={BADGE_LABELS[bid]?.label}>{BADGE_LABELS[bid]?.emoji || '🏅'}</Text>
                      ))}
                    </HStack>
                  </Box>
                  <VStack spacing={0} align="end">
                    <Text fontWeight="bold" color="green.600">{user.points} pts</Text>
                    <Text fontSize="xs" color="gray.500">{user.totalReports} reports</Text>
                  </VStack>
                </HStack>
              </Box>
            </MotionBox>
          ))}
        </VStack>
      </Container>
    </Box>
  );
};

export default Leaderboard;