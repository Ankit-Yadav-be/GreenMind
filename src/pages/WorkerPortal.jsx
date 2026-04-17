import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Text, VStack, HStack, SimpleGrid,
  Button, Badge, Spinner, Flex, Icon, Image, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, Divider, Alert, AlertIcon,
  Progress, useColorModeValue, Tabs, TabList, Tab, TabPanels, TabPanel,
} from '@chakra-ui/react';
import {
  FiCheckCircle, FiClock, FiMapPin, FiCamera, FiUpload,
  FiAlertCircle, FiTrendingUp, FiUser,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLOR = { pending:'yellow', 'in-progress':'blue', resolved:'green', rejected:'red' };
const PRIORITY_COLOR = { High:'red', Medium:'yellow', Low:'green' };

const StatBox = ({ label, value, color, icon }) => {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <Box bg={bg} p={5} borderRadius="2xl" boxShadow="md" borderTopWidth="3px" borderTopColor={`${color}.400`}>
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{label}</Text>
          <Text fontSize="3xl" fontWeight="extrabold" color={`${color}.500`}>{value}</Text>
        </Box>
        <Box bg={`${color}.50`} p={3} borderRadius="xl" _dark={{ bg:`${color}.900` }}>
          <Icon as={icon} boxSize={6} color={`${color}.500`}/>
        </Box>
      </Flex>
    </Box>
  );
};

const TaskCard = ({ task, onSubmitProof }) => {
  const cardBg   = useColorModeValue('white', 'gray.800');
  const borderCol= useColorModeValue('gray.100', 'gray.700');

  return (
    <MotionBox whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Box bg={cardBg} borderRadius="2xl" overflow="hidden" boxShadow="md"
        borderWidth="1px" borderColor={borderCol}
        borderLeftWidth="4px"
        borderLeftColor={task.status === 'resolved' ? 'green.400' : 'blue.400'}>
        <Box p={4}>
          <Flex justify="space-between" align="start" mb={3}>
            <Badge colorScheme={STATUS_COLOR[task.status]} borderRadius="full" px={2} fontSize="xs">
              {task.status}
            </Badge>
            {task.priorityLevel && (
              <Badge colorScheme={PRIORITY_COLOR[task.priorityLevel]} fontSize="xs">
                {task.priorityLevel} Priority
              </Badge>
            )}
          </Flex>

          <Text fontWeight="bold" fontSize="md" mb={1} noOfLines={2}>{task.description}</Text>
          <HStack fontSize="xs" color="gray.500" mb={1}>
            <Icon as={FiMapPin}/>
            <Text noOfLines={1}>{task.location?.address || 'Location on map'}</Text>
          </HStack>
          <HStack fontSize="xs" color="gray.500" mb={3}>
            <Icon as={FiClock}/>
            <Text>Assigned: {new Date(task.assignedWorker?.assignedAt).toLocaleDateString('en-IN')}</Text>
          </HStack>

          {task.images?.[0]?.url && (
            <Image src={task.images[0].url} h="100px" w="100%" objectFit="cover" borderRadius="xl" mb={3}/>
          )}

          {task.completionProof?.imageUrl ? (
            <Box>
              <HStack color="green.500" mb={2}>
                <Icon as={FiCheckCircle}/>
                <Text fontSize="sm" fontWeight="bold">Proof Submitted</Text>
              </HStack>
              <Image src={task.completionProof.imageUrl} h="80px" w="100%" objectFit="cover" borderRadius="lg"/>
              <Text fontSize="xs" color="gray.400" mt={1}>
                {task.completionProof.locationVerified ? '✅ Location verified' : `⚠️ ${task.completionProof.distanceMeters}m from complaint`}
              </Text>
            </Box>
          ) : task.status === 'in-progress' ? (
            <Button
              size="sm" w="full" colorScheme="green" borderRadius="xl"
              leftIcon={<FiCamera/>}
              bgGradient="linear(135deg, green.500, teal.400)"
              _hover={{ bgGradient: 'linear(135deg, green.600, teal.500)' }}
              onClick={() => onSubmitProof(task)}
            >
              Submit Proof of Cleanup
            </Button>
          ) : null}
        </Box>
      </Box>
    </MotionBox>
  );
};

const WorkerPortal = () => {
  const [dashboard, setDashboard]   = useState(null);
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedTask, setSelected] = useState(null);
  const [proofFile, setProofFile]   = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [locating, setLocating]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tabIndex, setTabIndex]     = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef(null);
  const toast = useToast();

  const bg       = useColorModeValue('gray.50', 'gray.900');
  const cardBg   = useColorModeValue('white',   'gray.800');
  const borderCol= useColorModeValue('gray.100','gray.700');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, taskRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/workers-portal/dashboard`, { credentials:'include' }),
        fetch(`${BACKEND_URL}/api/workers-portal/tasks`,     { credentials:'include' }),
      ]);
      const dashData = await dashRes.json();
      const taskData = await taskRes.json();
      if (dashData.status === 'success') setDashboard(dashData.data);
      if (taskData.status === 'success') setTasks(taskData.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmitProof = (task) => {
    setSelected(task);
    setProofFile(null);
    setProofPreview(null);
    setWorkerLocation(null);
    onOpen();
    // Auto-detect location
    detectLocation();
  };

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      pos => { setWorkerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      ()  => { setLocating(false); toast({ title: 'Could not detect location', status:'warning', position:'top-right' }); }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleProofSubmit = async () => {
    if (!proofFile) { toast({ title:'Please select a proof photo', status:'warning', position:'top-right' }); return; }
    if (!workerLocation) { toast({ title:'Location required', description:'Please allow GPS access', status:'warning', position:'top-right' }); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('proof', proofFile);
      formData.append('workerLat', workerLocation.lat);
      formData.append('workerLng', workerLocation.lng);

      const res  = await fetch(`${BACKEND_URL}/api/workers-portal/submit-proof/${selectedTask._id}`, {
        method: 'POST', body: formData, credentials: 'include',
      });
      const data = await res.json();

      if (data.status === 'success') {
        toast({
          title: data.data.locationVerified ? '✅ Proof Verified!' : '⚠️ Proof Uploaded',
          description: data.message,
          status: data.data.locationVerified ? 'success' : 'warning',
          duration: 6000, position:'top-right',
        });
        onClose();
        fetchData();
      } else throw new Error(data.message);
    } catch (err) {
      toast({ title:'Submission failed', description: err.message, status:'error', position:'top-right' });
    } finally { setSubmitting(false); }
  };

  const pendingTasks   = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'resolved');

  if (loading) return (
    <Flex h="100vh" align="center" justify="center" direction="column" gap={4}>
      <Spinner size="xl" color="green.500" thickness="4px"/>
      <Text color="gray.400">Loading your portal…</Text>
    </Flex>
  );

  return (
    <Box bg={bg} minH="100vh" pb={12}>
      {/* Banner */}
      <Box bgGradient="linear(135deg, teal.600, green.500)" px={8} py={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <HStack mb={1}>
                <Icon as={FiUser} color="whiteAlpha.700"/>
                <Text color="whiteAlpha.700" fontSize="sm">Worker Portal</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="extrabold" color="white">
                Welcome, {dashboard?.profile?.name || 'Worker'} 👷
              </Text>
              <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                Area: {dashboard?.profile?.workerProfile?.area || 'All Areas'}
              </Text>
            </Box>
            <Button size="sm" bg="whiteAlpha.200" color="white" onClick={fetchData}
              _hover={{ bg:'whiteAlpha.300' }}>Refresh</Button>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" mt={6}>
        {/* Stats */}
        <SimpleGrid columns={{ base:2, md:4 }} spacing={4} mb={6}>
          <StatBox label="Total Assigned" value={dashboard?.stats?.assigned || 0}    color="blue"   icon={FiAlertCircle}/>
          <StatBox label="Completed"      value={dashboard?.stats?.completed || 0}   color="green"  icon={FiCheckCircle}/>
          <StatBox label="Pending"        value={dashboard?.stats?.pending || 0}     color="yellow" icon={FiClock}/>
          <StatBox label="Completion Rate" value={`${dashboard?.stats?.completionRate || 0}%`} color="teal" icon={FiTrendingUp}/>
        </SimpleGrid>

        {/* Tasks */}
        <Tabs colorScheme="green" index={tabIndex} onChange={setTabIndex}>
          <TabList mb={4}>
            <Tab>Active Tasks ({pendingTasks.length})</Tab>
            <Tab>Completed ({completedTasks.length})</Tab>
            <Tab>All Tasks ({tasks.length})</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              {pendingTasks.length === 0 ? (
                <Flex py={12} direction="column" align="center" gap={3}>
                  <Text fontSize="3xl">✅</Text>
                  <Text color="gray.400">No active tasks right now</Text>
                </Flex>
              ) : (
                <SimpleGrid columns={{ base:1, md:2, lg:3 }} spacing={4}>
                  {pendingTasks.map(t => <TaskCard key={t._id} task={t} onSubmitProof={handleSubmitProof}/>)}
                </SimpleGrid>
              )}
            </TabPanel>
            <TabPanel px={0}>
              <SimpleGrid columns={{ base:1, md:2, lg:3 }} spacing={4}>
                {completedTasks.map(t => <TaskCard key={t._id} task={t} onSubmitProof={handleSubmitProof}/>)}
              </SimpleGrid>
            </TabPanel>
            <TabPanel px={0}>
              <SimpleGrid columns={{ base:1, md:2, lg:3 }} spacing={4}>
                {tasks.map(t => <TaskCard key={t._id} task={t} onSubmitProof={handleSubmitProof}/>)}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Proof Submission Modal */}
      {selectedTask && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(4px)"/>
          <ModalContent bg={cardBg} borderRadius="2xl">
            <ModalHeader borderBottomWidth="1px" borderColor={borderCol}>
              Submit Cleanup Proof
              <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={0.5}>
                {selectedTask.description?.slice(0, 60)}…
              </Text>
            </ModalHeader>
            <ModalCloseButton/>
            <ModalBody pb={6} pt={4}>
              <VStack spacing={5} align="stretch">

                <Alert status="info" borderRadius="xl">
                  <AlertIcon/>
                  <Text fontSize="sm">
                    You must be within <strong>500 meters</strong> of the complaint location for auto-resolution. Your GPS will be checked.
                  </Text>
                </Alert>

                {/* Location Status */}
                <Box p={4} bg={useColorModeValue('gray.50','gray.700')} borderRadius="xl">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="bold">Your GPS Location</Text>
                    <Button size="xs" colorScheme="teal" onClick={detectLocation} isLoading={locating}>
                      Refresh GPS
                    </Button>
                  </HStack>
                  {workerLocation ? (
                    <HStack color="green.500">
                      <Icon as={FiCheckCircle}/>
                      <Text fontSize="sm">Location detected: {workerLocation.lat.toFixed(4)}, {workerLocation.lng.toFixed(4)}</Text>
                    </HStack>
                  ) : (
                    <HStack color="orange.500">
                      <Icon as={FiAlertCircle}/>
                      <Text fontSize="sm">{locating ? 'Detecting your location…' : 'Location not detected — click Refresh GPS'}</Text>
                    </HStack>
                  )}
                </Box>

                {/* Map showing complaint location */}
                {selectedTask.location?.coordinates && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Complaint Location</Text>
                    <Box h="180px" borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor={borderCol}>
                      <MapContainer
                        center={[selectedTask.location.coordinates[1], selectedTask.location.coordinates[0]]}
                        zoom={15} style={{ height:'100%', width:'100%' }} scrollWheelZoom={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <Marker position={[selectedTask.location.coordinates[1], selectedTask.location.coordinates[0]]}/>
                        <Circle
                          center={[selectedTask.location.coordinates[1], selectedTask.location.coordinates[0]]}
                          radius={500} color="green" fillOpacity={0.1}
                        />
                        {workerLocation && <Marker position={[workerLocation.lat, workerLocation.lng]}/>}
                      </MapContainer>
                    </Box>
                    <Text fontSize="xs" color="gray.400" mt={1}>Green circle = 500m radius allowed area</Text>
                  </Box>
                )}

                <Divider/>

                {/* Photo upload */}
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>Cleanup Photo Evidence</Text>
                  <input type="file" ref={fileInputRef} accept="image/*" capture="environment"
                    style={{ display:'none' }} onChange={handleFileChange}/>
                  <Button
                    w="full" variant="outline" colorScheme="green" borderRadius="xl"
                    leftIcon={<FiCamera/>} onClick={() => fileInputRef.current?.click()}
                    borderStyle="dashed" h="80px" fontSize="sm"
                  >
                    {proofFile ? 'Change Photo' : 'Take Photo or Upload'}
                  </Button>
                  {proofPreview && (
                    <Box mt={3}>
                      <Image src={proofPreview} h="160px" w="100%" objectFit="cover" borderRadius="xl"/>
                    </Box>
                  )}
                </Box>

                <Button
                  colorScheme="green" size="lg" borderRadius="xl"
                  bgGradient="linear(135deg, green.500, teal.400)"
                  _hover={{ bgGradient:'linear(135deg, green.600, teal.500)' }}
                  leftIcon={<FiUpload/>}
                  isLoading={submitting} loadingText="Submitting…"
                  onClick={handleProofSubmit}
                  isDisabled={!proofFile || !workerLocation}
                >
                  Submit Proof & Resolve Complaint
                </Button>

              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default WorkerPortal;