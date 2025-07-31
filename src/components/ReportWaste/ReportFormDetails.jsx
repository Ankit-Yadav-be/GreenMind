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
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ReportFormDetails = ({ formDetails, setFormDetails }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDetails((prev) => ({ ...prev, [name]: value }));
  };

  const bg = useColorModeValue('gray.800', 'gray.900');
  const labelColor = useColorModeValue('gray.100', 'gray.300');
  const inputBg = useColorModeValue('gray.700', 'gray.800');
  const borderColor = useColorModeValue('blue.400', 'teal.300');
  const focusShadow = useColorModeValue(
    '0 0 0 2px rgba(66, 153, 225, 0.6)',
    '0 0 0 2px rgba(56, 178, 172, 0.6)'
  );

  return (
    <MotionBox
      mt={6}
      p={6}
      bg={bg}
      rounded="xl"
      shadow="lg"
      border="1px solid"
      borderColor="gray.700"
      transition="all 0.3s"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Description Field */}
      <FormControl mb={6} isRequired>
        <Flex align="center" justify="space-between" mb={1}>
          <FormLabel color={labelColor} fontSize="lg">
            Description
          </FormLabel>
          <Tooltip label="Max 300 characters" hasArrow>
            <Text fontSize="sm" color="gray.400">
              {formDetails.description.length}/300
            </Text>
          </Tooltip>
        </Flex>
        <Textarea
          name="description"
          placeholder="Describe the waste issue clearly..."
          value={formDetails.description}
          onChange={handleChange}
          maxLength={300}
          resize="vertical"
          bg={inputBg}
          color="white"
          borderColor="gray.600"
          _hover={{ borderColor }}
          _focus={{
            borderColor,
            boxShadow: focusShadow,
          }}
        />
      </FormControl>

      {/* Category Field */}
      <FormControl isRequired>
        <Flex align="center" justify="space-between" mb={1}>
          <FormLabel color={labelColor} fontSize="lg">
            Category
          </FormLabel>
          <Popover placement="top-end">
            <PopoverTrigger>
              <Icon as={InfoIcon} color="gray.400" cursor="pointer" />
            </PopoverTrigger>
            <PopoverContent bg="gray.700" color="white" border="none">
              <PopoverArrow />
              <PopoverHeader fontWeight="bold">Category Info</PopoverHeader>
              <PopoverBody fontSize="sm">
                🧴 Plastic: Bottles, bags, etc.<br />
                🍃 Organic: Food, leaves, etc.<br />
                🔌 E-waste: Phones, batteries, etc.<br />
                🧩 Other: Miscellaneous
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
        <Select
          name="category"
          placeholder="Choose waste category"
          value={formDetails.category}
          onChange={handleChange}
          bg={inputBg}
          color="white"
          borderColor="gray.600"
          _hover={{ borderColor }}
          _focus={{
            borderColor,
            boxShadow: focusShadow,
          }}
        >
          <option style={{ backgroundColor: '#2D3748' }} value="plastic">
            🧴 Plastic Waste
          </option>
          <option style={{ backgroundColor: '#2D3748' }} value="organic">
            🍃 Organic Waste
          </option>
          <option style={{ backgroundColor: '#2D3748' }} value="electronic">
            🔌 Electronic Waste
          </option>
          <option style={{ backgroundColor: '#2D3748' }} value="other">
            🧩 Other
          </option>
        </Select>
      </FormControl>
    </MotionBox>
  );
};

export default ReportFormDetails;
