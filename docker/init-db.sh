#!/bin/sh
# Se ejecuta UNA vez al construir la imagen: crea MariaDB e importa las bases de los labs 4 y 5.
# Las contraseñas se leen del propio código de cada lab (no se repiten aquí).
set -eu
DATA=/home/app/mysql-data
SRC=/home/app/repo/prog-v
SOCK=/tmp/init.sock
L4=$SRC/laboratorio4/mvc-estudiantes
L5=$SRC/laboratorio5/gestion-inventario-jsp

mkdir -p "$DATA"
mariadb-install-db --datadir="$DATA" --auth-root-authentication-method=normal --skip-test-db >/dev/null

mariadbd --datadir="$DATA" --socket="$SOCK" --pid-file=/tmp/init.pid --skip-networking --skip-log-bin --performance-schema=OFF &
PID=$!
for i in $(seq 1 60); do mariadb-admin -u root --socket="$SOCK" ping >/dev/null 2>&1 && break; sleep 1; done
mariadb-admin -u root --socket="$SOCK" ping >/dev/null

mariadb -u root --socket="$SOCK" --default-character-set=utf8mb4 < "$L4/database.sql"
mariadb -u root --socket="$SOCK" --default-character-set=utf8mb4 < "$L5/db/schema.sql"

# Credenciales que usa el código de cada lab
UPW=$(grep -oP '^spring\.datasource\.password=\K.*' "$L4/src/main/resources/application.properties" | tr -d '\r')
RPW=$(grep -oP 'PASSWORD\s*=\s*"\K[^"]*' "$L5/src/main/java/com/unachi/inventario/datos/ConexionBD.java" | head -1 || true)

mariadb -u root --socket="$SOCK" <<SQL
CREATE USER IF NOT EXISTS 'mvc_user'@'127.0.0.1' IDENTIFIED BY '$UPW';
GRANT ALL PRIVILEGES ON mvc_unachi.* TO 'mvc_user'@'127.0.0.1';
ALTER USER 'mvc_user'@'localhost' IDENTIFIED BY '$UPW';
CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY '$RPW';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$RPW';
FLUSH PRIVILEGES;
SQL

kill -TERM "$PID"   # apagado limpio de MariaDB
wait "$PID" || true
echo "Bases cargadas: $(ls "$DATA" | tr '\n' ' ')"
