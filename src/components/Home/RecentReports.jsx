import React, { useState, useRef } from 'react';
import {
  Box, Text, SimpleGrid, Image, Stack, Avatar,
  useColorModeValue, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, useDisclosure, Badge,
} from '@chakra-ui/react';
import { motion, useInView } from 'framer-motion';

const MotionBox = motion(Box);

const reports = [
  {
    id: 1,
    title: 'Overflowing Garbage Bin',
    location: 'Sector 22, Noida',
    time: '2 hours ago',
    status: 'In Progress',
    statusColor: 'orange',
    description: 'The garbage bin near the main market is severely overflowing, causing a foul smell and attracting pests. Immediate cleanup required.',
    imageUrl: 'https://images.unsplash.com/photo-1574974671999-24b7dfbb0d53?q=80&w=1170&auto=format&fit=crop',
    reportedBy: 'Ravi Kumar',
    category: 'Plastic Waste',
    upvotes: 42,
  },
  {
    id: 2,
    title: 'Illegal Dumping Site',
    location: 'Andheri West, Mumbai',
    time: '5 hours ago',
    status: 'Resolved',
    statusColor: 'green',
    description: 'A large pile of mixed waste has been illegally dumped near the residential complex. Authorities have been informed and cleanup is scheduled.',
    imageUrl: 'https://images.unsplash.com/photo-1679161837515-aa234d3a1fff?q=80&w=1008&auto=format&fit=crop',
    reportedBy: 'Anjali Mehta',
    category: 'Mixed Waste',
    upvotes: 87,
  },
  {
    id: 3,
    title: 'Construction Debris',
    location: 'Rajajinagar, Bangalore',
    time: '1 day ago',
    status: 'Pending',
    statusColor: 'red',
    description: 'Builders have left construction debris on the public footpath, making it dangerous for pedestrians and blocking access.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1008&auto=format&fit=crop',
    reportedBy: 'Rahul Verma',
    category: 'Construction Debris',
    upvotes: 29,
  },
];

const statusConfig = {
  'In Progress': { color: '#d97706', bg: '#fffbeb', darkBg: 'rgba(217,119,6,0.1)', dot: '#d97706' },
  'Resolved': { color: '#16a34a', bg: '#f0fdf4', darkBg: 'rgba(22,163,74,0.1)', dot: '#4ade80' },
  'Pending': { color: '#dc2626', bg: '#fef2f2', darkBg: 'rgba(220,38,38,0.1)', dot: '#f87171' },
};

const ReportCard = ({ report, onClick, index, isInView }) => {
  const cardBg = useColorModeValue('white', '#1a2e1a');
  const cardBorder = useColorModeValue('rgba(22,163,74,0.1)', 'rgba(74,222,128,0.08)');
  const textMain = useColorModeValue('#111827', '#f9fafb');
  const textSub = useColorModeValue('#6b7280', '#9ca3af');
  const metaBg = useColorModeValue('rgba(22,163,74,0.06)', 'rgba(74,222,128,0.05)');
  const cfg = statusConfig[report.status];

  return (
    <MotionBox
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      cursor="pointer"
      role="group"
    >
      <Box
        bg={cardBg}
        border="1px solid" borderColor={cardBorder}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="0 4px 24px rgba(0,0,0,0.07)"
        transition="all 0.3s ease"
        _hover={{
          boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
          borderColor: 'rgba(22,163,74,0.25)',
        }}
        h="100%"
        display="flex" flexDir="column"
      >
        {/* Image */}
        <Box position="relative" overflow="hidden" h="220px">
          <Image
            src={report.imageUrl} alt={report.title}
            w="100%" h="100%" objectFit="cover"
            transition="transform 0.5s ease"
            _groupHover={{ transform: 'scale(1.06)' }}
          />
          {/* Gradient overlay */}
          <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(0,0,0,0.5) 0%, transparent 60%)" />

          {/* Status badge */}
          <Box position="absolute" top={4} left={4}>
            <Box
              display="inline-flex" alignItems="center" gap={1.5}
              bg={useColorModeValue(cfg.bg, cfg.darkBg)}
              backdropFilter="blur(8px)"
              border="1px solid" borderColor={`${cfg.dot}30`}
              borderRadius="full" px={3} py={1}
            >
              <Box w={1.5} h={1.5} borderRadius="full" bg={cfg.dot} style={{ boxShadow: `0 0 6px ${cfg.dot}` }} />
              <Text fontSize="xs" fontWeight="600" color={cfg.color}>{report.status}</Text>
            </Box>
          </Box>

          {/* Upvotes badge */}
          <Box position="absolute" top={4} right={4}>
            <Box
              display="inline-flex" alignItems="center" gap={1}
              bg="rgba(0,0,0,0.4)" backdropFilter="blur(8px)"
              borderRadius="full" px={3} py={1}
            >
              <Text fontSize="xs">👍</Text>
              <Text fontSize="xs" fontWeight="600" color="white">{report.upvotes}</Text>
            </Box>
          </Box>

          {/* Category label at bottom */}
          <Box position="absolute" bottom={3} left={4}>
            <Text fontSize="xs" color="rgba(255,255,255,0.7)" fontWeight="500">{report.category}</Text>
          </Box>
        </Box>

        {/* Content */}
        <Box p={5} flex="1" display="flex" flexDir="column">
          <Text fontSize="lg" fontWeight="700" color={textMain} mb={2} lineHeight="1.3"
            fontFamily="'Georgia', serif">
            {report.title}
          </Text>

          <Stack direction="row" spacing={4} mb={3}>
            <Box display="flex" alignItems="center" gap={1.5}
              bg={metaBg} borderRadius="full" px={3} py={1}>
              <Text fontSize="xs">📍</Text>
              <Text fontSize="xs" fontWeight="500" color={textSub}>{report.location}</Text>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}
              bg={metaBg} borderRadius="full" px={3} py={1}>
              <Text fontSize="xs">⏰</Text>
              <Text fontSize="xs" fontWeight="500" color={textSub}>{report.time}</Text>
            </Box>
          </Stack>

          <Text fontSize="sm" color={textSub} lineHeight="1.6" noOfLines={2} mb={4} flex="1">
            {report.description}
          </Text>

          {/* Reporter */}
          <Box display="flex" alignItems="center" gap={2} pt={4}
            borderTop="1px solid" borderColor={useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.06)')}>
            <Avatar size="xs" name={report.reportedBy} bg="green.500" />
            <Text fontSize="xs" color={textSub}>
              Reported by <Text as="span" fontWeight="600" color={textMain}>{report.reportedBy}</Text>
            </Text>
          </Box>
        </Box>
      </Box>
    </MotionBox>
  );
};

const RecentReports = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const bg = useColorModeValue('#f8fafc', '#0d1117');
  const textMain = useColorModeValue('#111827', '#f9fafb');
  const textSub = useColorModeValue('#6b7280', '#9ca3af');
  const modalBg = useColorModeValue('white', '#1a2e1a');
  const cfg = selectedReport ? statusConfig[selectedReport.status] : null;

  const handleOpen = (report) => { setSelectedReport(report); onOpen(); };

  return (
    <Box ref={ref} bg={bg} py={{ base: 20, md: 32 }} px={{ base: 6, md: 16, lg: 24 }} position="relative" overflow="hidden">
      {/* Decorative blob */}
      <Box
        position="absolute" bottom="-100px" right="-100px"
        w="500px" h="500px" borderRadius="full"
        bg={useColorModeValue('rgba(22,163,74,0.05)', 'rgba(74,222,128,0.03)')}
        pointerEvents="none"
      />

      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        textAlign="center" mb={{ base: 14, md: 20 }} position="relative" zIndex={1}
      >
        <Box
          display="inline-flex" alignItems="center" gap={2}
          bg={useColorModeValue('#f0fdf4', 'rgba(74,222,128,0.1)')}
          border="1px solid" borderColor={useColorModeValue('rgba(22,163,74,0.2)', 'rgba(74,222,128,0.2)')}
          borderRadius="full" px={4} py={1.5} mb={5}
        >
          <Box w={2} h={2} borderRadius="full" bg="#4ade80"
            style={{ boxShadow: '0 0 8px rgba(74,222,128,0.8)', animation: 'livepulse 2s infinite' }} />
          <Text fontSize="xs" fontWeight="600" color={useColorModeValue('#15803d', '#4ade80')} letterSpacing="0.1em" textTransform="uppercase">
            Live Feed
          </Text>
        </Box>
        <Text
          as="h2" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800"
          color={textMain} fontFamily="'Georgia', serif"
          letterSpacing="-0.02em" lineHeight="1.15"
        >
          Recent Reports
        </Text>
        <Text fontSize={{ base: 'md', md: 'lg' }} color={textSub} mt={4} maxW="420px" mx="auto" lineHeight="1.7">
          See what your fellow citizens are reporting right now across the country.
        </Text>
      </MotionBox>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={7} position="relative" zIndex={1}>
        {reports.map((report, i) => (
          <ReportCard key={report.id} report={report} onClick={() => handleOpen(report)} index={i} isInView={isInView} />
        ))}
      </SimpleGrid>

      {/* Modal */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered motionPreset="scale">
          <ModalOverlay backdropFilter="blur(8px)" bg="rgba(0,0,0,0.6)" />
          <ModalContent bg={modalBg} borderRadius="2xl" overflow="hidden" border="1px solid"
            borderColor={useColorModeValue('rgba(22,163,74,0.15)', 'rgba(74,222,128,0.1)')} mx={4}>
            <Box position="relative" h="260px" overflow="hidden">
              <Image src={selectedReport.imageUrl} alt={selectedReport.title} w="100%" h="100%" objectFit="cover" />
              <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(0,0,0,0.7), transparent)" />
              <Box position="absolute" top={4} left={4}
                display="inline-flex" alignItems="center" gap={1.5}
                bg="rgba(255,255,255,0.15)" backdropFilter="blur(8px)"
                border="1px solid rgba(255,255,255,0.2)"
                borderRadius="full" px={3} py={1}
              >
                <Box w={2} h={2} borderRadius="full" bg={cfg?.dot} style={{ boxShadow: `0 0 6px ${cfg?.dot}` }} />
                <Text fontSize="xs" fontWeight="600" color="white">{selectedReport.status}</Text>
              </Box>
            </Box>
            <ModalCloseButton top={3} right={3} color="white" bg="rgba(0,0,0,0.3)" borderRadius="full" />

            <ModalBody pb={8} pt={6}>
              <Text as="h3" fontSize="2xl" fontWeight="700" color={textMain}
                fontFamily="'Georgia', serif" mb={1} lineHeight="1.2">
                {selectedReport.title}
              </Text>
              <Text fontSize="sm" color={textSub} mb={5}>{selectedReport.category}</Text>

              <Stack spacing={3} mb={5}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Text fontSize="md">📍</Text>
                  <Text fontWeight="600" color={textSub} fontSize="sm">{selectedReport.location}</Text>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Text fontSize="md">⏰</Text>
                  <Text fontWeight="600" color={textSub} fontSize="sm">{selectedReport.time}</Text>
                </Box>
              </Stack>

              <Text fontSize="md" color={textMain} lineHeight="1.7" mb={6}>
                {selectedReport.description}
              </Text>

              <Box display="flex" alignItems="center" gap={3} pt={4}
                borderTop="1px solid" borderColor={useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)')}>
                <Avatar size="sm" name={selectedReport.reportedBy} bg="green.500" />
                <Text fontSize="sm" color={textSub}>
                  Reported by <Text as="span" fontWeight="700" color={textMain}>{selectedReport.reportedBy}</Text>
                </Text>
                <Box ml="auto" display="flex" alignItems="center" gap={1}>
                  <Text fontSize="sm">👍</Text>
                  <Text fontSize="sm" fontWeight="700" color={textMain}>{selectedReport.upvotes}</Text>
                </Box>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      <style>{`
        @keyframes livepulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(74,222,128,0.8); }
          50% { opacity: 0.5; box-shadow: 0 0 2px rgba(74,222,128,0.3); }
        }
      `}</style>
    </Box>
  );
};

export default RecentReports;