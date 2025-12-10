import { useState } from 'react';
import PropTypes from 'prop-types';

const fallback =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=60';

const ImageWithFallback = ({ src, alt, className = '' }) => {
  const [error, setError] = useState(false);
  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

ImageWithFallback.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export { ImageWithFallback };
export default ImageWithFallback;

