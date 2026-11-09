@echo off
rem Alternativa al panel de XAMPP: enciende MySQL (MariaDB) en el puerto 3306.
rem Para apagarlo: detener-mysql.bat
start "MySQL-XAMPP" /min C:\xampp\mysql\bin\mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini --standalone --console
echo MySQL iniciando... espera unos segundos. Comprueba con: C:\xampp\mysql\bin\mysql.exe -u root -e "SHOW DATABASES;"
