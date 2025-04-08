import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, TextField, Card, CardMedia, CardContent, CardActions, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface ProfileIcon {
  id: string;
  filename: string;
  path: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [icons, setIcons] = useState<ProfileIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const baseUrl = 'http://localhost:8000';

  // Helper function to get the correct image URL
  const getImageUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    } else if (path.startsWith('/api/v1')) {
      return `${baseUrl}${path}`;
    } else {
      return path;
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const token = btoa(`${username}:${password}`);
      const response = await axios.get(`${baseUrl}/api/v1/admin/profile-icons`, {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });
      
      if (response.status === 200) {
        setIsAuthenticated(true);
        setIcons(response.data);
        localStorage.setItem('adminAuth', token);
        enqueueSnackbar('Login successful', { variant: 'success' });
      }
    } catch (error) {
      console.error('Login error:', error);
      enqueueSnackbar('Authentication failed', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIcons = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminAuth');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      
      const response = await axios.get(`${baseUrl}/api/v1/admin/profile-icons`, {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });
      
      setIcons(response.data);
    } catch (error) {
      console.error('Failed to fetch icons:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuth');
        enqueueSnackbar('Session expired, please login again', { variant: 'warning' });
      } else {
        enqueueSnackbar('Failed to fetch icons', { variant: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
  };

  const handleUpload = async () => {
    if (!file || !label) {
      enqueueSnackbar('Please select a file and enter a label', { variant: 'warning' });
      return;
    }

    try {
      setUploadLoading(true);
      const token = localStorage.getItem('adminAuth');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('label', label);
      
      const response = await axios.post(
        `${baseUrl}/api/v1/admin/profile-icons`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Basic ${token}`,
          },
        }
      );
      
      if (response.status === 200) {
        enqueueSnackbar('Icon uploaded successfully', { variant: 'success' });
        setFile(null);
        setLabel('');
        fetchIcons();
      }
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar('Failed to upload icon', { variant: 'error' });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (iconId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminAuth');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      
      const response = await axios.delete(
        `${baseUrl}/api/v1/admin/profile-icons/${iconId}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        }
      );
      
      if (response.status === 200) {
        enqueueSnackbar('Icon deleted successfully', { variant: 'success' });
        fetchIcons();
      }
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar('Failed to delete icon', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setIcons([]);
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    const token = localStorage.getItem('adminAuth');
    if (token) {
      setIsAuthenticated(true);
      fetchIcons();
    }
  }, []);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard - Profile Icons Management
        </Typography>
        
        {!isAuthenticated ? (
          <Box my={4} p={3} border={1} borderColor="grey.300" borderRadius={1}>
            <Typography variant="h6" gutterBottom>
              Admin Login
            </Typography>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button variant="outlined" color="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
            
            <Box my={4} p={3} border={1} borderColor="grey.300" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                Upload New Profile Icon
              </Typography>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                <Box flex={1}>
                  <TextField
                    label="Icon Label"
                    fullWidth
                    value={label}
                    onChange={handleLabelChange}
                    margin="normal"
                  />
                </Box>
                <Box flex={1} mt={2}>
                  <input
                    accept="image/*"
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outlined" component="span">
                      Select File
                    </Button>
                  </label>
                  {file && (
                    <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                      {file.name}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  disabled={uploadLoading || !file || !label}
                >
                  {uploadLoading ? <CircularProgress size={24} /> : 'Upload Icon'}
                </Button>
              </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Available Profile Icons
            </Typography>
            
            {isLoading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {icons.length === 0 ? (
                  <Typography variant="body1" color="textSecondary">
                    No profile icons available. Upload some!
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {icons.map((icon) => (
                      <Box key={icon.id} sx={{ width: { xs: '100%', sm: '45%', md: '30%' } }}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="140"
                            image={getImageUrl(icon.path)}
                            alt={icon.filename}
                          />
                          <CardContent>
                            <Typography variant="body2" color="textSecondary">
                              {icon.filename}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                              Added: {new Date(icon.created_at).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              color="secondary"
                              onClick={() => handleDelete(icon.id)}
                            >
                              Delete
                            </Button>
                          </CardActions>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard; 