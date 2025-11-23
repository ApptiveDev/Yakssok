import * as React from "react";
const OpenButton = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={35}
    height={35}
    viewBox="0 0 48 48"
    fill="none"
    {...props}
  >
    <path
      stroke="#C4C5B7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M18 6v36M10 6h28a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Z"
    />
  </svg>
);
export default OpenButton;
