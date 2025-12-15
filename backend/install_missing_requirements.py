"""Install only missing or incompatible requirements from requirements.txt

This script reads the repository's `requirements.txt`, checks which packages
are already installed and satisfy the version specifier, and runs `pip install`
only for the packages that are missing or do not satisfy the requested
version. It purposely implements a small, robust fallback for version parsing
so it can run without extra deps like `packaging`.

Usage (from the backend folder):
    python install_missing_requirements.py

This is helpful when you have many packages already present system-wide or in
another environment and you only want to fetch what's missing.
"""

from __future__ import annotations
import sys
import subprocess
import re
import os
from importlib.metadata import version, PackageNotFoundError


def parse_requirement(line: str):
    line = line.strip()
    if not line or line.startswith('#'):
        return None
    if line.startswith('-'):
        # skip pip options like -i, --extra-index-url, -f, -r etc.
        return None
    # remove environment markers (anything after a ';')
    req = line.split(';', 1)[0].strip()
    # support simple formats like 'package==1.2.3' or 'package>=1.0'
    m = re.match(r'^([A-Za-z0-9_.+\-]+)\s*(.*)$', req)
    if not m:
        return None
    name = m.group(1)
    spec = m.group(2).strip() or None
    return name, spec


def is_satisfied(name: str, spec: str | None) -> bool:
    try:
        inst_ver = version(name)
    except PackageNotFoundError:
        return False
    if not spec:
        return True

    # Try to use `packaging` if available for correct semantic comparisons
    try:
        from packaging.version import Version
        from packaging.specifiers import SpecifierSet

        spec_set = SpecifierSet(spec)
        return Version(inst_ver) in spec_set
    except Exception:
        # fallback: support common operators with LooseVersion
        spec_clean = spec.replace(' ', '')
        try:
            from distutils.version import LooseVersion
        except Exception:
            # if we can't compare, be conservative and request installation
            return False

        if spec_clean.startswith('=='):
            return inst_ver == spec_clean[2:]
        if spec_clean.startswith('>='):
            return LooseVersion(inst_ver) >= LooseVersion(spec_clean[2:])
        if spec_clean.startswith('<='):
            return LooseVersion(inst_ver) <= LooseVersion(spec_clean[2:])
        if spec_clean.startswith('>'):
            return LooseVersion(inst_ver) > LooseVersion(spec_clean[1:])
        if spec_clean.startswith('<'):
            return LooseVersion(inst_ver) < LooseVersion(spec_clean[1:])
        if spec_clean.startswith('~='):
            # approx. compatible release: treat like >= for fallback
            return LooseVersion(inst_ver) >= LooseVersion(spec_clean[2:])

        # If unknown specifier, be conservative
        return False


def main(req_filename: str = 'requirements.txt') -> int:
    base_dir = os.path.dirname(__file__)
    path = os.path.join(base_dir, req_filename)
    if not os.path.exists(path):
        print(f"requirements file not found: {path}")
        return 2

    to_install = []
    with open(path, 'r', encoding='utf-8') as fh:
        for raw in fh:
            parsed = parse_requirement(raw)
            if not parsed:
                continue
            name, spec = parsed
            if not is_satisfied(name, spec):
                to_install.append(raw.strip())

    if not to_install:
        print('All requirements already satisfied. Nothing to install.')
        return 0

    print('Installing only missing/incompatible requirements:')
    for r in to_install:
        print('  ', r)

    cmd = [sys.executable, '-m', 'pip', 'install'] + to_install
    print('\nRunning:', ' '.join(cmd))
    rc = subprocess.call(cmd)
    return rc


if __name__ == '__main__':
    raise SystemExit(main())
