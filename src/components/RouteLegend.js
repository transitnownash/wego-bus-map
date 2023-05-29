import React from 'react';
import PropTypes from 'prop-types';

const routeFrequency = [
  {
    name: 'Frequent',
    color: 'rgb(243, 39, 53)',
    textColor: 'rgb(255, 255, 255)',
  },
  {
    name: 'Local',
    color: 'rgb(117, 60, 190)',
    textColor: 'rgb(255, 255, 255)',
  },
  {
    name: 'Connector',
    color: 'rgb(93, 95, 98)',
    textColor: 'rgb(255, 255, 255)',
  },
  {
    name: 'Express',
    color: 'rgb(0, 170, 231)',
    textColor: 'rgb(255, 255, 255)',
  },
  {
    name: 'Train Shuttles',
    color: 'rgb(0, 30, 97)',
    textColor: 'rgb(255, 255, 255)',
  },
];

function RouteLegend() {
  return (
    <div className="d-flex mb-3 justify-content-center flex-wrap">
      {routeFrequency.map((frequency) => (
          <div key={frequency.name} className="mb-1 ms-1 me-1 p-2 px-3 rounded fw-bold" style={{ backgroundColor: frequency.color, color: frequency.textColor }}>{frequency.name}</div>
      ))}
    </div>
  );
}

RouteLegend.propTypes = {
  selectedRouteTypes: PropTypes.array,
};

RouteLegend.defaultProps = {
  selectedRouteTypes: [],
};

export default RouteLegend;
