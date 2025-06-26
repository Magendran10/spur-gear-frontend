import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="bg-gray-900 shadow-md">
      <nav className="w-full px-4 py-4 flex items-center justify-between">

        {/* Logo / Brand */}
        <div className="text-white text-4xl font-bold tracking-wide">
          Defect<span className="text-blue-400">X</span>
        </div>

        {/* Navigation Links - Aligned Right */}
        <div className="ml-auto flex space-x-6 text-white text-sm font-medium">
          <Link to="/" className="hover:text-blue-400 transition duration-200">Home</Link>
          <Link to="/dashboard" className="hover:text-blue-400 transition duration-200">Dashboard</Link>
          <Link to="/history" className="hover:text-blue-400 transition duration-200">History</Link>
        </div>
      </nav>
    </header>
  );
}
