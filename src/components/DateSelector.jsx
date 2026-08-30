import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faSpinner } from '@fortawesome/free-solid-svg-icons';

function DateSelector({ scheduleDate = dayjs().format('YYYY-MM-DD'), handleDateFieldChange, isLoading = false }) {
  return (
    <div className="input-group">
      <span className="input-group-text">
        {isLoading ? (
          <FontAwesomeIcon icon={faSpinner} fixedWidth={true} spin={true} />
        ) : (
          <FontAwesomeIcon icon={faCalendar} fixedWidth={true} />
        )}
      </span>
      <input className="form-control" type={'date'} value={scheduleDate} onChange={handleDateFieldChange} />
    </div>
  );
}

DateSelector.propTypes = {
  scheduleDate: PropTypes.string,
  handleDateFieldChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default DateSelector;
