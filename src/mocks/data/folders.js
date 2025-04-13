/**
 * Mock folder data for the Media Library Manager
 * 
 * This file contains mock data for folders that simulates the structure
 * that would be returned from a real API call.
 */

const folders = [
  { id: '1', name: 'Images', parent: null, path: 'Images', color: '#3B82F6' },
  { id: '2', name: 'Documents', parent: null, path: 'Documents', color: '#10B981' },
  { id: '3', name: 'Videos', parent: null, path: 'Videos', color: '#F59E0B' },
  { id: '4', name: 'Marketing', parent: '1', path: 'Images/Marketing', color: '#6366F1' },
  { id: '5', name: 'Products', parent: '1', path: 'Images/Products', color: '#EC4899' },
  { id: '6', name: 'Team', parent: '1', path: 'Images/Team', color: '#14B8A6' },
  { id: '7', name: 'Reports', parent: '2', path: 'Documents/Reports', color: '#8B5CF6' },
  { id: '8', name: 'Contracts', parent: '2', path: 'Documents/Contracts', color: '#F43F5E' },
  { id: '9', name: 'Tutorials', parent: '3', path: 'Videos/Tutorials', color: '#EF4444' },
  { id: '10', name: 'Web Assets', parent: '1', path: 'Images/Web Assets', color: '#0EA5E9' },
  { id: '11', name: 'Social Media', parent: '1', path: 'Images/Social Media', color: '#F97316' },
  { id: '12', name: 'Icons', parent: '10', path: 'Images/Web Assets/Icons', color: '#8B5CF6' },
  { id: '13', name: 'Banners', parent: '10', path: 'Images/Web Assets/Banners', color: '#EC4899' },
  { id: '14', name: 'Logos', parent: '10', path: 'Images/Web Assets/Logos', color: '#10B981' },
  { id: '15', name: 'Instagram', parent: '11', path: 'Images/Social Media/Instagram', color: '#6366F1' },
  { id: '16', name: 'Twitter', parent: '11', path: 'Images/Social Media/Twitter', color: '#0EA5E9' },
  { id: '17', name: 'Facebook', parent: '11', path: 'Images/Social Media/Facebook', color: '#3B82F6' }
];

export default folders;