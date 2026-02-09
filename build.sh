#!/bin/bash

# 1. Download Quarto (using a specific stable version)
curl -L -o quarto.tar.gz https://github.com/quarto-dev/quarto-cli/releases/download/v1.4.550/quarto-1.4.550-linux-amd64.tar.gz

# 2. Extract it
tar -xzf quarto.tar.gz

# 3. Run the render command using the downloaded binary
./quarto-1.4.550-linux-amd64/bin/quarto render