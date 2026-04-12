import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, SimpleGrid, Text, VStack, HStack,
  useColorModeValue, Spinner, Button, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  ModalFooter, useDisclosure, Flex, IconButton, Tooltip,
  Select, Icon, Tabs, TabList, TabPanels, Tab, TabPanel,
  useToast, Progress, Divider, Badge, Image, Table,
  Thead, Tbody, Tr, Th, Td, Avatar,
} from '@chakra-ui/react';
import {
  FiEye, FiTrash2, FiMapPin, FiCheckCircle, FiClock,
  FiAlertCircle, FiXCircle, FiActivity, FiTrendingUp,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import PriorityBadge from '../components/shared/PriorityBadge';

const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/reports`;
const MotionBox = motion(Box);

// Chart color palettes
const PRIORITY_COLORS  = { High: '#FC8181', Medium: '#F6E05E', Low: '#68D391', null: '#CBD5E0' };
const CATEGORY_COLORS  = ['#4FD1C5', '#63B3ED', '#9F7AEA', '#F6AD55'];
const STATUS_COLORS    = { pending: '#F6E05E', 'in-progress': '#63B3ED', resolved: '#68D391', rejected: '#FC8181' };

const getCategoryEmoji = (c) => ({ plastic: '🧴', organic: '🍃', electronic: '🔌', other: '🧩' }[c] || '📦');
const getStatusColor   = (s) => ({ pending: 'yellow', 'in-progress': 'blue', resolved: 'green', rejected: 'red' }[s] || 'gray');
const formatDate       = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatDateShort  = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, helpText, icon, color, change, index }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Box
        bg={cardBg} p={5} borderRadius="2xl" boxShadow="md"
        borderWidth="1px" borderColor={borderColor}
        _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
        transition="all 0.3s"
        borderTopWidth="3px"
        borderTopColor={`${color}.400`}
      >
        <Flex justify="space-between" align="start">
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
              {label}
            </Text>
            <Text fontSize="3xl" fontWeight="extrabold" color={`${color}.500`} lineHeight="1.2" mt={1}>
              {value}
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>{helpText}</Text>
          </Box>
          <Box
            bg={`${color}.50`} p={3} borderRadius="xl"
            color={`${color}.500`}
            _dark={{ bg: `${color}.900` }}
          >
            <Icon as={icon} boxSize={6} />
          </Box>
        </Flex>
        {change !== undefined && (
          <HStack mt={3} spacing={1}>
            <Icon as={FiTrendingUp} color={change >= 0 ? 'green.400' : 'red.400'} boxSize={3} />
            <Text fontSize="xs" color={change >= 0 ? 'green.500' : 'red.500'} fontWeight="bold">
              {change >= 0 ? '+' : ''}{change}% this week
            </Text>
          </HStack>
        )}
      </Box>
    </MotionBox>
  );
};

// ── Chart Card wrapper ───────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, action }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  return (
    <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderColor} h="100%">
      <Flex justify="space-between" align="start" mb={4}>
        <Box>
          <Text fontWeight="bold" fontSize="md">{title}</Text>
          {subtitle && <Text fontSize="xs" color="gray.400" mt={0.5}>{subtitle}</Text>}
        </Box>
        {action}
      </Flex>
      {children}
    </Box>
  );
};

// ── Custom Tooltip for recharts ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  const bg = useColorModeValue('white', 'gray.700');
  if (!active || !payload?.length) return null;
  return (
    <Box bg={bg} p={3} borderRadius="lg" boxShadow="lg" fontSize="sm">
      {label && <Text fontWeight="bold" mb={1}>{label}</Text>}
      {payload.map((p, i) => (
        <Text key={i} color={p.color}>{p.name}: {p.value}</Text>
      ))}
    </Box>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [reports, setReports]         = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedReport, setSelected] = useState(null);
  const [filterCategory, setFC]       = useState('');
  const [filterStatus, setFS]         = useState('');
  const [filterPriority, setFP]       = useState('');
  const [updatingStatus, setUpdating] = useState(false);
  const { isOpen, onOpen, onClose }   = useDisclosure();
  const toast = useToast();

  const bg          = useColorModeValue('gray.50', 'gray.900');
  const cardBg      = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtleBg    = useColorModeValue('gray.50', 'gray.700');
  const headerBg    = useColorModeValue('teal.500', 'teal.700');
  const textColor   = useColorModeValue('gray.700', 'gray.200');

  const fetchReports = useCallback(async () => {
    try {
      setTableLoading(true);
      const params = ['sortBy=priorityScore&order=desc&limit=50'];
      if (filterCategory) params.push(`category=${filterCategory}`);
      if (filterStatus)   params.push(`status=${filterStatus}`);
      if (filterPriority) params.push(`priorityLevel=${filterPriority}`);
      const { data } = await axios.get(`${API_URL}?${params.join('&')}`, { withCredentials: true });
      setReports(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  }, [filterCategory, filterStatus, filterPriority]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/stats`);
      setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { fetchReports(); }, [filterCategory, filterStatus, filterPriority]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdating(true);
      await axios.patch(`${API_URL}/${id}/status`, { status: newStatus }, { withCredentials: true });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      if (selectedReport?._id === id) setSelected(prev => ({ ...prev, status: newStatus }));
      fetchStats();
      toast({ title: `Status → ${newStatus}`, status: 'success', duration: 2000, position: 'top-right' });
    } catch (err) {
      toast({ title: 'Update failed', status: 'error', duration: 3000, position: 'top-right' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setReports(prev => prev.filter(r => r._id !== id));
      fetchStats();
      onClose();
      toast({ title: 'Deleted', status: 'success', duration: 2000, position: 'top-right' });
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 3000, position: 'top-right' });
    }
  };

  // ── Prepare chart data ──────────────────────────────────────────────────
  const trendData = (stats?.trend || []).map(t => ({
    date:  formatDateShort(t._id),
    count: t.count,
  }));

  const pieData = (stats?.byPriority || [])
    .filter(p => p._id)
    .map(p => ({ name: p._id, value: p.count, color: PRIORITY_COLORS[p._id] }));

  const categoryBarData = (stats?.byCategory || []).map(c => ({
    name:  c._id ? c._id.charAt(0).toUpperCase() + c._id.slice(1) : 'Unknown',
    count: c.count,
  }));

  const statusData = ['pending', 'in-progress', 'resolved', 'rejected'].map(s => {
    const count = reports.filter(r => r.status === s).length;
    return { name: s, count, fill: STATUS_COLORS[s] };
  });

  const resolutionRate = stats?.overall?.totalReports
    ? Math.round(((stats.overall.resolvedReports || 0) / stats.overall.totalReports) * 100)
    : 0;

  const avgScore = stats?.overall?.avgPriorityScore
    ? Math.round(stats.overall.avgPriorityScore)
    : 0;

  if (loading) {
    return (
      <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text color="gray.400">Loading dashboard…</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh" pb={12}>

      {/* ── Top Banner ─────────────────────────────────────────────────── */}
      <Box bgGradient="linear(135deg, teal.600, green.500)" px={8} py={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Text fontSize="2xl" fontWeight="extrabold" color="white">
                Admin Dashboard
              </Text>
              <Text color="whiteAlpha.800" fontSize="sm">
                Real-time waste management intelligence
              </Text>
            </Box>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={() => { fetchReports(); fetchStats(); }}
                size="sm" bg="whiteAlpha.200" color="white"
                _hover={{ bg: 'whiteAlpha.300' }}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" mt={-4}>

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          {[
            { label: 'Total Reports',  value: stats?.overall?.totalReports || 0,      icon: FiActivity,    color: 'teal',   helpText: 'All time'          },
            { label: 'Pending',        value: stats?.overall?.pendingReports || 0,     icon: FiClock,       color: 'yellow', helpText: 'Needs attention'   },
            { label: 'In Progress',    value: stats?.overall?.inProgressReports || 0,  icon: FiAlertCircle, color: 'blue',   helpText: 'Being handled'     },
            { label: 'Resolved',       value: stats?.overall?.resolvedReports || 0,    icon: FiCheckCircle, color: 'green',  helpText: `${resolutionRate}% rate` },
          ].map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </SimpleGrid>

        {/* ── Charts Row 1 ───────────────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4} mb={4}>

          {/* Trend Chart */}
          <Box gridColumn={{ lg: '1 / 3' }}>
            <ChartCard
              title="Reports Over Time"
              subtitle={`Last ${trendData.length} days`}
            >
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#319795" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#319795" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#E2E8F0', '#2D3748')} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: textColor }} />
                    <YAxis tick={{ fontSize: 11, fill: textColor }} allowDecimals={false} />
                    <RTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" name="Reports" stroke="#319795" strokeWidth={2.5} fill="url(#tealGrad)" dot={{ fill: '#319795', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box h="200px" display="flex" alignItems="center" justifyContent="center">
                  <Text color="gray.400" fontSize="sm">No trend data yet</Text>
                </Box>
              )}
            </ChartCard>
          </Box>

          {/* Priority Pie */}
          <ChartCard title="Priority Split" subtitle="All reports">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <RTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <VStack spacing={2} mt={2}>
                  {pieData.map(p => (
                    <Flex key={p.name} justify="space-between" w="100%" align="center">
                      <HStack spacing={2}>
                        <Box w="10px" h="10px" borderRadius="full" bg={p.color} />
                        <Text fontSize="xs">{p.name}</Text>
                      </HStack>
                      <Text fontSize="xs" fontWeight="bold">{p.value}</Text>
                    </Flex>
                  ))}
                </VStack>
              </>
            ) : (
              <Box h="160px" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.400" fontSize="sm">No data yet</Text>
              </Box>
            )}
          </ChartCard>
        </SimpleGrid>

        {/* ── Charts Row 2 ───────────────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={4}>

          {/* Category Bar */}
          <Box gridColumn={{ lg: '1 / 3' }}>
            <ChartCard title="Reports by Category" subtitle="Waste type breakdown">
              {categoryBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={categoryBarData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#E2E8F0', '#2D3748')} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} />
                    <YAxis tick={{ fontSize: 11, fill: textColor }} allowDecimals={false} />
                    <RTooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Reports" radius={[6, 6, 0, 0]}>
                      {categoryBarData.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box h="180px" display="flex" alignItems="center" justifyContent="center">
                  <Text color="gray.400" fontSize="sm">No data yet</Text>
                </Box>
              )}
            </ChartCard>
          </Box>

          {/* Resolution Rate Radial */}
          <ChartCard title="Resolution Rate" subtitle="Resolved vs total">
            <Box textAlign="center">
              <ResponsiveContainer width="100%" height={140}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: resolutionRate, fill: '#68D391' }]} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: useColorModeValue('#E2E8F0', '#2D3748') }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <Text fontSize="3xl" fontWeight="extrabold" color="green.500" mt={-4}>{resolutionRate}%</Text>
              <Text fontSize="xs" color="gray.400">resolved</Text>
            </Box>
          </ChartCard>

          {/* Avg Priority Score */}
          <ChartCard title="Avg Priority Score" subtitle="Across all reports">
            <Box textAlign="center" pt={4}>
              <Box position="relative" display="inline-block">
                <CircularProgress
                  value={avgScore}
                  size="120px"
                  thickness="10px"
                  color={avgScore >= 70 ? 'red.400' : avgScore >= 40 ? 'yellow.400' : 'green.400'}
                  trackColor={useColorModeValue('gray.100', 'gray.700')}
                >
                  <CircularProgressLabel fontSize="xl" fontWeight="extrabold">
                    {avgScore}
                  </CircularProgressLabel>
                </CircularProgress>
              </Box>
              <Text fontSize="xs" color="gray.400" mt={2}>
                {avgScore >= 70 ? '🔴 High urgency avg' : avgScore >= 40 ? '🟡 Medium urgency avg' : '🟢 Low urgency avg'}
              </Text>
            </Box>
          </ChartCard>
        </SimpleGrid>

        {/* ── Status Distribution Bar ─────────────────────────────────────── */}
        <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Text fontWeight="bold" mb={4}>Status Distribution</Text>
          <Flex gap={3} flexWrap="wrap">
            {statusData.map(s => {
              const total = reports.length || 1;
              const pct = Math.round((s.count / total) * 100);
              return (
                <Box key={s.name} flex={1} minW="120px">
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="xs" textTransform="capitalize" fontWeight="medium">{s.name}</Text>
                    <Text fontSize="xs" fontWeight="bold">{s.count}</Text>
                  </Flex>
                  <Box bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="full" h="8px">
                    <Box bg={s.fill} borderRadius="full" h="8px" w={`${pct}%`} transition="width 0.8s ease" />
                  </Box>
                  <Text fontSize="10px" color="gray.400" mt={0.5}>{pct}%</Text>
                </Box>
              );
            })}
          </Flex>
        </Box>

        {/* ── Reports Table ───────────────────────────────────────────────── */}
        <Box bg={cardBg} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={borderColor} overflow="hidden">
          {/* Table Header */}
          <Box px={6} py={4} borderBottomWidth="1px" borderColor={borderColor}>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ md: 'center' }} gap={3}>
              <Box>
                <Text fontWeight="bold" fontSize="md">All Reports</Text>
                <Text fontSize="xs" color="gray.400">Sorted by priority score — highest first</Text>
              </Box>
              <HStack spacing={2} flexWrap="wrap">
                <Select placeholder="Category" value={filterCategory} onChange={e => setFC(e.target.value)} size="sm" maxW="140px" borderRadius="lg">
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
                  <Button onClick={() => { setFC(''); setFS(''); setFP(''); }} size="sm" variant="outline" borderRadius="lg">
                    Clear
                  </Button>
                )}
              </HStack>
            </Flex>
          </Box>

          {tableLoading ? (
            <Flex py={12} justify="center"><Spinner color="teal.500" /></Flex>
          ) : reports.length === 0 ? (
            <Flex py={12} direction="column" align="center" gap={2}>
              <Text fontSize="3xl">📭</Text>
              <Text color="gray.400">No reports match the current filters</Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr bg={useColorModeValue('gray.50', 'gray.750')}>
                    {['Image', 'Description', 'Category', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                      <Th key={h} py={3} fontSize="xs" color="gray.500" fontWeight="bold">{h}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {reports.map((report, idx) => (
                    <Tr
                      key={report._id}
                      _hover={{ bg: useColorModeValue('teal.50', 'teal.900') }}
                      transition="all 0.15s"
                      borderLeftWidth={report.priorityLevel === 'High' ? '3px' : '0'}
                      borderLeftColor="red.400"
                    >
                      <Td py={3}>
                        <Image
                          src={report.images[0]?.url}
                          boxSize="48px" objectFit="cover"
                          borderRadius="lg"
                          fallbackSrc="https://via.placeholder.com/48"
                        />
                      </Td>
                      <Td maxW="200px" py={3}>
                        <Text noOfLines={2} fontSize="sm">{report.description}</Text>
                        {report.escalated && (
                          <Badge colorScheme="red" fontSize="9px" mt={1}>⚠️ Escalated</Badge>
                        )}
                      </Td>
                      <Td py={3}>
                        <HStack spacing={1}>
                          <Text>{getCategoryEmoji(report.category)}</Text>
                          <Text fontSize="sm" textTransform="capitalize">{report.category}</Text>
                        </HStack>
                      </Td>
                      <Td py={3}>
                        <PriorityBadge priorityLevel={report.priorityLevel} priorityScore={report.priorityScore} size="sm" />
                      </Td>
                      <Td py={3}>
                        <Badge colorScheme={getStatusColor(report.status)} borderRadius="full" px={2} py={0.5} fontSize="xs" textTransform="capitalize">
                          {report.status}
                        </Badge>
                      </Td>
                      <Td py={3} fontSize="xs" color="gray.500">{formatDate(report.createdAt)}</Td>
                      <Td py={3}>
                        <HStack spacing={1}>
                          <Tooltip label="View details">
                            <IconButton icon={<FiEye />} size="xs" colorScheme="blue" variant="ghost" onClick={() => { setSelected(report); onOpen(); }} aria-label="View" />
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" variant="ghost" onClick={() => handleDelete(report._id)} aria-label="Delete" />
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

      {/* ── Report Detail Modal ─────────────────────────────────────────── */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent bg={cardBg} borderRadius="2xl">
            <ModalHeader>
              <HStack spacing={3}>
                <Text fontSize="2xl">{getCategoryEmoji(selectedReport.category)}</Text>
                <Box>
                  <Text fontSize="lg">Manage Report</Text>
                  <HStack mt={1} spacing={2}>
                    <PriorityBadge priorityLevel={selectedReport.priorityLevel} priorityScore={selectedReport.priorityScore} />
                    {selectedReport.escalated && <Badge colorScheme="red" fontSize="xs">⚠️ Escalated</Badge>}
                  </HStack>
                </Box>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={4}>
              <Tabs colorScheme="teal" variant="soft-rounded" size="sm">
                <TabList flexWrap="wrap" gap={1} mb={4}>
                  <Tab>Details</Tab>
                  <Tab>Priority</Tab>
                  {selectedReport.wasteClassification?.wasteType && <Tab>Classification</Tab>}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && <Tab>Actions</Tab>}
                  <Tab>Status</Tab>
                </TabList>
                <TabPanels>

                  {/* Details */}
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: Math.min(selectedReport.images.length, 3) }} spacing={3}>
                        {selectedReport.images.map((img, i) => (
                          <Image key={i} src={img.url} h="140px" objectFit="cover" borderRadius="xl" cursor="pointer" onClick={() => window.open(img.url, '_blank')} _hover={{ opacity: 0.85 }} transition="opacity 0.2s" />
                        ))}
                      </SimpleGrid>
                      <Box p={4} bg={subtleBg} borderRadius="xl">
                        <Text fontSize="xs" color="gray.500" mb={1}>Description</Text>
                        <Text fontSize="sm">{selectedReport.description}</Text>
                      </Box>
                      <SimpleGrid columns={2} spacing={3}>
                        {[
                          { label: 'Category', value: `${getCategoryEmoji(selectedReport.category)} ${selectedReport.category}` },
                          { label: 'Reported by', value: selectedReport.userName || selectedReport.reportedBy || 'Anonymous' },
                          { label: 'Date', value: formatDate(selectedReport.createdAt) },
                          { label: 'Cluster size', value: `${selectedReport.clusterSize || 1} report(s) nearby` },
                        ].map(({ label, value }) => (
                          <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{label}</Text>
                            <Text fontSize="sm" fontWeight="medium" mt={0.5} textTransform="capitalize">{value}</Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                      {selectedReport.location?.address && (
                        <Box p={3} bg={subtleBg} borderRadius="lg">
                          <HStack>
                            <Icon as={FiMapPin} color="green.400" />
                            <Text fontSize="sm">{selectedReport.location.address}</Text>
                          </HStack>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Priority Breakdown */}
                  <TabPanel px={0}>
                    {selectedReport.priorityBreakdown ? (
                      <VStack spacing={4} align="stretch">
                        <Flex align="center" gap={4} p={4} bg={subtleBg} borderRadius="xl">
                          <Box textAlign="center">
                            <Text fontSize="4xl" fontWeight="extrabold" color={selectedReport.priorityLevel === 'High' ? 'red.500' : selectedReport.priorityLevel === 'Medium' ? 'yellow.500' : 'green.500'}>
                              {selectedReport.priorityScore}
                            </Text>
                            <Text fontSize="xs" color="gray.400">/ 100</Text>
                          </Box>
                          <Box flex={1}>
                            <Progress value={selectedReport.priorityScore || 0} colorScheme={selectedReport.priorityLevel === 'High' ? 'red' : selectedReport.priorityLevel === 'Medium' ? 'yellow' : 'green'} borderRadius="full" size="lg" mb={2} />
                            <PriorityBadge priorityLevel={selectedReport.priorityLevel} priorityScore={selectedReport.priorityScore} />
                          </Box>
                        </Flex>
                        {[
                          { label: '♻️ Resource',  key: 'resourceScore',  weight: '35%', color: 'teal'   },
                          { label: '📍 Location',  key: 'locationScore',  weight: '25%', color: 'blue'   },
                          { label: '🌦 Weather',   key: 'weatherScore',   weight: '20%', color: 'cyan'   },
                          { label: '💬 Sentiment', key: 'sentimentScore', weight: '20%', color: 'purple' },
                        ].map(({ label, key, weight, color }) => (
                          <Box key={key}>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm">{label} <Text as="span" fontSize="xs" color="gray.400">({weight})</Text></Text>
                              <Text fontSize="sm" fontWeight="bold">{selectedReport.priorityBreakdown[key] ?? 'N/A'}</Text>
                            </Flex>
                            <Progress value={selectedReport.priorityBreakdown[key] || 0} colorScheme={color} borderRadius="full" size="sm" />
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Flex py={8} justify="center" align="center" gap={3} direction="column">
                        <Spinner color="teal.500" />
                        <Text color="gray.400" fontSize="sm">Analysis in progress…</Text>
                      </Flex>
                    )}
                  </TabPanel>

                  {/* Classification */}
                  {selectedReport.wasteClassification?.wasteType && (
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg="purple.50" borderRadius="xl" borderLeftWidth="4px" borderColor="purple.400" _dark={{ bg: 'purple.900' }}>
                          <Text fontWeight="bold" color="purple.600">{selectedReport.wasteClassification.wasteType}</Text>
                          <Text fontSize="sm" color="gray.500">{selectedReport.wasteClassification.subType}</Text>
                        </Box>
                        <SimpleGrid columns={2} spacing={3}>
                          {[
                            { label: 'Hazard', value: selectedReport.wasteClassification.hazardLevel },
                            { label: 'Recyclable', value: selectedReport.wasteClassification.recyclingPossibility },
                            { label: 'Action', value: selectedReport.wasteClassification.actionRequired },
                            { label: 'Decomposition', value: selectedReport.wasteClassification.estimatedDecompositionDays === -1 ? 'Non-biodeg.' : `~${selectedReport.wasteClassification.estimatedDecompositionDays}d` },
                          ].map(({ label, value }) => (
                            <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                              <Text fontSize="10px" color="gray.400">{label}</Text>
                              <Text fontSize="sm" fontWeight="bold">{value || 'N/A'}</Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                        <Box p={3} bg={subtleBg} borderRadius="lg">
                          <Text fontSize="xs" color="gray.400" mb={1}>Disposal</Text>
                          <Text fontSize="sm">{selectedReport.wasteClassification.disposalMethod}</Text>
                        </Box>
                        <Box p={3} bg="orange.50" borderRadius="lg" _dark={{ bg: 'orange.900' }}>
                          <Text fontSize="xs" color="orange.500" mb={1}>⚠️ Environmental Impact</Text>
                          <Text fontSize="sm">{selectedReport.wasteClassification.environmentalImpact}</Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                  )}

                  {/* Recommendations */}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && (
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg={subtleBg} borderRadius="xl">
                          <Text fontWeight="bold" fontSize="sm" mb={3}>Immediate Actions</Text>
                          {selectedReport.recommendations.immediateActions.map((a, i) => (
                            <HStack key={i} align="start" mb={2}>
                              <Box minW="20px" h="20px" bg="teal.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                                <Text fontSize="10px" color="white" fontWeight="bold">{i + 1}</Text>
                              </Box>
                              <Text fontSize="sm">{a}</Text>
                            </HStack>
                          ))}
                        </Box>
                        <SimpleGrid columns={2} spacing={3}>
                          <Box p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="10px" color="gray.400">Authority</Text>
                            <Text fontSize="sm" fontWeight="bold">{selectedReport.recommendations.authorityToContact}</Text>
                          </Box>
                          <Box p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="10px" color="gray.400">Est. Resolution</Text>
                            <Text fontSize="sm" fontWeight="bold">{selectedReport.recommendations.estimatedResolutionTime}</Text>
                          </Box>
                        </SimpleGrid>
                        {selectedReport.recommendations.recyclingCenters?.length > 0 && (
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" mb={2}>Nearby Recycling Centers</Text>
                            {selectedReport.recommendations.recyclingCenters.map((c, i) => (
                              <Box key={i} p={3} bg={subtleBg} borderRadius="lg" mb={2} borderLeftWidth="3px" borderColor="teal.400">
                                <Text fontSize="sm" fontWeight="bold">{c.name}</Text>
                                <Text fontSize="xs" color="gray.400">📍 {c.area} • 📞 {c.phone}</Text>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>
                  )}

                  {/* Update Status */}
                  <TabPanel px={0}>
                    <VStack spacing={3}>
                      {[
                        { s: 'pending',     icon: FiClock,       color: 'yellow', label: 'Mark Pending'     },
                        { s: 'in-progress', icon: FiAlertCircle, color: 'blue',   label: 'Mark In Progress' },
                        { s: 'resolved',    icon: FiCheckCircle, color: 'green',  label: 'Mark Resolved'    },
                        { s: 'rejected',    icon: FiXCircle,     color: 'red',    label: 'Mark Rejected'    },
                      ].map(({ s, icon, color, label }) => (
                        <Button
                          key={s} w="full" colorScheme={color}
                          leftIcon={<Icon as={icon} />}
                          onClick={() => handleUpdateStatus(selectedReport._id, s)}
                          isLoading={updatingStatus}
                          isDisabled={selectedReport.status === s}
                          borderRadius="xl"
                          variant={selectedReport.status === s ? 'solid' : 'outline'}
                        >
                          {label}
                          {selectedReport.status === s && ' (current)'}
                        </Button>
                      ))}
                      <Box p={3} bg={subtleBg} borderRadius="lg" w="full">
                        <Text fontSize="xs" color="gray.500">
                          Changing to "Resolved" awards the reporter 25 bonus points.
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter borderTopWidth="1px" borderColor={borderColor} gap={2}>
              <Button colorScheme="red" variant="ghost" onClick={() => handleDelete(selectedReport._id)} leftIcon={<FiTrash2 />} size="sm">
                Delete
              </Button>
              <Button onClick={onClose} size="sm">Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

// Need to import CircularProgress
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react';

export default AdminDashboard;