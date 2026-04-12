import React, { useRef, useEffect, useState } from 'react';
import { Box, Text, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { motion, useInView } from 'framer-motion';

const MotionBox = motion(Box);

const useCountUp = (target, isActive, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ''));
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numericTarget));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isActive, target, duration]);
  return count;
};

const StatCard = ({ stat, index, isInView }) => {
  const count = useCountUp(stat.value, isInView);
  const textMain = useColorModeValue('#111827', '#f9fafb');
  const textSub = useColorModeValue('#6b7280', '#9ca3af');

  const formatCount = (n, suffix) => {
    if (suffix === 'K+') return `${(n / 1000).toFixed(n >= 1000 ? 0 : 1)}K+`;
    if (suffix === '+') return `${n}+`;
    if (suffix === '%') return `${n}%`;
    return `${n}`;
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      position="relative"
    >
      <Box
        bg={useColorModeValue('white', 'rgba(255,255,255,0.04)')}
        border="1px solid"
        borderColor={useColorModeValue('rgba(22,163,74,0.12)', 'rgba(74,222,128,0.1)')}
        borderRadius="2xl"
        p={8}
        textAlign="center"
        position="relative"
        overflow="hidden"
        role="group"
        transition="all 0.4s ease"
        _hover={{
          borderColor: `${stat.color}40`,
          boxShadow: `0 24px 60px ${stat.color}15`,
        }}
        boxShadow="0 4px 24px rgba(0,0,0,0.06)"
      >
        {/* Background glow on hover */}
        <Box
          position="absolute" inset={0}
          bg={`radial-gradient(circle at 50% 0%, ${stat.color}08 0%, transparent 70%)`}
          opacity={0} transition="opacity 0.4s"
          _groupHover={{ opacity: 1 }}
        />

        {/* Top accent line */}
        <Box
          position="absolute" top={0} left="20%" right="20%" h="2px"
          bg={`linear-gradient(90deg, transparent, ${stat.color}, transparent)`}
          borderRadius="full" opacity={0.6}
        />

        {/* Icon */}
        <Box
          w={16} h={16} borderRadius="2xl" mx="auto" mb={5}
          bg={`${stat.color}12`} border="1px solid" borderColor={`${stat.color}20`}
          display="flex" alignItems="center" justifyContent="center"
          fontSize="2xl"
          transition="transform 0.3s"
          _groupHover={{ transform: 'scale(1.1) rotate(5deg)' }}
        >
          {stat.icon}
        </Box>

        {/* Animated number */}
        <Text
          fontSize={{ base: '4xl', md: '5xl' }} fontWeight="900"
          color={stat.color} lineHeight="1" mb={2}
          fontFamily="'Georgia', serif"
        >
          {formatCount(count, stat.suffix)}
        </Text>

        <Text fontSize="sm" fontWeight="600" color={textMain} mb={1} letterSpacing="0.02em">
          {stat.label}
        </Text>
        <Text fontSize="xs" color={textSub} lineHeight="1.5" maxW="140px" mx="auto">
          {stat.sublabel}
        </Text>
      </Box>
    </MotionBox>
  );
};

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const bg = useColorModeValue('#fafaf8', '#0d1117');
  const textMain = useColorModeValue('#111827', '#f9fafb');
  const textSub = useColorModeValue('#6b7280', '#9ca3af');

  const stats = [
    { icon: '🧹', value: '12340', suffix: 'K+', label: 'Cleanups Completed', sublabel: 'Areas restored to cleanliness', color: '#16a34a' },
    { icon: '📋', value: '8652', suffix: '+', label: 'Reports Submitted', sublabel: 'By engaged citizens nationwide', color: '#0891b2' },
    { icon: '👥', value: '4212', suffix: '+', label: 'Active Citizens', sublabel: 'Growing community of changers', color: '#7c3aed' },
    { icon: '🏙️', value: '38', suffix: '+', label: 'Cities Covered', sublabel: 'Across states in India', color: '#b45309' },
  ];

  return (
    <Box ref={ref} bg={bg} py={{ base: 20, md: 32 }} px={{ base: 6, md: 16, lg: 24 }} position="relative" overflow="hidden">
      {/* Large background text */}
      <Text
        position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)"
        fontSize={{ base: '120px', md: '200px' }} fontWeight="900"
        color={useColorModeValue('rgba(22,163,74,0.04)', 'rgba(74,222,128,0.03)')}
        userSelect="none" pointerEvents="none" whiteSpace="nowrap"
        fontFamily="'Georgia', serif"
      >
        IMPACT
      </Text>

      {/* Header */}
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
            Real Numbers
          </Text>
        </Box>
        <Text
          as="h2" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800"
          color={textMain} fontFamily="'Georgia', serif"
          letterSpacing="-0.02em" lineHeight="1.15"
        >
          Our Impact in Numbers
        </Text>
        <Text fontSize={{ base: 'md', md: 'lg' }} color={textSub} mt={4} maxW="420px" mx="auto" lineHeight="1.7">
          Each report creates a ripple effect. Look at what we've built together.
        </Text>
      </MotionBox>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} position="relative" zIndex={1}>
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} isInView={isInView} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default StatsSection;