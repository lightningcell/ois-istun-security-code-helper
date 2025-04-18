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

  .code-panel {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    text-align: center;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .panel-current {
    background-color: #4caf50; 
    color: white;
  }

  .panel-old {
    background-color: #ffeb3b;
    color: #333;
  }

  .panel-icon {
    cursor: pointer;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
  }

  .panel-icon:hover {
    opacity: 0.8;
  }

  .copy-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'/%3E%3C/svg%3E");
    background-size: contain;
  }

  .refresh-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23333'%3E%3Cpath d='M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  /* Tooltip for copied text */
  .tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: normal;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    white-space: nowrap;
    z-index: 1001;
  }

  .tooltip.visible {
    opacity: 1;
  }
`;

const styleElement = document.createElement("style");
styleElement.type = "text/css";
styleElement.appendChild(document.createTextNode(styleContent));
document.head.appendChild(styleElement);
