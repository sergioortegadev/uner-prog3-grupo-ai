#!/bin/bash
set -e

# Este script puebla la base de datos de test usando el mismo esquema que la de desarrollo.
# Docker ejecuta los archivos en /docker-entrypoint-initdb.d/ por orden alfabético.
# Como este se llama 99-..., se ejecuta al final.

echo "Cargando esquema en la base de datos de TEST (prog3_turnos_test)..."

mysql -u root -p"$MYSQL_ROOT_PASSWORD" prog3_turnos_test < /docker-entrypoint-initdb.d/schema.sql

echo "¡Base de datos de TEST inicializada correctamente!"
