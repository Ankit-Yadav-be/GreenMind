import React, { useEffect, useState } from 'react';
import {
  Box, Text, Table, Thead, Tbody, Tr, Th, Td,
  Badge, HStack, Avatar, Progress, useColorModeValue,
  Spinner, Flex,
} from '@chakra-ui/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const WorkerPerformancePanel = ({ filterArea }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const subtleBg  = useColorModeValue('gray.50', 'gray.700');
  const cardBg    = useColorModeValue('white',   'gray.800');
  const borderCol = useColorModeValue('gray.100','gray.700');

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/analytics/workers`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        let data = d.data || [];
        if (filterArea) {
          const kw = filterArea.split(',')[0].toLowerCase().trim();
          data = data.filter(w => w.area?.toLowerCase().includes(kw));
        }
        setWorkers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterArea]);

  if (loading) return <Flex py={6} justify="center"><Spinner size="sm" color="teal.500"/></Flex>;

  if (workers.length === 0) return (
    <Flex py={8} direction="column" align="center" gap={2}>
      <Text fontSize="2xl">👷</Text>
      <Text color="gray.400" fontSize="sm">{filterArea ? `No workers in ${filterArea}` : 'No workers found'}</Text>
    </Flex>
  );

  return (
    <Box overflowX="auto">
      <Table size="sm">
        <Thead bg={subtleBg}>
          <Tr>
            {['Worker','Area','Status','Tasks','Resolved','Completion Rate','Points'].map(h => (
              <Th key={h} py={3} fontSize="xs">{h}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {workers.map(w => (
            <Tr key={w._id} _hover={{ bg: subtleBg }}>
              <Td py={3}>
                <HStack spacing={2}>
                  <Avatar size="xs" name={w.name} src={w.picture}/>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">{w.name}</Text>
                    <Text fontSize="10px" color="gray.400">{w.email}</Text>
                  </Box>
                </HStack>
              </Td>
              <Td fontSize="xs" color="gray.500">{w.area}</Td>
              <Td>
                <Badge colorScheme={w.isAvailable ? 'green' : 'yellow'} fontSize="10px" borderRadius="full">
                  {w.isAvailable ? 'Available' : 'Busy'}
                </Badge>
              </Td>
              <Td py={3}>
                <Text fontSize="sm" fontWeight="bold">{w.assignedTasks}</Text>
              </Td>
              <Td py={3}>
                <Text fontSize="sm" fontWeight="bold" color="green.500">{w.resolved}</Text>
              </Td>
              <Td py={3} minW="120px">
                <Flex align="center" gap={2}>
                  <Progress
                    value={w.completionRate} size="sm" borderRadius="full"
                    colorScheme={w.completionRate >= 80 ? 'green' : w.completionRate >= 50 ? 'yellow' : 'red'}
                    flex={1}
                  />
                  <Text fontSize="xs" fontWeight="bold" minW="30px">{w.completionRate}%</Text>
                </Flex>
              </Td>
              <Td py={3}>
                <Badge colorScheme="purple" fontSize="10px">{w.points} pts</Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default WorkerPerformancePanel;