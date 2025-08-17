import React from 'react';
import { Box, Heading, Text, Button, Container, VStack } from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxW="container.md" py={10}>
          <VStack spacing={6} align="center">
            <Heading color="red.500">Oops! Something went wrong</Heading>
            <Text>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Button
              colorScheme="green"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </VStack>
        </Container>
      );
    }

    return this.props.children;
  }
}
