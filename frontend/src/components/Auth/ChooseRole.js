import React from 'react';
import { Link } from 'react-router-dom';

function ChooseRole() {
  return (
    <div>
      <h2>Continue as:</h2>
      <Link to="/driver/dashboard"><button>Driver Dashboard</button></Link>
      <Link to="/rider/dashboard"><button>Rider Dashboard</button></Link>
    </div>
  );
}

export default ChooseRole;