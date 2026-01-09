'use client';
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: '16px',
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
    },
}));

const IconWrapper = styled(Box)(({ color }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: '12px',
    backgroundColor: color + '20', // 20% opacity
    color: color,
    marginBottom: '16px',
}));

const StatCard = ({ title, value, icon, color = '#1976d2', trend }) => {
    return (
        <StyledCard>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <IconWrapper color={color}>
                        {icon}
                    </IconWrapper>
                    {trend && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: trend > 0 ? 'success.main' : 'error.main',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: trend > 0 ? 'success.lighter' : 'error.lighter',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                            }}
                        >
                            {trend > 0 ? '+' : ''}{trend}%
                        </Typography>
                    )}
                </Box>
                <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
            </CardContent>
        </StyledCard>
    );
};

export default StatCard;
