import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  useColorModeValue,
  Text,
  Flex,
  Tooltip,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Badge,
  Heading,
  Divider,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { InfoIcon, WarningIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const pulseAnimation = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const ReportFormDetails = ({ formDetails, setFormDetails }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Light mode color scheme — matches the rest of the page
  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('teal.400', 'teal.300');
  const labelColor = useColorModeValue('gray.700', 'gray.100');
  const headingColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
  const tipsBg = useColorModeValue('teal.50', 'rgba(56,178,172,0.1)');
  const tipsBorderColor = useColorModeValue('teal.400', 'teal.400');
  const tipsTextColor = useColorModeValue('gray.700', 'gray.300');
  const tipsSubColor = useColorModeValue('gray.600', 'gray.400');
  const popoverBg = useColorModeValue('white', 'gray.800');
  const popoverBorderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBorderNormal = useColorModeValue('gray.300', 'gray.600');
  const inputColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const accentGradient = 'linear-gradient(135deg, #38b2ac, #4299e1)';
  const shadowColor = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(0,0,0,0.3)');

  const charCountColor = formDetails.description.length > 280
    ? 'orange.500'
    : formDetails.description.length > 250
    ? 'yellow.500'
    : 'gray.400';

  const categoryOptions = [
    { value: "plastic", label: "Plastic Waste", icon: "🧴", color: "blue" },
    { value: "organic", label: "Organic / Food Waste", icon: "🍃", color: "green" },
    { value: "electronic", label: "Electronic Waste", icon: "🔌", color: "purple" },
    { value: "paper", label: "Paper & Cardboard", icon: "🗞️", color: "teal" },
    { value: "metal", label: "Metal Waste", icon: "🥫", color: "gray" },
    { value: "glass", label: "Glass Waste", icon: "🍾", color: "cyan" },
    { value: "batteries", label: "Batteries", icon: "🔋", color: "orange" },
    { value: "lightbulbs", label: "Light Bulbs", icon: "💡", color: "yellow" },
    { value: "chemical", label: "Chemical Waste", icon: "🧪", color: "red" },
    { value: "medical", label: "Medical / Pharmaceutical Waste", icon: "💊", color: "pink" },
    { value: "textiles", label: "Textiles & Clothing", icon: "👕", color: "purple" },
    { value: "furniture", label: "Furniture / Bulky Waste", icon: "🛋️", color: "orange" },
    { value: "garden", label: "Garden Waste", icon: "🌿", color: "green" },
    { value: "oil", label: "Cooking / Motor Oil", icon: "🛢️", color: "brown" },
    { value: "construction", label: "Construction Debris", icon: "🧱", color: "gray" },
    { value: "other", label: "Other", icon: "🧩", color: "purple" },
  ];

  const selectedCategory = categoryOptions.find(opt => opt.value === formDetails.category);

  return (
    <MotionBox
      mt={8}
      p={0}
      rounded="2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <Box
        bg={cardBg}
        rounded="2xl"
        shadow={`0 4px 24px ${shadowColor}`}
        overflow="hidden"
        position="relative"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          bgGradient: accentGradient,
        }}
      >
        {/* Header Section */}
        <Box p={6} pb={4}>
          <HStack spacing={3} mb={2}>
            <Icon as={WarningIcon} w={6} h={6} color="teal.500" />
            <Heading size="md" color={headingColor} fontWeight="600">
              Report Details
            </Heading>
            <Badge
              ml={2}
              colorScheme="teal"
              variant="solid"
              rounded="full"
              px={3}
              fontSize="xs"
            >
              Required
            </Badge>
          </HStack>
          <Text color={subtitleColor} fontSize="sm" mt={1}>
            Provide detailed information about the waste issue
          </Text>
        </Box>

        <Divider borderColor={dividerColor} />

        {/* Form Fields */}
        <VStack spacing={6} p={6} align="stretch">
          {/* Description Field */}
          <FormControl isRequired>
            <Flex align="center" justify="space-between" mb={2}>
              <FormLabel color={labelColor} fontSize="md" fontWeight="500" mb={0}>
                📝 Description
              </FormLabel>
              <MotionFlex
                align="center"
                gap={2}
                animate={{ scale: formDetails.description.length > 280 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Tooltip
                  label={formDetails.description.length >= 300 ? "Maximum length reached" : "Max 300 characters"}
                  hasArrow
                >
                  <Badge
                    colorScheme={
                      formDetails.description.length >= 300 ? "red" :
                      formDetails.description.length >= 280 ? "orange" :
                      formDetails.description.length >= 250 ? "yellow" : "gray"
                    }
                    variant="subtle"
                    rounded="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                  >
                    {formDetails.description.length}/300
                  </Badge>
                </Tooltip>
              </MotionFlex>
            </Flex>
            <Textarea
              name="description"
              placeholder="Describe the waste issue clearly (e.g., location, type, severity, odor, pests, etc.)..."
              value={formDetails.description}
              onChange={handleChange}
              maxLength={300}
              resize="vertical"
              rows={4}
              bg={inputBg}
              color={inputColor}
              border="2px solid"
              borderColor={inputBorderNormal}
              _hover={{ borderColor: borderColor }}
              _focus={{
                borderColor: borderColor,
                boxShadow: `0 0 0 3px rgba(56, 178, 172, 0.2)`,
              }}
              transition="all 0.2s"
              fontSize="md"
              _placeholder={{ color: placeholderColor, fontSize: "sm" }}
            />
            {formDetails.description.length > 250 && (
              <Text
                fontSize="xs"
                color={charCountColor}
                mt={1}
                animation={`${pulseAnimation} 2s infinite`}
              >
                {formDetails.description.length >= 300 ? "⚠️ Maximum length reached" : "⚠️ Approaching character limit"}
              </Text>
            )}
          </FormControl>

          {/* Category Field */}
          <FormControl isRequired>
            <Flex align="center" justify="space-between" mb={2}>
              <FormLabel color={labelColor} fontSize="md" fontWeight="500" mb={0}>
                🏷️ Waste Category
              </FormLabel>
              <Popover placement="top-end" trigger="hover">
                <PopoverTrigger>
                  <Tooltip label="Category information" hasArrow>
                    <Icon
                      as={InfoIcon}
                      color="teal.500"
                      cursor="pointer"
                      w={4}
                      h={4}
                      transition="transform 0.2s"
                      _hover={{ transform: "scale(1.1)", color: "teal.400" }}
                    />
                  </Tooltip>
                </PopoverTrigger>
                <PopoverContent
                  bg={popoverBg}
                  color={inputColor}
                  border="1px solid"
                  borderColor={popoverBorderColor}
                  shadow="xl"
                  rounded="lg"
                  maxW="280px"
                >
                  <PopoverArrow bg={popoverBg} />
                  <PopoverHeader fontWeight="bold" borderBottomColor={popoverBorderColor}>
                    Category Reference
                  </PopoverHeader>
                  <PopoverBody fontSize="sm" maxH="300px" overflowY="auto">
                    <VStack align="start" spacing={2}>
                      {categoryOptions.map(cat => (
                        <Text key={cat.value} fontSize="xs" color={labelColor}>
                          {cat.icon} {cat.label}
                        </Text>
                      ))}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Flex>
            <Box position="relative">
              <Select
                name="category"
                placeholder="Select waste category"
                value={formDetails.category}
                onChange={handleChange}
                bg={inputBg}
                color={inputColor}
                border="2px solid"
                borderColor={inputBorderNormal}
                _hover={{ borderColor: borderColor }}
                _focus={{
                  borderColor: borderColor,
                  boxShadow: `0 0 0 3px rgba(56, 178, 172, 0.2)`,
                }}
                transition="all 0.2s"
                cursor="pointer"
                fontSize="md"
                height="50px"
              >
                {categoryOptions.map((option) => (
                  <option
                    key={option.value}
                    style={{
                      backgroundColor: 'white',
                      color: '#2D3748',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                    value={option.value}
                  >
                    {option.icon} {option.label}
                  </option>
                ))}
              </Select>

              {/* Selected Category Badge */}
              {selectedCategory && (
                <MotionFlex
                  position="absolute"
                  bottom="-24px"
                  left="0"
                  mt={2}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge
                    colorScheme={selectedCategory.color}
                    variant="solid"
                    rounded="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <CheckCircleIcon w={3} h={3} mr={1} />
                    {selectedCategory.icon} {selectedCategory.label} selected
                  </Badge>
                </MotionFlex>
              )}
            </Box>
          </FormControl>

          {/* Helpful Tips */}
          <MotionFlex
            mt={4}
            p={4}
            bg={tipsBg}
            rounded="lg"
            borderLeft="4px solid"
            borderLeftColor={tipsBorderColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Icon as={InfoIcon} color="teal.500" mr={3} mt={0.5} />
            <Box>
              <Text fontSize="sm" color={tipsTextColor} fontWeight="500" mb={1}>
                Pro Tips for Better Reports:
              </Text>
              <Text fontSize="xs" color={tipsSubColor}>
                • Be specific about the location and quantity of waste<br />
                • Mention if there are any odors or pest issues<br />
                • Include the duration if it's a recurring problem<br />
                • Add photos when possible for faster response
              </Text>
            </Box>
          </MotionFlex>
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default ReportFormDetails;