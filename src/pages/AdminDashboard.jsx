import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, SimpleGrid, Text, VStack, HStack,
  useColorModeValue, Spinner, Button, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  ModalFooter, useDisclosure, Flex, IconButton, Tooltip,
  Select, Icon, Tabs, TabList, TabPanels, Tab, TabPanel,
  useToast, Progress, Divider, Badge, Image, Table,
  Thead, Tbody, Tr, Th, Td, CircularProgress,
  CircularProgressLabel, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, AccordionIcon, Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FiEye, FiTrash2, FiMapPin, FiCheckCircle, FiClock,
  FiAlertCircle, FiXCircle, FiActivity, FiTrendingUp,
  FiRefreshCw, FiZap, FiInfo, FiBell,
} from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import PriorityBadge from '../components/shared/PriorityBadge';
import WorkerPerformancePanel from '../components/WorkerPerformancePanel';
import AreaPerformancePanel from '../components/AreaPerformancePanel';

const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/reports`;
const MotionBox = motion(Box);

const PRIORITY_COLORS = { High: '#FC8181', Medium: '#F6E05E', Low: '#68D391' };
const CATEGORY_COLORS = ['#4FD1C5', '#63B3ED', '#9F7AEA', '#F6AD55'];
const STATUS_COLORS   = { pending: '#F6E05E', 'in-progress': '#63B3ED', resolved: '#68D391', rejected: '#FC8181' };
const getCatEmoji     = (c) => ({ plastic:'🧴', organic:'🍃', electronic:'🔌', other:'🧩' }[c] || '📦');
const getStatusColor  = (s) => ({ pending:'yellow', 'in-progress':'blue', resolved:'green', rejected:'red' }[s] || 'gray');
const fmtDate         = (d) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
const fmtDateShort    = (d) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' });

// ── Priority Formula Info Panel ──────────────────────────────────────────────
const PriorityFormulaPanel = () => {
  const bg       = useColorModeValue('blue.50', 'blue.900');
  const cardBg   = useColorModeValue('white', 'gray.750');
  const borderCol = useColorModeValue('blue.200', 'blue.700');

  return (
    <Box bg={bg} border="1px solid" borderColor={borderCol} borderRadius="2xl" p={5} mb={4}>
      <HStack mb={3} spacing={2}>
        <Icon as={FiInfo} color="blue.500" boxSize={5} />
        <Text fontWeight="bold" fontSize="md" color="blue.600" _dark={{ color: 'blue.300' }}>
          How Priority Score is Calculated (0–100)
        </Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3} mb={4}>
        {[
          { icon: '♻️', label: 'Resource Score',  weight: '35%', desc: 'AI image analysis — detects waste material type. E-waste=85+, Metal=70+, Plastic=55+, Organic=30+' },
          { icon: '📍', label: 'Location Score',  weight: '25%', desc: 'Proximity to hospitals, schools, markets. Near school/hospital adds 60pts, public spaces +40pts' },
          { icon: '🌦', label: 'Weather Score',   weight: '20%', desc: 'Live weather via OpenWeather. Thunderstorm=+55, Rain=+50, Temp>38°C=+30, High humidity+heat=+15' },
          { icon: '💬', label: 'Sentiment Score', weight: '20%', desc: 'Groq NLP on description. Words like "dangerous", "urgent", "school", "children" raise score significantly' },
        ].map(({ icon, label, weight, desc }) => (
          <Box key={label} bg={cardBg} p={4} borderRadius="xl" boxShadow="sm">
            <HStack mb={2}>
              <Text fontSize="xl">{icon}</Text>
              <Box>
                <Text fontSize="sm" fontWeight="bold">{label}</Text>
                <Badge colorScheme="blue" fontSize="10px">{weight} weight</Badge>
              </Box>
            </HStack>
            <Text fontSize="xs" color="gray.500" lineHeight="1.5">{desc}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box bg={cardBg} p={4} borderRadius="xl" boxShadow="sm">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase" letterSpacing="wider">Formula</Text>
        <Text fontFamily="mono" fontSize="sm" color="blue.600" _dark={{ color: 'blue.300' }}>
          Score = (0.35 × Resource) + (0.25 × Location) + (0.20 × Weather) + (0.20 × Sentiment)
        </Text>
        <HStack mt={3} spacing={4} flexWrap="wrap">
          {[
            { range: '70–100', level: 'High',   color: 'red',    desc: 'Immediate action required' },
            { range: '40–69',  level: 'Medium',  color: 'yellow', desc: 'Schedule within 24–72 hrs' },
            { range: '0–39',   level: 'Low',     color: 'green',  desc: 'Routine cleanup queue'     },
          ].map(({ range, level, color, desc }) => (
            <HStack key={level} spacing={2}>
              <Badge colorScheme={color} px={2} py={0.5} borderRadius="full">{level}</Badge>
              <Text fontSize="xs" color="gray.500">{range} — {desc}</Text>
            </HStack>
          ))}
        </HStack>
      </Box>
    </Box>
  );
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, helpText, icon, color, index }) => {
  const cardBg    = useColorModeValue('white', 'gray.800');
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
            <Icon as={icon} boxSize={6} />
          </Box>
        </Flex>
      </Box>
    </MotionBox>
  );
};

const ChartCard = ({ title, subtitle, children }) => {
  const cardBg    = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.100', 'gray.700');
  return (
    <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderCol} h="100%">
      <Box mb={4}><Text fontWeight="bold" fontSize="md">{title}</Text>{subtitle && <Text fontSize="xs" color="gray.400" mt={0.5}>{subtitle}</Text>}</Box>
      {children}
    </Box>
  );
};

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

const WorkerAssignPanel = ({ reportId, currentWorker, onAssigned }) => {
  const [workers, setWorkers]     = useState([]);
  const [selectedWId, setSelWId]  = useState('');
  const [assigning, setAssigning] = useState(false);
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/workers`, { withCredentials: true })
      .then(r => setWorkers(r.data.data || []))
      .catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!selectedWId) return;
    setAssigning(true);
    try {
      const { data } = await axios.patch(
        `${BACKEND_URL}/api/workers/assign/${reportId}`,
        { workerId: selectedWId },
        { withCredentials: true }
      );
      onAssigned(data.data.report);
    } catch { /* silent — parent toast handles it */ }
    finally { setAssigning(false); }
  };

  return (
    <Box p={4} bg={subtleBg} borderRadius="xl">
      {currentWorker?.workerName && (
        <HStack mb={3} p={2} bg="blue.50" borderRadius="lg" _dark={{ bg:'blue.900' }}>
          <Icon as={FiCheckCircle} color="blue.500" />
          <Text fontSize="xs">Currently assigned: <strong>{currentWorker.workerName}</strong></Text>
        </HStack>
      )}
      {workers.length === 0 ? (
        <Text fontSize="xs" color="gray.400">
          No workers available. Promote a user to worker role via the API or database.
        </Text>
      ) : (
        <HStack>
          <Select size="sm" placeholder="Select worker" value={selectedWId}
            onChange={e => setSelWId(e.target.value)} borderRadius="lg">
            {workers.map(w => (
              <option key={w._id} value={w._id}>
                {w.name} {w.workerProfile?.area ? `(${w.workerProfile.area})` : ''} {!w.workerProfile?.isAvailable ? '— Busy' : ''}
              </option>
            ))}
          </Select>
          <Button size="sm" colorScheme="teal" isLoading={assigning}
            isDisabled={!selectedWId} onClick={handleAssign} flexShrink={0}>
            Assign
          </Button>
        </HStack>
      )}
    </Box>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [reports, setReports]         = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedReport, setSelected] = useState(null);
  const [filterCategory, setFC]       = useState('');
  const [filterStatus, setFS]         = useState('');
  const [filterPriority, setFP]       = useState('');
  const [sortBy, setSortBy]           = useState('createdAt');
  const [sortOrder, setSortOrder]     = useState('desc');
  const [updatingStatus, setUpdating] = useState(false);
  const [recalcing, setRecalcing]     = useState(false);
  const { isOpen, onOpen, onClose }   = useDisclosure();
  const [showFormula, setShowFormula] = useState(false);
  const toast = useToast();

  const bg          = useColorModeValue('gray.50',  'gray.900');
  const cardBg      = useColorModeValue('white',    'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtleBg    = useColorModeValue('gray.50',  'gray.700');
  const textColor   = useColorModeValue('gray.700', 'gray.200');

  const fetchReports = useCallback(async () => {
    try {
      setTableLoading(true);
      const params = [`sortBy=${sortBy}&order=${sortOrder}&limit=100`];
      if (filterCategory) params.push(`category=${filterCategory}`);
      if (filterStatus)   params.push(`status=${filterStatus}`);
      if (filterPriority) params.push(`priorityLevel=${filterPriority}`);
      const { data } = await axios.get(`${API_URL}?${params.join('&')}`, { withCredentials: true });
      setReports(data.data || []);
    } catch (err) { console.error(err); }
    finally { setTableLoading(false); }
 }, [filterCategory, filterStatus, filterPriority, sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/stats`, { withCredentials: true });
      setStats(data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const init = async () => { setLoading(true); await Promise.all([fetchReports(), fetchStats()]); setLoading(false); };
    init();
  }, []);
  useEffect(() => { fetchReports(); }, [filterCategory, filterStatus, filterPriority, sortBy, sortOrder]);

  // ── Status update with notification toast ─────────────────────────────────
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdating(true);
      await axios.patch(`${API_URL}/${id}/status`, { status: newStatus }, { withCredentials: true });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      if (selectedReport?._id === id) setSelected(prev => ({ ...prev, status: newStatus }));
      fetchStats();
      toast({
        title: '✅ Status Updated',
        description: `Report marked as "${newStatus}". Reporter has been notified via real-time notification.`,
        status: 'success', duration: 4000, isClosable: true, position: 'top-right',
      });
    } catch {
      toast({ title: 'Update failed', status: 'error', duration: 3000, position: 'top-right' });
    } finally { setUpdating(false); }
  };

  // ── Recalculate priority ──────────────────────────────────────────────────
  const handleRecalculate = async (id) => {
    setRecalcing(true);
    try {
      const { data } = await axios.post(`${API_URL}/${id}/recalculate`, {}, { withCredentials: true });
      if (data.status === 'success') {
        setReports(prev => prev.map(r => r._id === id ? data.data : r));
        setSelected(data.data);
        toast({
          title: '🤖 Analysis Complete',
          description: `Priority: ${data.data.priorityLevel} (Score: ${data.data.priorityScore}/100)`,
          status: 'success', duration: 4000, position: 'top-right',
        });
      }
    } catch {
      toast({ title: 'Recalculation failed', status: 'error', duration: 3000, position: 'top-right' });
    } finally { setRecalcing(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setReports(prev => prev.filter(r => r._id !== id));
      fetchStats(); onClose();
      toast({ title: 'Report deleted', status: 'success', duration: 2000, position: 'top-right' });
    } catch { toast({ title: 'Delete failed', status: 'error', duration: 3000, position: 'top-right' }); }
  };

  // ── Chart data ────────────────────────────────────────────────────────────
  const trendData       = (stats?.trend || []).map(t => ({ date: fmtDateShort(t._id), count: t.count }));
  const pieData         = (stats?.byPriority || []).filter(p => p._id).map(p => ({ name: p._id, value: p.count, color: PRIORITY_COLORS[p._id] }));
  const categoryBarData = (stats?.byCategory || []).map(c => ({ name: c._id ? c._id.charAt(0).toUpperCase() + c._id.slice(1) : 'Unknown', count: c.count }));
  const statusData      = ['pending','in-progress','resolved','rejected'].map(s => ({ name: s, count: reports.filter(r => r.status === s).length, fill: STATUS_COLORS[s] }));
  const resolutionRate  = stats?.overall?.totalReports ? Math.round(((stats.overall.resolvedReports || 0) / stats.overall.totalReports) * 100) : 0;
  const avgScore        = stats?.overall?.avgPriorityScore ? Math.round(stats.overall.avgPriorityScore) : 0;

  if (loading) return (
    <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={4}><Spinner size="xl" color="teal.500" thickness="4px" /><Text color="gray.400">Loading dashboard…</Text></VStack>
    </Box>
  );

  return (
    <Box bg={bg} minH="100vh" pb={12}>
      {/* Banner */}
      <Box bgGradient="linear(135deg, teal.600, green.500)" px={8} py={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Text fontSize="2xl" fontWeight="extrabold" color="white">Admin Dashboard</Text>
              <Text color="whiteAlpha.800" fontSize="sm">Real-time waste management intelligence · Reports sorted by AI priority</Text>
            </Box>
            <HStack spacing={3}>
              <Button leftIcon={<FiInfo />} onClick={() => setShowFormula(f => !f)} size="sm"
                bg="whiteAlpha.200" color="white" _hover={{ bg:'whiteAlpha.300' }}>
                {showFormula ? 'Hide' : 'Show'} Priority Formula
              </Button>
              <Button leftIcon={<FiRefreshCw />} onClick={() => { fetchReports(); fetchStats(); }}
                size="sm" bg="whiteAlpha.200" color="white" _hover={{ bg:'whiteAlpha.300' }}>
                Refresh
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" mt={-4}>
        {/* Priority Formula Panel */}
        {showFormula && <Box mt={4}><PriorityFormulaPanel /></Box>}

        {/* Stat Cards */}
        <SimpleGrid columns={{ base:2, md:4 }} spacing={4} mb={6} mt={4}>
          {[
            { label:'Total Reports', value: stats?.overall?.totalReports || 0,      icon: FiActivity,    color:'teal',   helpText:'All time'                  },
            { label:'Pending',       value: stats?.overall?.pendingReports || 0,     icon: FiClock,       color:'yellow', helpText:'Awaiting action'           },
            { label:'In Progress',   value: stats?.overall?.inProgressReports || 0,  icon: FiAlertCircle, color:'blue',   helpText:'Being handled'             },
            { label:'Resolved',      value: stats?.overall?.resolvedReports || 0,    icon: FiCheckCircle, color:'green',  helpText:`${resolutionRate}% rate`   },
          ].map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </SimpleGrid>

        {/* Charts Row 1 */}
        <SimpleGrid columns={{ base:1, lg:3 }} spacing={4} mb={4}>
          <Box gridColumn={{ lg:'1 / 3' }}>
            <ChartCard title="Reports Over Time" subtitle={`Last ${trendData.length} days`}>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#319795" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#319795" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#E2E8F0','#2D3748')}/>
                    <XAxis dataKey="date" tick={{ fontSize:11, fill:textColor }}/>
                    <YAxis tick={{ fontSize:11, fill:textColor }} allowDecimals={false}/>
                    <RTooltip content={<CustomTooltip/>}/>
                    <Area type="monotone" dataKey="count" name="Reports" stroke="#319795" strokeWidth={2.5} fill="url(#tg)" dot={{ fill:'#319795', r:3 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Flex h="200px" align="center" justify="center"><Text color="gray.400" fontSize="sm">No trend data yet</Text></Flex>}
            </ChartCard>
          </Box>
          <ChartCard title="Priority Split" subtitle="All reports">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
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
            ) : <Flex h="150px" align="center" justify="center"><Text color="gray.400" fontSize="sm">No data yet</Text></Flex>}
          </ChartCard>
        </SimpleGrid>

        {/* Charts Row 2 */}
        <SimpleGrid columns={{ base:1, md:2, lg:4 }} spacing={4} mb={4}>
          <Box gridColumn={{ lg:'1 / 3' }}>
            <ChartCard title="Reports by Category" subtitle="Waste type breakdown">
              {categoryBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={categoryBarData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#E2E8F0','#2D3748')} vertical={false}/>
                    <XAxis dataKey="name" tick={{ fontSize:11, fill:textColor }}/>
                    <YAxis tick={{ fontSize:11, fill:textColor }} allowDecimals={false}/>
                    <RTooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="count" name="Reports" radius={[6,6,0,0]}>
                      {categoryBarData.map((_,i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <Flex h="180px" align="center" justify="center"><Text color="gray.400" fontSize="sm">No data yet</Text></Flex>}
            </ChartCard>
          </Box>

          <ChartCard title="Resolution Rate" subtitle="Resolved vs total">
            <Box textAlign="center">
              <ResponsiveContainer width="100%" height={130}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                  data={[{ value: resolutionRate, fill:'#68D391' }]} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: useColorModeValue('#E2E8F0','#2D3748') }}/>
                </RadialBarChart>
              </ResponsiveContainer>
              <Text fontSize="3xl" fontWeight="extrabold" color="green.500" mt={-3}>{resolutionRate}%</Text>
              <Text fontSize="xs" color="gray.400">resolved</Text>
            </Box>
          </ChartCard>

          <ChartCard title="Avg Priority Score" subtitle="Across all reports">
            <Box textAlign="center" pt={3}>
              <CircularProgress value={avgScore} size="110px" thickness="10px"
                color={avgScore >= 70 ? 'red.400' : avgScore >= 40 ? 'yellow.400' : 'green.400'}
                trackColor={useColorModeValue('gray.100','gray.700')}>
                <CircularProgressLabel fontSize="xl" fontWeight="extrabold">{avgScore}</CircularProgressLabel>
              </CircularProgress>
              <Text fontSize="xs" color="gray.400" mt={2}>
                {avgScore >= 70 ? '🔴 High urgency avg' : avgScore >= 40 ? '🟡 Medium urgency avg' : '🟢 Low urgency avg'}
              </Text>
            </Box>
          </ChartCard>
        </SimpleGrid>

        {/* Status Distribution */}
        <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Text fontWeight="bold" mb={4}>Status Distribution</Text>
          <Flex gap={3} flexWrap="wrap">
            {statusData.map(s => {
              const total = Math.max(reports.length, 1);
              const pct = Math.round((s.count / total) * 100);
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

       {/* ── Worker Performance ── */}
        <Box bg={cardBg} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderColor} overflow="hidden" mb={4}>
          <Box px={6} py={4} borderBottomWidth="1px" borderColor={borderColor}>
            <Text fontWeight="bold" fontSize="md">👷 Worker Performance</Text>
            <Text fontSize="xs" color="gray.400">Task completion rates and availability of all field workers</Text>
          </Box>
          <WorkerPerformancePanel />
        </Box>

        {/* ── Area Performance ── */}
        <Box bg={cardBg} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderColor} overflow="hidden" mb={4}>
          <Box px={6} py={4} borderBottomWidth="1px" borderColor={borderColor}>
            <Text fontWeight="bold" fontSize="md">📍 Area-wise Performance</Text>
            <Text fontSize="xs" color="gray.400">Resolution rates by area — click Message to advise area heads</Text>
          </Box>
          <AreaPerformancePanel />
        </Box>

        {/* Reports Table */}
        <Box bg={cardBg} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderColor} overflow="hidden">
          <Box px={6} py={4} borderBottomWidth="1px" borderColor={borderColor}>
           <Flex direction={{ base:'column', md:'row' }} justify="space-between" align={{ md:'start' }} gap={3}>
              <Box>
                <Text fontWeight="bold" fontSize="md">All Reports</Text>
                <Text fontSize="xs" color="gray.400">Click any row to open full management panel</Text>
              </Box>
            <VStack spacing={2} align="end">
  {/* Filter Row */}
 <HStack spacing={2} flexWrap="nowrap">
  <Text fontSize="xs" color="gray.400" fontWeight="semibold" alignSelf="center" whiteSpace="nowrap">🔽 Filter:</Text>
  <Select placeholder="Category" value={filterCategory} onChange={e => setFC(e.target.value)} size="sm" maxW="130px" borderRadius="lg">
      <option value="plastic">🧴 Plastic</option>
      <option value="organic">🍃 Organic</option>
      <option value="electronic">🔌 Electronic</option>
      <option value="other">🧩 Other</option>
    </Select>
    <Select placeholder="Status" value={filterStatus} onChange={e => setFS(e.target.value)} size="sm" maxW="130px" borderRadius="lg">
      <option value="pending">Pending</option>
      <option value="in-progress">In Progress</option>
      <option value="resolved">Resolved</option>
      <option value="rejected">Rejected</option>
    </Select>
    <Select placeholder="Priority" value={filterPriority} onChange={e => setFP(e.target.value)} size="sm" maxW="130px" borderRadius="lg">
      <option value="High">🔴 High</option>
      <option value="Medium">🟡 Medium</option>
      <option value="Low">🟢 Low</option>
    </Select>
    {(filterCategory || filterStatus || filterPriority) && (
      <Button onClick={() => { setFC(''); setFS(''); setFP(''); }} size="sm" variant="outline" colorScheme="red" borderRadius="lg">Clear</Button>
    )}
  </HStack>

  {/* Sort Row */}
  <HStack spacing={2}>
    <Text fontSize="xs" color="gray.400" fontWeight="semibold" alignSelf="center">↕️ Sort:</Text>
<Select value={sortBy} onChange={e => {
  const val = e.target.value;
  setSortBy(val);
  setSortOrder(val === 'priorityScore' ? 'desc' : 'desc');
}} size="sm" maxW="140px" borderRadius="lg">
  <option value="createdAt">📅 Date</option>
  <option value="priorityScore">⚡ Priority Score</option>
</Select>
<Select value={sortOrder} onChange={e => setSortOrder(e.target.value)} size="sm" maxW="150px" borderRadius="lg">
  {sortBy === 'priorityScore' ? (
    <>
      <option value="desc">🔴 High → Low</option>
      <option value="asc">🟢 Low → High</option>
    </>
  ) : (
    <>
      <option value="desc">↑ Newest First</option>
      <option value="asc">↓ Oldest First</option>
    </>
  )}
</Select>
  </HStack>
</VStack>
            </Flex>
          </Box>

          {tableLoading ? (
            <Flex py={12} justify="center"><Spinner color="teal.500"/></Flex>
          ) : reports.length === 0 ? (
            <Flex py={12} direction="column" align="center" gap={2}><Text fontSize="3xl">📭</Text><Text color="gray.400">No reports match the current filters</Text></Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr bg={useColorModeValue('gray.50','gray.750')}>
                    {['Image','Description','Category','Priority','Status','Date','Actions'].map(h => (
                      <Th key={h} py={3} fontSize="xs" color="gray.500" fontWeight="bold">{h}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {reports.map((report) => (
                    <Tr key={report._id}
                      cursor="pointer"
                      _hover={{ bg: useColorModeValue('teal.50','teal.900') }}
                      transition="all 0.15s"
                      borderLeftWidth={report.priorityLevel === 'High' ? '3px' : '0'}
                      borderLeftColor="red.400"
                      onClick={() => { setSelected(report); onOpen(); }}
                    >
                      <Td py={3}>
                        <Image src={report.images[0]?.url} boxSize="48px" objectFit="cover" borderRadius="lg" fallbackSrc="https://via.placeholder.com/48"/>
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
                            <IconButton icon={<FiEye/>} size="xs" colorScheme="blue" variant="ghost"
                              onClick={() => { setSelected(report); onOpen(); }} aria-label="View"/>
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton icon={<FiTrash2/>} size="xs" colorScheme="red" variant="ghost"
                              onClick={() => handleDelete(report._id)} aria-label="Delete"/>
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
      </Container>

      {/* ── Full Management Modal ──────────────────────────────────────── */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(4px)"/>
          <ModalContent bg={cardBg} borderRadius="2xl">
            <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
              <HStack spacing={3}>
                <Text fontSize="2xl">{getCatEmoji(selectedReport.category)}</Text>
                <Box flex={1}>
                  <Text fontSize="lg" fontWeight="bold">Manage Report</Text>
                  <HStack mt={1} spacing={2} flexWrap="wrap">
                    <PriorityBadge priorityLevel={selectedReport.priorityLevel} priorityScore={selectedReport.priorityScore}/>
                    <Badge colorScheme={getStatusColor(selectedReport.status)} textTransform="capitalize">{selectedReport.status}</Badge>
                    {selectedReport.escalated && <Badge colorScheme="red">⚠️ Escalated</Badge>}
                    {!selectedReport.priorityLevel && (
                      <Button size="xs" leftIcon={<FiZap/>} colorScheme="orange"
                        isLoading={recalcing} onClick={() => handleRecalculate(selectedReport._id)}>
                        Analyze Now
                      </Button>
                    )}
                  </HStack>
                </Box>
              </HStack>
            </ModalHeader>
            <ModalCloseButton/>
            <ModalBody pb={4} pt={4}>
              <Tabs colorScheme="teal" variant="soft-rounded" size="sm">
                <TabList flexWrap="wrap" gap={1} mb={4}>
                  <Tab>Details</Tab>
                  <Tab>🎯 Change Status</Tab>
                  <Tab>📊 Priority</Tab>
                  {selectedReport.wasteClassification?.wasteType && <Tab>🤖 AI Class</Tab>}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && <Tab>📋 Actions</Tab>}
                </TabList>
                <TabPanels>

                  {/* Details Tab */}
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base:1, md: Math.min(selectedReport.images.length, 3) }} spacing={3}>
                        {selectedReport.images.map((img, i) => (
                          <Image key={i} src={img.url} h="140px" objectFit="cover" borderRadius="xl"
                            cursor="pointer" onClick={() => window.open(img.url,'_blank')}
                            _hover={{ opacity:0.85 }} transition="opacity 0.2s"/>
                        ))}
                      </SimpleGrid>
                      <Box p={4} bg={subtleBg} borderRadius="xl">
                        <Text fontSize="xs" color="gray.500" mb={1}>Description</Text>
                        <Text fontSize="sm">{selectedReport.description}</Text>
                      </Box>
                      <SimpleGrid columns={2} spacing={3}>
                        {[
                          { label:'Category',     value:`${getCatEmoji(selectedReport.category)} ${selectedReport.category}`   },
                          { label:'Reported by',  value: selectedReport.userName || selectedReport.reportedBy || 'Anonymous'   },
                          { label:'Date',         value: fmtDate(selectedReport.createdAt)                                     },
                          { label:'Cluster size', value:`${selectedReport.clusterSize || 1} nearby report(s)`                  },
                        ].map(({ label, value }) => (
                          <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{label}</Text>
                            <Text fontSize="sm" fontWeight="medium" mt={0.5} textTransform="capitalize">{value}</Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                      {selectedReport.location?.address && (
                        <Box p={3} bg={subtleBg} borderRadius="lg">
                          <HStack><Icon as={FiMapPin} color="green.400"/><Text fontSize="sm">{selectedReport.location.address}</Text></HStack>
                        </Box>
                      )}
                      {selectedReport.escalated && (
                        <Alert status="error" borderRadius="xl">
                          <AlertIcon/>
                          <Box>
                            <Text fontSize="sm" fontWeight="bold">This report has been escalated</Text>
                            <Text fontSize="xs">{selectedReport.escalationReason}</Text>
                            {selectedReport.escalatedAt && <Text fontSize="xs" color="gray.500">Escalated at: {fmtDate(selectedReport.escalatedAt)}</Text>}
                          </Box>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Change Status Tab — PROMINENT */}
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <Alert status="info" borderRadius="xl">
                        <AlertIcon/>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold">Real-time Notification</Text>
                          <Text fontSize="xs">The reporter will receive an instant notification when you change the status. Their points are also updated automatically when resolved.</Text>
                        </Box>
                      </Alert>

                      <Box p={4} bg={subtleBg} borderRadius="xl">
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Current Status</Text>
                        <Badge colorScheme={getStatusColor(selectedReport.status)} fontSize="md" px={4} py={2} borderRadius="full" textTransform="capitalize">
                          {selectedReport.status}
                        </Badge>
                      </Box>

                      <Text fontSize="sm" fontWeight="bold" color="gray.600">Change to:</Text>

                      <SimpleGrid columns={{ base:1, md:2 }} spacing={3}>
                        {[
                          { s:'pending',     icon:FiClock,       color:'yellow', label:'Mark Pending',     desc:'Reset to awaiting review'       },
                          { s:'in-progress', icon:FiAlertCircle, color:'blue',   label:'Mark In Progress', desc:'Worker assigned, being handled'  },
                          { s:'resolved',    icon:FiCheckCircle, color:'green',  label:'Mark Resolved ✅',  desc:'Awards reporter +25 pts'         },
                          { s:'rejected',    icon:FiXCircle,     color:'red',    label:'Mark Rejected',    desc:'Invalid or duplicate complaint'  },
                        ].map(({ s, icon, color, label, desc }) => (
                          <Box
                            key={s}
                            p={4} borderRadius="xl" cursor="pointer"
                            borderWidth="2px"
                            borderColor={selectedReport.status === s ? `${color}.400` : borderColor}
                            bg={selectedReport.status === s ? `${color}.50` : cardBg}
                            _hover={{ borderColor:`${color}.400`, bg:`${color}.50` }}
                            _dark={{ bg: selectedReport.status === s ? `${color}.900` : cardBg, _hover:{ bg:`${color}.900` } }}
                            transition="all 0.2s"
                            onClick={() => selectedReport.status !== s && handleUpdateStatus(selectedReport._id, s)}
                            opacity={selectedReport.status === s ? 0.7 : 1}
                          >
                            <HStack>
                              <Icon as={icon} color={`${color}.500`} boxSize={5}/>
                              <Box>
                                <Text fontSize="sm" fontWeight="bold" color={`${color}.600`} _dark={{ color:`${color}.300` }}>{label}</Text>
                                <Text fontSize="xs" color="gray.500">{desc}</Text>
                              </Box>
                              {selectedReport.status === s && <Badge colorScheme={color} ml="auto" fontSize="10px">current</Badge>}
                            </HStack>
                          </Box>
                        ))}
                      </SimpleGrid>

                      {updatingStatus && (
                        <HStack justify="center" pt={2}>
                          <Spinner size="sm" color="teal.500"/>
                          <Text fontSize="sm" color="gray.500">Updating and notifying reporter…</Text>
                        </HStack>
                      )}

                      <Divider/>

                 <Box>
  <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.600">Other Operations</Text>
  <HStack spacing={3} flexWrap="wrap" mb={4}>
    <Button leftIcon={<FiZap/>} colorScheme="orange" size="sm" variant="outline"
      isLoading={recalcing} loadingText="Analyzing…"
      onClick={() => handleRecalculate(selectedReport._id)}>
      Re-run AI Analysis
    </Button>
    <Button leftIcon={<FiTrash2/>} colorScheme="red" size="sm" variant="outline"
      onClick={() => handleDelete(selectedReport._id)}>
      Delete Report
    </Button>
  </HStack>
</Box>

{/* Worker Assignment Section */}
<Box>
  <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.600">Assign Worker</Text>
  <WorkerAssignPanel reportId={selectedReport._id} currentWorker={selectedReport.assignedWorker} onAssigned={(updated) => {
    setReports(prev => prev.map(r => r._id === updated._id ? updated : r));
    setSelected(updated);
    toast({ title: 'Worker assigned', status: 'success', duration: 3000, position: 'top-right' });
  }} />
</Box>
                    </VStack>
                  </TabPanel>

                  {/* Priority Breakdown Tab */}
                  <TabPanel px={0}>
                    {selectedReport.priorityBreakdown ? (
                      <VStack spacing={4} align="stretch">
                        <Flex align="center" gap={4} p={5} bg={subtleBg} borderRadius="2xl">
                          <Box textAlign="center">
                            <Text fontSize="5xl" fontWeight="extrabold" lineHeight="1"
                              color={selectedReport.priorityLevel === 'High' ? 'red.500' : selectedReport.priorityLevel === 'Medium' ? 'yellow.500' : 'green.500'}>
                              {selectedReport.priorityScore}
                            </Text>
                            <Text fontSize="xs" color="gray.400">/ 100</Text>
                          </Box>
                          <Box flex={1}>
                            <Progress value={selectedReport.priorityScore || 0} borderRadius="full" size="lg" mb={2}
                              colorScheme={selectedReport.priorityLevel === 'High' ? 'red' : selectedReport.priorityLevel === 'Medium' ? 'yellow' : 'green'}/>
                            <PriorityBadge priorityLevel={selectedReport.priorityLevel} priorityScore={selectedReport.priorityScore}/>
                          </Box>
                        </Flex>

                        <Divider/>

                        {[
                          { label:'♻️ Resource Score',  key:'resourceScore',  color:'teal',   weight:'35%' },
                          { label:'📍 Location Score',  key:'locationScore',  color:'blue',   weight:'25%' },
                          { label:'🌦 Weather Score',   key:'weatherScore',   color:'cyan',   weight:'20%' },
                          { label:'💬 Sentiment Score', key:'sentimentScore', color:'purple', weight:'20%' },
                        ].map(({ label, key, color, weight }) => (
                          <Box key={key}>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm">{label} <Text as="span" fontSize="xs" color="gray.400">({weight})</Text></Text>
                              <Text fontSize="sm" fontWeight="bold">{selectedReport.priorityBreakdown[key] ?? 'N/A'}/100</Text>
                            </Flex>
                            <Progress value={selectedReport.priorityBreakdown[key] || 0} colorScheme={color} borderRadius="full" size="sm"/>
                          </Box>
                        ))}

                        {selectedReport.priorityBreakdown.materials?.length > 0 && (
                          <Box p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="xs" color="gray.500" mb={2}>Detected Materials</Text>
                            <HStack flexWrap="wrap" gap={2}>
                              {selectedReport.priorityBreakdown.materials.map((m, i) => <Badge key={i} colorScheme="teal" fontSize="xs">{m}</Badge>)}
                            </HStack>
                          </Box>
                        )}

                        <SimpleGrid columns={2} spacing={3}>
                          {selectedReport.priorityBreakdown.weatherDetails?.condition && (
                            <Box p={3} bg={subtleBg} borderRadius="lg">
                              <Text fontSize="xs" color="gray.500" mb={1}>Weather at Report Time</Text>
                              <Text fontSize="sm">{selectedReport.priorityBreakdown.weatherDetails.condition}
                                {selectedReport.priorityBreakdown.weatherDetails.temp != null && ` — ${selectedReport.priorityBreakdown.weatherDetails.temp}°C`}
                              </Text>
                            </Box>
                          )}
                          <Box p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="xs" color="gray.500" mb={1}>Sentiment Analysis</Text>
                            <Badge colorScheme={selectedReport.priorityBreakdown.sentimentLabel === 'critical' ? 'red' : selectedReport.priorityBreakdown.sentimentLabel === 'high' ? 'orange' : 'yellow'}>
                              {selectedReport.priorityBreakdown.sentimentLabel || 'N/A'}
                            </Badge>
                          </Box>
                        </SimpleGrid>

                        <Alert status="info" borderRadius="xl" fontSize="xs">
                          <AlertIcon/>
                          Score = (0.35 × {selectedReport.priorityBreakdown.resourceScore}) + (0.25 × {selectedReport.priorityBreakdown.locationScore}) + (0.20 × {selectedReport.priorityBreakdown.weatherScore}) + (0.20 × {selectedReport.priorityBreakdown.sentimentScore}) = <strong>{selectedReport.priorityScore}</strong>
                        </Alert>
                      </VStack>
                    ) : (
                      <Flex py={8} direction="column" align="center" gap={3}>
                        <Text fontSize="3xl">🤖</Text>
                        <Text color="gray.500" fontSize="sm">No AI analysis yet for this report.</Text>
                        <Button leftIcon={<FiZap/>} colorScheme="orange" isLoading={recalcing}
                          onClick={() => handleRecalculate(selectedReport._id)}>
                          Run Analysis Now
                        </Button>
                      </Flex>
                    )}
                  </TabPanel>

                  {/* AI Classification Tab */}
                  {selectedReport.wasteClassification?.wasteType && (
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg="purple.50" borderRadius="xl" borderLeftWidth="4px" borderColor="purple.400" _dark={{ bg:'purple.900' }}>
                          <Text fontWeight="bold" color="purple.600" fontSize="lg">{selectedReport.wasteClassification.wasteType} Waste</Text>
                          <Text fontSize="sm" color="gray.500">{selectedReport.wasteClassification.subType}</Text>
                        </Box>
                        <SimpleGrid columns={2} spacing={3}>
                          {[
                            { label:'Hazard',      value: selectedReport.wasteClassification.hazardLevel },
                            { label:'Recyclable',  value: selectedReport.wasteClassification.recyclingPossibility },
                            { label:'Action',      value: selectedReport.wasteClassification.actionRequired },
                            { label:'Decomposition',value: selectedReport.wasteClassification.estimatedDecompositionDays === -1 ? 'Non-biodeg.' : `~${selectedReport.wasteClassification.estimatedDecompositionDays}d` },
                          ].map(({ label, value }) => (
                            <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                              <Text fontSize="10px" color="gray.400">{label}</Text>
                              <Text fontSize="sm" fontWeight="bold">{value || 'N/A'}</Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                        <Box p={4} bg={subtleBg} borderRadius="lg"><Text fontSize="xs" color="gray.400" mb={1}>Disposal Method</Text><Text fontSize="sm">{selectedReport.wasteClassification.disposalMethod}</Text></Box>
                        <Box p={4} bg="orange.50" borderRadius="lg" borderLeftWidth="3px" borderColor="orange.400" _dark={{ bg:'orange.900' }}>
                          <Text fontSize="xs" color="orange.500" fontWeight="bold" mb={1}>⚠️ Environmental Impact</Text>
                          <Text fontSize="sm">{selectedReport.wasteClassification.environmentalImpact}</Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                  )}

                  {/* Recommendations Tab */}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && (
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg={subtleBg} borderRadius="xl">
                          <Text fontWeight="bold" fontSize="sm" mb={3}>Immediate Actions</Text>
                          {selectedReport.recommendations.immediateActions.map((a, i) => (
                            <HStack key={i} align="start" mb={2} spacing={2}>
                              <Box minW="20px" h="20px" bg="teal.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                                <Text fontSize="10px" color="white" fontWeight="bold">{i+1}</Text>
                              </Box>
                              <Text fontSize="sm">{a}</Text>
                            </HStack>
                          ))}
                        </Box>
                        <SimpleGrid columns={2} spacing={3}>
                          <Box p={3} bg={subtleBg} borderRadius="lg"><Text fontSize="10px" color="gray.400">Authority</Text><Text fontSize="sm" fontWeight="bold">{selectedReport.recommendations.authorityToContact}</Text></Box>
                          <Box p={3} bg={subtleBg} borderRadius="lg"><Text fontSize="10px" color="gray.400">Est. Resolution</Text><Text fontSize="sm" fontWeight="bold">{selectedReport.recommendations.estimatedResolutionTime}</Text></Box>
                        </SimpleGrid>
                        {selectedReport.recommendations.recyclingCenters?.length > 0 && (
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" mb={2}>Nearby Recycling Centers</Text>
                            {selectedReport.recommendations.recyclingCenters.map((c, i) => (
                              <Box key={i} p={3} bg={subtleBg} borderRadius="lg" mb={2} borderLeftWidth="3px" borderColor="teal.400">
                                <Text fontSize="sm" fontWeight="bold">{c.name}</Text>
                                <Text fontSize="xs" color="gray.400">📍 {c.area} · 📞 {c.phone}</Text>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter borderTopWidth="1px" borderColor={borderColor} gap={2}>
              <Button colorScheme="red" variant="ghost" leftIcon={<FiTrash2/>} size="sm" onClick={() => handleDelete(selectedReport._id)}>Delete</Button>
              <Button onClick={onClose} size="sm">Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default AdminDashboard;