function AlertButton({alerts, buttonAction}) {
  if (alerts.length > 0) {
    return(
      <button className="btn btn-sm btn-primary bg-dark" onClick={buttonAction}>
          <span className="badge bg-light text-dark">
            {alerts.length}
          </span>&nbsp;
          Service Alerts
      </button>
    );
  }
}

export default AlertButton;
