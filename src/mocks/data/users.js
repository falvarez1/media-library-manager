/**
 * Mock user data for the Media Library Manager
 * 
 * This file contains mock data for users that simulates the structure
 * that would be returned from a real API call.
 */

const users = [
  { 
    id: 'user1', 
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60',
    lastActive: '2025-04-12T14:32:21Z',
    created: '2024-10-15T09:00:00Z',
    preferences: {
      theme: 'light',
      viewMode: 'grid',
      gridSize: 'medium',
      defaultSort: 'name'
    },
    recentFolders: ['5', '1', '10'],
    recentFiles: ['1', '8', '13']
  },
  { 
    id: 'user2', 
    name: 'Samantha Chen',
    email: 'samantha.chen@example.com',
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60',
    lastActive: '2025-04-11T18:45:33Z',
    created: '2024-11-02T14:30:00Z',
    preferences: {
      theme: 'dark',
      viewMode: 'grid',
      gridSize: 'small',
      defaultSort: 'date'
    },
    recentFolders: ['4', '11', '15'],
    recentFiles: ['3', '6', '15']
  },
  { 
    id: 'user3', 
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@example.com',
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60',
    lastActive: '2025-04-12T10:15:07Z',
    created: '2024-10-28T11:45:00Z',
    preferences: {
      theme: 'light',
      viewMode: 'list',
      gridSize: 'medium',
      defaultSort: 'type'
    },
    recentFolders: ['7', '2', '8'],
    recentFiles: ['4', '7', '13']
  },
  { 
    id: 'user4', 
    name: 'Emily Williams',
    email: 'emily.williams@example.com',
    role: 'viewer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=60',
    lastActive: '2025-04-10T15:22:41Z',
    created: '2025-01-15T13:20:00Z',
    preferences: {
      theme: 'light',
      viewMode: 'grid',
      gridSize: 'large',
      defaultSort: 'name'
    },
    recentFolders: ['6', '3', '9'],
    recentFiles: ['2', '5', '19']
  },
  { 
    id: 'user5', 
    name: 'David Kim',
    email: 'david.kim@example.com',
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60',
    lastActive: '2025-04-11T09:35:18Z',
    created: '2024-12-05T10:10:00Z',
    preferences: {
      theme: 'dark',
      viewMode: 'grid',
      gridSize: 'medium',
      defaultSort: 'size'
    },
    recentFolders: ['13', '14', '4'],
    recentFiles: ['8', '9', '18']
  },
  { 
    id: 'current', 
    name: 'Jamie Smith',
    email: 'jamie.smith@example.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=60',
    lastActive: '2025-04-12T15:05:00Z',
    created: '2024-10-01T08:00:00Z',
    preferences: {
      theme: 'light',
      viewMode: 'grid',
      gridSize: 'medium',
      defaultSort: 'name'
    },
    recentFolders: ['1', '5', '7'],
    recentFiles: ['1', '3', '10']
  }
];

export default users;

export const currentUser = users.find(user => user.id === 'current');