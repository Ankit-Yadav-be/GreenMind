import React from 'react';
import {
    Box,
    Heading,
    Text,
    Button,
    Stack,
    useBreakpointValue,

} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

// Animation keyframe for glowing heading


const HeroSection = () => {
    return (
        <Box
            w="100%"
            h={{ base: '80vh', md: '100vh' }}
            bgImage="linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://media.istockphoto.com/id/2156608209/photo/garden-rubbish.jpg?s=1024x1024&w=is&k=20&c=48ZC-YHOH_z1R8NFGVKg3ZvVj5kEqLKBaZiEOGWB2Q4=')"
            bgSize="cover"
            bgPosition="center"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={4}
        >
            <Box
                textAlign="center"
                bg="rgba(255, 255, 255, 0.05)"
                border="1px solid rgba(255,255,255,0.2)"
                backdropFilter="blur(10px)"
                borderRadius="2xl"
                px={8}
                py={10}
                color="white"
                maxW="3xl"
                boxShadow="lg"
                transition="all 0.3s ease"
            >
                <Heading
                    fontSize={useBreakpointValue({ base: '3xl', md: '5xl' })}
                    fontWeight="extrabold"
                    lineHeight="1.2"
                    mb={4}

                >
                    Clean Your City, One Click at a Time
                </Heading>

                <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.200" maxW="2xl" mx="auto">
                    Be the change you want to see. Spot garbage? Report it in seconds. Let’s build a cleaner, greener tomorrow.
                </Text>

                <Stack mt={8} direction={{ base: 'column', sm: 'row' }} spacing={4} justify="center">
                    <Button
                        as={RouterLink}
                        to="/report"
                        colorScheme="green"
                        size="lg"
                        fontWeight="bold"
                        px={8}
                        _hover={{
                            transform: 'scale(1.05)',
                            boxShadow: 'lg',
                            bg: 'green.500',
                        }}
                        transition="all 0.3s ease"
                    >
                        Report Now
                    </Button>
                    <Button
                        as={RouterLink}
                        to="/wastelist"
                        variant="outline"
                        color="white"
                        borderColor="green.400"
                        size="lg"
                        fontWeight="medium"
                        px={8}
                        _hover={{
                            bg: 'green.600',
                            color: 'white',
                            transform: 'scale(1.05)',
                            borderColor: 'green.500',
                        }}
                        transition="all 0.3s ease"
                    >
                        View Reports
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};

export default HeroSection;
