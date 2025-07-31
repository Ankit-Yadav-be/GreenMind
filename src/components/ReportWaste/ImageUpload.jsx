import React, { useRef } from 'react';
import {
  Box,
  Button,
  Input,
  Text,
  Image,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi';

const ImageUpload = ({ selectedFile, setSelectedFile }) => {
  const inputRef = useRef();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const buttonBg = useColorModeValue('teal.400', 'teal.600');
  const buttonHover = useColorModeValue('teal.500', 'teal.700');
  const previewBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box
      mb={6}
      textAlign="center"
      border="2px dashed"
      borderColor={borderColor}
      p={6}
      borderRadius="xl"
      boxShadow="xl"
      transition="all 0.3s"
      _hover={{ borderColor: 'teal.400', transform: 'scale(1.01)' }}
    >
      <Input
        type="file"
        accept="image/*"
        ref={inputRef}
        display="none"
        onChange={handleImageSelect}
      />

      <Button
        leftIcon={<Icon as={FiUploadCloud} boxSize={5} />}
        bgGradient="linear(to-r, teal.400, blue.500)"
        color="white"
        _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)', transform: 'scale(1.03)' }}
        size="lg"
        borderRadius="lg"
        onClick={() => inputRef.current.click()}
        mb={4}
        transition="all 0.2s"
      >
        Upload Image
      </Button>

      {selectedFile && (
        <Box
          mt={6}
          p={4}
          bg={previewBg}
          borderRadius="md"
          boxShadow="lg"
          transition="0.3s"
        >
          <Text fontWeight="semibold" fontSize="lg" mb={2}>
            Preview
          </Text>
          <Image
            src={URL.createObjectURL(selectedFile)}
            alt="Selected Preview"
            maxH="280px"
            mx="auto"
            borderRadius="md"
            boxShadow="md"
            objectFit="cover"
          />
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
