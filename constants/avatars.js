// Avatar data for player profiles
// Images should be stored in assets/avatars/

export const AVATARS = [
  {
    id: 'health_potion',
    name: 'Health Potion',
    src: require('../assets/avatars/health_potion.png'),
    category: 'potions'
  },
  {
    id: 'medicine_bottle',
    name: 'Medicine Bottle',
    src: require('../assets/avatars/medicine_bottle.png'),
    category: 'containers'
  },
  {
    id: 'pill_capsule',
    name: 'Pill Capsule',
    src: require('../assets/avatars/pill_capsule.png'),
    category: 'medications'
  },
  {
    id: 'medical_tablet',
    name: 'Medical Tablet',
    src: require('../assets/avatars/medical_tablet.png'),
    category: 'digital'
  },
  {
    id: 'digital_stethoscope',
    name: 'Digital Stethoscope',
    src: require('../assets/avatars/digital_stethoscope.png'),
    category: 'equipment'
  },
  {
    id: 'smart_health_monitor',
    name: 'Smart Health Monitor',
    src: require('../assets/avatars/smart_health_monitor.png'),
    category: 'digital'
  }
];

// Helper function to get a random avatar
export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * AVATARS.length);
  return AVATARS[randomIndex];
};

// Default avatar for new players
export const DEFAULT_AVATAR = AVATARS[0].id; 