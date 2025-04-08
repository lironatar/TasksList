import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, Avatar, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { AuthContext } from '../App';
import { userApi } from '../utils/api';

interface ProfileIcon {
  id: string;
  path: string;
  label: string;
}

const Profile: React.FC = () => {
  const { user, updateProfileIcon } = useContext(AuthContext);
  const [icons, setIcons] = useState<ProfileIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
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

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        setIsLoading(true);
        const data = await userApi.getProfileIcons();
        setIcons(data);
      } catch (error) {
        console.error('Failed to fetch profile icons:', error);
        enqueueSnackbar('Failed to load profile icons', { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIcons();
  }, [enqueueSnackbar]);

  const handleSelectIcon = async (iconPath: string) => {
    try {
      setIsUpdating(true);
      await updateProfileIcon(iconPath);
      enqueueSnackbar('Profile icon updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to update profile icon:', error);
      enqueueSnackbar('Failed to update profile icon', { variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          פרופיל משתמש
        </Typography>

        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" my={4}>
          <Avatar 
            src={user.profile_icon ? getImageUrl(user.profile_icon) : undefined}
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          <Typography variant="h5" component="div">
            {user.name}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {user.email}
          </Typography>
        </Box>

        <Box my={6}>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            בחר תמונת פרופיל
          </Typography>
          
          {isLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {icons.length === 0 ? (
                <Typography variant="body1" color="textSecondary" align="center">
                  אין תמונות פרופיל זמינות כרגע.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                  {icons.map((icon) => (
                    <Box key={icon.id} sx={{ width: { xs: '45%', sm: '30%', md: '22%' } }}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: user.profile_icon === icon.path ? '2px solid #2196f3' : 'none',
                          transform: user.profile_icon === icon.path ? 'scale(1.05)' : 'none',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => handleSelectIcon(icon.path)}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={getImageUrl(icon.path)}
                          alt={icon.label}
                        />
                        <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                          <Typography variant="body2">
                            {icon.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
      
      {isUpdating && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(0, 0, 0, 0.5)"
          zIndex={9999}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </Container>
  );
};

export default Profile; 