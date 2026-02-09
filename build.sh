#!/bin/bash

# 1. Install ALL Python dependencies
# Added: plotly (for charts) and scipy (for math/interpolation)
echo "Installing Python libraries..."
python3 -m pip install jupyter numpy matplotlib pandas plotly scipy

# 2. Download Quarto
curl -L -o quarto.tar.gz https://github.com/quarto-dev/quarto-cli/releases/download/v1.4.550/quarto-1.4.550-linux-amd64.tar.gz

# 3. Extract it
tar -xzf quarto.tar.gz

# 4. Render the book
./quarto*/bin/quarto render