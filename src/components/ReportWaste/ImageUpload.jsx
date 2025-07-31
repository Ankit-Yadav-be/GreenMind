import React, { useRef } from 'react';
import {
  Box,
  Button,
  Input,
  Text,
  Image,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import { FiUploadCloud, FiTrash2 } from 'react-icons/fi';

const ImageUpload = ({ selectedFile, setSelectedFile }) => {
  const inputRef = useRef();

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFile((prev) => [...prev, ...files]);
  };

  const handleRemove = (index) => {
    const updated = [...selectedFile];
    updated.splice(index, 1);
    setSelectedFile(updated);
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
        multiple
        ref={inputRef}
        display="none"
        onChange={handleImageSelect}
      />

      <Button
        leftIcon={<Icon as={FiUploadCloud} boxSize={5} />}
        bgGradient="linear(to-r, teal.400, blue.500)"
        color="white"
        _hover={{
          bgGradient: 'linear(to-r, teal.500, blue.600)',
          transform: 'scale(1.03)',
        }}
        size="lg"
        borderRadius="lg"
        onClick={() => inputRef.current.click()}
        mb={4}
        transition="all 0.2s"
      >
        Upload Images
      </Button>

      {selectedFile.length > 0 && (
        <Box mt={6}>
          <Text fontWeight="bold" mb={4}>
            Preview
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
            {selectedFile.map((file, index) => (
              <Box
                key={index}
                position="relative"
                borderRadius="md"
                boxShadow="md"
                overflow="hidden"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  objectFit="cover"
                  w="100%"
                  h="200px"
                  borderRadius="md"
                />
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Remove Image"
                  colorScheme="red"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={() => handleRemove(index)}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
