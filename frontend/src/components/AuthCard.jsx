import PropTypes from 'prop-types';

const AuthCard = ({ title, subtitle, children }) => (
  <section className="auth-card">
    <header className="auth-card__header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
    {children}
  </section>
);

AuthCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default AuthCard;

