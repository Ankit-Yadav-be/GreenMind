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
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

const SubmitButton = ({ selectedFile, location, formDetails, placeName }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Calculate progress dynamically
  useEffect(() => {
    let progressCount = 0;
    if (selectedFile && selectedFile.length > 0) progressCount += 25;
    if (formDetails.description) progressCount += 25;
    if (formDetails.category) progressCount += 25;
    if (location.lat && location.lng) progressCount += 25;
    setProgress(progressCount);
  }, [selectedFile, formDetails, location]);

  const handleSubmit = async () => {
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

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append text fields
      formData.append('description', formDetails.description);
      formData.append('category', formDetails.category);
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
      formData.append('address', placeName || '');

      // Append all images
      selectedFile.forEach((file) => {
        formData.append('images', file);
      });

      // Send POST request to backend
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsLoading(false);

      toast({
        title: 'Report Submitted Successfully!',
        description: `Your report has been saved with ID: ${response.data.data._id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
        icon: <Icon as={FaCheckCircle} color="green.400" />,
        variant: 'left-accent',
      });

      // Optional: Reset form or redirect
      // You can add callback props to reset the form here

    } catch (error) {
      setIsLoading(false);
      
      const errorMessage = error.response?.data?.message || 'Failed to submit report. Please try again.';
      
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
        variant: 'left-accent',
      });

      console.error('Error submitting report:', error);
    }
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
        loadingText="Submitting..."
        colorScheme="teal"
        bgGradient="linear(to-r, teal.500, green.400)"
        _hover={{ bgGradient: 'linear(to-r, teal.600, green.500)', transform: 'scale(1.03)' }}
        _active={{ transform: 'scale(0.98)' }}
        transition="all 0.2s ease-in-out"
        fontWeight="bold"
        letterSpacing="wide"
        fontSize="lg"
        shadow="lg"
        isDisabled={progress < 100 || isLoading}
      >
        Submit Report
      </Button>
    </VStack>
  );
};

export default SubmitButton;