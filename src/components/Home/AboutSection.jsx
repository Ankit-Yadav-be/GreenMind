import React, { useRef } from 'react';
import {
  Box, Text, Stack, Image, useColorModeValue,
} from '@chakra-ui/react';
import { motion, useInView } from 'framer-motion';

const MotionBox = motion(Box);
const MotionText = motion(Text);

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const bg = useColorModeValue('#fafaf8', '#0f1a0f');
  const accent = useColorModeValue('#15803d', '#4ade80');
  const textMain = useColorModeValue('#1a2e1a', '#f0fdf4');
  const textSub = useColorModeValue('#4b5563', '#9ca3af');
  const pillBg = useColorModeValue('#dcfce7', 'rgba(74,222,128,0.1)');
  const pillColor = useColorModeValue('#15803d', '#4ade80');
  const pillBorder = useColorModeValue('rgba(22,163,74,0.2)', 'rgba(74,222,128,0.2)');
  const cardBg = useColorModeValue('white', '#1a2e1a');
  const cardBorder = useColorModeValue('rgba(22,163,74,0.1)', 'rgba(74,222,128,0.1)');

  const stats = [
    { value: '98%', label: 'Response Rate', icon: '⚡' },
    { value: '24h', label: 'Avg Resolution', icon: '🕐' },
    { value: '50K+', label: 'Lives Impacted', icon: '🌱' },
  ];

  return (
    <Box ref={ref} bg={bg} py={{ base: 20, md: 32 }} px={{ base: 6, md: 16, lg: 24 }} overflow="hidden" position="relative">
      {/* Background decorative element */}
      <Box
        position="absolute" top="50%" right="-200px" transform="translateY(-50%)"
        w="600px" h="600px" borderRadius="full"
        bg={useColorModeValue('rgba(22,163,74,0.04)', 'rgba(74,222,128,0.04)')}
        pointerEvents="none"
      />

      <Stack direction={{ base: 'column', lg: 'row' }} spacing={{ base: 16, lg: 20 }} align="center">
        {/* Image side */}
        <MotionBox
          flex="1.1"
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          position="relative"
        >
          <Box position="relative" borderRadius="3xl" overflow="hidden" boxShadow="0 32px 80px rgba(0,0,0,0.15)">
            <Image
              src="https://plus.unsplash.com/premium_photo-1661963024527-c855211ad31d?q=80&w=1170&auto=format&fit=crop"
              alt="Clean City"
              w="100%" h={{ base: '320px', md: '480px' }}
              objectFit="cover"
            />
            {/* Image overlay gradient */}
            <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(5,46,22,0.5) 0%, transparent 60%)" />

            {/* Floating stat pill on image */}
            <Box
              position="absolute" bottom={6} left={6}
              bg="rgba(255,255,255,0.95)" backdropFilter="blur(12px)"
              borderRadius="2xl" px={5} py={3}
              boxShadow="0 8px 32px rgba(0,0,0,0.15)"
            >
              <Text fontSize="xs" color="gray.500" fontWeight="500" letterSpacing="0.08em" textTransform="uppercase" mb={1}>
                Reports this month
              </Text>
              <Text fontSize="2xl" fontWeight="800" color="green.700" lineHeight="1">
                2,847
              </Text>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Text fontSize="xs" color="green.600">↑ 23% from last month</Text>
              </Box>
            </Box>
          </Box>

          {/* Decorative card behind image */}
          <Box
            position="absolute" top={-4} left={-4} right={4} bottom={-4}
            borderRadius="3xl" border="2px solid"
            borderColor={useColorModeValue('rgba(22,163,74,0.15)', 'rgba(74,222,128,0.1)')}
            zIndex={-1}
          />
        </MotionBox>

        {/* Content side */}
        <MotionBox
          flex="1"
          initial={{ opacity: 0, x: 60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {/* Eyebrow pill */}
          <Box
            display="inline-flex" alignItems="center" gap={2}
            bg={pillBg} border="1px solid" borderColor={pillBorder}
            borderRadius="full" px={4} py={1.5} mb={6}
          >
            <Text fontSize="sm">🌍</Text>
            <Text fontSize="xs" fontWeight="600" color={pillColor} letterSpacing="0.08em" textTransform="uppercase">
              Our Mission
            </Text>
          </Box>

          <Text
            as="h2"
            fontSize={{ base: '3xl', md: '5xl' }}
            fontWeight="800"
            color={textMain}
            fontFamily="'Georgia', serif"
            lineHeight="1.1"
            letterSpacing="-0.02em"
            mb={6}
          >
            Every Citizen is a
            <Text as="span" color={accent}> Guardian</Text>
            <br />of Their City
          </Text>

          <Text fontSize={{ base: 'md', md: 'lg' }} color={textSub} lineHeight="1.8" mb={8} maxW="480px">
            We believe that the power to transform urban environments lies in the hands of ordinary people.
            One photo, one pin, one report — and local authorities are notified before the situation
            deteriorates. ZeroX Waste turns passive bystanders into active changemakers.
          </Text>

          {/* Mini stats row */}
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
            {stats.map((stat, i) => (
              <MotionBox
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                flex="1"
                bg={cardBg}
                border="1px solid" borderColor={cardBorder}
                borderRadius="2xl" p={4}
                boxShadow="0 4px 20px rgba(0,0,0,0.06)"
                textAlign="center"
              >
                <Text fontSize="xl" mb={1}>{stat.icon}</Text>
                <Text fontSize="2xl" fontWeight="800" color={accent} lineHeight="1">{stat.value}</Text>
                <Text fontSize="xs" color={textSub} mt={1} letterSpacing="0.05em">{stat.label}</Text>
              </MotionBox>
            ))}
          </Stack>
        </MotionBox>
      </Stack>
    </Box>
  );
};

export default AboutSection;