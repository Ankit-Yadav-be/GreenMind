import React, { useEffect, useState, useRef } from 'react';
import {
  Box, IconButton, Badge, VStack, Text, HStack,
  Popover, PopoverTrigger, PopoverContent,
  PopoverHeader, PopoverBody, useColorModeValue, Divider,
} from '@chakra-ui/react';
import { FiBell, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const TYPE_CONFIG = {
  STATUS_UPDATE:      { color: 'blue.500',   bg: 'blue.50'   },
  NEW_HIGH_PRIORITY:  { color: 'red.500',    bg: 'red.50'    },
  TASK_ASSIGNED:      { color: 'purple.500', bg: 'purple.50' },
  CONNECTED:          { color: 'green.500',  bg: 'green.50'  },
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const eventSourceRef = useRef(null);
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    // Connect to SSE stream
    const es = new EventSource(`${BACKEND_URL}/api/notifications/stream`, { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CONNECTED') return; // skip connection confirm
        setNotifications(prev => [{ ...data, id: Date.now(), timestamp: new Date() }, ...prev].slice(0, 20));
        setUnread(prev => prev + 1);
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      // Auto-reconnect handled by browser for SSE
    };

    return () => es.close();
  }, []);

  const handleOpen = () => setUnread(0);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <Popover placement="bottom-end" onOpen={handleOpen}>
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            icon={<FiBell />}
            variant="ghost"
            aria-label="Notifications"
            fontSize="20px"
          />
          <AnimatePresence>
            {unread > 0 && (
              <MotionBox
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                position="absolute" top="-2px" right="-2px"
              >
                <Badge colorScheme="red" borderRadius="full" fontSize="10px" minW="18px" textAlign="center">
                  {unread > 9 ? '9+' : unread}
                </Badge>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
      </PopoverTrigger>
      <PopoverContent w="340px" bg={cardBg} boxShadow="xl" border="none">
        <PopoverHeader fontWeight="bold" fontSize="sm" borderBottomWidth="1px">
          Notifications
        </PopoverHeader>
        <PopoverBody p={0} maxH="380px" overflowY="auto">
          {notifications.length === 0 ? (
            <Box p={6} textAlign="center">
              <Text fontSize="sm" color="gray.500">No notifications yet</Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.CONNECTED;
                return (
                  <Box key={n.id} p={3} borderBottomWidth="1px" _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} transition="all 0.2s">
                    <HStack justify="space-between" align="start">
                      <HStack align="start" spacing={3} flex={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg={config.color} mt="5px" flexShrink={0} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="bold">{n.title}</Text>
                          <Text fontSize="xs" color="gray.500">{n.message}</Text>
                          <Text fontSize="10px" color="gray.400" mt={1}>{formatTime(n.timestamp)}</Text>
                        </VStack>
                      </HStack>
                      <IconButton icon={<FiX />} size="xs" variant="ghost" onClick={() => removeNotification(n.id)} aria-label="Dismiss" />
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;