// Icon set using react-icons
import PropTypes from 'prop-types';
import { 
  FaCoins, 
  FaTrophy, 
  FaShoppingCart, 
  FaAward, 
  FaLock, 
  FaCheckCircle, 
  FaBolt, 
  FaStar, 
  FaCode, 
  FaGamepad, 
  FaUsers, 
  FaBullseye, 
  FaShieldAlt, 
  FaUser, 
  FaMedal, 
  FaTh, 
  FaPhone, 
  FaEnvelope, 
  FaCrown, 
  FaArrowLeft, 
  FaClock, 
  FaPlus, 
  FaTimes, 
  FaTrash, 
  FaEdit, 
  FaSave,
  FaGift,
  FaLockOpen,
  FaKey,
  FaFingerprint,
  FaServer,
  FaDatabase,
  FaFileCode,
  FaNetworkWired,
  FaCodeBranch,
  FaLaptopCode,
  FaRobot,
  FaBrain,
  FaPuzzlePiece,
  FaCube,
  FaCog,
  FaWifi,
  FaRss,
  FaEye,
  FaEyeSlash,
  FaUserSecret,
  FaUserAstronaut,
  FaUserNinja,
  FaUserTie,
  FaUserGraduate,
  FaUserShield,
  FaRocket,
  FaFire,
  FaGem,
  FaTheaterMasks,
  FaPalette,
  FaMagic,
  FaGhost,
  FaDragon,
  FaHatWizard,
  FaStar as FaStarOfLife,
  FaCircle,
  FaCog as FaSettings,
} from 'react-icons/fa';
import { 
  SiBitcoin,
  SiEthereum,
  SiMonero,
  SiLitecoin,
} from 'react-icons/si';
import { 
  MdSecurity,
  MdLock,
  MdLockOpen,
  MdVpnKey,
  MdFingerprint,
  MdShield,
  MdVerifiedUser,
  MdAdminPanelSettings,
  MdSettings,
} from 'react-icons/md';
import { 
  HiLockClosed,
  HiLockOpen,
  HiKey,
  HiFingerPrint,
  HiShieldCheck,
  HiServer,
  HiCog,
  HiCpuChip,
  HiCommandLine,
  HiCodeBracket,
} from 'react-icons/hi2';

// Wrapper component for icons with className support
const IconWrapper = ({ icon: Icon, className = '' }) => (
  <Icon className={`inline-flex items-center justify-center ${className}`} aria-hidden="true" />
);

IconWrapper.propTypes = {
  icon: PropTypes.elementType.isRequired,
  className: PropTypes.string,
};

// Basic icons
export const Coins = (props) => <IconWrapper icon={FaCoins} {...props} />;
export const Trophy = (props) => <IconWrapper icon={FaTrophy} {...props} />;
export const ShoppingCart = (props) => <IconWrapper icon={FaShoppingCart} {...props} />;
export const Award = (props) => <IconWrapper icon={FaAward} {...props} />;
export const Lock = (props) => <IconWrapper icon={FaLock} {...props} />;
export const CheckCircle2 = (props) => <IconWrapper icon={FaCheckCircle} {...props} />;
export const Zap = (props) => <IconWrapper icon={FaBolt} {...props} />;
export const Star = (props) => <IconWrapper icon={FaStar} {...props} />;
export const Code = (props) => <IconWrapper icon={FaCode} {...props} />;
export const Gamepad2 = (props) => <IconWrapper icon={FaGamepad} {...props} />;
export const Users = (props) => <IconWrapper icon={FaUsers} {...props} />;
export const Target = (props) => <IconWrapper icon={FaBullseye} {...props} />;
export const Sparkles = (props) => <IconWrapper icon={FaStar} {...props} />;
export const Shield = (props) => <IconWrapper icon={FaShieldAlt} {...props} />;
export const User = (props) => <IconWrapper icon={FaUser} {...props} />;
export const Medal = (props) => <IconWrapper icon={FaMedal} {...props} />;
export const Grid3x3 = (props) => <IconWrapper icon={FaTh} {...props} />;
export const Phone = (props) => <IconWrapper icon={FaPhone} {...props} />;
export const Mail = (props) => <IconWrapper icon={FaEnvelope} {...props} />;
export const Crown = (props) => <IconWrapper icon={FaCrown} {...props} />;
export const ArrowLeft = (props) => <IconWrapper icon={FaArrowLeft} {...props} />;
export const Clock = (props) => <IconWrapper icon={FaClock} {...props} />;
export const Plus = (props) => <IconWrapper icon={FaPlus} {...props} />;
export const X = (props) => <IconWrapper icon={FaTimes} {...props} />;
export const Trash2 = (props) => <IconWrapper icon={FaTrash} {...props} />;
export const Edit2 = (props) => <IconWrapper icon={FaEdit} {...props} />;
export const Save = (props) => <IconWrapper icon={FaSave} {...props} />;
export const Gift = (props) => <IconWrapper icon={FaGift} {...props} />;
export const LockOpen = (props) => <IconWrapper icon={FaLockOpen} {...props} />;
export const Key = (props) => <IconWrapper icon={FaKey} {...props} />;
export const Fingerprint = (props) => <IconWrapper icon={FaFingerprint} {...props} />;
export const Settings = (props) => <IconWrapper icon={FaSettings} {...props} />;
export const Circle = (props) => <IconWrapper icon={FaCircle} {...props} />;
export const Fire = (props) => <IconWrapper icon={FaFire} {...props} />;
export const Rocket = (props) => <IconWrapper icon={FaRocket} {...props} />;
export const Gem = (props) => <IconWrapper icon={FaGem} {...props} />;
export const TheaterMasks = (props) => <IconWrapper icon={FaTheaterMasks} {...props} />;
export const Palette = (props) => <IconWrapper icon={FaPalette} {...props} />;
export const Magic = (props) => <IconWrapper icon={FaMagic} {...props} />;
export const Ghost = (props) => <IconWrapper icon={FaGhost} {...props} />;
export const Dragon = (props) => <IconWrapper icon={FaDragon} {...props} />;
export const HatWizard = (props) => <IconWrapper icon={FaHatWizard} {...props} />;
export const StarOfLife = (props) => <IconWrapper icon={FaStarOfLife} {...props} />;
export const UserSecret = (props) => <IconWrapper icon={FaUserSecret} {...props} />;

// Cryptography-related icons for category selection
export const cryptographyIcons = [
  { name: 'Lock', icon: FaLock, value: 'lock' },
  { name: 'Lock Open', icon: FaLockOpen, value: 'lock-open' },
  { name: 'Key', icon: FaKey, value: 'key' },
  { name: 'Fingerprint', icon: FaFingerprint, value: 'fingerprint' },
  { name: 'Shield', icon: FaShieldAlt, value: 'shield' },
  { name: 'Code', icon: FaCode, value: 'code' },
  { name: 'Terminal', icon: FaCode, value: 'terminal' },
  { name: 'Server', icon: FaServer, value: 'server' },
  { name: 'Database', icon: FaDatabase, value: 'database' },
  { name: 'File Code', icon: FaFileCode, value: 'file-code' },
  { name: 'Network', icon: FaNetworkWired, value: 'network' },
  { name: 'Code Branch', icon: FaCodeBranch, value: 'code-branch' },
  { name: 'Laptop Code', icon: FaLaptopCode, value: 'laptop-code' },
  { name: 'Robot', icon: FaRobot, value: 'robot' },
  { name: 'Brain', icon: FaBrain, value: 'brain' },
  { name: 'Puzzle', icon: FaPuzzlePiece, value: 'puzzle' },
  { name: 'Cube', icon: FaCube, value: 'cube' },
  { name: 'Cog', icon: FaCog, value: 'cog' },
  { name: 'Wifi', icon: FaWifi, value: 'wifi' },
  { name: 'RSS', icon: FaRss, value: 'rss' },
  { name: 'Eye', icon: FaEye, value: 'eye' },
  { name: 'Eye Slash', icon: FaEyeSlash, value: 'eye-slash' },
  { name: 'User Secret', icon: FaUserSecret, value: 'user-secret' },
  { name: 'Shield Check', icon: HiShieldCheck, value: 'shield-check' },
  { name: 'Security', icon: MdSecurity, value: 'security' },
  { name: 'Vpn Key', icon: MdVpnKey, value: 'vpn-key' },
  { name: 'Verified User', icon: MdVerifiedUser, value: 'verified-user' },
  { name: 'Admin Panel', icon: MdAdminPanelSettings, value: 'admin-panel' },
  { name: 'Command Line', icon: HiCommandLine, value: 'command-line' },
  { name: 'Code Bracket', icon: FaCode, value: 'code-bracket' },
  { name: 'Document Code', icon: FaFileCode, value: 'document-code' },
  { name: 'Chip', icon: HiCpuChip, value: 'chip' },
  { name: 'Cpu Chip', icon: HiCpuChip, value: 'cpu-chip' },
  { name: 'Bitcoin', icon: SiBitcoin, value: 'bitcoin' },
  { name: 'Ethereum', icon: SiEthereum, value: 'ethereum' },
  { name: 'Monero', icon: SiMonero, value: 'monero' },
  { name: 'Litecoin', icon: SiLitecoin, value: 'litecoin' },
];

// Helper function to get icon component by value
export const getIconByValue = (value) => {
  // Handle null, undefined, or empty values
  if (!value || typeof value !== 'string') {
    return FaLock;
  }
  
  // Check cryptography icons first
  const iconData = cryptographyIcons.find(icon => icon.value === value);
  if (iconData) return iconData.icon;
  
  // Check common icon mappings
  const commonIcons = {
    'coins': FaCoins,
    'trophy': FaTrophy,
    'award': FaAward,
    'users': FaUsers,
    'target': FaBullseye,
    'crown': FaCrown,
    'zap': FaBolt,
    'star': FaStar,
    'gamepad': FaGamepad,
    'code': FaCode,
    'lock': FaLock,
    'lock-open': FaLockOpen,
    'key': FaKey,
    'fingerprint': FaFingerprint,
    'shield': FaShieldAlt,
    'user': FaUser,
    'user-secret': FaUserSecret,
    'medal': FaMedal,
    'settings': FaSettings,
    'gift': FaGift,
    'check': FaCheckCircle,
    'clock': FaClock,
    'arrow-left': FaArrowLeft,
    'fire': FaFire,
    'rocket': FaRocket,
    'gem': FaGem,
    'theater-masks': FaTheaterMasks,
    'palette': FaPalette,
    'magic': FaMagic,
    'ghost': FaGhost,
    'dragon': FaDragon,
    'hat-wizard': FaHatWizard,
    'star-of-life': FaStarOfLife,
  };
  
  return commonIcons[value] || FaLock;
};

// Helper function to render icon by value
export const renderIconByValue = (value, className = '') => {
  try {
    const IconComponent = getIconByValue(value);
    return <IconComponent className={className} />;
  } catch (error) {
    console.error('Error rendering icon:', error, 'value:', value);
    return <FaLock className={className} />;
  }
};
