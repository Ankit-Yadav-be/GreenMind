import React, { useState } from 'react';
import { Button, useToast, Icon } from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';

const SubmitButton = ({ selectedFile, setImageUrl, location, formDetails }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!selectedFile || !location.lat || !formDetails.description || !formDetails.category) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all fields before submitting.',
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
    }, 1500); // Simulate network
  };

  return (
    <Button
      mt={6}
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
    >
      Submit Report
    </Button>
  );
};

export default SubmitButton;
