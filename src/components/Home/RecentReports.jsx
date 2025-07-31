import React, { useState } from 'react';
import {
  Box,
  Heading,
  Image,
  Text,
  Stack,
  SimpleGrid,
  Avatar,
  useColorModeValue,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const reports = [
  {
    id: 1,
    title: 'Overflowing Garbage Bin',
    location: 'Sector 22, Noida',
    time: '2 hours ago',
    description: 'The garbage bin is overflowing and causing a foul smell.',
    imageUrl: 'https://images.unsplash.com/photo-1574974671999-24b7dfbb0d53?q=80&w=1170&auto=format&fit=crop',
    reportedBy: 'Ravi Kumar',
  },
  {
    id: 2,
    title: 'Pothole on Road',
    location: 'Andheri West, Mumbai',
    time: '5 hours ago',
    description: 'A deep pothole is causing traffic issues.',
    imageUrl: 'https://images.unsplash.com/photo-1717667745836-145a38948ebf?q=80&w=1074&auto=format&fit=crop',
    reportedBy: 'Anjali Mehta',
  },
  {
    id: 3,
    title: 'Illegal Dumping',
    location: 'Rajajinagar, Bangalore',
    time: '1 day ago',
    description: 'People are dumping waste in an empty plot.',
    imageUrl: 'https://images.unsplash.com/photo-1679161837515-aa234d3a1fff?q=80&w=1008&auto=format&fit=crop',
    reportedBy: 'Rahul Verma',
  },
];

const RecentReports = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState(null);

  const handleOpenModal = (report) => {
    setSelectedReport(report);
    onOpen();
  };

  return (
    <Box px={{ base: 4, md: 20 }} py={16} bg={useColorModeValue('gray.100', 'gray.800')}>
      <Heading mb={10} textAlign="center" color="green.600" fontSize="4xl">
        Recent Reports
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        {reports.map((report) => (
          <Box
            key={report.id}
            bg={useColorModeValue('white', 'gray.700')}
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="lg"
            transition="all 0.3s ease"
            _hover={{ transform: 'translateY(-6px) scale(1.02)', boxShadow: '2xl', cursor: 'pointer' }}
            onClick={() => handleOpenModal(report)}
          >
            <Image src={report.imageUrl} alt={report.title} w="100%" h="200px" objectFit="cover" />

            <Box p={5}>
              <Text fontSize="lg" fontWeight="bold" mb={1} color="green.600">
                {report.title}
              </Text>

              <Stack direction="row" align="center" fontSize="sm" color="gray.500" mb={2}>
                <Icon as={FaMapMarkerAlt} />
                <Text>{report.location}</Text>
                <Icon as={FaClock} ml={4} />
                <Text>{report.time}</Text>
              </Stack>

              <Text fontSize="sm" mb={4} noOfLines={2}>
                {report.description}
              </Text>

              <Stack direction="row" align="center">
                <Avatar size="sm" name={report.reportedBy} />
                <Text fontSize="sm" color="gray.600">
                  Reported by <strong>{report.reportedBy}</strong>
                </Text>
              </Stack>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {/* Modal for full report view */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered motionPreset="scale">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="green.600">{selectedReport.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Image src={selectedReport.imageUrl} alt={selectedReport.title} borderRadius="lg" mb={4} />
              <Stack spacing={3}>
                <Text fontWeight="semibold" color="gray.600">
                  <Icon as={FaMapMarkerAlt} mr={2} />
                  {selectedReport.location}
                </Text>
                <Text fontWeight="semibold" color="gray.600">
                  <Icon as={FaClock} mr={2} />
                  {selectedReport.time}
                </Text>
                <Text fontSize="md" color="gray.700">
                  {selectedReport.description}
                </Text>
                <Stack direction="row" align="center" mt={4}>
                  <Avatar size="sm" name={selectedReport.reportedBy} />
                  <Text fontSize="sm" color="gray.600">
                    Reported by <strong>{selectedReport.reportedBy}</strong>
                  </Text>
                </Stack>
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default RecentReports;
