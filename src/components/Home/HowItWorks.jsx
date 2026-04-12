import React, { useRef } from 'react';
import { Box, Text, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { motion, useInView } from 'framer-motion';

const MotionBox = motion(Box);

const steps = [
  {
    icon: '📸',
    number: '01',
    title: 'Capture It',
    description: 'Spot waste anywhere — on streets, parks, water bodies. Click a clear photo.',
    color: '#16a34a',
    lightBg: '#f0fdf4',
    darkBg: 'rgba(22,163,74,0.08)',
  },
  {
    icon: '📍',
    number: '02',
    title: 'Pin the Spot',
    description: 'Your location is auto-detected or manually pin it on the live map.',
    color: '#0891b2',
    lightBg: '#ecfeff',
    darkBg: 'rgba(8,145,178,0.08)',
  },
  {
    icon: '🚀',
    number: '03',
    title: 'Submit Report',
    description: 'One tap sends your report directly to the relevant municipal authority.',
    color: '#7c3aed',
    lightBg: '#f5f3ff',
    darkBg: 'rgba(124,58,237,0.08)',
  },
  {
    icon: '✨',
    number: '04',
    title: 'City Cleaned',
    description: 'Track progress in real-time as your area gets cleaned and earn impact points.',
    color: '#b45309',
    lightBg: '#fffbeb',
    darkBg: 'rgba(180,83,9,0.08)',
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const bg = useColorModeValue('white', '#111827');
  const textMain = useColorModeValue('#111827', '#f9fafb');
  const textSub = useColorModeValue('#6b7280', '#9ca3af');
  const connectorColor = useColorModeValue('rgba(22,163,74,0.2)', 'rgba(74,222,128,0.15)');

  return (
    <Box ref={ref} bg={bg} py={{ base: 20, md: 32 }} px={{ base: 6, md: 16, lg: 24 }} position="relative" overflow="hidden">
      {/* Subtle background grid */}
      <Box
        position="absolute" inset={0} pointerEvents="none"
        backgroundImage={`radial-gradient(circle, ${useColorModeValue('rgba(22,163,74,0.06)', 'rgba(74,222,128,0.04)')} 1px, transparent 1px)`}
        backgroundSize="40px 40px"
      />

      {/* Section header */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        textAlign="center" mb={{ base: 16, md: 20 }} position="relative" zIndex={1}
      >
        <Box
          display="inline-flex" alignItems="center" gap={2}
          bg={useColorModeValue('#f0fdf4', 'rgba(74,222,128,0.1)')}
          border="1px solid" borderColor={useColorModeValue('rgba(22,163,74,0.2)', 'rgba(74,222,128,0.2)')}
          borderRadius="full" px={4} py={1.5} mb={5}
        >
          <Text fontSize="xs" fontWeight="600" color={useColorModeValue('#15803d', '#4ade80')} letterSpacing="0.1em" textTransform="uppercase">
            Simple & Fast
          </Text>
        </Box>
        <Text
          as="h2"
          fontSize={{ base: '3xl', md: '5xl' }}
          fontWeight="800"
          color={textMain}
          fontFamily="'Georgia', serif"
          letterSpacing="-0.02em"
          lineHeight="1.15"
        >
          How It Works
        </Text>
        <Text fontSize={{ base: 'md', md: 'lg' }} color={textSub} mt={4} maxW="480px" mx="auto" lineHeight="1.7">
          From spotting waste to seeing it cleaned — the whole journey takes minutes, not days.
        </Text>
      </MotionBox>

      {/* Steps grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} position="relative" zIndex={1}>
        {steps.map((step, i) => (
          <MotionBox
            key={step.number}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            position="relative"
          >
            {/* Connector line between steps (desktop) */}
            {i < steps.length - 1 && (
              <Box
                display={{ base: 'none', lg: 'block' }}
                position="absolute" top="48px" left="calc(100% - 12px)" w="24px" h="1px"
                bg={connectorColor} zIndex={2}
              />
            )}

            <Box
              bg={useColorModeValue(step.lightBg, step.darkBg)}
              border="1px solid"
              borderColor={useColorModeValue(`${step.color}20`, `${step.color}30`)}
              borderRadius="2xl"
              p={7}
              h="100%"
              position="relative"
              overflow="hidden"
              role="group"
              transition="all 0.3s ease"
              _hover={{
                boxShadow: `0 20px 50px ${step.color}20`,
                borderColor: `${step.color}40`,
              }}
            >
              {/* Number watermark */}
              <Text
                position="absolute" top={3} right={4}
                fontSize="6xl" fontWeight="900" color={step.color}
                opacity={0.08} lineHeight="1" userSelect="none"
                transition="opacity 0.3s"
                _groupHover={{ opacity: 0.12 }}
              >
                {step.number}
              </Text>

              {/* Icon */}
              <Box
                w={14} h={14} borderRadius="xl"
                bg={`${step.color}15`}
                border="1px solid" borderColor={`${step.color}25`}
                display="flex" alignItems="center" justifyContent="center"
                fontSize="2xl" mb={5}
                transition="transform 0.3s"
                _groupHover={{ transform: 'scale(1.1)' }}
              >
                {step.icon}
              </Box>

              <Text
                fontSize="sm" fontWeight="700" color={step.color}
                letterSpacing="0.1em" textTransform="uppercase" mb={2}
              >
                Step {step.number}
              </Text>
              <Text fontSize="xl" fontWeight="700" color={textMain} mb={3} lineHeight="1.2">
                {step.title}
              </Text>
              <Text fontSize="sm" color={textSub} lineHeight="1.7">
                {step.description}
              </Text>
            </Box>
          </MotionBox>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default HowItWorks;