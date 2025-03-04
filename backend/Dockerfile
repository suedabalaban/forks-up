FROM gradle:8.10.2-jdk23 AS build
WORKDIR /app
COPY . .
RUN gradle build -x test

FROM openjdk:25-ea-11-jdk-oraclelinux9
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
COPY src/main/resources/forks-up-firebase-adminsdk-4zto3-335c30c024.json /app/firebase-credentials.json
EXPOSE 8080
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/firebase-credentials.json
ENTRYPOINT ["java", "-jar", "app.jar"]
