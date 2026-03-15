#!/usr/bin/env bash

set -euo pipefail

tag="${1:-${GITHUB_REF_NAME:-}}"

if [[ -z "${tag}" ]]; then
  echo "Release tag is required." >&2
  exit 1
fi

if [[ ! "${tag}" =~ ^v([0-9]+\.[0-9]+\.[0-9]+)(-(web|extension))?$ ]]; then
  echo "Unsupported release tag: ${tag}" >&2
  echo "Expected formats: v<major>.<minor>.<patch>, v<major>.<minor>.<patch>-web, v<major>.<minor>.<patch>-extension" >&2
  exit 1
fi

version="${BASH_REMATCH[1]}"
channel="${BASH_REMATCH[3]:-all}"

IFS='.' read -r major minor patch <<< "${version}"
major_minor="${major}.${minor}"

publish_web=false
publish_extension=false

case "${channel}" in
  all)
    publish_web=true
    publish_extension=true
    ;;
  web)
    publish_web=true
    ;;
  extension)
    publish_extension=true
    ;;
esac

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "tag=${tag}"
    echo "version=${version}"
    echo "channel=${channel}"
    echo "major=${major}"
    echo "minor=${minor}"
    echo "patch=${patch}"
    echo "major_minor=${major_minor}"
    echo "publish_web=${publish_web}"
    echo "publish_extension=${publish_extension}"
  } >> "${GITHUB_OUTPUT}"
else
  cat <<EOF
tag=${tag}
version=${version}
channel=${channel}
major=${major}
minor=${minor}
patch=${patch}
major_minor=${major_minor}
publish_web=${publish_web}
publish_extension=${publish_extension}
EOF
fi
