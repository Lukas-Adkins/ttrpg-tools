import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 p-4 text-center text-gray-400">
      © {new Date().getFullYear()} TTRPG Tools. All rights reserved.
    </footer>
  );
};

export default Footer;
