import PropTypes from 'prop-types';

const SubmitButton = ({ label, loading }) => (
  <button type="submit" className="submit-button" disabled={loading}>
    {loading ? 'Отправляю...' : label}
  </button>
);

SubmitButton.propTypes = {
  label: PropTypes.string.isRequired,
  loading: PropTypes.bool
};

export default SubmitButton;