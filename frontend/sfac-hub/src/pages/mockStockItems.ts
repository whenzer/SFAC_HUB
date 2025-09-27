// Define type for stock items
interface StockItem {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  currentStock: number;
  totalStock: number;
  status: 'Available' | 'Low' | 'Out';
  lastUpdated: string;
  image: string;
}

// Mock data for stock items
const stockItems: StockItem[] = [ 
  {
    id: 1,
    name: 'School Uniform - Small',
    description: 'Official SFAC uniform shirt, size small',
    category: 'Uniforms',
    location: 'Storage Room A',
    currentStock: 25,
    totalStock: 30,
    status: 'Available',
    lastUpdated: '2 hours ago',
    image: 'https://picsum.photos/200?random=1'
  },
  {
    id: 2,
    name: 'Programming Fundamentals Textbook',
    description: 'Latest edition programming textbook',
    category: 'Books & Materials',
    location: 'Library - Section B',
    currentStock: 3,
    totalStock: 20,
    status: 'Low',
    lastUpdated: '1 day ago',
    image: 'https://picsum.photos/200?random=2'
  },
  {
    id: 3,
    name: 'Laptop - Dell XPS 13',
    description: 'Dell XPS 13 laptop for student use',
    category: 'Electronics',
    location: 'IT Department - Counter 2',
    currentStock: 0,
    totalStock: 10,
    status: 'Out',
    lastUpdated: '3 hours ago',
    image: 'https://picsum.photos/200?random=3'
  },
  {
    id: 4,
    name: 'Graphing Calculator - TI-84 Plus',
    description: 'Texas Instruments TI-84 Plus graphing calculator',
    category: 'Electronics',
    location: 'Math Lab - Cabinet 4',
    currentStock: 12,
    totalStock: 15,
    status: 'Available',
    lastUpdated: '45 minutes ago',
    image: 'https://picsum.photos/200?random=4'
  },
  {
    id: 5,
    name: 'Chemistry Lab Kit',
    description: 'Complete chemistry lab kit with safety equipment',
    category: 'Laboratory Equipment',
    location: 'Science Lab - Room 203',
    currentStock: 1,
    totalStock: 5,
    status: 'Low',
    lastUpdated: 'Yesterday',
    image: 'https://picsum.photos/200?random=5'
  },
  {
    id: 6,
    name: 'Sports Jersey - Basketball Team',
    description: 'Official SFAC basketball team jersey',
    category: 'Sports Equipment',
    location: 'Gymnasium - Locker Room',
    currentStock: 8,
    totalStock: 20,
    status: 'Available',
    lastUpdated: '3 days ago',
    image: 'https://picsum.photos/200?random=6'
  }
];

export default stockItems;