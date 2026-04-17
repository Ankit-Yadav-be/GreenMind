import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Flex, Text, IconButton, VStack, HStack,
  Badge, Avatar, useColorModeValue, Button, Textarea,
} from '@chakra-ui/react';
import { FiSend, FiX, FiMinimize2, FiMaximize2, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Detect page for contextual suggestions
const detectPage = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('report') && !path.includes('myreports') && !path.includes('my-reports')) return 'report';
  if (path.includes('myreports') || path.includes('my-reports')) return 'myreports';
  if (path.includes('leaderboard')) return 'leaderboard';
  if (path.includes('map'))         return 'map';
  if (path.includes('admin'))       return 'admin';
  if (path.includes('wastelist'))   return 'wastelist';
  return 'home';
};

// Format bot message — convert **bold** to styled spans
const FormattedText = ({ content }) => {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text fontSize="sm" lineHeight="1.7" whiteSpace="pre-wrap" wordBreak="break-word">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text as="span" key={i} fontWeight="bold">{part.slice(2, -2)}</Text>;
        }
        return <Text as="span" key={i}>{part}</Text>;
      })}
    </Text>
  );
};

// Animated typing dots
const TypingDots = () => (
  <HStack spacing="3px" px={3} py={2}>
    {[0, 1, 2].map(i => (
      <MotionBox
        key={i} w="6px" h="6px" borderRadius="full" bg="green.400"
        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
      />
    ))}
  </HStack>
);

// Single message bubble
const Bubble = React.memo(({ msg }) => {
  const isUser   = msg.role === 'user';
  const userBg   = 'linear-gradient(135deg, #276749, #319795)';
  const botBg    = useColorModeValue('white',    'gray.700');
  const botBorder= useColorModeValue('gray.100', 'gray.600');
  const timeCol  = useColorModeValue('gray.400', 'gray.500');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
      maxW="86%"
    >
      {!isUser && (
        <HStack spacing={1.5} mb={1}>
          <Text fontSize="14px">🤖</Text>
          <Text fontSize="10px" fontWeight="bold" color="green.500" letterSpacing="wider">ECOBOT</Text>
        </HStack>
      )}
      <Box
        bg={isUser ? undefined : botBg}
        bgGradient={isUser ? userBg : undefined}
        color={isUser ? 'white' : useColorModeValue('gray.800', 'gray.100')}
        px={4} py={3}
        borderRadius={isUser ? '20px 20px 6px 20px' : '6px 20px 20px 20px'}
        borderWidth={isUser ? 0 : '1px'}
        borderColor={botBorder}
        boxShadow={isUser ? '0 2px 12px rgba(39,103,73,0.25)' : '0 1px 4px rgba(0,0,0,0.06)'}
      >
        {isUser
          ? <Text fontSize="sm" lineHeight="1.7" whiteSpace="pre-wrap">{msg.content}</Text>
          : <FormattedText content={msg.content} />
        }
      </Box>
      <Text fontSize="10px" color={timeCol} mt={0.5}
        textAlign={isUser ? 'right' : 'left'} px={1}>
        {msg.time}
      </Text>
    </MotionBox>
  );
});

// Quick reply chip
const Chip = ({ text, onClick }) => (
  <MotionBox whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Button
      size="xs" h="auto" py={1.5} px={3}
      variant="outline" colorScheme="green"
      borderRadius="full" fontSize="11px"
      fontWeight="medium" whiteSpace="normal"
      textAlign="left" lineHeight="1.4"
      onClick={() => onClick(text)}
      borderColor="green.200"
      _dark={{ borderColor: 'green.700' }}
      _hover={{ bg: 'green.50', borderColor: 'green.400', _dark: { bg: 'green.900', borderColor: 'green.500' } }}
      transition="all 0.15s"
    >
      {text}
    </Button>
  </MotionBox>
);

// ── Main Widget ───────────────────────────────────────────────────────────────
const ChatbotWidget = ({ userRole = 'user' }) => {
  const [isOpen,      setIsOpen]      = useState(false);
  const [isExpanded,  setIsExpanded]  = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [isTyping,    setIsTyping]    = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [hasUnread,   setHasUnread]   = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [errorCount,  setErrorCount]  = useState(0);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Colors
  const widgetBg   = useColorModeValue('white',    'gray.800');
  const inputBg    = useColorModeValue('gray.50',  'gray.700');
  const borderCol  = useColorModeValue('gray.150', 'gray.650');
  const msgAreaBg  = useColorModeValue('#f8fffe',  'gray.850');
  const dividerCol = useColorModeValue('gray.100', 'gray.700');

  const W = isExpanded ? '440px' : '370px';
  const H = isExpanded ? '640px' : '530px';

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  // Fetch suggestions
  useEffect(() => {
    const page = detectPage();
    fetch(`${BACKEND_URL}/api/chatbot/suggestions?page=${page}&role=${userRole}`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setSuggestions(d.data); })
      .catch(() => setSuggestions([
        'How do I report waste?',
        'What is the priority score?',
        'How do I earn points?',
        'Why is my score N/A?',
      ]));
  }, [userRole]);

  const timestamp = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const addMessage = useCallback((role, content) => {
    setMessages(prev => [...prev, { role, content, time: timestamp(), id: Date.now() + Math.random() }]);
  }, []);

  // First open — show welcome
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
    if (!initialized) {
      setInitialized(true);
      const greeting = userRole === 'admin'
        ? `👋 Hi Admin! I'm **EcoBot**, your intelligent platform assistant.\n\nI can help you with:\n• 📊 Understanding dashboard analytics\n• 👷 Assigning workers to complaints\n• 🔄 Managing report statuses\n• 🤖 Re-running AI analysis\n\nWhat do you need help with?`
        : `👋 Hi there! I'm **EcoBot**, your smart waste management assistant.\n\nI can help you:\n• 📸 Report waste issues step by step\n• 📊 Understand your priority scores\n• 🏆 Earn points and badges\n• 🔔 Track your complaint status\n\nHow can I help you today?`;

      setTimeout(() => addMessage('assistant', greeting), 300);
    }
  }, [initialized, userRole, addMessage]);

  // ── Core send function ─────────────────────────────────────────────────────
  const sendMessage = useCallback(async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || isTyping) return;

    setInput('');
    addMessage('user', text);
    setIsTyping(true);

    try {
      // Build clean history — ONLY role + content, nothing else
      // This is the critical fix: never include time, id, or other fields
      const history = [...messages, { role: 'user', content: text }]
        .slice(-12) // last 12 messages max
        .map(m => ({
          role:    m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').trim().slice(0, 1500),
        }))
        .filter(m => m.content.length > 0);

      const response = await fetch(`${BACKEND_URL}/api/chatbot/message`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // NOTE: removed credentials: 'include' — chatbot doesn't need auth cookies
        body: JSON.stringify({
          messages: history,
          userRole,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();

      if (data.status === 'success' && data.data?.reply) {
        addMessage('assistant', data.data.reply);
        setErrorCount(0); // reset error count on success
      } else {
        throw new Error(data.message || 'Invalid response structure');
      }

    } catch (error) {
      console.error('[EcoBot] Send failed:', error.message);
      setErrorCount(prev => prev + 1);

      // Contextual error messages — never show raw errors to user
      const errorResponses = [
        "Let me try that again — could you rephrase your question? 🔄",
        "I'm having a brief moment. Could you ask that differently? 💭",
        "Sorry about that! I'm back now — what did you want to know? ✨",
      ];
      const fallback = errorResponses[errorCount % errorResponses.length];
      addMessage('assistant', fallback);

    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, userRole, addMessage, errorCount]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleReset = useCallback(() => {
    setMessages([]);
    setInitialized(false);
    setErrorCount(0);
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* ── Widget Panel ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.85,  y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            position="fixed"
            bottom={{ base: '76px', md: '86px' }}
            right={{ base: '8px', md: '22px' }}
            w={{ base: 'calc(100vw - 16px)', sm: W }}
            h={{ base: '80vh', sm: H }}
            maxH="85vh"
            bg={widgetBg}
            borderRadius="24px"
            boxShadow="0 24px 64px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08)"
            borderWidth="1px"
            borderColor={borderCol}
            overflow="hidden"
            display="flex"
            flexDirection="column"
            zIndex={2000}
          >
            {/* Header */}
            <Box
              bgGradient="linear(135deg, #1a6b45 0%, #276749 50%, #2c7a7b 100%)"
              px={4} py={3.5} flexShrink={0}
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Box position="relative">
                    <Box
                      w="36px" h="36px" borderRadius="full"
                      bg="whiteAlpha.200"
                      display="flex" alignItems="center" justifyContent="center"
                      fontSize="20px"
                    >
                      🤖
                    </Box>
                    <Box
                      position="absolute" bottom="1px" right="1px"
                      w="9px" h="9px" bg="green.300" borderRadius="full"
                      borderWidth="1.5px" borderColor="white"
                    />
                  </Box>
                  <Box>
                    <Text color="white" fontWeight="bold" fontSize="sm" letterSpacing="wide">
                      EcoBot
                    </Text>
                    <HStack spacing={1.5}>
                      <Box w="5px" h="5px" bg="green.300" borderRadius="full"/>
                      <Text color="whiteAlpha.800" fontSize="10px" letterSpacing="wider">
                        AI ASSISTANT · ONLINE
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
                <HStack spacing={0.5}>
                  <IconButton
                    icon={isExpanded ? <FiMinimize2 size={13}/> : <FiMaximize2 size={13}/>}
                    size="xs" variant="ghost" color="whiteAlpha.800"
                    aria-label="Toggle size"
                    onClick={() => setIsExpanded(v => !v)}
                    _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                    borderRadius="lg"
                  />
                  <IconButton
                    icon={<FiRefreshCw size={13}/>}
                    size="xs" variant="ghost" color="whiteAlpha.800"
                    aria-label="Reset chat"
                    onClick={handleReset}
                    _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                    borderRadius="lg"
                    title="Start new conversation"
                  />
                  <IconButton
                    icon={<FiX size={15}/>}
                    size="xs" variant="ghost" color="whiteAlpha.800"
                    aria-label="Close"
                    onClick={() => setIsOpen(false)}
                    _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                    borderRadius="lg"
                  />
                </HStack>
              </Flex>
            </Box>

            {/* Messages */}
            <Box
              flex={1} overflowY="auto" px={4} py={4}
              bg={msgAreaBg}
              sx={{
                '&::-webkit-scrollbar':       { width: '3px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#c6f6d5', borderRadius: '2px' },
              }}
            >
              {messages.length === 0 && (
                <VStack spacing={3} pt={6} pb={4} opacity={0.6}>
                  <Text fontSize="32px">🌿</Text>
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    Ask me anything about ZeroX Waste
                  </Text>
                </VStack>
              )}

              <VStack spacing={4} align="stretch">
                {messages.map((msg, i) => (
                  <Bubble key={msg.id || i} msg={msg} />
                ))}

                {isTyping && (
                  <MotionBox
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    alignSelf="flex-start"
                  >
                    <HStack spacing={1.5} mb={1}>
                      <Text fontSize="14px">🤖</Text>
                      <Text fontSize="10px" fontWeight="bold" color="green.500">ECOBOT</Text>
                    </HStack>
                    <Box
                      bg={useColorModeValue('white', 'gray.700')}
                      borderWidth="1px" borderColor={dividerCol}
                      borderRadius="6px 20px 20px 20px"
                      boxShadow="0 1px 4px rgba(0,0,0,0.06)"
                    >
                      <TypingDots />
                    </Box>
                  </MotionBox>
                )}
                <div ref={bottomRef}/>
              </VStack>
            </Box>

            {/* Suggestions — shown only at the start */}
            <AnimatePresence>
              {messages.length <= 1 && suggestions.length > 0 && (
                <MotionBox
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{   opacity: 0, height: 0 }}
                  px={4} py={3}
                  bg={widgetBg}
                  borderTopWidth="1px"
                  borderColor={dividerCol}
                  flexShrink={0}
                  overflow="hidden"
                >
                  <Text
                    fontSize="9px" color="gray.400" mb={2}
                    fontWeight="semibold" textTransform="uppercase" letterSpacing="wider"
                  >
                    Quick questions
                  </Text>
                  <Flex gap={2} flexWrap="wrap">
                    {suggestions.slice(0, 4).map((s, i) => (
                      <Chip key={i} text={s} onClick={sendMessage}/>
                    ))}
                  </Flex>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Input */}
            <Box
              px={4} py={3} bg={widgetBg}
              borderTopWidth="1px" borderColor={dividerCol}
              flexShrink={0}
            >
              <HStack spacing={2} align="flex-end">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Message EcoBot..."
                  size="sm" rows={1}
                  minH="38px" maxH="90px"
                  resize="none" overflow="auto"
                  bg={inputBg}
                  borderRadius="14px"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  fontSize="sm"
                  lineHeight="1.5"
                  py={2} px={3}
                  _focus={{
                    borderColor: 'green.400',
                    boxShadow:   '0 0 0 2px rgba(72, 187, 120, 0.15)',
                    outline:     'none',
                  }}
                  _placeholder={{ color: 'gray.400', fontSize: '13px' }}
                  transition="all 0.15s"
                />
                <IconButton
                  icon={<FiSend size={15}/>}
                  aria-label="Send"
                  size="sm" w="38px" h="38px" flexShrink={0}
                  borderRadius="12px"
                  bg={input.trim() && !isTyping ? 'green.500' : useColorModeValue('gray.100','gray.700')}
                  color={input.trim() && !isTyping ? 'white' : 'gray.400'}
                  _hover={input.trim() && !isTyping ? { bg: 'green.600', transform: 'scale(1.05)' } : {}}
                  isDisabled={!input.trim() || isTyping}
                  onClick={() => sendMessage()}
                  transition="all 0.15s"
                  boxShadow={input.trim() && !isTyping ? '0 2px 8px rgba(72,187,120,0.3)' : 'none'}
                />
              </HStack>
              <Text fontSize="9px" color="gray.300" textAlign="center" mt={1.5} letterSpacing="wide">
                ZEROX WASTE · POWERED BY GROQ AI
              </Text>
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* ── FAB Button ───────────────────────────────────────────────── */}
      <MotionBox
        position="fixed"
        bottom={{ base: '14px', md: '22px' }}
        right={{ base: '8px', md: '22px' }}
        zIndex={2000}
        whileHover={{ scale: 1.06 }}
        whileTap={{  scale: 0.94 }}
      >
        {/* Pulse rings — only when closed */}
        {!isOpen && (
          <>
            <MotionBox
              position="absolute" inset="-8px"
              borderRadius="full"
              bg="green.400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <MotionBox
              position="absolute" inset="-4px"
              borderRadius="full"
              bg="green.400"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
            />
          </>
        )}

        <Box
          as="button"
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          w="54px" h="54px" borderRadius="full"
          bgGradient="linear(135deg, #276749, #319795)"
          color="white" fontSize="22px"
          display="flex" alignItems="center" justifyContent="center"
          boxShadow="0 4px 20px rgba(39,103,73,0.45), 0 2px 8px rgba(0,0,0,0.15)"
          _hover={{
            bgGradient: 'linear(135deg, #1a5c3a, #276749)',
            boxShadow:  '0 6px 28px rgba(39,103,73,0.55)',
          }}
          transition="all 0.2s ease"
          position="relative"
          zIndex={1}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={isOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1   }}
              exit={{   rotate: 90,  opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? '✕' : '🤖'}
            </MotionBox>
          </AnimatePresence>
        </Box>

        {/* Unread badge */}
        <AnimatePresence>
          {hasUnread && !isOpen && (
            <MotionBox
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              position="absolute" top="-3px" right="-3px" zIndex={2}
            >
              <Box
                w="18px" h="18px" bg="red.500" borderRadius="full"
                display="flex" alignItems="center" justifyContent="center"
                borderWidth="2px" borderColor="white"
                fontSize="9px" color="white" fontWeight="bold"
              >
                1
              </Box>
            </MotionBox>
          )}
        </AnimatePresence>
      </MotionBox>
    </>
  );
};

export default ChatbotWidget;