#!/bin/sh
mkdir -p build
javac -encoding UTF-8 -d build src/reservas/*/*.java || exit 1
java -cp build reservas.servidor.ServidorReservas &
SRV=$!
sleep 2
java -cp build reservas.cliente.ClienteConsola "$@"
kill $SRV
