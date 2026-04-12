import React, { useState } from 'react';
import ImageUpload from '../components/ReportWaste/ImageUpload';
import LocationPicker from '../components/ReportWaste/LocationPicker';
import ReportFormDetails from '../components/ReportWaste/ReportFormDetails';
import SubmitButton from '../components/ReportWaste/SubmitButton';
import {
  Box, Heading, Flex, Text, VStack, HStack,
  useColorModeValue, Badge, Icon, Divider, Container,
} from '@chakra-ui/react';
import { FiCamera, FiMapPin, FiFileText, FiSend } from 'react-icons/fi';

const STEPS = [
  { icon: FiCamera,   label: 'Upload Image',   desc: 'Take or upload a clear photo of the waste' },
  { icon: FiFileText, label: 'Describe Waste',  desc: 'Add category and description'              },
  { icon: FiMapPin,   label: 'Confirm Location',desc: 'Allow GPS or drag the pin'                 },
  { icon: FiSend,     label: 'Submit',          desc: 'AI analysis runs automatically'            },
];

const ReportWaste = () => {
  const [selectedFile, setSelectedFile] = useState([]);
  const [location, setLocation]         = useState({ lat: null, lng: null });
  const [placeName, setPlaceName]       = useState('');
  const [formDetails, setFormDetails]   = useState({ description: '', category: '' });

  const pageBg    = useColorModeValue('gray.50', 'gray.900');
  const cardBg    = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.100', 'gray.700');
  const stepBg    = useColorModeValue('green.50', 'green.900');

  return (
    <Box bg={pageBg} minH="100vh">
      {/* Hero Banner */}
      <Box bgGradient="linear(135deg, green.600, teal.500)" py={10} px={6}>
        <Container maxW="container.xl">
          <VStack spacing={2} align="start">
            <Badge colorScheme="whiteAlpha" bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="full" fontSize="xs">
              🌿 Make Your City Cleaner
            </Badge>
            <Heading color="white" fontSize={{ base: '2xl', md: '3xl' }}>
              Report a Waste Issue
            </Heading>
            <Text color="whiteAlpha.800" fontSize="sm">
              Your report triggers AI analysis and notifies the right authorities automatically.
            </Text>

            {/* Step indicators */}
            <HStack spacing={0} mt={4} flexWrap="wrap" gap={2}>
              {STEPS.map((step, i) => (
                <HStack key={i} spacing={2}>
                  <HStack
                    bg="whiteAlpha.200" px={3} py={1.5} borderRadius="xl" spacing={2}
                    _hover={{ bg: 'whiteAlpha.300' }} transition="all 0.2s"
                  >
                    <Box
                      bg="whiteAlpha.400" borderRadius="full" w="22px" h="22px"
                      display="flex" alignItems="center" justifyContent="center"
                    >
                      <Text fontSize="10px" color="white" fontWeight="bold">{i + 1}</Text>
                    </Box>
                    <Icon as={step.icon} color="white" boxSize={3.5} />
                    <Text color="white" fontSize="xs" fontWeight="medium">{step.label}</Text>
                  </HStack>
                  {i < STEPS.length - 1 && (
                    <Text color="whiteAlpha.500" fontSize="xs">→</Text>
                  )}
                </HStack>
              ))}
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6} align="start">

          {/* ── Left Column ── */}
          <Box flex={1.1}>
            {/* Image Upload Card */}
            <Box bg={cardBg} borderRadius="2xl" p={6} boxShadow="md" borderWidth="1px" borderColor={borderCol} mb={5}>
              <HStack mb={4} spacing={2}>
                <Box bg="green.100" p={2} borderRadius="lg" _dark={{ bg: 'green.800' }}>
                  <Icon as={FiCamera} color="green.600" boxSize={4} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Upload Photos</Text>
                  <Text fontSize="xs" color="gray.500">Clear photos help AI classify waste accurately</Text>
                </Box>
              </HStack>
              <ImageUpload selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
            </Box>

            {/* Form Details Card */}
            <Box bg={cardBg} borderRadius="2xl" p={6} boxShadow="md" borderWidth="1px" borderColor={borderCol} mb={5}>
              <HStack mb={4} spacing={2}>
                <Box bg="blue.100" p={2} borderRadius="lg" _dark={{ bg: 'blue.800' }}>
                  <Icon as={FiFileText} color="blue.600" boxSize={4} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Waste Details</Text>
                  <Text fontSize="xs" color="gray.500">Better description = smarter AI recommendations</Text>
                </Box>
              </HStack>
              <ReportFormDetails formDetails={formDetails} setFormDetails={setFormDetails} />
            </Box>

            {/* AI Info Banner */}
            <Box
              bg={stepBg} borderRadius="2xl" p={5}
              borderWidth="1px" borderColor="green.200"
              _dark={{ borderColor: 'green.700' }} mb={5}
            >
              <Text fontWeight="bold" color="green.700" fontSize="sm" mb={2} _dark={{ color: 'green.300' }}>
                🤖 What happens after you submit?
              </Text>
              <VStack align="start" spacing={1}>
                {[
                  '📸 Image analyzed by AI to detect waste materials',
                  '🌦 Live weather fetched to assess health risk',
                  '📍 Location checked for nearby hospitals/schools',
                  '💬 Your description analyzed for urgency',
                  '🔢 Priority score (0–100) calculated automatically',
                ].map((item, i) => (
                  <Text key={i} fontSize="xs" color="gray.600" _dark={{ color: 'gray.300' }}>{item}</Text>
                ))}
              </VStack>
            </Box>

            {/* Submit Button */}
            <Box bg={cardBg} borderRadius="2xl" p={6} boxShadow="md" borderWidth="1px" borderColor={borderCol}>
              <HStack mb={4} spacing={2}>
                <Box bg="teal.100" p={2} borderRadius="lg" _dark={{ bg: 'teal.800' }}>
                  <Icon as={FiSend} color="teal.600" boxSize={4} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Submit Report</Text>
                  <Text fontSize="xs" color="gray.500">Complete all steps to enable submission</Text>
                </Box>
              </HStack>
              <SubmitButton
                selectedFile={selectedFile}
                location={location}
                formDetails={formDetails}
                placeName={placeName}
              />
            </Box>
          </Box>

          {/* ── Right Column: Map ── */}
          <Box flex={1} position={{ lg: 'sticky' }} top="80px">
            <Box bg={cardBg} borderRadius="2xl" p={6} boxShadow="md" borderWidth="1px" borderColor={borderCol}>
              <HStack mb={4} spacing={2}>
                <Box bg="orange.100" p={2} borderRadius="lg" _dark={{ bg: 'orange.800' }}>
                  <Icon as={FiMapPin} color="orange.600" boxSize={4} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Pin Location</Text>
                  <Text fontSize="xs" color="gray.500">Drag the marker or click anywhere on the map</Text>
                </Box>
              </HStack>
              <LocationPicker
                location={location}
                setLocation={setLocation}
                onPlaceNameChange={setPlaceName}
              />
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default ReportWaste;