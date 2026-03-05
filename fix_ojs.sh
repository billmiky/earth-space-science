#!/bin/bash
sed -i '704,1027s/tempIncrease/sim2TempIncrease/g' unit4-climate-change/unit4-past-and-future.qmd
sed -i '704,1027s/\bsalinity\b/sim2Salinity/g' unit4-climate-change/unit4-past-and-future.qmd
sed -i '704,1027s/freshwaterInput/sim2FreshwaterInput/g' unit4-climate-change/unit4-past-and-future.qmd
sed -i '704,1027s/calculateDensity/sim2CalculateDensity/g' unit4-climate-change/unit4-past-and-future.qmd
sed -i '704,1027s/calculateAMOCStrength/sim2CalculateAMOCStrength/g' unit4-climate-change/unit4-past-and-future.qmd
sed -i '704,1027s/currentState/sim2CurrentState/g' unit4-climate-change/unit4-past-and-future.qmd
