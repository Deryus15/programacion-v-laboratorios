#!/bin/sh
# Publica el contenedor (Dockerfile) en un Space de Hugging Face (SDK Docker, gratis).
#
# Antes (una sola vez):
#   1. Crea cuenta en https://huggingface.co y un Space nuevo: SDK = Docker, plan = CPU basic (gratis).
#   2. Crea un token con permiso de escritura (Settings -> Access Tokens) e inicia sesión:  hf auth login
#
# Uso:   sh docker/deploy-hf.sh USUARIO/NOMBRE-DEL-SPACE
# URL final del servidor en vivo:  https://USUARIO-NOMBRE-DEL-SPACE.hf.space
set -eu
SPACE=${1:?Uso: sh docker/deploy-hf.sh USUARIO/NOMBRE-DEL-SPACE}
ROOT=$(git rev-parse --show-toplevel)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

git -C "$ROOT" archive HEAD | tar -x -C "$TMP"      # solo lo versionado (nada de respaldos ni material local)
cd "$TMP"
{
  printf '%s\n' '---' 'title: Programacion V - Laboratorios en vivo' 'emoji: 👁️' 'colorFrom: gray' 'colorTo: indigo' 'sdk: docker' 'app_port: 7860' 'pinned: false' '---' ''
  cat README.md
} > README.hf && mv README.hf README.md

git init -q -b main
git add -A
git -c user.name="deploy" -c user.email="deploy@localhost" commit -q -m "Despliegue del portafolio en vivo"
git push -f "https://huggingface.co/spaces/$SPACE" main
echo "Listo. El Space construye la imagen (varios minutos): https://huggingface.co/spaces/$SPACE"
