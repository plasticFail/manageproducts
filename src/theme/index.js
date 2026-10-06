import { MP_THEME } from "./mpTheme";
import { createTheme } from "@mui/material";
import { themeQuartz } from "ag-grid-community";

const C = MP_THEME.tokens;
export const theme = createTheme(MP_THEME.mui);
export const gridTheme = themeQuartz.withParams(MP_THEME.agGrid);
