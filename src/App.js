import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './controllers/Main'
import { About } from './controllers/About';
import TransitRoutes from './controllers/TransitRoutes'
import TransitRoute from './controllers/TransitRoute';
import Trip from './controllers/Trip';
import { NoMatch } from './controllers/NoMatch';
import './resources/bootstrap-with-mixins.scss'
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index={true} path="/" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="/routes" element={<TransitRoutes />} />
        <Route path="/routes/:route_id" element={<TransitRoute />} />
        <Route path="/trips/:trip_id" element={<Trip />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
