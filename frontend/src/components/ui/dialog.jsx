import PropTypes from 'prop-types';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => onOpenChange?.(false)}
    >
      {children}
    </div>
  );
};

Dialog.propTypes = {
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  children: PropTypes.node,
};

export const DialogContent = ({ className = '', onClick, children }) => (
  <div
    className={[
      'bg-[#0f0f1a] text-cyan-100 border border-cyan-500/40 rounded-xl shadow-2xl max-h-[90vh] overflow-auto custom-scrollbar w-full max-w-5xl',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.(e);
    }}
  >
    {children}
  </div>
);

DialogContent.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

export const DialogHeader = ({ className = '', children }) => (
  <header className={`space-y-1 p-4 border-b border-cyan-500/20 ${className}`}>
    {children}
  </header>
);

DialogHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export const DialogTitle = ({ className = '', children }) => (
  <h2
    className={[
      'text-xl font-semibold text-cyan-300 tracking-wide',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </h2>
);

DialogTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export const DialogDescription = ({ className = '', children }) => (
  <p
    className={[
      'text-sm text-cyan-200/80',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </p>
);

DialogDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

