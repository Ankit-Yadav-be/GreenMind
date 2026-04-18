import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Text, SimpleGrid, Flex, Button, Badge,
  VStack, HStack, useColorModeValue, Spinner, Icon,
  Table, Thead, Tbody, Tr, Th, Td, Select, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, Input, useToast,
  Tabs, TabList, Tab, TabPanels, TabPanel, Alert, AlertIcon,
  Progress, Divider, Image, IconButton, Tooltip, CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  FiUsers, FiShield, FiActivity, FiCheckCircle, FiClock,
  FiAlertCircle, FiPlusCircle, FiTrash2, FiEye, FiRefreshCw,
  FiMapPin, FiZap, FiXCircle, FiTrendingUp,
} from 'react-icons/fi';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import PriorityBadge from '../components/shared/PriorityBadge';
import WorkerPerformancePanel from '../components/WorkerPerformancePanel';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const MotionBox = motion(Box);

const PRIORITY_COLORS = { High: '#FC8181', Medium: '#F6E05E', Low: '#68D391' };
const CATEGORY_COLORS_CHART = ['#4FD1C5', '#63B3ED', '#9F7AEA', '#F6AD55', '#FC8181', '#68D391'];
const STATUS_COLORS = { pending: '#F6E05E', 'in-progress': '#63B3ED', resolved: '#68D391', rejected: '#FC8181' };
const getCatEmoji = (c) => ({ plastic:'🧴', organic:'🍃', electronic:'🔌', other:'🧩', paper:'📄', metal:'🔩', glass:'🪟', batteries:'🔋', chemical:'⚗️', medical:'💊', textiles:'👕', furniture:'🛋️', garden:'🌱', oil:'🛢️', construction:'🏗️', lightbulbs:'💡' }[c] || '📦');
const getStatusColor = (s) => ({ pending:'yellow', 'in-progress':'blue', resolved:'green', rejected:'red' }[s] || 'gray');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

const CATEGORY_LABELS = {
  waste_collection: 'Waste Collection', recycling: 'Recycling',
  hazardous: 'Hazardous Waste', public_cleanliness: 'Public Cleanliness', campaigns: 'All Campaigns',
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, helpText, icon, color, index }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.100', 'gray.700');
  return (
    <MotionBox initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay: index*0.08 }}>
      <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderCol}
        _hover={{ transform:'translateY(-4px)', boxShadow:'xl' }} transition="all 0.3s"
        borderTopWidth="3px" borderTopColor={`${color}.400`}>
        <Flex justify="space-between" align="start">
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">{label}</Text>
            <Text fontSize="3xl" fontWeight="extrabold" color={`${color}.500`} lineHeight="1.2" mt={1}>{value}</Text>
            <Text fontSize="xs" color="gray.400" mt={1}>{helpText}</Text>
          </Box>
          <Box bg={`${color}.50`} p={3} borderRadius="xl" color={`${color}.500`} _dark={{ bg:`${color}.900` }}>
            <Icon as={icon} boxSize={6}/>
          </Box>
        </Flex>
      </Box>
    </MotionBox>
  );
};

// ── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  const bg = useColorModeValue('white', 'gray.700');
  if (!active || !payload?.length) return null;
  return (
    <Box bg={bg} p={3} borderRadius="lg" boxShadow="lg" fontSize="sm">
      {label && <Text fontWeight="bold" mb={1}>{label}</Text>}
      {payload.map((p, i) => <Text key={i} color={p.color}>{p.name}: {p.value}</Text>)}
    </Box>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const SubAdminDashboard = ({ userRole }) => {
  const [reports,    setReports]    = useState([]);
  const [stats,      setStats]      = useState(null);
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [filterStatus, setFS]       = useState('');
  const [filterPriority, setFP]     = useState('');
  const [updatingStatus, setUpdating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bg        = useColorModeValue('gray.50',  'gray.900');
  const cardBg    = useColorModeValue('white',    'gray.800');
  const borderCol = useColorModeValue('gray.100', 'gray.700');
  const subtleBg  = useColorModeValue('gray.50',  'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const isSuperAdmin = userRole === 'admin' || userRole === 'super_admin';

  const fetchAll = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = ['limit=100'];
      if (filterStatus)   params.push(`status=${filterStatus}`);
      if (filterPriority) params.push(`priority=${filterPriority}`);

      const [rpRes, meRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/sub-admin/reports?${params.join('&')}`, { withCredentials:true }),
        axios.get(`${BACKEND_URL}/api/sub-admin/me`, { withCredentials:true }),
      ]);

      if (rpRes.data.status === 'success') {
        setReports(rpRes.data.data || []);
        setStats(rpRes.data.stats || null);
      }
      if (meRes.data.status === 'success') setProfile(meRes.data.data);
    } catch (err) { console.error('[SubAdmin] fetch error:', err.message); }
    finally { setTableLoading(false); setLoading(false); }
  }, [filterStatus, filterPriority]);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchAll(); }, [filterStatus, filterPriority]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdating(true);
      await axios.patch(`${BACKEND_URL}/api/sub-admin/reports/${id}/status`, { status: newStatus }, { withCredentials:true });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status: newStatus }));
      // Recalculate stats locally
      const updated = reports.map(r => r._id === id ? { ...r, status: newStatus } : r);
      const total = updated.length;
      const resolved = updated.filter(r => r.status === 'resolved').length;
      setStats(prev => ({
        ...prev,
        pending:    updated.filter(r => r.status === 'pending').length,
        inProgress: updated.filter(r => r.status === 'in-progress').length,
        resolved,
        resolutionRate: total > 0 ? Math.round((resolved/total)*100) : 0,
      }));
      toast({ title:'✅ Status Updated', description:`Report marked as "${newStatus}". Reporter notified.`, status:'success', duration:3000, position:'top-right' });
    } catch {
      toast({ title:'Update failed', status:'error', duration:3000, position:'top-right' });
    } finally { setUpdating(false); }
  };

  // Chart data
  const pieData = Object.entries(
    reports.reduce((acc, r) => { acc[r.priorityLevel || 'Unscored'] = (acc[r.priorityLevel || 'Unscored'] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value, color: PRIORITY_COLORS[name] || '#CBD5E0' }));

  const categoryBarData = Object.entries(
    reports.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + 1; return acc; }, {})
  ).map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }));

  const statusBarData = ['pending','in-progress','resolved','rejected'].map(s => ({
    name: s, count: reports.filter(r => r.status === s).length, fill: STATUS_COLORS[s],
  }));

  if (loading) return (
    <Flex h="100vh" align="center" justify="center" direction="column" gap={4}>
      <Spinner size="xl" color="purple.500" thickness="4px"/>
      <Text color="gray.400">Loading your dashboard…</Text>
    </Flex>
  );

  const scopeLabel = profile?.adminProfile?.category
    ? `Category: ${CATEGORY_LABELS[profile.adminProfile.category] || profile.adminProfile.category}`
    : profile?.adminProfile?.area
    ? `Area: ${profile.adminProfile.area}`
    : 'All Reports';

  return (
    <Box bg={bg} minH="100vh" pb={12}>

      {/* ── Banner ── */}
      <Box bgGradient="linear(135deg, purple.700, teal.600)" px={8} py={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <HStack mb={1}><Icon as={FiShield} color="whiteAlpha.700"/><Text color="whiteAlpha.700" fontSize="sm">Sub-Admin Portal</Text></HStack>
              <Text fontSize="2xl" fontWeight="extrabold" color="white">
                {profile?.name ? `${profile.name}'s Dashboard` : 'Sub-Admin Dashboard'}
              </Text>
              <HStack mt={1} spacing={3}>
                <Badge bg="whiteAlpha.200" color="white" px={3} py={1} borderRadius="full" fontSize="xs">
                  🎯 {scopeLabel}
                </Badge>
                <Badge bg="whiteAlpha.200" color="white" px={3} py={1} borderRadius="full" fontSize="xs" textTransform="capitalize">
                  {profile?.role?.replace('_', ' ')}
                </Badge>
              </HStack>
            </Box>
            <Button leftIcon={<FiRefreshCw/>} onClick={fetchAll} size="sm"
              bg="whiteAlpha.200" color="white" _hover={{ bg:'whiteAlpha.300' }}>
              Refresh
            </Button>
          </Flex>

          {/* Stats strip */}
          <HStack mt={5} spacing={4} flexWrap="wrap">
            {[
              { label:'Total',      value: stats?.total || reports.length },
              { label:'⏳ Pending', value: stats?.pending || reports.filter(r => r.status==='pending').length },
              { label:'🔄 In Progress', value: stats?.inProgress || reports.filter(r => r.status==='in-progress').length },
              { label:'✅ Resolved', value: stats?.resolved || reports.filter(r => r.status==='resolved').length },
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

        {/* ── Stat Cards ── */}
        <SimpleGrid columns={{ base:2, md:4 }} spacing={4} mb={6}>
          {[
            { label:'Total Reports', value: stats?.total || reports.length, icon:FiActivity, color:'purple', helpText: scopeLabel },
            { label:'Pending',       value: stats?.pending || 0,            icon:FiClock,    color:'yellow', helpText:'Need attention' },
            { label:'In Progress',   value: stats?.inProgress || 0,         icon:FiAlertCircle, color:'blue', helpText:'Being handled' },
            { label:'Resolved',      value: stats?.resolved || 0,           icon:FiCheckCircle, color:'green', helpText:`${stats?.resolutionRate || 0}% rate` },
          ].map((s, i) => <StatCard key={s.label} {...s} index={i}/>)}
        </SimpleGrid>

        {/* ── Charts ── */}
        {reports.length > 0 && (
          <SimpleGrid columns={{ base:1, md:3 }} spacing={4} mb={6}>
            {/* Priority Pie */}
            <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderCol}>
              <Text fontWeight="bold" fontSize="md" mb={4}>Priority Split</Text>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none"/>)}
                      </Pie>
                      <RTooltip content={<CustomTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <VStack spacing={2} mt={2}>
                    {pieData.map(p => (
                      <Flex key={p.name} justify="space-between" w="100%" align="center">
                        <HStack spacing={2}><Box w="10px" h="10px" borderRadius="full" bg={p.color}/><Text fontSize="xs">{p.name}</Text></HStack>
                        <Text fontSize="xs" fontWeight="bold">{p.value}</Text>
                      </Flex>
                    ))}
                  </VStack>
                </>
              ) : <Flex h="140px" align="center" justify="center"><Text color="gray.400" fontSize="sm">No data</Text></Flex>}
            </Box>

            {/* Category Bar */}
            <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderCol}>
              <Text fontWeight="bold" fontSize="md" mb={4}>By Category</Text>
              {categoryBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={categoryBarData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#E2E8F0','#2D3748')} vertical={false}/>
                    <XAxis dataKey="name" tick={{ fontSize:9, fill:textColor }}/>
                    <YAxis tick={{ fontSize:10, fill:textColor }} allowDecimals={false}/>
                    <RTooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="count" name="Reports" radius={[4,4,0,0]}>
                      {categoryBarData.map((_,i) => <Cell key={i} fill={CATEGORY_COLORS_CHART[i % CATEGORY_COLORS_CHART.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <Flex h="180px" align="center" justify="center"><Text color="gray.400" fontSize="sm">No data</Text></Flex>}
            </Box>

            {/* Resolution Rate */}
            <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderCol} textAlign="center">
              <Text fontWeight="bold" fontSize="md" mb={4}>Resolution Rate</Text>
              <Box pt={3}>
                <CircularProgress
                  value={stats?.resolutionRate || 0} size="110px" thickness="10px"
                  color="purple.400"
                  trackColor={useColorModeValue('gray.100','gray.700')}
                >
                  <CircularProgressLabel fontSize="xl" fontWeight="extrabold">
                    {stats?.resolutionRate || 0}%
                  </CircularProgressLabel>
                </CircularProgress>
                <Text fontSize="xs" color="gray.400" mt={2}>
                  {stats?.resolved || 0} of {stats?.total || 0} resolved
                </Text>
              </Box>
            </Box>
          </SimpleGrid>
        )}

        {/* ── Reports Table ── */}
        <Box bg={cardBg} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderCol} overflow="hidden">
          {/* Table Header */}
          <Box px={6} py={4} borderBottomWidth="1px" borderColor={borderCol}>
            <Flex direction={{ base:'column', md:'row' }} justify="space-between" align={{ md:'center' }} gap={3}>
              <Box>
                <Text fontWeight="bold" fontSize="md">Complaints Under My Scope</Text>
                <Text fontSize="xs" color="gray.400">Click any row to manage the complaint</Text>
              </Box>
              <HStack spacing={2} flexWrap="wrap">
                <Select placeholder="All Status" value={filterStatus} onChange={e => setFS(e.target.value)} size="sm" maxW="130px" borderRadius="lg">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </Select>
                <Select placeholder="All Priority" value={filterPriority} onChange={e => setFP(e.target.value)} size="sm" maxW="130px" borderRadius="lg">
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🟢 Low</option>
                </Select>
                {(filterStatus || filterPriority) && (
                  <Button size="sm" variant="outline" colorScheme="red" borderRadius="lg"
                    onClick={() => { setFS(''); setFP(''); }}>Clear</Button>
                )}
              </HStack>
            </Flex>
          </Box>

          {tableLoading ? (
            <Flex py={12} justify="center"><Spinner color="purple.500"/></Flex>
          ) : reports.length === 0 ? (
            <Flex py={16} direction="column" align="center" gap={3}>
              <Text fontSize="3xl">📭</Text>
              <Text color="gray.400" fontSize="md">No complaints under your scope yet</Text>
              <Text color="gray.300" fontSize="sm">Reports matching your category/area will appear here</Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr bg={useColorModeValue('gray.50','gray.750')}>
                    {['Image','Description','Category','Priority','Status','Date','Manage'].map(h => (
                      <Th key={h} py={3} fontSize="xs" color="gray.500" fontWeight="bold">{h}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {reports.map((report) => (
                    <Tr key={report._id}
                      cursor="pointer"
                      _hover={{ bg: useColorModeValue('purple.50','purple.900') }}
                      transition="all 0.15s"
                      borderLeftWidth={report.priorityLevel === 'High' ? '3px' : '0'}
                      borderLeftColor="red.400"
                      onClick={() => { setSelected(report); onOpen(); }}
                    >
                      <Td py={3}>
                        <Image src={report.images[0]?.url} boxSize="44px" objectFit="cover" borderRadius="lg"
                          fallbackSrc="https://via.placeholder.com/44"/>
                      </Td>
                      <Td maxW="200px" py={3}>
                        <Text noOfLines={2} fontSize="sm">{report.description}</Text>
                        {report.escalated && <Badge colorScheme="red" fontSize="9px" mt={1}>⚠️ Escalated</Badge>}
                      </Td>
                      <Td py={3}>
                        <HStack spacing={1}>
                          <Text>{getCatEmoji(report.category)}</Text>
                          <Text fontSize="sm" textTransform="capitalize">{report.category}</Text>
                        </HStack>
                      </Td>
                      <Td py={3}>
                        <PriorityBadge priorityLevel={report.priorityLevel} priorityScore={report.priorityScore} size="sm"/>
                      </Td>
                      <Td py={3}>
                        <Badge colorScheme={getStatusColor(report.status)} borderRadius="full" px={2} py={0.5} fontSize="xs" textTransform="capitalize">
                          {report.status}
                        </Badge>
                      </Td>
                      <Td py={3} fontSize="xs" color="gray.500">{fmtDate(report.createdAt)}</Td>
                      <Td py={3}>
                        <HStack spacing={1} onClick={e => e.stopPropagation()}>
                          <Tooltip label="View & Manage">
                            <IconButton icon={<FiEye/>} size="xs" colorScheme="purple" variant="ghost"
                              onClick={() => { setSelected(report); onOpen(); }} aria-label="View"/>
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        {/* ── Status Distribution ── */}
        {reports.length > 0 && (
          <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderCol} mt={4}>
            <Text fontWeight="bold" mb={4}>Status Distribution</Text>
            <Flex gap={3} flexWrap="wrap">
              {statusBarData.map(s => {
                const pct = Math.round((s.count / Math.max(reports.length, 1)) * 100);
                return (
                  <Box key={s.name} flex={1} minW="120px">
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" textTransform="capitalize" fontWeight="medium">{s.name}</Text>
                      <Text fontSize="xs" fontWeight="bold">{s.count}</Text>
                    </Flex>
                    <Box bg={useColorModeValue('gray.100','gray.700')} borderRadius="full" h="8px">
                      <Box bg={s.fill} borderRadius="full" h="8px" w={`${pct}%`} transition="width 0.8s ease"/>
                    </Box>
                    <Text fontSize="10px" color="gray.400" mt={0.5}>{pct}%</Text>
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}
      {/* ── Workers in My Area ── */}
        <Box bg={cardBg} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderCol} overflow="hidden" mt={4}>
          <Box px={6} py={4} borderBottomWidth="1px" borderColor={borderCol}>
            <Text fontWeight="bold" fontSize="md">👷 Workers in My Area</Text>
            <Text fontSize="xs" color="gray.400">
              {profile?.adminProfile?.area
                ? `Showing workers assigned to: ${profile.adminProfile.area}`
                : 'Showing all workers in your scope'}
            </Text>
          </Box>
          <WorkerPerformancePanel filterArea={profile?.adminProfile?.area || ''} />
        </Box>
      </Container>

      {/* ── Management Modal ── */}
      {selected && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(4px)"/>
          <ModalContent bg={cardBg} borderRadius="2xl">
            <ModalHeader borderBottomWidth="1px" borderColor={borderCol}>
              <HStack spacing={3}>
                <Text fontSize="2xl">{getCatEmoji(selected.category)}</Text>
                <Box flex={1}>
                  <Text fontSize="lg" fontWeight="bold">Manage Complaint</Text>
                  <HStack mt={1} spacing={2} flexWrap="wrap">
                    <PriorityBadge priorityLevel={selected.priorityLevel} priorityScore={selected.priorityScore}/>
                    <Badge colorScheme={getStatusColor(selected.status)} textTransform="capitalize">{selected.status}</Badge>
                    {selected.escalated && <Badge colorScheme="red">⚠️ Escalated</Badge>}
                  </HStack>
                </Box>
              </HStack>
            </ModalHeader>
            <ModalCloseButton/>
            <ModalBody pb={6} pt={4}>
              <Tabs colorScheme="purple" variant="soft-rounded" size="sm">
                <TabList flexWrap="wrap" gap={1} mb={4}>
                  <Tab>Details</Tab>
                  <Tab>🎯 Change Status</Tab>
                  {selected.priorityBreakdown && <Tab>📊 Priority</Tab>}
                  {selected.wasteClassification?.wasteType && <Tab>🤖 AI Class</Tab>}
                </TabList>
                <TabPanels>

                  {/* Details */}
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      {selected.images?.length > 0 && (
                        <Image src={selected.images[0].url} h="180px" objectFit="cover" borderRadius="xl"
                          cursor="pointer" onClick={() => window.open(selected.images[0].url,'_blank')}/>
                      )}
                      <Box p={4} bg={subtleBg} borderRadius="xl">
                        <Text fontSize="xs" color="gray.500" mb={1}>Description</Text>
                        <Text fontSize="sm">{selected.description}</Text>
                      </Box>
                      <SimpleGrid columns={2} spacing={3}>
                        {[
                          { label:'Category',    value:`${getCatEmoji(selected.category)} ${selected.category}` },
                          { label:'Reported by', value: selected.userName || selected.reportedBy || 'Anonymous' },
                          { label:'Date',        value: fmtDate(selected.createdAt) },
                          { label:'Cluster',     value:`${selected.clusterSize || 1} nearby report(s)` },
                        ].map(({ label, value }) => (
                          <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{label}</Text>
                            <Text fontSize="sm" fontWeight="medium" mt={0.5} textTransform="capitalize">{value}</Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                      {selected.location?.address && (
                        <Box p={3} bg={subtleBg} borderRadius="lg">
                          <HStack><Icon as={FiMapPin} color="green.400"/><Text fontSize="sm">{selected.location.address}</Text></HStack>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Change Status */}
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <Alert status="info" borderRadius="xl">
                        <AlertIcon/>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold">Real-time Notification</Text>
                          <Text fontSize="xs">The reporter will be instantly notified of any status change.</Text>
                        </Box>
                      </Alert>
                      <Box p={4} bg={subtleBg} borderRadius="xl">
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Current Status</Text>
                        <Badge colorScheme={getStatusColor(selected.status)} fontSize="md" px={4} py={2} borderRadius="full" textTransform="capitalize">
                          {selected.status}
                        </Badge>
                      </Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">Change to:</Text>
                      <SimpleGrid columns={{ base:1, md:2 }} spacing={3}>
                        {[
                          { s:'pending',     icon:FiClock,       color:'yellow', label:'Mark Pending',     desc:'Reset to awaiting review' },
                          { s:'in-progress', icon:FiAlertCircle, color:'blue',   label:'Mark In Progress', desc:'Being handled by worker' },
                          { s:'resolved',    icon:FiCheckCircle, color:'green',  label:'Mark Resolved ✅',  desc:'Awards reporter +25 pts' },
                          { s:'rejected',    icon:FiXCircle,     color:'red',    label:'Mark Rejected',    desc:'Invalid or duplicate' },
                        ].map(({ s, icon, color, label, desc }) => (
                          <Box key={s} p={4} borderRadius="xl" cursor="pointer"
                            borderWidth="2px"
                            borderColor={selected.status === s ? `${color}.400` : borderCol}
                            bg={selected.status === s ? `${color}.50` : cardBg}
                            _hover={{ borderColor:`${color}.400`, bg:`${color}.50` }}
                            _dark={{ bg: selected.status === s ? `${color}.900` : cardBg, _hover:{ bg:`${color}.900` } }}
                            transition="all 0.2s"
                            onClick={() => selected.status !== s && handleUpdateStatus(selected._id, s)}
                            opacity={selected.status === s ? 0.7 : 1}
                          >
                            <HStack>
                              <Icon as={icon} color={`${color}.500`} boxSize={5}/>
                              <Box>
                                <Text fontSize="sm" fontWeight="bold" color={`${color}.600`} _dark={{ color:`${color}.300` }}>{label}</Text>
                                <Text fontSize="xs" color="gray.500">{desc}</Text>
                              </Box>
                              {selected.status === s && <Badge colorScheme={color} ml="auto" fontSize="10px">current</Badge>}
                            </HStack>
                          </Box>
                        ))}
                      </SimpleGrid>
                      {updatingStatus && (
                        <HStack justify="center" pt={2}>
                          <Spinner size="sm" color="purple.500"/>
                          <Text fontSize="sm" color="gray.500">Updating and notifying reporter…</Text>
                        </HStack>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Priority */}
                  {selected.priorityBreakdown && (
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <Flex align="center" gap={4} p={4} bg={subtleBg} borderRadius="2xl">
                          <Box textAlign="center">
                            <Text fontSize="4xl" fontWeight="extrabold" lineHeight="1"
                              color={selected.priorityLevel === 'High' ? 'red.500' : selected.priorityLevel === 'Medium' ? 'yellow.500' : 'green.500'}>
                              {selected.priorityScore}
                            </Text>
                            <Text fontSize="xs" color="gray.400">/ 100</Text>
                          </Box>
                          <Box flex={1}>
                            <Progress value={selected.priorityScore || 0} borderRadius="full" size="lg" mb={2}
                              colorScheme={selected.priorityLevel === 'High' ? 'red' : selected.priorityLevel === 'Medium' ? 'yellow' : 'green'}/>
                            <PriorityBadge priorityLevel={selected.priorityLevel} priorityScore={selected.priorityScore}/>
                          </Box>
                        </Flex>
                        {[
                          { label:'♻️ Resource',  key:'resourceScore',  color:'teal',   weight:'35%' },
                          { label:'📍 Location',  key:'locationScore',  color:'blue',   weight:'25%' },
                          { label:'🌦 Weather',   key:'weatherScore',   color:'cyan',   weight:'20%' },
                          { label:'💬 Sentiment', key:'sentimentScore', color:'purple', weight:'20%' },
                        ].map(({ label, key, color, weight }) => (
                          <Box key={key}>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm">{label} <Text as="span" fontSize="xs" color="gray.400">({weight})</Text></Text>
                              <Text fontSize="sm" fontWeight="bold">{selected.priorityBreakdown[key] ?? 'N/A'}/100</Text>
                            </Flex>
                            <Progress value={selected.priorityBreakdown[key] || 0} colorScheme={color} borderRadius="full" size="sm"/>
                          </Box>
                        ))}
                      </VStack>
                    </TabPanel>
                  )}

                  {/* AI Classification */}
                  {selected.wasteClassification?.wasteType && (
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg="purple.50" borderRadius="xl" borderLeftWidth="4px" borderColor="purple.400" _dark={{ bg:'purple.900' }}>
                          <Text fontWeight="bold" color="purple.600" fontSize="lg">{selected.wasteClassification.wasteType} Waste</Text>
                          <Text fontSize="sm" color="gray.500">{selected.wasteClassification.subType}</Text>
                        </Box>
                        <SimpleGrid columns={2} spacing={3}>
                          {[
                            { label:'Hazard',       value: selected.wasteClassification.hazardLevel },
                            { label:'Recyclable',   value: selected.wasteClassification.recyclingPossibility },
                            { label:'Action',       value: selected.wasteClassification.actionRequired },
                            { label:'Decomp.',      value: selected.wasteClassification.estimatedDecompositionDays === -1 ? 'Non-biodeg.' : `~${selected.wasteClassification.estimatedDecompositionDays}d` },
                          ].map(({ label, value }) => (
                            <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                              <Text fontSize="10px" color="gray.400">{label}</Text>
                              <Text fontSize="sm" fontWeight="bold">{value || 'N/A'}</Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                        <Box p={3} bg={subtleBg} borderRadius="lg">
                          <Text fontSize="xs" color="gray.400" mb={1}>Disposal Method</Text>
                          <Text fontSize="sm">{selected.wasteClassification.disposalMethod}</Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default SubAdminDashboard;