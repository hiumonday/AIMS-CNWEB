# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy Maven wrapper and pom.xml first for better layer caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# FIX 1: Ensure mvnw is executable (Crucial for Mac/Windows users)
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime stage
FROM amazoncorretto:17-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

ENV SERVER_PORT=8000
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/actuator/health || exit 1

# FIX 4: Allow passing JAVA_OPTS (e.g. -Xmx512m) during runtime
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]