# Specify the base Docker image optimized for Puppeteer
# Using the latest stable version with Chrome pre-installed
FROM apify/actor-node-puppeteer-chrome:20

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Install additional system dependencies for better compatibility
# Switch to root user for system package installation
USER root
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    && rm -rf /var/lib/apt/lists/*

# Switch back to myuser for npm operations
USER myuser

# Check preinstalled packages
RUN npm ls crawlee apify puppeteer

# Copy just package.json and package-lock.json
# to speed up the build using Docker layer cache.
COPY package*.json ./

# Install NPM packages, skip optional and development dependencies to
# keep the image small. Avoid logging too much and print the dependency
# tree for debugging
RUN npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && echo "Chrome version:" \
    && google-chrome-stable --version \
    && rm -r ~/.npm

# Next, copy the remaining files and directories with the source code.
# Since we do this after NPM install, quick build will be really fast
# for most source file changes.
COPY . ./

# Verify Chrome installation and Puppeteer compatibility
RUN npx puppeteer --version && \
    google-chrome-stable --version && \
    echo "Puppeteer and Chrome versions verified"

# Set proper permissions for the current working directory
USER root
RUN chown -R myuser:myuser .

# Switch to non-root user for security
USER myuser

# Run the image.
CMD npm start --silent