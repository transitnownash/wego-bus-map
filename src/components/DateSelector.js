import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

function DateSelector({scheduleDate, handleDateFieldChange}) {
  return(
    <div className="input-group">
      <span className="input-group-text"><FontAwesomeIcon icon={faCalendar} fixedWidth={true} /></span>
      <input className="form-control" type={'date'} value={scheduleDate} onChange={handleDateFieldChange} />
    </div>
  );
}

DateSelector.propTypes = {
  scheduleDate: PropTypes.string,
  handleDateFieldChange: PropTypes.func.isRequired
};

DateSelector.defaultProps = {
  scheduleDate: dayjs().format('YYYY-MM-DD')
};

export default DateSelector;
