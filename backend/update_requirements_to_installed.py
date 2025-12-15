"""Update requirements.txt to pin the versions currently installed in the active Python env.

Creates `requirements.txt.bak` as a backup before overwriting `requirements.txt`.
It preserves comment/option lines and leaves entries unchanged if the package
is not installed in the current environment.

Run from the `backend` folder:
    python update_requirements_to_installed.py
"""

from __future__ import annotations
import os
import re
from importlib.metadata import version, PackageNotFoundError


REQ_FILE = 'requirements.txt'


def parse_name(line: str) -> str | None:
    s = line.strip()
    if not s or s.startswith('#') or s.startswith('-'):
        return None
    base = s.split(';', 1)[0].strip()
    m = re.match(r'^([A-Za-z0-9_.+\-]+)', base)
    if m:
        return m.group(1)
    return None


def main():
    here = os.path.dirname(__file__)
    path = os.path.join(here, REQ_FILE)
    if not os.path.exists(path):
        print('requirements.txt not found at', path)
        return 2

    lines = open(path, 'r', encoding='utf-8').read().splitlines()
    new_lines = []
    changed = []
    missing = []

    for ln in lines:
        name = parse_name(ln)
        if not name:
            new_lines.append(ln)
            continue
        try:
            inst = version(name)
            new_line = f"{name}=={inst}"
            new_lines.append(new_line)
            if new_line != ln:
                changed.append((ln, new_line))
        except PackageNotFoundError:
            new_lines.append(ln)
            missing.append(name)

    # backup
    bak = path + '.bak'
    open(bak, 'w', encoding='utf-8').write('\n'.join(lines) + ('\n' if lines and not lines[-1].endswith('\n') else ''))
    open(path, 'w', encoding='utf-8').write('\n'.join(new_lines) + '\n')

    print('Wrote updated', REQ_FILE, 'and backup at', bak)
    if changed:
        print('\nUpdated lines:')
        for old, new in changed:
            print(' -', old, '->', new)
    else:
        print('\nNo lines changed.')

    if missing:
        print('\nPackages not found in this environment (left unchanged):')
        for m in missing:
            print(' -', m)

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
