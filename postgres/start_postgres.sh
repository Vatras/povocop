#!/usr/bin/env bash
docker run -d --name postgres -p 5432:5432 --restart=always -e POSTGRES_DB=povocop_1 -e POSTGRES_PASSWORD=povocop -v /data/postgresql/data:/var/lib/postgresql/data postgres:9.4