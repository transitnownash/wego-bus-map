import React from 'react';

function TripTableRowEmpty() {
  return (
    <tr className="bg-info text-bg-info">
      <td colSpan="99" className="text-center p-2">No scheduled trips.</td>
    </tr>
  );
}

export default TripTableRowEmpty;
