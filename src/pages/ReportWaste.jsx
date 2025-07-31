import React, { useState } from 'react';
import ImageUpload from '../components/ReportWaste/ImageUpload';
import LocationPicker from '../components/ReportWaste/LocationPicker';
import ReportFormDetails from '../components/ReportWaste/ReportFormDetails';
import SubmitButton from '../components/ReportWaste/SubmitButton';
import {
  Box,
  Heading,
  Flex,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';

const ReportWaste = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [formDetails, setFormDetails] = useState({
    description: '',
    category: '',
  });

  return (
    <Box p={5}>
      {/* 🔔 Suggestion Box */}
      <Alert
        status="info"
        variant="subtle"
        bg={useColorModeValue('gray.100', 'gray.700')}
        rounded="md"
        mb={6}
      >
        <AlertIcon />
        <AlertDescription fontSize="md">
          Please note: <strong>Image upload is mandatory</strong>. Category and description are <strong>optional</strong>, but providing them helps us classify the waste better.
        </AlertDescription>
      </Alert>

      <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
        {/* Left Side: Form, Image Upload, Submit */}
        <Box flex={1}>
          <ImageUpload 
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
          <ReportFormDetails 
            formDetails={formDetails}
            setFormDetails={setFormDetails}
          />
          <SubmitButton 
            selectedFile={selectedFile}
            setImageUrl={setImageUrl}
            location={location}
            formDetails={formDetails}
          />
        </Box>

        {/* Right Side: Map */}
        <Box flex={1}>
          <LocationPicker 
            location={location}
            setLocation={setLocation}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default ReportWaste;
