/**
 * Mock collection data for the Media Library Manager
 * 
 * This file contains mock data for collections that simulates the structure
 * that would be returned from a real API call.
 */

const collections = [
  { 
    id: '1', 
    name: 'Homepage Redesign', 
    description: 'Assets for the new homepage design',
    items: ['1', '3', '8'],
    created: '2025-03-10',
    modified: '2025-03-15',
    color: '#8B5CF6',
    createdBy: 'user1',
    isShared: true,
    sharedWith: ['user2', 'user3']
  },
  { 
    id: '2', 
    name: 'Spring Campaign', 
    description: 'Marketing materials for Spring 2025',
    items: ['3', '5', '6'],
    created: '2025-02-20',
    modified: '2025-02-28',
    color: '#10B981',
    createdBy: 'user1',
    isShared: true,
    sharedWith: ['user2']
  },
  { 
    id: '3', 
    name: 'Legal Documents', 
    description: 'Important contracts and legal files',
    items: ['4', '7'],
    created: '2025-01-15',
    modified: '2025-03-01',
    color: '#F43F5E',
    createdBy: 'user3',
    isShared: true,
    sharedWith: ['user1']
  },
  { 
    id: '4', 
    name: 'Product Photoshoot', 
    description: 'New product line photography',
    items: ['1', '12', '17'],
    created: '2025-03-25',
    modified: '2025-03-28',
    color: '#0EA5E9',
    createdBy: 'user1',
    isShared: false,
    sharedWith: []
  },
  { 
    id: '5', 
    name: 'Social Media Content', 
    description: 'Assets for April social posts',
    items: ['6', '15', '16'],
    created: '2025-03-20',
    modified: '2025-03-22',
    color: '#F97316',
    createdBy: 'user2',
    isShared: true,
    sharedWith: ['user1', 'user3', 'user4']
  },
  { 
    id: '6', 
    name: 'Annual Report Materials', 
    description: 'Graphics and documents for annual report',
    items: ['4', '18', '13'],
    created: '2025-01-10',
    modified: '2025-01-20',
    color: '#6366F1',
    createdBy: 'user3',
    isShared: true,
    sharedWith: ['user1', 'user5']
  },
  { 
    id: '7', 
    name: 'Team Resources', 
    description: 'Team photos and videos',
    items: ['2', '11', '19'],
    created: '2025-02-15',
    modified: '2025-03-05',
    color: '#14B8A6',
    createdBy: 'user1',
    isShared: true,
    sharedWith: ['user2', 'user3', 'user4', 'user5']
  }
];

export default collections;