import { faLocationArrow } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

function LocateButton({map, buttonAction}) {
  if (!navigator.geolocation) {
    return null
  }

  return(
    <button className="btn btn-sm bg-dark text-light ms-2"><FontAwesomeIcon icon={faLocationArrow} fixedWidth={true} onClick={buttonAction}></FontAwesomeIcon></button>
  )
}

export default LocateButton
