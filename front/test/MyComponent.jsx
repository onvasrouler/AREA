import React from 'react';
import PropTypes from 'prop-types';

const MyComponent = ({ text }) => {
  return (
    <div className="my-class">
      <p>{text}</p>
    </div>
  );
};

MyComponent.propTypes = {
  text: PropTypes.string.isRequired,
};

export default MyComponent;