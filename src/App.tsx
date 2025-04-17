import { useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material';
import {
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Layout } from "./components/Layout";
import PdfViewer from "./components/PdfViewer";
import { FormElementToolbar } from "./components/FormElementToolbar";
import { FormElementProperties } from "./components/FormElementProperties";
import { FormElementProvider } from "./contexts/FormElementContext";
import { FormDataProvider } from "./contexts/FormDataContext";
import { FormValidationErrors } from "./components/FormValidationErrors";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PdfFormGenerator } from "./components/PdfFormGenerator";
import "./App.css";


interface PdfDocument {
  page_count: number; 
  // Add other properties as needed
}

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const PropertyDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 300,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
}));

const ToolbarButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  textTransform: 'none',
}));

const ZoomControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: theme.spacing(2),
  '& .MuiIconButton-root': {
    padding: theme.spacing(1),
  },
}));

function App() {
  const theme = useTheme();
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [
    // pdfDocument,
    //  setPdfDocument
    ] = useState<PdfDocument | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState({ width: 612, height: 792 }); // Default US Letter size
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Open a PDF file
  const openPdfFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'PDF Files',
          extensions: ['pdf']
        }]
      });
      
      if (selected && !Array.isArray(selected)) {
        setIsLoading(true);
        setPdfPath(selected);
        setCurrentPage(1);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error opening PDF file:', error);
      setIsLoading(false);
    }
  };

  // Load demo PDF
  const loadDemoPdf = async () => {
    try {
      setIsLoading(true);
      
      setPdfPath('/pdf/demo.pdf');
      setCurrentPage(1);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading demo PDF:', error);
      setIsLoading(false);

      alert('Failed to load demo PDF. Please try opening your own PDF file.');
    }
  };

  // Handle document loaded
  const handleDocumentLoaded = (document: any) => {
    // setPdfDocument({
    //   page_count: document.numPages,
    // });
    setTotalPages(document.numPages);
  };

  // Handle page dimensions change
  const handlePageDimensionsChange = (width: number, height: number) => {
    setPageDimensions({ width, height });
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3.0));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  // Handle rotation left
  const handleRotateLeft = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  // Handle rotation right
  const handleRotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Toggle validation errors display
  const toggleValidationErrors = () => {
    setShowValidationErrors(!showValidationErrors);
  };
  
  // Handle page navigation
  const handlePageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  return (
    <ThemeProvider>
      <FormElementProvider>
        <FormDataProvider>
          <Layout>
            {pdfPath ? (
              <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                {/* Left Sidebar - Form Element Toolbar */}
                <StyledDrawer variant="permanent" anchor="left">
                  <Toolbar sx={{ minHeight: '64px !important' }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      Form Elements
                    </Typography>
                  </Toolbar>
                  <Divider />
                  
                  <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                    <FormElementToolbar
                      currentPage={currentPage}
                      scale={scale}
                      rotation={rotation}
                      pageDimensions={pageDimensions}
                    />
                  </Box>
                  
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <PdfFormGenerator pdfPath={pdfPath} />
                  </Box>
                </StyledDrawer>
                
                {/* Main Content Area */}
                <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Top Toolbar */}
                  <Paper square elevation={0} sx={{ 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    zIndex: theme.zIndex.appBar 
                  }}>
                    <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={1}>
                        <ToolbarButton
                          variant="outlined"
                          startIcon={<UploadIcon />}
                          onClick={openPdfFile}
                        >
                          Open PDF
                        </ToolbarButton>
                        <ToolbarButton
                          variant="outlined"
                          startIcon={<DescriptionIcon />}
                          onClick={loadDemoPdf}
                        >
                          Load Demo
                        </ToolbarButton>
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          Page {currentPage} of {totalPages}
                        </Typography>
                        
                        <ToolbarButton
                          variant={showValidationErrors ? "contained" : "outlined"}
                          startIcon={showValidationErrors ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          onClick={toggleValidationErrors}
                        >
                          Validation
                        </ToolbarButton>
                        
                        <ZoomControls>
                          <IconButton onClick={handleZoomOut} size="small">
                            <ZoomOutIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ mx: 1 }}>
                            {Math.round(scale * 100)}%
                          </Typography>
                          <IconButton onClick={handleZoomIn} size="small">
                            <ZoomInIcon />
                          </IconButton>
                          
                          <IconButton onClick={handleRotateLeft} size="small" sx={{ ml: 2 }}>
                            <RotateLeftIcon />
                          </IconButton>
                          <IconButton onClick={handleRotateRight} size="small">
                            <RotateRightIcon />
                          </IconButton>
                        </ZoomControls>
                      </Stack>
                    </Toolbar>
                    
                    {showValidationErrors && (
                      <Box sx={{ p: 1, backgroundColor: theme.palette.warning.light }}>
                        <FormValidationErrors showAll={true} />
                      </Box>
                    )}
                  </Paper>
                  
                  {/* PDF Viewer Area */}
                  <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
                    {isLoading ? (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%' 
                      }}>
                        <CircularProgress size={60} />
                      </Box>
                    ) : (
                      <PdfViewer
                        pdfPath={pdfPath}
                        scale={scale}
                        rotation={rotation}
                        pageNumber={currentPage}
                        onPageChange={setCurrentPage}
                        onDocumentLoaded={handleDocumentLoaded}
                        onPageDimensionsChange={handlePageDimensionsChange}
                      />
                    )}
                  </Box>
                  
                  {/* Bottom Navigation */}
                  <Paper square elevation={0} sx={{ 
                    borderTop: `1px solid ${theme.palette.divider}`,
                    p: 1 
                  }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <ToolbarButton
                        variant="outlined"
                        disabled={currentPage <= 1}
                        onClick={() => handlePageNavigation('prev')}
                      >
                        Previous
                      </ToolbarButton>
                      <ToolbarButton
                        variant="outlined"
                        disabled={currentPage >= totalPages}
                        onClick={() => handlePageNavigation('next')}
                      >
                        Next
                      </ToolbarButton>
                    </Stack>
                  </Paper>
                </Box>
                
                {/* Right Sidebar - Properties Panel */}
                <PropertyDrawer variant="permanent" anchor="right">
                  <Toolbar sx={{ minHeight: '64px !important' }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      Properties
                    </Typography>
                  </Toolbar>
                  <Divider />
                  <Box sx={{ overflow: 'auto', height: '100%' }}>
                    <FormElementProperties />
                  </Box>
                </PropertyDrawer>
              </Box>
            ) : (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: theme.palette.mode === 'light' 
                  ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
                  : 'linear-gradient(135deg, #2c3e50 0%, #1a1a1a 100%)',
                p: 3
              }}>
                <Paper elevation={3} sx={{ 
                  p: 4, 
                  maxWidth: 500, 
                  width: '100%',
                  textAlign: 'center'
                }}>
                  <DescriptionIcon sx={{ 
                    fontSize: 60, 
                    color: theme.palette.primary.main,
                    mb: 2
                  }} />
                  
                  <Typography variant="h4" component="h1" gutterBottom>
                    PDF Form Editor
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Create interactive PDF forms by adding form elements, configuring their properties, and generating fillable PDFs.
                  </Typography>
                  
                  {isLoading ? (
                    <Box sx={{ my: 4 }}>
                      <CircularProgress size={60} />
                    </Box>
                  ) : (
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<UploadIcon />}
                        onClick={openPdfFile}
                        fullWidth
                        sx={{ py: 1.5 }}
                      >
                        Open PDF File
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<DescriptionIcon />}
                        onClick={loadDemoPdf}
                        fullWidth
                        sx={{ py: 1.5 }}
                      >
                        Try Demo PDF
                      </Button>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                        Start by opening a PDF file or try our demo to explore the features.
                      </Typography>
                    </Stack>
                  )}
                </Paper>
              </Box>
            )}
          </Layout>
        </FormDataProvider>
      </FormElementProvider>
    </ThemeProvider>
  );
}

export default App;
