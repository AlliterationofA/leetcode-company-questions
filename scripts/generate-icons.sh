#!/bin/bash

# Optimize the SVG first
svgo public/logo.svg -o public/logo.optimized.svg

# Generate PNG versions at different sizes
sharp -i public/logo.optimized.svg -o public/favicon-16x16.png --resize 16 16
sharp -i public/logo.optimized.svg -o public/favicon-32x32.png --resize 32 32
sharp -i public/logo.optimized.svg -o public/favicon-48x48.png --resize 48 48
sharp -i public/logo.optimized.svg -o public/apple-touch-icon.png --resize 180 180
sharp -i public/logo.optimized.svg -o public/icon-192.png --resize 192 192
sharp -i public/logo.optimized.svg -o public/icon-512.png --resize 512 512

# Generate og-image.png (social preview)
sharp -i public/logo.optimized.svg -o public/og-image.png --resize 1200 630

# Create a temporary favicon.ico (we'll need to install ImageMagick for proper multi-size ico)
cp public/favicon-32x32.png public/favicon.ico

# Cleanup temporary files
rm public/logo.optimized.svg public/favicon-48x48.png 