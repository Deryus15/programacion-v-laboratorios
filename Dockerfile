# Portafolio Programación V con los 8 laboratorios EJECUTABLES en un solo contenedor Linux:
# Node (servidor del portafolio) + JDK 21 + Tomcat 10.1 + MariaDB con las bases ya cargadas.
#
#   docker build -t progv .
#   docker run --rm -p 7860:7860 progv        ->  http://localhost:7860
#
# Los labs 4, 5, 7 y 8 se inician/detienen desde la página; los labs 1 y 2 se ejecutan al pulsar el botón.
# Los datos de las bases se reinician con cada arranque del contenedor (demo).

# ---------- 1) Compila los labs que necesitan Maven (4: Spring Boot, 5: WAR) ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /b
COPY prog-v/laboratorio4/mvc-estudiantes ./lab4
COPY prog-v/laboratorio5/gestion-inventario-jsp ./lab5
RUN cd lab4 && mvn -B -q -DskipTests package \
 && cd ../lab5 && mvn -B -q -DskipTests package

# ---------- 2) Imagen final ----------
FROM eclipse-temurin:21-jdk-noble
ARG TOMCAT=10.1.34
RUN apt-get update \
 && apt-get install -y --no-install-recommends mariadb-server nodejs curl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && curl -fsSL "https://archive.apache.org/dist/tomcat/tomcat-10/v${TOMCAT}/bin/apache-tomcat-${TOMCAT}.tar.gz" | tar -xz -C /opt \
 && mv "/opt/apache-tomcat-${TOMCAT}" /opt/tomcat \
 && (userdel -r ubuntu 2>/dev/null || true) \
 && useradd -m -u 1000 app          # Hugging Face Spaces y otros hostings ejecutan con UID 1000

RUN chmod -R a+rX /opt/tomcat     # el tar de Tomcat extrae conf/ restringido; el portafolio lo copia a un CATALINA_BASE temporal

USER app
WORKDIR /home/app/repo
COPY --chown=app portafolio ./portafolio
COPY --chown=app prog-v ./prog-v
COPY --from=build --chown=app /b/lab4/target/*.jar ./prog-v/laboratorio4/mvc-estudiantes/target/
COPY --from=build --chown=app /b/lab5/target/gestion-inventario.war ./prog-v/laboratorio5/gestion-inventario-jsp/target/

# Crea el directorio de datos de MariaDB e importa las bases de los labs 4 y 5.
COPY --chown=app docker/init-db.sh /home/app/init-db.sh
RUN sed -i 's/\r$//' /home/app/init-db.sh && sh /home/app/init-db.sh

ENV PORT=7860 \
    PORTAFOLIO_HOST=0.0.0.0 \
    CATALINA_HOME=/opt/tomcat \
    MYSQL_DATADIR=/home/app/mysql-data
EXPOSE 7860
CMD ["node", "portafolio/server.js"]
