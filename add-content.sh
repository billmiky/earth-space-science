
echo "This script will help you add content to your textbook."
echo "I'll guide you through creating each file."
echo ""
echo "The full content is too large to paste all at once."
echo "Would you like me to create:"
echo "  1. Just the structure with placeholder content"
echo "  2. Guide you through adding full content file-by-file"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    # Create placeholder files
    for unit in unit1-discovering-new-worlds unit2-probability-of-life unit3-earthquakes-volcanoes-tsunamis unit4-climate-change unit5-hurricanes-blizzards unit6-sustainable-future; do
        echo "Creating placeholders for $unit..."
        touch $unit/index.qmd
        for file in $unit/*.qmd; do
            if [ ! -s "$file" ]; then
                echo "# Placeholder" > "$file"
                echo "Content will be added here." >> "$file"
            fi
        done
    done
    echo "✅ Placeholder structure created!"
fi
