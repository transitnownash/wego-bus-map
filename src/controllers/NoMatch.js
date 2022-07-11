import React from 'react';
import TitleBar from "../components/TitleBar";
import Footer from '../components/Footer';
import { Link } from "react-router-dom";

function NoMatch() {
  return (
    <div>
      <TitleBar></TitleBar>
      <div className="container my-4">
        <h2>Detour in Effect.</h2>
        <p>You seem to have wandered off the route. The content you were are looking for is not here.</p>
        <p>
          <Link to="/">Go to the home page</Link>
        </p>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default NoMatch;
