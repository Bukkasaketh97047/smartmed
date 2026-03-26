# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install Tesseract OCR and OpenCV system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr tesseract-ocr-eng libtesseract-dev \
    libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Explicitly set the Tesseract data path environment variable for Ubuntu
ENV TESSERACT_DATAPATH=/usr/share/tesseract-ocr/4.00/tessdata
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata

# Expose port 8080 (Render's default port for web services)
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
