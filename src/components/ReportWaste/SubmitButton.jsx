import React, { useState, useEffect } from 'react';
import {
  Button,
  useToast,
  Icon,
  Progress,
  VStack,
  Text,
  Box
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';

const SubmitButton = ({ selectedFile, setImageUrl, location, formDetails }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Calculate progress dynamically
  useEffect(() => {
    let progressCount = 0;
    if (selectedFile) progressCount += 25;
    if (formDetails.description) progressCount += 25;
    if (formDetails.category) progressCount += 25;
    if (location.lat && location.lng) progressCount += 25;
    setProgress(progressCount);
  }, [selectedFile, formDetails, location]);

  const handleSubmit = () => {
    if (progress < 100) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all steps before submitting.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
        variant: 'subtle',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const dummyImageUrl = URL.createObjectURL(selectedFile);
      setImageUrl(dummyImageUrl);
      setIsLoading(false);

      toast({
        title: 'Report Submitted',
        description: 'Thank you for your contribution!',
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
        icon: <Icon as={FaCheckCircle} color="green.400" />,
        variant: 'left-accent',
      });
    }, 1500);
  };

  return (
    <VStack spacing={4} mt={6} width="full">
      <Box width="100%">
        <Text fontWeight="semibold" mb={1}>
          Completion Progress: {progress}%
        </Text>
        <Progress value={progress} size="sm" colorScheme="green" rounded="md" />
      </Box>

      <Button
        width="full"
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Submitting"
        colorScheme="teal"
        bgGradient="linear(to-r, teal.500, green.400)"
        _hover={{ bgGradient: 'linear(to-r, teal.600, green.500)', transform: 'scale(1.03)' }}
        _active={{ transform: 'scale(0.98)' }}
        transition="all 0.2s ease-in-out"
        fontWeight="bold"
        letterSpacing="wide"
        fontSize="lg"
        shadow="lg"
        isDisabled={progress < 100}
      >
        Submit Report
      </Button>
    </VStack>
  );
};

export default SubmitButton;
