import React, { useRef, useState } from 'react';
import {
  Box, Button, Input, Text, Image, Icon,
  useColorModeValue, SimpleGrid, IconButton, VStack, Badge,
} from '@chakra-ui/react';
import { FiUploadCloud, FiTrash2, FiImage } from 'react-icons/fi';

const ImageUpload = ({ selectedFile, setSelectedFile }) => {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFile((prev) => [...prev, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setSelectedFile((prev) => [...prev, ...files]);
  };

  const handleRemove = (index) => {
    const updated = [...selectedFile];
    updated.splice(index, 1);
    setSelectedFile(updated);
  };

  const borderColor  = dragging ? 'green.400' : useColorModeValue('gray.200', 'gray.600');
  const dropBg       = dragging ? useColorModeValue('green.50', 'green.900') : useColorModeValue('gray.50', 'gray.750');
  const iconColor    = useColorModeValue('gray.400', 'gray.500');

  return (
    <Box>
      <Input type="file" accept="image/*" multiple ref={inputRef} display="none" onChange={handleImageSelect} />

      {/* Drop Zone */}
      <Box
        border="2px dashed" borderColor={borderColor} borderRadius="xl"
        p={8} textAlign="center" bg={dropBg} cursor="pointer"
        transition="all 0.2s"
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        _hover={{ borderColor: 'green.400', bg: useColorModeValue('green.50', 'green.900') }}
      >
        <VStack spacing={3}>
          <Box
            bg={useColorModeValue('green.100', 'green.800')}
            p={4} borderRadius="2xl"
          >
            <Icon as={FiUploadCloud} boxSize={8} color="green.500" />
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="sm">
              {dragging ? 'Drop images here' : 'Click or drag images here'}
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>
              PNG, JPG, WEBP up to 5MB each · Multiple allowed
            </Text>
          </Box>
          <Button
            size="sm" colorScheme="green" variant="outline" borderRadius="lg"
            onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
          >
            Browse Files
          </Button>
        </VStack>
      </Box>

      {/* Preview Grid */}
      {selectedFile.length > 0 && (
        <Box mt={4}>
          <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium">
            {selectedFile.length} image{selectedFile.length > 1 ? 's' : ''} selected
          </Text>
          <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
            {selectedFile.map((file, index) => (
              <Box key={index} position="relative" borderRadius="xl" overflow="hidden" boxShadow="md" group>
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  objectFit="cover" w="100%" h="120px"
                />
                {index === 0 && (
                  <Badge
                    position="absolute" top={1} left={1}
                    colorScheme="green" fontSize="9px"
                  >
                    Primary
                  </Badge>
                )}
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Remove"
                  colorScheme="red" size="xs"
                  position="absolute" top={1} right={1}
                  borderRadius="lg" opacity={0.9}
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