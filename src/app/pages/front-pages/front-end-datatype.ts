interface Framework {
  src: string;
  alt: string;
  tooltip: string;
}
interface followercards {
  id: number;
  icon: string;
  title: string;
  text_color: string;
  bg_color: string;
}

interface testimonials {
  id: number;
  name: string;
  subtext: string;
  imgSrc: string;
}

interface productcards {
  id: number;
  imgSrc: string;
  title: string;
  price: string;
  rprice: string;
  date:string;
}
interface faqItems {
  question: string;
  answer: string;
}

  export const frameworks: Framework[] = [
    {
      src: 'assets/images/front-end/angular.svg',
      alt: 'Angular',
      tooltip: 'Angular',
    },
    {
      src: 'assets/images/front-end/material.svg',
      alt: 'Angular Material',
      tooltip: 'Angular Material',
    },
    {
      src: 'assets/images/front-end/logo-ts.svg',
      alt: 'Typescript',
      tooltip: 'Typescript',
    },
    {
      src: 'assets/images/front-end/icon-tabler.svg',
      alt: 'Tabler Icon',
      tooltip: 'Tabler Icon',
    },
    {
      src: 'assets/images/front-end/icon-bootstrap.svg',
      alt: 'Bootstrap',
      tooltip: 'Bootstrap',
    },
    {
      src: 'assets/images/front-end/icon-sass.svg',
      alt: 'Sass',
      tooltip: 'Sass',
    },
  ];

  export const stats = [
    {
      id: 1,
      label: 'Expert Advisor',
      description: 'Suspendisse vestibulum eu erat ac scelerisque.',
      bg_color: 'error',
      icon: 'chart-bubble',
      color: 'text-error',
    },
    {
      id: 2,
      label: 'Effective Support',
      description: 'Suspendisse vestibulum eu erat ac scelerisque.',
      bg_color: 'primary',
      icon: 'building-store',
      color: 'text-primary',
    },
    {
      id: 3,
      label: 'Low Fees',
      description: 'Suspendisse vestibulum eu erat ac scelerisque.',
      bg_color: 'secondary',
      icon: 'category-2',
      color: 'text-secondary',
    },
    {
      id: 4,
      label: 'Loan Facility',
      description: 'Suspendisse vestibulum eu erat ac scelerisque.',
      bg_color: '--mat-sys-outline-variant',
      icon: 'activity-heartbeat',
      color: 'text-dark',
    },
  ];

  export const team = [
    {
      id: 1,
      name: 'Alex Martinez',
      position: 'CEO & Co-Founder',
      image: 'assets/images/front-end/user1.jpg',
    },
    {
      id: 2,
      name: 'Jordan Nguyen',
      position: 'CTO & Co-Founder',
      image: 'assets/images/front-end/user2.jpg',
    },
    {
      id: 3,
      name: 'Taylor Roberts',
      position: 'Product Manager',
      image: 'assets/images/front-end/user3.jpg',
    },
    {
      id: 4,
      name: 'Morgan Patel',
      position: 'Lead Developer',
      image: 'assets/images/front-end/user4.jpg',
    },
  ];


  export const support = [
   {
      id: 1,
      label: 'Safe Water',
      description: 'Ensuring Clean Water for the People of the Maldives.',
      bg_color: 'primary',
      icon: 'building-store',
      color: 'text-primary',
    },
    {
      id: 2,
      label: 'Waste water',
      description: 'Ensuring Proper Wastewater Management for a Cleaner Environment.',
      bg_color: 'error',
      icon: 'chart-bubble',
      color: 'text-error',
    },
   
    {
      id: 3,
      label: 'Waste management',
      description: 'Efficient and Sustainable Waste Management Solutions.',
      bg_color: 'secondary',
      icon: 'category-2',
      color: 'text-secondary',
    },
    {
      id: 4,
      label: 'Elecetricity',
      description: 'Powering the Maldives with Reliable Electricity.',
      bg_color: '--mat-sys-outline-variant',
      icon: 'activity-heartbeat',
      color: 'text-dark',
    },
  ];

  export const records = [
    {
      id:1,
      title:'2019',
      subtitle:'When we founded eServices'
    },
     {
      id:2,
      title:'300k+',
      subtitle:'Customers on eServices'
    },
     {
      id:3,
      title:'25k+',
      subtitle:'Applications processed'
    }
  ];

  const descriptions = [
  "Booster Replacement",
  "Booster New Connection",
  "Electricity New Connection",
  "Sewerage New Connection",
  "Water New Connection",
  "Waste New Connection"
];

  // export const  followercardsFirst: followercards[] = [
  //   {
  //     id: 1,
  //     icon: 'arrows-shuffle-2',
  //     title: '',
  //     text_color: 'text-primary',
  //     bg_color: 'bg-light-primary',
  //   },
  //   {
  //     id: 2,
  //     icon: 'wand',
  //     title: 'Dard & Light Sidebar',
  //     text_color: 'text-error',
  //     bg_color: 'bg-light-error',
  //   },
  //   {
  //     id: 3,
  //     icon: 'table',
  //     title: '425+ Page Templates',
  //     text_color: 'text-secondary',
  //     bg_color: 'bg-light-secondary',
  //   },
  //   {
  //     id: 4,
  //     icon: 'stack',
  //     title: '150+ UI Component',
  //     text_color: 'text-success',
  //     bg_color: 'bg-light-success',
  //   },
  //   {
  //     id: 5,
  //     icon: 'puzzle',
  //     title: '6 Themes Colors',
  //     text_color: 'text-warning',
  //     bg_color: 'bg-light-warning',
  //   },
  //   {
  //     id: 6,
  //     icon: 'arrows-shuffle-2',
  //     title: 'Dard & Light Sidebar',
  //     text_color: 'text-primary',
  //     bg_color: 'bg-light-primary',
  //   },
  //   {
  //     id: 7,
  //     icon: 'wand',
  //     title: '50+ UI Components',
  //     text_color: 'text-error',
  //     bg_color: 'bg-light-error',
  //   },
  //   {
  //     id: 8,
  //     icon: 'table',
  //     title: '65+ pages Templates',
  //     text_color: 'text-success',
  //     bg_color: 'bg-light-success',
  //   },
  //   {
  //     id: 9,
  //     icon: 'stack',
  //     title: '6 Themes Colors',
  //     text_color: 'text-secondary',
  //     bg_color: 'bg-light-secondary',
  //   },
  //   {
  //     id: 10,
  //     icon: 'puzzle',
  //     title: 'Dard & Light Sidebar',
  //     text_color: 'text-warning',
  //     bg_color: 'bg-light-warning',
  //   },
  // ];
  export const followercardsFirst: followercards[] = [
  {
    id: 1,
    icon: 'arrows-shuffle-2',
    title: 'Booster Replacement',
    text_color: 'text-primary',
    bg_color: 'bg-light-primary',
  },
  {
    id: 2,
    icon: 'wand',
    title: 'Booster New Connection',
    text_color: 'text-error',
    bg_color: 'bg-light-error',
  },
  {
    id: 3,
    icon: 'table',
    title: 'Electricity New Connection',
    text_color: 'text-secondary',
    bg_color: 'bg-light-secondary',
  },
  {
    id: 4,
    icon: 'stack',
    title: 'Sewerage New Connection',
    text_color: 'text-success',
    bg_color: 'bg-light-success',
  },
  {
    id: 5,
    icon: 'puzzle',
    title: 'Water New Connection',
    text_color: 'text-warning',
    bg_color: 'bg-light-warning',
  },
  {
    id: 6,
    icon: 'arrows-shuffle-2',
    title: 'Waste New Connection',
    text_color: 'text-primary',
    bg_color: 'bg-light-primary',
  },
  // If you want, the remaining cards can keep their original titles or repeat descriptions
  {
    id: 7,
    icon: 'wand',
    title: 'Booster Replacement',
    text_color: 'text-error',
    bg_color: 'bg-light-error',
  },
  {
    id: 8,
    icon: 'table',
    title: 'Booster New Connection',
    text_color: 'text-success',
    bg_color: 'bg-light-success',
  },
  {
    id: 9,
    icon: 'stack',
    title: 'Electricity New Connection',
    text_color: 'text-secondary',
    bg_color: 'bg-light-secondary',
  },
  {
    id: 10,
    icon: 'puzzle',
    title: 'Sewerage New Connection',
    text_color: 'text-warning',
    bg_color: 'bg-light-warning',
  },
];



export const followercardsSecond: followercards[] = [
  {
    id: 1,
    icon: 'diamonds',
    title: descriptions[0],
    text_color: 'text-warning',
    bg_color: 'bg-light-warning',
  },
  {
    id: 2,
    icon: 'device-mobile',
    title: descriptions[1],
    text_color: 'text-error',
    bg_color: 'bg-light-error',
  },
  {
    id: 3,
    icon: 'source-code',
    title: descriptions[2],
    text_color: 'text-secondary',
    bg_color: 'bg-light-secondary',
  },
  {
    id: 4,
    icon: 'tag',
    title: descriptions[3],
    text_color: 'text-success',
    bg_color: 'bg-light-success',
  },
  {
    id: 5,
    icon: 'diamonds',
    title: descriptions[4],
    text_color: 'text-primary',
    bg_color: 'bg-light-primary',
  },
  {
    id: 6,
    icon: 'device-mobile',
    title: descriptions[5],
    text_color: 'text-error',
    bg_color: 'bg-light-error',
  },
  {
    id: 7,
    icon: 'source-code',
    title: descriptions[0],
    text_color: 'text-secondary',
    bg_color: 'bg-light-secondary',
  },
  {
    id: 8,
    icon: 'tag',
    title: descriptions[1],
    text_color: 'text-success',
    bg_color: 'bg-light-success',
  },
  {
    id: 9,
    icon: 'diamonds',
    title: descriptions[2],
    text_color: 'text-primary',
    bg_color: 'bg-light-primary',
  },
  {
    id: 10,
    icon: 'device-mobile',
    title: descriptions[3],
    text_color: 'text-warning',
    bg_color: 'bg-light-warning',
  },
];

// followercardsThird
export const followercardsThird: followercards[] = [
  {
    id: 1,
    icon: 'repeat',
    title: descriptions[0],
    text_color: 'text-warning',
    bg_color: 'bg-light-warning',
  },
  {
    id: 2,
    icon: 'messages',
    title: descriptions[1],
    text_color: 'text-error',
    bg_color: 'bg-light-error',
  },
  {
    id: 3,
    icon: 'toggle-left',
    title: descriptions[2],
    text_color: 'text-secondary',
    bg_color: 'bg-light-secondary',
  },
  {
    id: 4,
    icon: 'table',
    title: descriptions[3],
    text_color: 'text-success',
    bg_color: 'bg-light-success',
  },
  {
    id: 5,
    icon: 'chart-pie-3',
    title: descriptions[4],
    text_color: 'text-primary',
    bg_color: 'bg-light-primary',
  },
  {
    id: 6,
    icon: 'repeat',
    title: descriptions[5],
    text_color: 'text-warning',
    bg_color: 'bg-light-warning',
  },
  {
    id: 7,
    icon: 'messages',
    title: descriptions[0],
    text_color: 'text-error',
    bg_color: 'bg-light-error',
  },
  {
    id: 8,
    icon: 'toggle-left',
    title: descriptions[1],
    text_color: 'text-secondary',
    bg_color: 'bg-light-secondary',
  },
  {
    id: 9,
    icon: 'table',
    title: descriptions[2],
    text_color: 'text-success',
    bg_color: 'bg-light-success',
  },
  {
    id: 10,
    icon: 'chart-pie-3',
    title: descriptions[3],
    text_color: 'text-primary',
    bg_color: 'bg-light-primary',
  },
];


export const faqItems: faqItems[] = [
  {
    question: "Why is my water bill higher than usual?",
    answer: "Water bills can rise due to increased usage, construction, leaks in plumbing, or changes in use habits. Checking for internal leaks may help explain higher bills."
  },
  {
    question: "How can I get a hard copy of my water bill?",
    answer: "You can obtain a physical copy of your bill via self-service kiosks, the MWSC mobile app, or the MWSC portal."
  }
];

  export const brandLogos = [
    'assets/images/front-end/icon-intel.svg',
    'assets/images/front-end/icon-oracle.svg',
    'assets/images/front-end/icon-dell.svg',
    'assets/images/front-end/icon-samsung.svg',
    'assets/images/front-end/icon-infosys.svg',
    'assets/images/front-end/icon-capgemini.svg',
  ];



    export const testimonials: testimonials[] = [
    {
      id: 1,
      imgSrc: '/assets/images/profile/user-1.jpg',
      name: 'Ajit Singh',
      subtext:
        'The theme is very flexible with most of the content already available. And also the support team is very active. :)',
    },
    {
      id: 2,
      imgSrc: '/assets/images/profile/user-2.jpg',
      name: 'Kévin PEREZ',
      subtext:
        'This design is really good. The code is good. Its easy to start with it when we are new with Angular. Like this theme because its a material theme !',
    },
    {
      id: 3,
      imgSrc: '/assets/images/profile/user-3.jpg',
      name: 'Jikes Sam',
      subtext:
        'I am using the MatDash angular admin, and its feature rich, easy to use and saves a ton of time. The Support Team is great.',
    },
     {
      id: 4,
      imgSrc: '/assets/images/profile/user-1.jpg',
      name: 'Ajit Singh',
      subtext:
        'The theme is very flexible with most of the content already available. And also the support team is very active. :)',
    }
  ];

export const productcards: productcards[] = [
    { id: 1, imgSrc: 'assets/images/products/s1.jpg', title: 'Boat Headphone', price: '285', rprice: '375', date: 'Tue, Apr 03, 2025' },
    { id: 2, imgSrc: 'assets/images/products/s2.jpg', title: 'MacBook Air Pro', price: '285', rprice: '375', date: 'Tue, Apr 10, 2025' },
    { id: 3, imgSrc: 'assets/images/products/s3.jpg', title: 'Red Velvet Dress', price: '285', rprice: '375', date: 'Tue, Apr 15, 2025' },
    { id: 4, imgSrc: 'assets/images/products/s4.jpg', title: 'Soft Plush Teddy', price: '285', rprice: '375', date: 'Tue, Apr 12, 2025' },
    { id: 5, imgSrc: 'assets/images/products/s5.jpg', title: 'Boat Bass Booster', price: '285', rprice: '375', date: 'Tue, Apr 14, 2025' },
    { id: 6, imgSrc: 'assets/images/products/s6.jpg', title: 'MacBook Ultra Slim', price: '285', rprice: '375', date: 'Tue, Apr 18, 2025' },
    { id: 7, imgSrc: 'assets/images/products/s7.jpg', title: 'Crimson Party Dress', price: '285', rprice: '375', date: 'Tue, Apr 20, 2025' },
    { id: 8, imgSrc: 'assets/images/products/s8.jpg', title: 'Cuddly Teddy Gift', price: '285', rprice: '375', date: 'Tue, Apr 22, 2025' },
    { id: 9, imgSrc: 'assets/images/products/s9.jpg', title: 'Boat Sonic Headset', price: '285', rprice: '375', date: 'Tue, Apr 25, 2025' },
    { id: 10, imgSrc: 'assets/images/products/s10.jpg', title: 'MacBook Pro 2025', price: '285', rprice: '375', date: 'Tue, Apr 27, 2025' },
    { id: 11, imgSrc: 'assets/images/products/s1.jpg', title: 'Evening Gown - Red', price: '285', rprice: '375', date: 'Tue, Apr 29, 2025' },
    { id: 12, imgSrc: 'assets/images/products/s2.jpg', title: 'Fluffy Bear Surprise', price: '285', rprice: '375', date: 'Tue, Apr 30, 2025' },
  ];



  export const paymentLogos = [
  { src: 'assets/images/front-end/icon-visa.svg', alt: 'visa', tooltip: 'Visa' },
  {
    src: 'assets/images/front-end/icon-mastercard.svg',
    alt: 'mastercard',
    tooltip: 'Master Card',
  },
  {
    src: 'assets/images/front-end/icon-american-express.svg',
    alt: 'american express',
    tooltip: 'American Express',
  },
  {
    src: 'assets/images/front-end/icon-discover.svg',
    alt: 'discover',
    tooltip: 'Discover',
  },
  {
    src: 'assets/images/front-end/icon-paypal.svg',
    alt: 'paypal',
    tooltip: 'Paypal',
  },
  {
    src: 'assets/images/front-end/icon-masetro.svg',
    alt: 'maestro',
    tooltip: 'Maestro',
  },
  { src: 'assets/images/front-end/icon-jcb.svg', alt: 'jcb', tooltip: 'JCB' },
  {
    src: 'assets/images/front-end/icon-diners.svg',
    alt: 'diners',
    tooltip: 'Diners',
  },
];


 export const plans = [
  {
    title: 'Single Use',
    description:
      'Use for single end product which end users can’t be charged for.',
    price: 49,
    period: 'one time pay',
    features: [
      { text: 'Full source code', included: true },
      { text: 'Documentation', included: true },
      { text: 'Use in SaaS app', included: false },
      { text: 'One Project', included: true, bold: true },
      { text: 'One Year Technical Support', included: true },
      { text: 'One Year Free Updates', included: true },
    ],
  },
  {
    title: 'Multiple Use',
    description:
      'Use for unlimited end products end users can’t be charged for.',
    price: 89,
    period: 'one time pay',
    features: [
      { text: 'Full source code', included: true },
      { text: 'Documentation', included: true },
      { text: 'Use in SaaS app', included: false },
      { text: 'Unlimited Project', included: true, bold: true },
      { text: 'One Year Technical Support', included: true },
      { text: 'One Year Free Updates', included: true },
    ],
  },
  {
    title: 'Extended Use',
    description:
      'Use for single end product which end users can be charged for.',
    price: 299,
    period: 'one time pay',
    popular: true,
    features: [
      { text: 'Full source code', included: true },
      { text: 'Documentation', included: true },
      { text: 'Use in SaaS app', included: true },
      { text: 'One Project', included: true, bold: true },
      { text: 'One Year Technical Support', included: true },
      { text: 'One Year Free Updates', included: true },
    ],
  },
  {
    title: 'Unlimited Use',
    description:
      'Use in unlimited end products end users can be charged for.',
    price: 499,
    period: 'one time pay',
    features: [
      { text: 'Full source code', included: true },
      { text: 'Documentation', included: true },
      { text: 'Use in SaaS app', included: true },
      { text: 'Unlimited Project', included: true, bold: true },
      { text: 'One Year Technical Support', included: true },
      { text: 'One Year Free Updates', included: true },
    ],
  },
];