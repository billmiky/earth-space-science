
echo "🌍 Setting up Earth & Space Science Textbook..."

# Create the main _quarto.yml configuration
cat > _quarto.yml << 'EOF'
project:
  type: book
  output-dir: _book

book:
  title: "Earth and Space Science"
  subtitle: "An Interactive High School Textbook"
  author: "Your Name"
  date: last-modified
  
  search: true
  
  sidebar:
    style: docked
    background: light
  
  chapters:
    - index.qmd
    
    - part: "Unit 1: Discovering New Worlds"
      chapters:
        - unit1-discovering-new-worlds/index.qmd
        - unit1-discovering-new-worlds/01-sun-lifespan.qmd
        - unit1-discovering-new-worlds/02-star-lifecycles.qmd
        - unit1-discovering-new-worlds/03-solar-system-motions.qmd
        - unit1-discovering-new-worlds/04-nuclear-processes.qmd
    
    - part: "Unit 2: Probability of Life Elsewhere"
      chapters:
        - unit2-probability-of-life/index.qmd
        - unit2-probability-of-life/01-big-bang.qmd
        - unit2-probability-of-life/02-early-earth.qmd
        - unit2-probability-of-life/03-water-properties.qmd
        - unit2-probability-of-life/04-coevolution-life-earth.qmd
    
    - part: "Unit 3: Earthquakes, Volcanoes, & Tsunamis"
      chapters:
        - unit3-earthquakes-volcanoes-tsunamis/index.qmd
        - unit3-earthquakes-volcanoes-tsunamis/01-plate-tectonics.qmd
        - unit3-earthquakes-volcanoes-tsunamis/02-earth-processes.qmd
        - unit3-earthquakes-volcanoes-tsunamis/03-earth-interior.qmd
        - unit3-earthquakes-volcanoes-tsunamis/04-natural-hazards.qmd
    
    - part: "Unit 4: Climate Change"
      chapters:
        - unit4-climate-change/index.qmd
        - unit4-climate-change/01-moon-phases-tides.qmd
        - unit4-climate-change/02-earth-system-feedbacks.qmd
        - unit4-climate-change/03-energy-flow-climate.qmd
        - unit4-climate-change/04-carbon-cycle.qmd
    
    - part: "Unit 5: More Hurricanes & Blizzards in NYC?"
      chapters:
        - unit5-hurricanes-blizzards/index.qmd
        - unit5-hurricanes-blizzards/01-severe-weather.qmd
        - unit5-hurricanes-blizzards/02-climate-storm-impacts.qmd
    
    - part: "Unit 6: Solutions for a Sustainable Future"
      chapters:
        - unit6-sustainable-future/index.qmd
        - unit6-sustainable-future/01-sustainable-solutions.qmd
        - unit6-sustainable-future/02-human-impact-mitigation.qmd
    
    - references.qmd

format:
  html:
    theme:
      light: cosmo
      dark: darkly
    css: styles.css
    toc: true
    toc-depth: 3
    code-fold: true
    code-tools: true
    code-copy: true
    highlight-style: github
    
execute:
  freeze: auto
  warning: false
  message: false
EOF

echo "✅ Created _quarto.yml"

# Create styles.css
cat > styles.css << 'EOF'
/* Custom styles for Earth & Space Science textbook */

.sidebar nav[role=doc-toc] > ul > li > a {
  font-weight: bold;
  color: #2c5282;
}

.callout-note {
  border-left-color: #3182ce;
}

.callout-tip {
  border-left-color: #38a169;
}

.callout-warning {
  border-left-color: #d69e2e;
}

.callout-important {
  border-left-color: #e53e3e;
}

.interactive-container {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  background-color: #f7fafc;
}

figcaption {
  font-style: italic;
  color: #4a5568;
  text-align: center;
}
EOF

echo "✅ Created styles.css"

# Create placeholder references
cat > references.qmd << 'EOF'
# References {.unnumbered}

::: {#refs}
:::

## Data Sources

- **Earthquake Data**: [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/)
- **Climate Data**: [NOAA Climate.gov](https://www.climate.gov/)
- **Exoplanet Data**: [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)

## Curriculum Alignment

This textbook is aligned with:
- [New Visions Earth & Space Science Curriculum](https://www.newvisions.org/curriculum/science/earth-space/)
- Next Generation Science Standards (NGSS)
- New York State Science Learning Standards (NYSSLS)
EOF

echo "✅ Created references.qmd"

echo ""
echo "📁 Project structure created!"
echo ""
echo "Next steps:"
echo "  1. I'll provide the content files for each unit"
echo "  2. Copy them into the appropriate folders"
echo "  3. Run: ./start-preview.sh"
echo ""

