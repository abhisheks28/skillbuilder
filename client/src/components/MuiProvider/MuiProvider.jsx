"use client";

import React, { useMemo, useState } from "react";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export default function MuiProvider({ children }) {
    const [cache] = useState(() => {
        const cache = createCache({ key: "mui" });
        cache.compat = true;
        return cache;
    });



    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: "light",
                    primary: { main: "#1976d2" },
                },
                typography: {
                    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                },
                components: {
                    MuiButton: {
                        defaultProps: {
                            variant: 'contained',
                            size: 'small'
                        }
                    }
                }
            }),
        []
    );

    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </CacheProvider>
    );
}
