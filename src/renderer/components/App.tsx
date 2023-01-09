import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";

import theme from "../theme";
import Main from "./Main";

import {Routes, Route, HashRouter} from "react-router-dom";
import GUCollector from '../../util/gu_collector'

function renderMain(gu_obj:GUCollector){
  return(
    // Setup theme and css baseline for the Material-UI app
    // https://mui.com/customization/theming/
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <main>
          {/* This is where your app content should go */}
          <Main gu={gu_obj}/>
        </main>
      </Box>
    </ThemeProvider>
  )
}


export default function App(): JSX.Element {

  var guCollector = new GUCollector();
  const interval = useRef<number | null>(null);
  const startInterval = () => {
    console.log('startInteraval');
    if (interval.current !== null) return;
    interval.current = window.setInterval(() => {
      guCollector.timerCallback();
    }, 1000);
  };

  const stopInterval = () => {
    if (interval.current) {
      window.clearInterval(interval.current);
      interval.current = null;
    }
  };

  // Use the useEffect hook to cleanup the interval when the component unmounts
  useEffect(() => {
    // here's the cleanup function
    return () => {
      if (interval.current !== null) {
        window.clearInterval(interval.current);
      }
    };
  }, []);

  startInterval();

  return (

    <HashRouter>
      <div className="App">
        <Routes>
            <Route path={'/'} element={renderMain(guCollector)}/>
        </Routes>
      </div>
    </HashRouter>
  );
}
