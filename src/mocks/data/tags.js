/**
 * Mock tag data for the Media Library Manager
 * 
 * This file contains mock data for tags that simulates the structure
 * that would be returned from a real API call.
 */

// Define tag categories
const tagCategories = [
  { id: 'cat1', name: 'Content Type', description: 'Type of content' },
  { id: 'cat2', name: 'Purpose', description: 'Content purpose or usage' },
  { id: 'cat3', name: 'Subject', description: 'Main subject of content' },
  { id: 'cat4', name: 'Project', description: 'Related project' },
  { id: 'cat5', name: 'Status', description: 'Content status' }
];

const tags = [
  { id: '1', name: 'product', color: '#3B82F6', count: 15, categoryId: 'cat3' },
  { id: '2', name: 'hero', color: '#10B981', count: 8, categoryId: 'cat1' },
  { id: '3', name: 'banner', color: '#F59E0B', count: 12, categoryId: 'cat1' },
  { id: '4', name: 'team', color: '#8B5CF6', count: 7, categoryId: 'cat3' },
  { id: '5', name: 'report', color: '#EC4899', count: 5, categoryId: 'cat2' },
  { id: '6', name: 'logo', color: '#14B8A6', count: 4, categoryId: 'cat1' },
  { id: '7', name: 'featured', color: '#F43F5E', count: 6, categoryId: 'cat2' },
  { id: '8', name: 'contract', color: '#0EA5E9', count: 3, categoryId: 'cat1' },
  { id: '9', name: 'tutorial', color: '#F97316', count: 2, categoryId: 'cat2' },
  { id: '10', name: 'social', color: '#6366F1', count: 9, categoryId: 'cat2' },
  { id: '11', name: 'seasonal', color: '#EF4444', count: 8, categoryId: 'cat4' },
  { id: '12', name: 'web', color: '#10B981', count: 7, categoryId: 'cat2' },
  { id: '13', name: 'marketing', color: '#8B5CF6', count: 10, categoryId: 'cat4' },
  { id: '14', name: 'background', color: '#0EA5E9', count: 4, categoryId: 'cat1' },
  { id: '15', name: 'office', color: '#F59E0B', count: 3, categoryId: 'cat3' },
  { id: '16', name: 'interior', color: '#6366F1', count: 2, categoryId: 'cat3' },
  { id: '17', name: 'lifestyle', color: '#EC4899', count: 5, categoryId: 'cat3' },
  { id: '18', name: 'photography', color: '#14B8A6', count: 9, categoryId: 'cat1' },
  { id: '19', name: 'design', color: '#F43F5E', count: 8, categoryId: 'cat4' },
  { id: '20', name: 'ui', color: '#3B82F6', count: 3, categoryId: 'cat1' },
  { id: '21', name: 'icons', color: '#10B981', count: 4, categoryId: 'cat1' },
  { id: '22', name: 'interface', color: '#F59E0B', count: 2, categoryId: 'cat1' },
  { id: '23', name: 'corporate', color: '#8B5CF6', count: 6, categoryId: 'cat4' },
  { id: '24', name: 'brand', color: '#EC4899', count: 5, categoryId: 'cat2' },
  { id: '25', name: 'identity', color: '#14B8A6', count: 4, categoryId: 'cat2' },
  { id: '26', name: 'approved', color: '#22C55E', count: 7, categoryId: 'cat5' },
  { id: '27', name: 'pending', color: '#F59E0B', count: 4, categoryId: 'cat5' },
  { id: '28', name: 'rejected', color: '#EF4444', count: 2, categoryId: 'cat5' }
];

export { tags, tagCategories };
export default tags;