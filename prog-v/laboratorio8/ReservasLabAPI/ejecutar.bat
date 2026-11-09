@echo off
chcp 65001 > nul
if not exist build mkdir build
javac -encoding UTF-8 -d build src\reservas\modelo\*.java src\reservas\datos\*.java src\reservas\negocio\*.java src\reservas\servidor\*.java src\reservas\cliente\*.java
start "SERVIDOR" cmd /k java -Dfile.encoding=UTF-8 -cp build reservas.servidor.ServidorReservas
timeout /t 2 > nul
java -Dfile.encoding=UTF-8 -cp build reservas.cliente.ClienteConsola
