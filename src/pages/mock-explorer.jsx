import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useApi, useDataSource } from '../hooks/useApi';
import api from '../mocks/api';
import { mockData } from '../mocks';
import DataSourceConfig from '../components/DataSourceConfig';

// Main mock explorer component
export default function MockDataExplorer() {
  const router = useRouter();
  const { section = 'overview', id = null } = router.query;
  const [activeTab, setActiveTab] = useState(section);

  // Update active tab when URL query changes
  useEffect(() => {
    if (section) {
      setActiveTab(section);
    }
  }, [section]);

  // Change URL when tab changes
  const handleTabChange = (tab) => {
    router.push({
      pathname: '/mock-explorer',
      query: { section: tab }
    }, undefined, { shallow: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Mock Data Explorer</h1>
          <p className="text-gray-500 mt-1">
            Explore the mock data and API functionality
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Navigation tabs */}
          <div className="flex border-b border-gray-200">
            <TabButton 
              label="Overview" 
              isActive={activeTab === 'overview'} 
              onClick={() => handleTabChange('overview')} 
            />
            <TabButton 
              label="Media" 
              isActive={activeTab === 'media'} 
              onClick={() => handleTabChange('media')} 
            />
            <TabButton 
              label="Folders" 
              isActive={activeTab === 'folders'} 
              onClick={() => handleTabChange('folders')} 
            />
            <TabButton 
              label="Collections" 
              isActive={activeTab === 'collections'} 
              onClick={() => handleTabChange('collections')} 
            />
            <TabButton 
              label="Tags" 
              isActive={activeTab === 'tags'} 
              onClick={() => handleTabChange('tags')} 
            />
            <TabButton 
              label="Users" 
              isActive={activeTab === 'users'} 
              onClick={() => handleTabChange('users')} 
            />
            <TabButton
              label="API Tests"
              isActive={activeTab === 'api'}
              onClick={() => handleTabChange('api')}
            />
            <TabButton
              label="Config"
              isActive={activeTab === 'config'}
              onClick={() => handleTabChange('config')}
            />
          </div>

          {/* Content area */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewSection />}
            {activeTab === 'media' && <MediaSection mediaId={id} />}
            {activeTab === 'folders' && <FoldersSection folderId={id} />}
            {activeTab === 'collections' && <CollectionsSection collectionId={id} />}
            {activeTab === 'tags' && <TagsSection tagId={id} />}
            {activeTab === 'users' && <UsersSection userId={id} />}
            {activeTab === 'api' && <ApiTestSection />}
            {activeTab === 'config' && <ConfigSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

// Tab button component
function TabButton({ label, isActive, onClick }) {
  return (
    <button 
      className={`px-4 py-3 text-sm font-medium border-b-2 focus:outline-none ${
        isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Overview section
function OverviewSection() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mock Data Overview</h2>
      
      <p className="mb-4">
        This explorer allows you to browse and interact with the mock data system. 
        The mock data is organized into several categories:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DataCard 
          title="Media Items" 
          count={mockData.media.length} 
          description="Images, videos, and documents" 
          link={{ href: '/mock-explorer?section=media', label: 'View Media' }}
        />
        <DataCard 
          title="Folders" 
          count={mockData.folders.length} 
          description="Hierarchical structure for organizing media" 
          link={{ href: '/mock-explorer?section=folders', label: 'View Folders' }}
        />
        <DataCard 
          title="Collections" 
          count={mockData.collections.length} 
          description="Virtual groupings of media items" 
          link={{ href: '/mock-explorer?section=collections', label: 'View Collections' }}
        />
        <DataCard 
          title="Tags" 
          count={mockData.tags.length} 
          description="Categorization labels for media" 
          link={{ href: '/mock-explorer?section=tags', label: 'View Tags' }}
        />
        <DataCard 
          title="Users" 
          count={mockData.users.length} 
          description="User accounts with preferences" 
          link={{ href: '/mock-explorer?section=users', label: 'View Users' }}
        />
        <DataCard 
          title="API Tests" 
          count="7" 
          description="Test mock API functionality" 
          link={{ href: '/mock-explorer?section=api', label: 'Run Tests' }}
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Integration with your app</h3>
        <p className="text-blue-600 mb-3">
          To use the API in your components, import the hooks from the service layer:
        </p>
        <div className="bg-gray-800 text-white p-3 rounded font-mono text-sm">
          <div>
            <span className="text-green-400">import</span> <span className="text-blue-300">{'{ useMedia, useFolders, useDataSource }'}</span> <span className="text-green-400">from</span> <span className="text-orange-300">'../hooks/useApi'</span>;
          </div>
          <div className="mt-1">
            <span className="text-purple-400">const</span> <span className="text-blue-300">MediaList</span> = <span className="text-purple-400">()</span> <span className="text-orange-300">=&gt;</span> <span className="text-blue-300">{'{'}</span>
          </div>
          <div className="pl-2">
            <span className="text-purple-400">const</span> <span className="text-blue-300">{'{ data, loading }'}</span> = <span className="text-yellow-300">useMedia</span><span className="text-blue-300">();</span>
          </div>
          <div className="pl-2">
            <span className="text-purple-400">const</span> <span className="text-blue-300">{'{ isUsingRealApi, dataSource }'}</span> = <span className="text-yellow-300">useDataSource</span><span className="text-blue-300">();</span>
          </div>
          <div className="pl-2 mt-1">
            <span className="text-purple-400">if</span> <span className="text-blue-300">(loading)</span> <span className="text-purple-400">return</span> <span className="text-blue-300">&lt;div&gt;Loading...&lt;/div&gt;;</span>
          </div>
          <div className="pl-2 mt-1">
            <span className="text-purple-400">return</span> <span className="text-blue-300">(&lt;div&gt;{'{'}data.items.length{'}'} items from {'{'}dataSource{'}'} API&lt;/div&gt;);</span>
          </div>
          <div>
            <span className="text-blue-300">{'}'}</span>;
          </div>
        </div>
      </div>
    </div>
  );
}

// Data card component for overview
function DataCard({ title, count, description, link }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {count}
        </span>
      </div>
      <p className="text-gray-500 mt-1 mb-4">{description}</p>
      {link && (
        <Link 
          href={link.href}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          {link.label}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      )}
    </div>
  );
}

// Media section
function MediaSection({ mediaId }) {
  const { data: mediaList, loading: listLoading } = useApi(api.media.getMedia);
  const { data: mediaItem, loading: itemLoading } = useApi(
    () => mediaId ? api.media.getMediaById(mediaId) : Promise.resolve(null),
    [mediaId]
  );

  if (mediaId && itemLoading) {
    return <div className="text-center py-6">Loading media item...</div>;
  }

  if (mediaId && mediaItem) {
    return (
      <div>
        <div className="mb-4">
          <Link 
            href="/mock-explorer?section=media"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to all media
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6">
                {mediaItem.type === 'image' ? (
                  <img 
                    src={mediaItem.url} 
                    alt={mediaItem.name}
                    className="w-full h-auto object-cover rounded"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-500 uppercase text-sm font-medium">
                      {mediaItem.type}
                    </span>
                  </div>
                )}
                
                {mediaItem.attribution && (
                  <div className="mt-2 text-xs text-gray-500">
                    Photo by <a href={mediaItem.attribution.profile} target="_blank" rel="noopener noreferrer" className="text-blue-600">{mediaItem.attribution.photographer}</a> on {mediaItem.attribution.source}
                  </div>
                )}
              </div>

              <div className="md:w-2/3">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">{mediaItem.name}</h2>
                <div className="flex space-x-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {mediaItem.type}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {mediaItem.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Path</span>
                    <span className="text-sm">{mediaItem.path}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Size</span>
                    <span className="text-sm">{mediaItem.size}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Created</span>
                    <span className="text-sm">{new Date(mediaItem.created).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Modified</span>
                    <span className="text-sm">{new Date(mediaItem.modified).toLocaleDateString()}</span>
                  </div>
                  {mediaItem.dimensions && (
                    <div>
                      <span className="text-xs text-gray-500 block">Dimensions</span>
                      <span className="text-sm">{mediaItem.dimensions}</span>
                    </div>
                  )}
                  {mediaItem.duration && (
                    <div>
                      <span className="text-xs text-gray-500 block">Duration</span>
                      <span className="text-sm">{mediaItem.duration}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-xs text-gray-500 block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {mediaItem.tags && mediaItem.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {mediaItem.ai_tags && (
                  <div className="mb-4">
                    <span className="text-xs text-gray-500 block mb-1">AI Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {mediaItem.ai_tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mediaItem.used && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Used In</span>
                    <div className="flex flex-wrap gap-1">
                      {mediaItem.usedIn && mediaItem.usedIn.map(page => (
                        <span key={page} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {page}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (listLoading) {
    return <div className="text-center py-6">Loading media items...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Media Items</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mediaList?.items.map(item => (
          <Link 
            key={item.id}
            href={`/mock-explorer?section=media&id=${item.id}`}
            className="group block"
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-400 transition-colors">
              {item.type === 'image' ? (
                <img 
                  src={item.thumbnail || item.url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500 uppercase text-sm font-medium">
                    {item.type}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
                {item.name}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {item.size}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {item.type}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Folders section
function FoldersSection({ folderId }) {
  const { data: folderTree, loading: treeLoading } = useApi(api.folders.getFolderTree);
  const { data: folderContent, loading: contentLoading } = useApi(
    () => folderId ? api.folders.getFolderContents(folderId) : Promise.resolve(null), 
    [folderId]
  );

  if ((folderId && contentLoading) || treeLoading) {
    return <div className="text-center py-6">Loading folders...</div>;
  }

  if (folderId && folderContent) {
    return (
      <div>
        <div className="mb-4">
          <Link 
            href="/mock-explorer?section=folders"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to folder tree
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-6">
          <div className="flex items-center mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
              style={{ backgroundColor: `${folderContent.folder.color}20` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={folderContent.folder.color} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{folderContent.folder.name}</h2>
              <span className="text-sm text-gray-500">{folderContent.folder.path}</span>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Folder Contents</h3>
          {folderContent.contents.items.length === 0 ? (
            <div className="py-8 text-center text-gray-500">This folder is empty</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {folderContent.contents.items.map(item => (
                <Link 
                  key={item.id}
                  href={`/mock-explorer?section=media&id=${item.id}`}
                  className="group block"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-400 transition-colors">
                    {item.type === 'image' ? (
                      <img 
                        src={item.thumbnail || item.url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 uppercase text-sm font-medium">
                          {item.type}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Folder Structure</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          {folderTree && (
            <div className="space-y-4">
              {folderTree.map(folder => (
                <FolderTreeItem 
                  key={folder.id} 
                  folder={folder} 
                  level={0} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Recursive folder tree item component
function FolderTreeItem({ folder, level }) {
  const [expanded, setExpanded] = useState(level === 0);
  
  return (
    <div className="select-none">
      <div 
        className="flex items-center hover:bg-gray-50 py-1 rounded px-1 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-6 text-gray-400">
          {folder.children && folder.children.length > 0 && (
            expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )
          )}
        </div>
        
        <div className="w-5 h-5 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke={folder.color} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <Link href={`/mock-explorer?section=folders&id=${folder.id}`} className="hover:text-blue-600">
            {folder.name}
          </Link>
        </div>
        
        <div className="text-gray-400 text-xs">
          {folder.path}
        </div>
      </div>
      
      {expanded && folder.children && folder.children.length > 0 && (
        <div className="ml-2 pl-2 border-l border-gray-200 space-y-1 mt-1">
          {folder.children.map(child => (
            <FolderTreeItem 
              key={child.id} 
              folder={child} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Collections section
function CollectionsSection({ collectionId }) {
  const { data: collections, loading: collectionsLoading } = useApi(api.collections.getCollections);
  const { data: collectionContent, loading: contentLoading } = useApi(
    () => collectionId ? api.collections.getCollectionContents(collectionId) : Promise.resolve(null), 
    [collectionId]
  );

  if ((collectionId && contentLoading) || collectionsLoading) {
    return <div className="text-center py-6">Loading collections...</div>;
  }

  if (collectionId && collectionContent) {
    return (
      <div>
        <div className="mb-4">
          <Link 
            href="/mock-explorer?section=collections"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to collections
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-6">
          <div className="flex items-center mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
              style={{ backgroundColor: `${collectionContent.collection.color}20` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={collectionContent.collection.color} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{collectionContent.collection.name}</h2>
              <p className="text-sm text-gray-500">{collectionContent.collection.description}</p>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <div>
              <span className="text-xs text-gray-500 block">Created</span>
              <span className="text-sm">{new Date(collectionContent.collection.created).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Modified</span>
              <span className="text-sm">{new Date(collectionContent.collection.modified).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Items</span>
              <span className="text-sm">{collectionContent.collection.items.length}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Shared</span>
              <span className="text-sm">{collectionContent.collection.isShared ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {collectionContent.collection.isShared && (
            <div className="mb-6">
              <span className="text-xs text-gray-500 block mb-1">Shared with</span>
              <div className="flex -space-x-2">
                {collectionContent.collection.sharedWith.map((userId, index) => {
                  const user = mockData.users.find(u => u.id === userId);
                  return (
                    <div 
                      key={userId} 
                      className="w-8 h-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200"
                      title={user?.name || userId}
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-500">
                          {user?.name.charAt(0) || userId.charAt(0)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h3 className="text-lg font-medium text-gray-800 mb-3">Collection Items</h3>
          {collectionContent.contents.items.length === 0 ? (
            <div className="py-8 text-center text-gray-500">This collection is empty</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {collectionContent.contents.items.map(item => (
                <Link 
                  key={item.id}
                  href={`/mock-explorer?section=media&id=${item.id}`}
                  className="group block"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-400 transition-colors">
                    {item.type === 'image' ? (
                      <img 
                        src={item.thumbnail || item.url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 uppercase text-sm font-medium">
                          {item.type}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Collections</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections?.items.map(collection => (
          <Link 
            key={collection.id}
            href={`/mock-explorer?section=collections&id=${collection.id}`}
            className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div 
              className="h-2"
              style={{ backgroundColor: collection.color }}
            ></div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 hover:text-blue-600">
                {collection.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {collection.description}
              </p>
              <div className="flex space-x-4 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block">Items</span>
                  <span>{collection.items.length}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Created</span>
                  <span>{new Date(collection.created).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Shared</span>
                  <span>{collection.isShared ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Tags section
function TagsSection({ tagId }) {
  const { data: tags, loading: tagsLoading } = useApi(api.tags.getTags);
  const { data: tagMedia, loading: mediaLoading } = useApi(
    () => tagId ? api.tags.getMediaWithTag(tagId) : Promise.resolve(null), 
    [tagId]
  );

  if ((tagId && mediaLoading) || tagsLoading) {
    return <div className="text-center py-6">Loading tags...</div>;
  }

  if (tagId && tagMedia) {
    return (
      <div>
        <div className="mb-4">
          <Link 
            href="/mock-explorer?section=tags"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to tags
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-6">
          <div className="flex items-center mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
              style={{ backgroundColor: `${tagMedia.tag.color}20` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={tagMedia.tag.color} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">#{tagMedia.tag.name}</h2>
              <span className="text-sm text-gray-500">{tagMedia.media.length || tagMedia.media.items?.length || 0} items</span>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Tagged Media</h3>
          {(!tagMedia.media.length && !tagMedia.media.items?.length) ? (
            <div className="py-8 text-center text-gray-500">No media with this tag</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {(tagMedia.media.items || tagMedia.media).map(item => (
                <Link 
                  key={item.id}
                  href={`/mock-explorer?section=media&id=${item.id}`}
                  className="group block"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-400 transition-colors">
                    {item.type === 'image' ? (
                      <img 
                        src={item.thumbnail || item.url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 uppercase text-sm font-medium">
                          {item.type}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Tags</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {tags?.map(tag => (
              <Link 
                key={tag.id}
                href={`/mock-explorer?section=tags&id=${tag.id}`}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-50 border border-gray-200 transition-colors"
                style={{ backgroundColor: `${tag.color}10`, borderColor: `${tag.color}30` }}
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                ></span>
                <span>#{tag.name}</span>
                <span className="bg-white bg-opacity-80 px-1.5 py-0.5 rounded-full text-xs text-gray-700">
                  {tag.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Users section
function UsersSection({ userId }) {
  const { data: users, loading: usersLoading } = useApi(api.users.getUsers);
  const { data: user, loading: userLoading } = useApi(
    () => userId ? api.users.getUserById(userId) : Promise.resolve(null), 
    [userId]
  );

  if ((userId && userLoading) || usersLoading) {
    return <div className="text-center py-6">Loading users...</div>;
  }

  if (userId && user) {
    return (
      <div>
        <div className="mb-4">
          <Link 
            href="/mock-explorer?section=users"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to users
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-medium text-gray-500">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                <span className="text-gray-500">{user.email}</span>
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
            
            <div className="md:w-2/3 md:border-l md:border-gray-200 md:pl-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">User Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Created</span>
                    <span className="text-sm">{new Date(user.created).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Last Active</span>
                    <span className="text-sm">{new Date(user.lastActive).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Preferences</h3>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="grid grid-cols-2 gap-y-2">
                    <div>
                      <span className="text-xs text-gray-500 block">Theme</span>
                      <span className="text-sm capitalize">{user.preferences.theme}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">View Mode</span>
                      <span className="text-sm capitalize">{user.preferences.viewMode}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Grid Size</span>
                      <span className="text-sm capitalize">{user.preferences.gridSize}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Default Sort</span>
                      <span className="text-sm capitalize">{user.preferences.defaultSort}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Recent Folders</h3>
                  <div className="space-y-1">
                    {user.recentFolders.map(folderId => {
                      const folder = mockData.folders.find(f => f.id === folderId);
                      return folder ? (
                        <Link 
                          key={folderId}
                          href={`/mock-explorer?section=folders&id=${folderId}`}
                          className="flex items-center py-1 px-2 rounded hover:bg-gray-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke={folder.color} strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span className="text-sm hover:text-blue-600">{folder.name}</span>
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Recent Files</h3>
                  <div className="space-y-1">
                    {user.recentFiles.map(fileId => {
                      const file = mockData.media.find(m => m.id === fileId);
                      return file ? (
                        <Link 
                          key={fileId}
                          href={`/mock-explorer?section=media&id=${fileId}`}
                          className="flex items-center py-1 px-2 rounded hover:bg-gray-50"
                        >
                          <div className="w-5 h-5 mr-2 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {file.type === 'image' ? (
                              <img src={file.thumbnail || file.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-500 uppercase text-[8px] font-medium">
                                  {file.type.slice(0, 3)}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm truncate hover:text-blue-600">{file.name}</span>
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Users</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users?.map(user => (
          <Link 
            key={user.id}
            href={`/mock-explorer?section=users&id=${user.id}`}
            className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-medium text-gray-500">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 hover:text-blue-600">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {user.email}
                </p>
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// API Tests section
function ApiTestSection() {
  const [activeTest, setActiveTest] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isUsingRealApi, dataSource, config } = useDataSource();

  const tests = [
    { id: 'dataSource', name: 'Data Source Info', fn: () => Promise.resolve({ data: {
      isUsingRealApi,
      dataSource,
      apiBaseUrl: config.apiBaseUrl,
      config
    }}) },
    { id: 'getMedia', name: 'Get Media List', fn: () => api.media.getMedia({ page: 1, pageSize: 5 }) },
    { id: 'getMediaById', name: 'Get Media Item', fn: () => api.media.getMediaById('1') },
    { id: 'getFolders', name: 'Get Folders', fn: () => api.folders.getFolders() },
    { id: 'getFolderContents', name: 'Get Folder Contents', fn: () => api.folders.getFolderContents('5') },
    { id: 'getCollections', name: 'Get Collections', fn: () => api.collections.getCollections() },
    { id: 'getTags', name: 'Get Tags', fn: () => api.tags.getTags() },
    { id: 'getCurrentUser', name: 'Get Current User', fn: () => api.users.getCurrentUser() }
  ];

  const runTest = async (test) => {
    setActiveTest(test.id);
    setLoading(true);
    setError(null);
    
    try {
      const result = await test.fn();
      setTestResult(result);
    } catch (err) {
      setError(err);
      setTestResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">API Tests</h2>
      
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
        <div className="flex items-center">
          <div className="mr-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {dataSource} API
            </span>
          </div>
          <div className="text-sm text-blue-700">
            Currently using {isUsingRealApi ? 'real' : 'mock'} data from {isUsingRealApi ? config.apiBaseUrl : 'mock dataset'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Available Tests</h3>
          </div>
          <div className="p-2">
            {tests.map(test => (
              <button
                key={test.id}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  activeTest === test.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => runTest(test)}
              >
                {test.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Test Results</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-6 w-6 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-500">Running test...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error.message}</p>
                      {error.code && <p className="mt-1">Code: {error.code}</p>}
                      {error.status && <p className="mt-1">Status: {error.status}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : testResult ? (
              <div>
                <div className="mb-2 bg-green-50 text-green-800 text-sm p-2 rounded">
                  <div className="font-medium">Success!</div>
                  <div className="text-green-700">{testResult.message}</div>
                </div>
                <div className="overflow-auto max-h-96">
                  <pre className="bg-gray-800 text-gray-200 p-3 rounded text-xs whitespace-pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a test to run
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Config section
function ConfigSection() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Source Configuration</h2>
      
      <p className="mb-4">
        Configure how the application interacts with data sources. Toggle between real API and mock data,
        customize API endpoints, and configure mock behavior such as response delays and error simulation.
        Your settings will be saved to localStorage and persisted between sessions.
      </p>
      
      <DataSourceConfig />
      
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Documentation</h3>
        <p className="text-blue-600 mb-3">
          For more information about data source configuration, check the following resources:
        </p>
        <ul className="list-disc pl-5 text-blue-700">
          <li>
            <a
              href="/docs/data-source-configuration.md"
              target="_blank"
              className="underline hover:text-blue-800"
            >
              Data Source Configuration Documentation
            </a>
          </li>
          <li>
            <a
              href="/src/mocks/README.md"
              target="_blank"
              className="underline hover:text-blue-800"
            >
              Mock System Documentation
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}