#!/bin/bash

# 1. Download Quarto
# We force the output filename to 'quarto.tar.gz' to be consistent
curl -L -o quarto.tar.gz https://github.com/quarto-dev/quarto-cli/releases/download/v1.4.550/quarto-1.4.550-linux-amd64.tar.gz

# 2. Extract the file
tar -xzf quarto.tar.gz

# 3. Debugging (Optional but helpful)
# This prints the folder names to the log so we can see what was extracted
echo "📂 Extraction complete. Listing directories:"
ls -d */

# 4. Run Quarto using a Wildcard
# Instead of guessing the exact folder name, we say:
# "Go into ANY folder that starts with 'quarto' and look for bin/quarto"
./quarto*/bin/quarto render