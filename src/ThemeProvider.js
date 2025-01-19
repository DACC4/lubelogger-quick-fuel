import React, {
    createContext,
    useState,
    useEffect,
    useMemo,
    useContext,
} from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

// Create a context to share the theme mode and toggle function
const CustomThemeContext = createContext({
    mode: "light",
    toggleTheme: () => {},
});

export const CustomThemeProvider = ({ children }) => {
    // Detect user’s system preference
    const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");

    // Check localStorage for a saved theme mode
    const storedMode = localStorage.getItem("themeMode"); // "light" or "dark"

    // If we have a stored mode, use it; otherwise use system preference
    const [mode, setMode] = useState(storedMode || (systemPrefersDark ? "dark" : "light"));

    // Optionally re-sync if system changes (and no stored preference)
    useEffect(() => {
    if (!storedMode) {
        setMode(systemPrefersDark ? "dark" : "light");
    }
    }, [systemPrefersDark, storedMode]);

    // Whenever `mode` changes, store it in localStorage
    useEffect(() => {
        localStorage.setItem("themeMode", mode);
    }, [mode]);

    // Memorize the MUI theme for performance
    const theme = useMemo(() => {
        if (mode === "dark") {
        return createTheme({
            palette: {
                mode: "dark",
                primary: {
                    main: "#fbc41f",
                },
                background: {
                    default: "#212529",
                    paper: "#212529",
                },
            },
        });
        } else {
        return createTheme({
            palette: {
                mode: "light",
                primary: {
                    main: "#fbc41f",
                },
            },
        });
        }
    }, [mode]);

    // Provide a toggle function
    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    };

    return (
    <CustomThemeContext.Provider value={{ mode, toggleTheme }}>
        <MuiThemeProvider theme={theme}>
        {/* CssBaseline ensures the correct background and text colors */}
        <CssBaseline />
            {children}
        </MuiThemeProvider>
    </CustomThemeContext.Provider>
    );
};

// Helper hook to consume the theme context
export const useCustomTheme = () => useContext(CustomThemeContext);  
