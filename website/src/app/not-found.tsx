"use client";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <h1 className="notFoundText">Page Not Found</h1>
      <h1 className="notFoundText">404</h1>
      <button
        className="btn largeText"
        onClick={() => (window.location.href = "/")}
      >
        Back To Home
      </button>
    </div>
  );
};

export default NotFoundPage;
