import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';

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
    <Box
      mt={6}
      p={6}
      bg={bg}
      rounded="xl"
      shadow="lg"
      border="1px solid"
      borderColor="gray.700"
      transition="all 0.3s"
    >
      <FormControl mb={6} isRequired>
        <FormLabel color={labelColor} fontSize="lg">
          Description
        </FormLabel>
        <Textarea
          name="description"
          placeholder="Describe the waste issue clearly..."
          value={formDetails.description}
          onChange={handleChange}
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

      <FormControl isRequired>
        <FormLabel color={labelColor} fontSize="lg">
          Category
        </FormLabel>
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
    </Box>
  );
};

export default ReportFormDetails;
