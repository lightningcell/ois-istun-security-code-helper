// This file is responsible for injecting styles into the page
const styleContent = `
  .countdown-style {
    position: absolute;
    top: 12px; /* Slight margin from the top */
    left: 50%;
    transform: translate(-50%, 0);
    background-color: #bd1622; /* Primary color */
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    z-index: 1000;
    min-width: 200px; 
  }
`;

const styleElement = document.createElement("style");
styleElement.type = "text/css";
styleElement.appendChild(document.createTextNode(styleContent));
document.head.appendChild(styleElement);
