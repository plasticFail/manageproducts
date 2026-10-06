// Month column header. The first and last month carry the Prev / Next controls,
// so paging sits on the edges of the months it moves instead of taking its own row.
// MUI "CancelOutlined" icon: the remove-row action in editable tables (same IconButton as table Actions).
export const CancelOutlined = () => (
  <svg className="MuiSvgIcon-root" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden focusable="false">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
  </svg>
);
// MUI "ErrorOutline" icon in red/400: the inline error flag inside editable tables; its message is in a tooltip.
export const ErrorOutlineIcon = () => (
  <svg className="MuiSvgIcon-root" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden focusable="false">
    <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8" />
  </svg>
);
// (legacy) circle-X icon
const CancelCircle = () => (
  <svg className="MuiSvgIcon-root" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden focusable="false">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z" />
  </svg>
);
