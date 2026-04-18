import React, { useEffect, useState } from 'react';
import {
  Box, Text, Table, Thead, Tbody, Tr, Th, Td, Badge,
  HStack, Progress, useColorModeValue, Spinner, Flex,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, Textarea, Button, useDisclosure, useToast,
  Avatar, VStack,
} from '@chakra-ui/react';
import { FiMessageSquare } from 'react-icons/fi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const AreaPerformancePanel = () => {
  const [areas,    setAreas]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [message,  setMessage]  = useState('');
  const [sending,  setSending]  = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast  = useToast();
  const subtleBg  = useColorModeValue('gray.50', 'gray.700');
  const cardBg    = useColorModeValue('white',   'gray.800');

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/analytics/areas`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setAreas(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !selected) return;
    setSending(true);
    try {
      await fetch(`${BACKEND_URL}/api/analytics/message/${selected.areaHeadId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });
      toast({ title: `Message sent to ${selected.areaHead}`, status:'success', duration:3000, position:'top-right' });
      setMessage('');
      onClose();
    } catch {
      toast({ title: 'Send failed', status:'error', duration:3000, position:'top-right' });
    } finally { setSending(false); }
  };

  if (loading) return <Flex py={6} justify="center"><Spinner size="sm" color="blue.500"/></Flex>;

  if (areas.length === 0) return (
    <Flex py={8} direction="column" align="center" gap={2}>
      <Text fontSize="2xl">📍</Text>
      <Text color="gray.400" fontSize="sm">No area heads assigned yet</Text>
    </Flex>
  );

  return (
    <>
      <Box overflowX="auto">
        <Table size="sm">
          <Thead bg={subtleBg}>
            <Tr>
              {['Area','Area Head','Reports','Resolved','Pending','High Priority','Avg Score','Rate','Actions'].map(h => (
                <Th key={h} py={3} fontSize="xs">{h}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {areas.map((a, i) => (
              <Tr key={i} _hover={{ bg: subtleBg }}>
                <Td py={3} fontWeight="medium" fontSize="sm">{a.area}</Td>
                <Td py={3}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">{a.areaHead}</Text>
                    <Text fontSize="10px" color="gray.400">{a.areaHeadEmail}</Text>
                  </VStack>
                </Td>
                <Td py={3}><Text fontSize="sm" fontWeight="bold">{a.total}</Text></Td>
                <Td py={3}><Text fontSize="sm" fontWeight="bold" color="green.500">{a.resolved}</Text></Td>
                <Td py={3}><Text fontSize="sm" fontWeight="bold" color="yellow.600">{a.pending}</Text></Td>
                <Td py={3}><Badge colorScheme="red" fontSize="10px">{a.high}</Badge></Td>
                <Td py={3}><Badge colorScheme={a.avgScore >= 70 ? 'red' : a.avgScore >= 40 ? 'yellow' : 'green'} fontSize="10px">{a.avgScore}</Badge></Td>
                <Td py={3} minW="110px">
                  <Flex align="center" gap={2}>
                    <Progress
                      value={a.resolutionRate} size="sm" borderRadius="full" flex={1}
                      colorScheme={a.resolutionRate >= 80 ? 'green' : a.resolutionRate >= 50 ? 'yellow' : 'red'}
                    />
                    <Text fontSize="xs" fontWeight="bold">{a.resolutionRate}%</Text>
                  </Flex>
                </Td>
                <Td py={3}>
                  <Button size="xs" leftIcon={<FiMessageSquare/>} colorScheme="blue" variant="outline"
                    onClick={() => { setSelected(a); setMessage(''); onOpen(); }}>
                    Message
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Message Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay backdropFilter="blur(4px)"/>
        <ModalContent bg={cardBg} borderRadius="2xl">
          <ModalHeader>
            <Text fontSize="md">Send Message to Area Head</Text>
            {selected && <Text fontSize="sm" fontWeight="normal" color="gray.500">{selected.areaHead} — {selected.area}</Text>}
          </ModalHeader>
          <ModalCloseButton/>
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your advice, instruction, or feedback here…"
                rows={5} borderRadius="xl" fontSize="sm"
              />
              <Button colorScheme="blue" w="full" borderRadius="xl"
                isLoading={sending} loadingText="Sending…"
                onClick={handleSendMessage} isDisabled={!message.trim()}>
                Send Message
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AreaPerformancePanel;