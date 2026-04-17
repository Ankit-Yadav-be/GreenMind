import React, { useState, useEffect } from 'react';
import {
  Box, Container, Text, SimpleGrid, Flex, Button, Badge,
  VStack, HStack, useColorModeValue, Spinner, Icon,
  Table, Thead, Tbody, Tr, Th, Td, Select, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, Input, useToast,
  Tabs, TabList, Tab, TabPanels, TabPanel, Alert, AlertIcon,
} from '@chakra-ui/react';
import {
  FiUsers, FiShield, FiActivity, FiCheckCircle,
  FiAlertCircle, FiPlusCircle, FiTrash2,
} from 'react-icons/fi';
import axios from 'axios';
import PriorityBadge from '../components/shared/PriorityBadge';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const CATEGORIES = [
  { value:'waste_collection',   label:'Waste Collection',   desc:'Plastic, Organic, General' },
  { value:'recycling',          label:'Recycling',          desc:'Paper, Metal, Glass, Textiles' },
  { value:'hazardous',          label:'Hazardous Waste',    desc:'Batteries, Chemical, Medical, Oil' },
  { value:'public_cleanliness', label:'Public Cleanliness', desc:'Furniture, Garden, Construction' },
  { value:'campaigns',          label:'Campaign Management',desc:'All categories' },
];

const ROLE_COLORS = {
  category_head: 'purple',
  area_head:     'blue',
  admin:         'red',
  super_admin:   'orange',
};

const SubAdminDashboard = ({ userRole }) => {
  const [subAdmins,  setSubAdmins]  = useState([]);
  const [reports,    setReports]    = useState([]);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [promoting,  setPromoting]  = useState(false);
  const [form,       setForm]       = useState({ userId:'', role:'category_head', category:'', area:'' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bg        = useColorModeValue('gray.50',  'gray.900');
  const cardBg    = useColorModeValue('white',    'gray.800');
  const borderCol = useColorModeValue('gray.100', 'gray.700');
  const subtleBg  = useColorModeValue('gray.50',  'gray.700');
  const fmtDate   = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const getStatusColor = (s) => ({ pending:'yellow', 'in-progress':'blue', resolved:'green', rejected:'red' }[s] || 'gray');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [saRes, rpRes, usrRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/sub-admin/list`,    { withCredentials:true }),
        axios.get(`${BACKEND_URL}/api/sub-admin/reports`, { withCredentials:true }),
        axios.get(`${BACKEND_URL}/api/sub-admin/users`,   { withCredentials:true }),
      ]);
      setSubAdmins(saRes.data.data || []);
      setReports(rpRes.data.data   || []);
      setUsers(usrRes.data.data    || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePromote = async () => {
    if (!form.userId || !form.role) { toast({ title:'Fill all fields', status:'warning', position:'top-right' }); return; }
    if (form.role === 'category_head' && !form.category) { toast({ title:'Select a category', status:'warning', position:'top-right' }); return; }
    if (form.role === 'area_head' && !form.area) { toast({ title:'Enter area name', status:'warning', position:'top-right' }); return; }

    setPromoting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/sub-admin/promote`, form, { withCredentials:true });
      toast({ title:'Promoted successfully', status:'success', duration:3000, position:'top-right' });
      onClose();
      fetchAll();
    } catch (err) {
      toast({ title:'Promotion failed', description: err.response?.data?.message, status:'error', position:'top-right' });
    } finally { setPromoting(false); }
  };

  const handleDemote = async (userId) => {
    if (!window.confirm('Demote this admin to regular user?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/sub-admin/demote/${userId}`, { withCredentials:true });
      toast({ title:'Demoted to user', status:'success', duration:2000, position:'top-right' });
      fetchAll();
    } catch (err) {
      toast({ title:'Failed', status:'error', position:'top-right' });
    }
  };

  if (loading) return (
    <Flex h="100vh" align="center" justify="center">
      <Spinner size="xl" color="teal.500"/>
    </Flex>
  );

  const isSuperAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <Box bg={bg} minH="100vh" pb={12}>
      <Box bgGradient="linear(135deg, purple.700, teal.500)" px={8} py={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <HStack mb={1}><Icon as={FiShield} color="whiteAlpha.700"/><Text color="whiteAlpha.700" fontSize="sm">Admin Hierarchy</Text></HStack>
              <Text fontSize="2xl" fontWeight="extrabold" color="white">Sub-Admin Management</Text>
              <Text color="whiteAlpha.800" fontSize="sm">Manage category heads and area heads</Text>
            </Box>
            {isSuperAdmin && (
              <Button leftIcon={<FiPlusCircle/>} bg="white" color="purple.700"
                onClick={onOpen} size="sm" fontWeight="bold">
                Promote Admin
              </Button>
            )}
          </Flex>

          <HStack mt={5} spacing={4} flexWrap="wrap">
            {[
              { label:'Sub Admins',       value: subAdmins.length },
              { label:'Category Heads',   value: subAdmins.filter(a => a.role === 'category_head').length },
              { label:'Area Heads',       value: subAdmins.filter(a => a.role === 'area_head').length },
              { label:'Reports Visible',  value: reports.length },
            ].map(({ label, value }) => (
              <Box key={label} bg="whiteAlpha.200" px={4} py={2} borderRadius="xl">
                <Text fontSize="xs" color="whiteAlpha.700">{label}</Text>
                <Text fontSize="xl" fontWeight="extrabold" color="white">{value}</Text>
              </Box>
            ))}
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" mt={6}>
        <Tabs colorScheme="purple">
          <TabList mb={4}>
            <Tab>Sub-Admin Team ({subAdmins.length})</Tab>
            <Tab>My Reports ({reports.length})</Tab>
            {isSuperAdmin && <Tab>Promote Users</Tab>}
          </TabList>
          <TabPanels>

            {/* Sub-Admin List */}
            <TabPanel px={0}>
              {subAdmins.length === 0 ? (
                <Flex py={12} direction="column" align="center" gap={3}>
                  <Text fontSize="3xl">👥</Text>
                  <Text color="gray.400">No sub-admins yet</Text>
                  {isSuperAdmin && <Button colorScheme="purple" onClick={onOpen}>Promote First Admin</Button>}
                </Flex>
              ) : (
                <Box bg={cardBg} borderRadius="2xl" overflow="hidden" boxShadow="md" borderWidth="1px" borderColor={borderCol}>
                  <Box overflowX="auto">
                    <Table size="sm">
                      <Thead bg={subtleBg}>
                        <Tr>{['Name','Email','Role','Category/Area','Permissions','Actions'].map(h => <Th key={h} py={3}>{h}</Th>)}</Tr>
                      </Thead>
                      <Tbody>
                        {subAdmins.map(a => (
                          <Tr key={a._id} _hover={{ bg: subtleBg }}>
                            <Td fontWeight="medium">{a.name}</Td>
                            <Td fontSize="xs" color="gray.500">{a.email}</Td>
                            <Td>
                              <Badge colorScheme={ROLE_COLORS[a.role] || 'gray'} borderRadius="full" px={2} fontSize="xs">
                                {a.role?.replace('_', ' ')}
                              </Badge>
                            </Td>
                            <Td fontSize="sm">
                              {a.adminProfile?.category && (
                                <Badge colorScheme="purple" fontSize="10px">{a.adminProfile.category}</Badge>
                              )}
                              {a.adminProfile?.area && (
                                <Badge colorScheme="blue" fontSize="10px">{a.adminProfile.area}</Badge>
                              )}
                            </Td>
                            <Td>
                              <HStack spacing={1} flexWrap="wrap">
                                {a.adminProfile?.permissions?.canChangeStatus && <Badge colorScheme="green" fontSize="9px">Status</Badge>}
                                {a.adminProfile?.permissions?.canAssignWorkers && <Badge colorScheme="blue" fontSize="9px">Workers</Badge>}
                                {a.adminProfile?.permissions?.canCreateCampaigns && <Badge colorScheme="purple" fontSize="9px">Campaigns</Badge>}
                              </HStack>
                            </Td>
                            <Td>
                              {isSuperAdmin && (
                                <Button size="xs" colorScheme="red" variant="ghost"
                                  leftIcon={<FiTrash2/>} onClick={() => handleDemote(a._id)}>
                                  Demote
                                </Button>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              )}
            </TabPanel>

            {/* Reports */}
            <TabPanel px={0}>
              <Box bg={cardBg} borderRadius="2xl" overflow="hidden" boxShadow="md" borderWidth="1px" borderColor={borderCol}>
                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead bg={subtleBg}>
                      <Tr>{['Description','Category','Priority','Status','Date'].map(h => <Th key={h} py={3}>{h}</Th>)}</Tr>
                    </Thead>
                    <Tbody>
                      {reports.map(r => (
                        <Tr key={r._id} _hover={{ bg: subtleBg }}>
                          <Td maxW="200px"><Text noOfLines={2} fontSize="sm">{r.description}</Text></Td>
                          <Td><Text fontSize="sm" textTransform="capitalize">{r.category}</Text></Td>
                          <Td><PriorityBadge priorityLevel={r.priorityLevel} priorityScore={r.priorityScore} size="sm"/></Td>
                          <Td><Badge colorScheme={getStatusColor(r.status)} borderRadius="full" fontSize="xs">{r.status}</Badge></Td>
                          <Td fontSize="xs" color="gray.500">{fmtDate(r.createdAt)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>

            {/* Promote Tab */}
            {isSuperAdmin && (
              <TabPanel px={0}>
                <Box bg={cardBg} borderRadius="2xl" p={5} boxShadow="md" borderWidth="1px" borderColor={borderCol}>
                  <Text fontWeight="bold" mb={4}>All Regular Users (eligible for promotion)</Text>
                  <Box overflowX="auto">
                    <Table size="sm">
                      <Thead bg={subtleBg}>
                        <Tr>{['Name','Email','Joined','Promote'].map(h => <Th key={h} py={3}>{h}</Th>)}</Tr>
                      </Thead>
                      <Tbody>
                        {users.map(u => (
                          <Tr key={u._id} _hover={{ bg: subtleBg }}>
                            <Td fontWeight="medium">{u.name}</Td>
                            <Td fontSize="xs" color="gray.500">{u.email}</Td>
                            <Td fontSize="xs" color="gray.500">{fmtDate(u.createdAt)}</Td>
                            <Td>
                              <Button size="xs" colorScheme="purple" variant="outline"
                                onClick={() => { setForm(f => ({...f, userId: u._id})); onOpen(); }}>
                                Promote
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Container>

      {/* Promote Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay backdropFilter="blur(4px)"/>
        <ModalContent bg={cardBg} borderRadius="2xl">
          <ModalHeader>Promote to Sub-Admin</ModalHeader>
          <ModalCloseButton/>
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="xl" fontSize="sm">
                <AlertIcon/>
                Sub-admins can manage reports within their category or area only.
              </Alert>

              {!form.userId && (
                <Select placeholder="Select user" size="sm" borderRadius="xl"
                  onChange={e => setForm(f => ({...f, userId: e.target.value}))}>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} — {u.email}</option>)}
                </Select>
              )}

              <Select size="sm" borderRadius="xl" value={form.role}
                onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                <option value="category_head">Category Head</option>
                <option value="area_head">Area Head</option>
              </Select>

              {form.role === 'category_head' && (
                <Select placeholder="Select category" size="sm" borderRadius="xl"
                  onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label} — {c.desc}</option>)}
                </Select>
              )}

              {form.role === 'area_head' && (
                <Input placeholder="Enter area name (e.g. Civil Lines, Prayagraj)" size="sm" borderRadius="xl"
                  onChange={e => setForm(f => ({...f, area: e.target.value}))}/>
              )}

              <Button colorScheme="purple" borderRadius="xl" isLoading={promoting} onClick={handlePromote}>
                Confirm Promotion
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SubAdminDashboard;