/**
 * Mock media data for the Media Library Manager
 * 
 * This file contains mock data for media items that simulates the structure
 * that would be returned from a real API call.
 * 
 * Images are sourced from Unsplash.com with proper attribution in the metadata.
 */

const media = [
  // Images - Core items
  { 
    id: '1', 
    type: 'image', 
    name: 'product-hero.jpg', 
    folder: '5', 
    path: 'Images/Products',
    size: '2.4 MB', 
    dimensions: '1920 x 1080',
    created: '2025-03-15',
    modified: '2025-04-02',
    used: true,
    usedIn: ['Homepage', 'Product Catalog'],
    tags: ['product', 'hero', 'featured'],
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=60',
    starred: true,
    favorited: true,
    status: 'approved',
    ai_tags: ['product', 'minimalist', 'white background', 'luxury item'],
    attribution: {
      photographer: 'C Dustin',
      profile: 'https://unsplash.com/@dustinc',
      source: 'Unsplash'
    }
  },
  { 
    id: '2', 
    type: 'image', 
    name: 'team-photo.jpg', 
    folder: '6', 
    path: 'Images/Team',
    size: '3.1 MB', 
    dimensions: '2400 x 1600',
    created: '2025-02-20',
    modified: '2025-02-20',
    used: true,
    usedIn: ['About Page', 'Team Page'],
    tags: ['team', 'people', 'corporate'],
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: false,
    status: 'approved',
    ai_tags: ['people', 'group', 'indoor', 'corporate', 'team meeting'],
    attribution: {
      photographer: 'Helena Lopes',
      profile: 'https://unsplash.com/@wildlittlethingsphoto',
      source: 'Unsplash'
    }
  },
  { 
    id: '3', 
    type: 'image', 
    name: 'banner-spring.jpg', 
    folder: '4', 
    path: 'Images/Marketing',
    size: '1.8 MB', 
    dimensions: '1500 x 500',
    created: '2025-03-01',
    modified: '2025-03-15',
    used: true,
    usedIn: ['Homepage'],
    tags: ['banner', 'spring', 'seasonal'],
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: true,
    status: 'approved',
    ai_tags: ['banner', 'colorful', 'spring', 'promotion', 'seasonal', 'flowers'],
    attribution: {
      photographer: 'Aaron Burden',
      profile: 'https://unsplash.com/@aaronburden',
      source: 'Unsplash'
    }
  },
  { 
    id: '6', 
    type: 'image', 
    name: 'social-post-summer.jpg', 
    folder: '15', 
    path: 'Images/Social Media/Instagram',
    size: '1.2 MB', 
    dimensions: '1080 x 1080',
    created: '2025-03-22',
    modified: '2025-03-22',
    used: true,
    usedIn: ['Instagram', 'Facebook'],
    tags: ['social', 'summer', 'promotion'],
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: true,
    status: 'approved',
    ai_tags: ['beach', 'summer', 'ocean', 'vacation', 'sunny'],
    attribution: {
      photographer: 'Sean O.',
      profile: 'https://unsplash.com/@seanobeyphoto',
      source: 'Unsplash'
    }
  },
  { 
    id: '8', 
    type: 'image', 
    name: 'hero-background.jpg', 
    folder: '13', 
    path: 'Images/Web Assets/Banners',
    size: '3.5 MB', 
    dimensions: '2400 x 1200',
    created: '2025-02-28',
    modified: '2025-03-01',
    used: true,
    usedIn: ['Homepage', 'Landing Page'],
    tags: ['hero', 'background', 'web'],
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=60',
    starred: true,
    favorited: false,
    status: 'approved',
    ai_tags: ['office', 'modern', 'corporate', 'architecture', 'business'],
    attribution: {
      photographer: 'Benjamin Child',
      profile: 'https://unsplash.com/@bchild311',
      source: 'Unsplash'
    }
  },
  { 
    id: '10', 
    type: 'image', 
    name: 'office-space.jpg', 
    folder: '6', 
    path: 'Images/Team',
    size: '2.8 MB', 
    dimensions: '2200 x 1467',
    created: '2025-01-30',
    modified: '2025-01-30',
    used: false,
    usedIn: [],
    tags: ['office', 'workspace', 'interior'],
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: false,
    status: 'pending',
    ai_tags: ['office', 'modern', 'workspace', 'corporate', 'empty'],
    attribution: {
      photographer: 'Nastuh Abootalebi',
      profile: 'https://unsplash.com/@sunday_digital',
      source: 'Unsplash'
    }
  },
  
  // Documents
  { 
    id: '4', 
    type: 'document', 
    name: 'annual-report-2024.pdf', 
    folder: '7', 
    path: 'Documents/Reports',
    size: '4.2 MB', 
    created: '2025-01-15',
    modified: '2025-01-15',
    used: false,
    usedIn: [],
    tags: ['report', 'annual', 'financial'],
    url: '/api/documents/4',
    thumbnail: '/file.svg',
    starred: true,
    favorited: false,
    status: 'approved',
    ai_tags: ['financial', 'report', 'corporate', 'annual'],
    metadata: {
      pages: 42,
      author: 'Finance Department'
    }
  },
  { 
    id: '7', 
    type: 'document', 
    name: 'legal-terms.docx', 
    folder: '8', 
    path: 'Documents/Contracts',
    size: '0.8 MB', 
    created: '2025-01-05',
    modified: '2025-02-15',
    used: true,
    usedIn: ['Legal Page'],
    tags: ['legal', 'terms', 'contract'],
    url: '/api/documents/7',
    thumbnail: '/file.svg',
    starred: false,
    favorited: false,
    status: 'approved',
    ai_tags: ['legal', 'document', 'terms', 'conditions'],
    metadata: {
      pages: 12,
      author: 'Legal Department',
      lastReviewed: '2025-02-15'
    }
  },
  { 
    id: '11', 
    type: 'document', 
    name: 'marketing-strategy.pptx', 
    folder: '4', 
    path: 'Images/Marketing',
    size: '12.3 MB', 
    created: '2025-03-10',
    modified: '2025-03-18',
    used: true,
    usedIn: ['Internal Docs'],
    tags: ['presentation', 'marketing', 'strategy'],
    url: '/api/documents/11',
    thumbnail: '/file.svg',
    starred: true,
    favorited: true,
    status: 'approved',
    ai_tags: ['presentation', 'strategy', 'marketing', 'slides'],
    metadata: {
      slides: 35,
      author: 'Marketing Team',
      version: 'v2.3'
    }
  },
  
  // Videos
  { 
    id: '5', 
    type: 'video', 
    name: 'product-tutorial.mp4', 
    folder: '9', 
    path: 'Videos/Tutorials',
    size: '28.4 MB', 
    dimensions: '1920 x 1080',
    duration: '2:45',
    created: '2025-02-10',
    modified: '2025-02-12',
    used: true,
    usedIn: ['Product Page', 'Help Center'],
    tags: ['tutorial', 'product', 'how-to'],
    url: '/api/videos/5',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: false,
    status: 'approved',
    ai_tags: ['tutorial', 'instructional', 'product demo', 'how-to'],
    metadata: {
      duration_seconds: 165,
      format: 'MP4',
      codec: 'H.264'
    },
    attribution: {
      creator: 'Product Team',
      source: 'Internal'
    }
  },
  { 
    id: '9', 
    type: 'video', 
    name: 'company-overview.mp4', 
    folder: '10', 
    path: 'Videos/Corporate',
    size: '45.2 MB', 
    dimensions: '1920 x 1080',
    duration: '3:30',
    created: '2025-02-05',
    modified: '2025-02-05',
    used: true,
    usedIn: ['About Page', 'Investor Relations'],
    tags: ['corporate', 'overview', 'company'],
    url: '/api/videos/9',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: true,
    status: 'approved',
    ai_tags: ['corporate', 'professional', 'business', 'overview'],
    metadata: {
      duration_seconds: 210,
      format: 'MP4',
      codec: 'H.264',
      subtitles: ['en', 'es', 'fr']
    },
    attribution: {
      creator: 'Video Production Team',
      source: 'Internal'
    }
  },
  { 
    id: '19', 
    type: 'video', 
    name: 'event-highlights.mov', 
    folder: '10', 
    path: 'Videos/Corporate',
    size: '150.8 MB', 
    dimensions: '3840 x 2160',
    duration: '5:15',
    created: '2025-01-28',
    modified: '2025-01-28',
    used: false,
    usedIn: [],
    tags: ['event', 'highlights', 'conference'],
    url: '/api/videos/19',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: false,
    status: 'draft',
    ai_tags: ['event', 'conference', 'corporate', 'presentation'],
    metadata: {
      duration_seconds: 315,
      format: 'MOV',
      codec: 'ProRes',
      resolution: '4K'
    },
    attribution: {
      creator: 'Event Team',
      source: 'Internal'
    }
  },
  
  // Different statuses and use cases
  { 
    id: '12', 
    type: 'image', 
    name: 'logo-variations.svg', 
    folder: '12', 
    path: 'Images/Branding/Logos',
    size: '0.2 MB', 
    dimensions: 'Vector',
    created: '2024-12-01',
    modified: '2025-01-10',
    used: true,
    usedIn: ['All Pages', 'Email Templates', 'Documents'],
    tags: ['logo', 'branding', 'vector'],
    url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=60',
    starred: true,
    favorited: true,
    status: 'approved',
    ai_tags: ['logo', 'brand', 'identity', 'vector', 'minimal'],
    metadata: {
      format: 'SVG',
      variations: ['color', 'black', 'white', 'monochrome']
    }
  },
  { 
    id: '15', 
    type: 'image', 
    name: 'product-lifestyle.jpg', 
    folder: '5', 
    path: 'Images/Products',
    size: '4.1 MB', 
    dimensions: '2800 x 1867',
    created: '2025-03-20',
    modified: '2025-03-20',
    used: false,
    usedIn: [],
    tags: ['product', 'lifestyle', 'photography'],
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: false,
    status: 'pending',
    ai_tags: ['product', 'watch', 'luxury', 'minimalist', 'lifestyle'],
    attribution: {
      photographer: 'Rachit Tank',
      profile: 'https://unsplash.com/@rachitank',
      source: 'Unsplash'
    }
  },
  { 
    id: '17', 
    type: 'image', 
    name: 'blog-header-tech.jpg', 
    folder: '17', 
    path: 'Images/Blog/Headers',
    size: '2.2 MB', 
    dimensions: '1920 x 600',
    created: '2025-03-25',
    modified: '2025-03-25',
    used: true,
    usedIn: ['Blog Post: Future of AI'],
    tags: ['blog', 'header', 'technology'],
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: false,
    status: 'approved',
    ai_tags: ['technology', 'futuristic', 'digital', 'network', 'abstract'],
    attribution: {
      photographer: 'Luca Bravo',
      profile: 'https://unsplash.com/@lucabravo',
      source: 'Unsplash'
    }
  },
  
  // Audio files
  { 
    id: '20', 
    type: 'audio', 
    name: 'podcast-episode-01.mp3', 
    folder: '11', 
    path: 'Audio/Podcasts',
    size: '32.5 MB', 
    duration: '35:22',
    created: '2025-02-15',
    modified: '2025-02-15',
    used: true,
    usedIn: ['Podcast Page', 'Blog'],
    tags: ['podcast', 'audio', 'interview'],
    url: '/api/audio/20',
    thumbnail: '/audio.svg',
    starred: false,
    favorited: true,
    status: 'approved',
    ai_tags: ['podcast', 'interview', 'discussion', 'audio'],
    metadata: {
      duration_seconds: 2122,
      format: 'MP3',
      bitrate: '128kbps',
      episode: 1,
      season: 1
    }
  },
  
  // Different image contexts
  { 
    id: '25', 
    type: 'image', 
    name: 'infographic-stats.png', 
    folder: '4', 
    path: 'Images/Marketing',
    size: '1.5 MB', 
    dimensions: '1200 x 1800',
    created: '2025-03-05',
    modified: '2025-03-08',
    used: true,
    usedIn: ['Blog', 'Social Media'],
    tags: ['infographic', 'data', 'statistics'],
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&auto=format&fit=crop&q=60',
    starred: true,
    favorited: false,
    status: 'approved',
    ai_tags: ['chart', 'data', 'visualization', 'business', 'analytics'],
    attribution: {
      photographer: 'Luke Chesser',
      profile: 'https://unsplash.com/@lukechesser',
      source: 'Unsplash'
    }
  },
  { 
    id: '30', 
    type: 'image', 
    name: 'customer-testimonial.jpg', 
    folder: '6', 
    path: 'Images/Team',
    size: '1.9 MB', 
    dimensions: '1600 x 1600',
    created: '2025-02-25',
    modified: '2025-02-25',
    used: true,
    usedIn: ['Testimonials Page', 'Homepage'],
    tags: ['testimonial', 'customer', 'portrait'],
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: false,
    status: 'approved',
    ai_tags: ['person', 'professional', 'portrait', 'business', 'confident'],
    attribution: {
      photographer: 'Austin Distel',
      profile: 'https://unsplash.com/@austindistel',
      source: 'Unsplash'
    }
  },
  { 
    id: '35', 
    type: 'image', 
    name: 'workshop-photo.jpg', 
    folder: '16', 
    path: 'Images/Events',
    size: '3.3 MB', 
    dimensions: '2400 x 1600',
    created: '2025-01-20',
    modified: '2025-01-20',
    used: false,
    usedIn: [],
    tags: ['event', 'workshop', 'training'],
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=200&auto=format&fit=crop&q=60',
    starred: false,
    favorited: false,
    status: 'draft',
    ai_tags: ['workshop', 'collaboration', 'teamwork', 'creative', 'brainstorming'],
    attribution: {
      photographer: 'Mapbox',
      profile: 'https://unsplash.com/@mapbox',
      source: 'Unsplash'
    }
  }
];

export default media;