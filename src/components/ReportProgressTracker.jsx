import React from 'react';
import { Box, VStack, HStack, Text, Progress, Badge, Icon, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, WarningIcon } from '@chakra-ui/icons';

const ReportProgressTracker = ({ report }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.200', 'gray.700');
  
  if (!report.progressStages || !report.progressStages.length) {
    return (
      <Box p={4} bg={cardBg} borderRadius="lg" borderWidth="1px" borderColor={borderCol}>
        <Text fontSize="sm" color="gray.500">Progress tracking not available for this report</Text>
      </Box>
    );
  }
  
  const getStageIcon = (stage, isCompleted) => {
    if (isCompleted) return <CheckCircleIcon color="green.500" />;
    if (stage === report.currentStage) return <TimeIcon color="blue.500" />;
    return <WarningIcon color="gray.300" />;
  };
  
  return (
    <Box>
      <VStack spacing={3} align="stretch">
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="bold" fontSize="sm">Overall Progress</Text>
            <Badge colorScheme={report.progressPercentage === 100 ? 'green' : 'blue'} fontSize="md">
              {report.progressPercentage}%
            </Badge>
          </HStack>
          <Progress 
            value={report.progressPercentage || 0} 
            colorScheme={report.progressPercentage === 100 ? 'green' : 'blue'} 
            borderRadius="full" 
            size="lg"
          />
        </Box>
        
        {report.estimatedCompletionDate && report.progressPercentage < 100 && (
          <Box p={2} bg="blue.50" borderRadius="md">
            <Text fontSize="xs" color="blue.600">
              Estimated completion: {new Date(report.estimatedCompletionDate).toLocaleDateString()}
            </Text>
          </Box>
        )}
        
        <Text fontWeight="bold" fontSize="sm" mt={2}>Progress Stages:</Text>
        
        {report.progressStages.map((stage, index) => (
          <Box 
            key={index} 
            p={3} 
            bg={stage.completed ? 'green.50' : (stage.name === report.currentStage ? 'blue.50' : 'gray.50')}
            borderRadius="md"
            borderLeftWidth="3px"
            borderLeftColor={stage.completed ? 'green.500' : (stage.name === report.currentStage ? 'blue.500' : 'gray.300')}
          >
            <HStack spacing={3}>
              {getStageIcon(stage.name, stage.completed)}
              <Box flex={1}>
                <HStack justify="space-between">
                  <Text fontWeight="medium" fontSize="sm">
                    {stage.name}
                    {stage.name === report.currentStage && !stage.completed && (
                      <Badge ml={2} colorScheme="blue" fontSize="xs">In Progress</Badge>
                    )}
                  </Text>
                  {stage.completedAt && (
                    <Text fontSize="xs" color="gray.500">
                      {new Date(stage.completedAt).toLocaleDateString()}
                    </Text>
                  )}
                </HStack>
                {stage.description && (
                  <Text fontSize="xs" color="gray.600" mt={1}>{stage.description}</Text>
                )}
              </Box>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ReportProgressTracker;