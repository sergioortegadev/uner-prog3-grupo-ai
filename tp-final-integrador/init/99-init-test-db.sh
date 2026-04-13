#!/bin/bash
# Usamos las variables de entorno de MySQL que Docker ya conoce para la de test
mysql -u root -p"$MYSQL_ROOT_PASSWORD" prog3_turnos_test < /docker-entrypoint-initdb.d/schema.sql
