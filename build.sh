#!/bin/bash

# 1. UNLOCK MEMORY: Increase limit to 8GB to prevent crash
export QUARTO_DENO_EXTRA_OPTIONS="--v8-flags=--max-old-space-size=8192"

# 2. Install Python libraries
echo "Installing Python libraries..."
python3 -m pip install jupyter numpy matplotlib pandas plotly scipy

# 3. Download Quarto
curl -L -o quarto.tar.gz https://github.com/quarto-dev/quarto-cli/releases/download/v1.4.550/quarto-1.4.550-linux-amd64.tar.gz

# 4. Extract it
tar -xzf quarto.tar.gz

# 5. Render the book
./quarto*/bin/quarto render