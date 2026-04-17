import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-extrabold text-primary">404</h1>
        <p className="mb-4 text-xl text-slate-500">Page not found</p>
        <Link to="/" className="text-accent underline hover:text-accent/80 font-medium">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
