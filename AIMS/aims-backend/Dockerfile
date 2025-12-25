# Stage 1: Build the application
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /builder

# Copy Maven wrapper and project definition
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Grant execution rights to the Maven wrapper
RUN chmod +x mvnw

# Download dependencies (this layer will be cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline

# Copy application source
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Extract layers using Spring Boot's layer tools
ARG JAR_FILE=target/*.jar
RUN java -Djarmode=layertools -jar ${JAR_FILE} extract

# Stage 2: Final runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /application

# Security: Create a non-root user
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring

# Copy extracted layers from the builder stage
# The order matters for caching: dependencies change least often
COPY --from=builder /builder/dependencies/ ./
COPY --from=builder /builder/spring-boot-loader/ ./
COPY --from=builder /builder/snapshot-dependencies/ ./
COPY --from=builder /builder/application/ ./

# Performance: Use container-aware JVM flags
# JarLauncher handles the classpath for the layers
ENTRYPOINT ["java", \
            "-XX:MaxRAMPercentage=75.0", \
            "-XX:+UseContainerSupport", \
            "org.springframework.boot.loader.launch.JarLauncher"]
