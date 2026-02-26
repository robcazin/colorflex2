Last login: Fri Feb 20 14:43:50 on ttys002
admin@robs-Mac-Studio ~ % sudo -V
Sudo version 1.9.13p2
Sudoers policy plugin version 1.9.13p2
Sudoers file grammar version 50
Sudoers I/O plugin version 1.9.13p2
Sudoers audit plugin version 1.9.13p2
admin@robs-Mac-Studio ~ % curl -I https://raw.githubusercontent.com
HTTP/2 301 
content-security-policy: default-src 'none'; style-src 'unsafe-inline'; sandbox
location: https://github.com/
strict-transport-security: max-age=31536000
x-content-type-options: nosniff
x-frame-options: deny
x-xss-protection: 1; mode=block
x-github-request-id: D7F8:375241:2A2F4A:31C170:6998BFB5
accept-ranges: bytes
date: Fri, 20 Feb 2026 20:24:04 GMT
via: 1.1 varnish
x-served-by: cache-mia-kmia1760041-MIA
x-cache: HIT
x-cache-hits: 1
x-timer: S1771619045.506089,VS0,VE1
vary: Authorization,Accept-Encoding
access-control-allow-origin: *
cross-origin-resource-policy: cross-origin
x-fastly-request-id: 598ec988153024a106a77fcb51d2f446187bbe25
expires: Fri, 20 Feb 2026 20:29:04 GMT
source-age: 814
content-length: 0

admin@robs-Mac-Studio ~ % curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh -o brew_install.sh
admin@robs-Mac-Studio ~ % bash brew_install.sh
==> Checking for `sudo` access (which may request your password)...
Password:
==> This script will install:
/opt/homebrew/bin/brew
/opt/homebrew/share/doc/homebrew
/opt/homebrew/share/man/man1/brew.1
/opt/homebrew/share/zsh/site-functions/_brew
/opt/homebrew/etc/bash_completion.d/brew
/opt/homebrew
/etc/paths.d/homebrew
==> The following new directories will be created:
/opt/homebrew/bin
/opt/homebrew/etc
/opt/homebrew/include
/opt/homebrew/lib
/opt/homebrew/sbin
/opt/homebrew/share
/opt/homebrew/var
/opt/homebrew/opt
/opt/homebrew/share/zsh
/opt/homebrew/share/zsh/site-functions
/opt/homebrew/var/homebrew
/opt/homebrew/var/homebrew/linked
/opt/homebrew/Cellar
/opt/homebrew/Caskroom
/opt/homebrew/Frameworks

Press RETURN/ENTER to continue or any other key to abort:
==> /usr/bin/sudo /usr/bin/install -d -o root -g wheel -m 0755 /opt/homebrew
==> /usr/bin/sudo /bin/mkdir -p /opt/homebrew/bin /opt/homebrew/etc /opt/homebrew/include /opt/homebrew/lib /opt/homebrew/sbin /opt/homebrew/share /opt/homebrew/var /opt/homebrew/opt /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew /opt/homebrew/var/homebrew/linked /opt/homebrew/Cellar /opt/homebrew/Caskroom /opt/homebrew/Frameworks
==> /usr/bin/sudo /bin/chmod ug=rwx /opt/homebrew/bin /opt/homebrew/etc /opt/homebrew/include /opt/homebrew/lib /opt/homebrew/sbin /opt/homebrew/share /opt/homebrew/var /opt/homebrew/opt /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew /opt/homebrew/var/homebrew/linked /opt/homebrew/Cellar /opt/homebrew/Caskroom /opt/homebrew/Frameworks
==> /usr/bin/sudo /bin/chmod go-w /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions
==> /usr/bin/sudo /usr/sbin/chown admin /opt/homebrew/bin /opt/homebrew/etc /opt/homebrew/include /opt/homebrew/lib /opt/homebrew/sbin /opt/homebrew/share /opt/homebrew/var /opt/homebrew/opt /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew /opt/homebrew/var/homebrew/linked /opt/homebrew/Cellar /opt/homebrew/Caskroom /opt/homebrew/Frameworks
==> /usr/bin/sudo /usr/bin/chgrp admin /opt/homebrew/bin /opt/homebrew/etc /opt/homebrew/include /opt/homebrew/lib /opt/homebrew/sbin /opt/homebrew/share /opt/homebrew/var /opt/homebrew/opt /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew /opt/homebrew/var/homebrew/linked /opt/homebrew/Cellar /opt/homebrew/Caskroom /opt/homebrew/Frameworks
==> /usr/bin/sudo /usr/sbin/chown -R admin:admin /opt/homebrew
==> Downloading and installing Homebrew...
remote: Enumerating objects: 321530, done.
remote: Counting objects: 100% (647/647), done.
remote: Compressing objects: 100% (313/313), done.
remote: Total 321530 (delta 496), reused 378 (delta 334), pack-reused 320883 (from 3)
remote: Enumerating objects: 55, done.
remote: Counting objects: 100% (33/33), done.
remote: Total 55 (delta 33), reused 33 (delta 33), pack-reused 22 (from 1)
==> /usr/bin/sudo /bin/mkdir -p /etc/paths.d
==> /usr/bin/sudo tee /etc/paths.d/homebrew
/opt/homebrew/bin
==> /usr/bin/sudo /usr/sbin/chown root:wheel /etc/paths.d/homebrew
==> /usr/bin/sudo /bin/chmod a+r /etc/paths.d/homebrew
==> Updating Homebrew...
==> Downloading https://ghcr.io/v2/homebrew/core/portable-ruby/blobs/sha256:1c98fa49eacc935640a6f8e10a2bf33f14cfc276804b71ddb658ea45ba99d167
######################################################################### 100.0%
==> Pouring portable-ruby-3.4.8.arm64_big_sur.bottle.tar.gz
==> Installation successful!

==> Homebrew has enabled anonymous aggregate formulae and cask analytics.
Read the analytics documentation (and how to opt-out) here:
  https://docs.brew.sh/Analytics
No analytics data has been sent yet (nor will any be during this install run).

==> Homebrew is run entirely by unpaid volunteers. Please consider donating:
  https://github.com/Homebrew/brew#donations

==> Next steps:
- Run these commands in your terminal to add Homebrew to your PATH:
    echo >> /Users/admin/.zprofile
    echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> /Users/admin/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv zsh)"
- Run brew help to get started
- Further documentation:
    https://docs.brew.sh

admin@robs-Mac-Studio ~ % echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
admin@robs-Mac-Studio ~ % 
admin@robs-Mac-Studio ~ % echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
admin@robs-Mac-Studio ~ % eval "$(/opt/homebrew/bin/brew shellenv)"

admin@robs-Mac-Studio ~ % brew --version
Homebrew 5.0.14
admin@robs-Mac-Studio ~ % which brew
/opt/homebrew/bin/brew
admin@robs-Mac-Studio ~ % brew install mas git node python
==> Fetching downloads for: mas, git, node and python@3.14
✔︎ Bottle Manifest mas (5.2.0)                                                     Downloaded    5.1KB/  5.1KB
✔︎ Bottle Manifest git (2.53.0)                                                    Downloaded   20.9KB/ 20.9KB
✔︎ Bottle Manifest node (25.6.1)                                                   Downloaded   27.5KB/ 27.5KB
✔︎ Bottle Manifest python@3.14 (3.14.3_1)                                          Downloaded   29.5KB/ 29.5KB
✔︎ Bottle Manifest libunistring (1.4.1)                                            Downloaded    7.3KB/  7.3KB
✔︎ Bottle Manifest gettext (1.0)                                                   Downloaded   13.7KB/ 13.7KB
✔︎ Bottle Manifest pcre2 (10.47_1)                                                 Downloaded   11.7KB/ 11.7KB
✔︎ Bottle Manifest libiconv (1.18)                                                 Downloaded    7.5KB/  7.5KB
✔︎ Bottle Manifest fmt (12.1.0)                                                    Downloaded    7.3KB/  7.3KB
✔︎ Bottle Manifest ada-url (3.4.2)                                                 Downloaded    8.5KB/  8.5KB
✔︎ Bottle Manifest brotli (1.2.0)                                                  Downloaded    8.0KB/  8.0KB
✔︎ Bottle Manifest c-ares (1.34.6)                                                 Downloaded    7.5KB/  7.5KB
✔︎ Bottle Manifest hdrhistogram_c (0.11.9)                                         Downloaded    7.8KB/  7.8KB
✔︎ Bottle libunistring (1.4.1)                                                     Downloaded    1.9MB/  1.9MB
✔︎ Bottle Manifest icu4c@78 (78.2)                                                 Downloaded    9.7KB/  9.7KB
✔︎ Bottle Manifest libnghttp2 (1.68.0)                                             Downloaded    7.3KB/  7.3KB
✔︎ Bottle mas (5.2.0)                                                              Downloaded    2.2MB/  2.2MB
✔︎ Bottle Manifest libnghttp3 (1.15.0)                                             Downloaded    7.3KB/  7.3KB
✔︎ Bottle libiconv (1.18)                                                          Downloaded    1.6MB/  1.6MB
✔︎ Bottle fmt (12.1.0)                                                             Downloaded  283.1KB/283.1KB
✔︎ Bottle ada-url (3.4.2)                                                          Downloaded  345.4KB/345.4KB
✔︎ Bottle Manifest ca-certificates (2025-12-02)                                    Downloaded    2.0KB/  2.0KB
✔︎ Bottle hdrhistogram_c (0.11.9)                                                  Downloaded   43.6KB/ 43.6KB
✔︎ Bottle libnghttp2 (1.68.0)                                                      Downloaded  220.8KB/220.8KB
✔︎ Bottle Manifest openssl@3 (3.6.1)                                               Downloaded   11.8KB/ 11.8KB
✔︎ Bottle Manifest libngtcp2 (1.20.0)                                              Downloaded    9.3KB/  9.3KB
✔︎ Bottle Manifest libuv (1.52.0)                                                  Downloaded    7.5KB/  7.5KB
✔︎ Bottle pcre2 (10.47_1)                                                          Downloaded    2.4MB/  2.4MB
✔︎ Bottle c-ares (1.34.6)                                                          Downloaded  304.1KB/304.1KB
✔︎ Bottle ca-certificates (2025-12-02)                                             Downloaded  131.8KB/131.8KB
✔︎ Bottle Manifest llhttp (9.3.1)                                                  Downloaded    7.2KB/  7.2KB
✔︎ Bottle libnghttp3 (1.15.0)                                                      Downloaded  189.0KB/189.0KB
✔︎ Bottle Manifest simdjson (4.2.4)                                                Downloaded    7.4KB/  7.4KB
✔︎ Bottle llhttp (9.3.1)                                                           Downloaded   36.8KB/ 36.8KB
✔︎ Bottle Manifest readline (8.3.3)                                                Downloaded   10.0KB/ 10.0KB
✔︎ Bottle Manifest uvwasi (0.0.23)                                                 Downloaded    8.3KB/  8.3KB
✔︎ Bottle gettext (1.0)                                                            Downloaded   10.3MB/ 10.3MB
✔︎ Bottle libngtcp2 (1.20.0)                                                       Downloaded  397.5KB/397.5KB
✔︎ Bottle libuv (1.52.0)                                                           Downloaded  375.2KB/375.2KB
✔︎ Bottle Manifest sqlite (3.51.2_1)                                               Downloaded   11.5KB/ 11.5KB
✔︎ Bottle Manifest lz4 (1.10.0)                                                    Downloaded   13.8KB/ 13.8KB
✔︎ Bottle uvwasi (0.0.23)                                                          Downloaded   70.1KB/ 70.1KB
✔︎ Bottle Manifest xz (5.8.2)                                                      Downloaded   11.8KB/ 11.8KB
✔︎ Bottle Manifest zstd (1.5.7_1)                                                  Downloaded   13.2KB/ 13.2KB
✔︎ Bottle Manifest mpdecimal (4.0.1)                                               Downloaded   11.9KB/ 11.9KB
✔︎ Bottle readline (8.3.3)                                                         Downloaded  758.1KB/758.1KB
✔︎ Bottle simdjson (4.2.4)                                                         Downloaded    1.2MB/  1.2MB
✔︎ Bottle sqlite (3.51.2_1)                                                        Downloaded    2.4MB/  2.4MB
✔︎ Bottle lz4 (1.10.0)                                                             Downloaded  276.1KB/276.1KB
✔︎ Bottle xz (5.8.2)                                                               Downloaded  764.9KB/764.9KB
✔︎ Bottle mpdecimal (4.0.1)                                                        Downloaded  185.7KB/185.7KB
✔︎ Bottle zstd (1.5.7_1)                                                           Downloaded  794.7KB/794.7KB
✔︎ Bottle git (2.53.0)                                                             Downloaded   22.6MB/ 22.6MB
✔︎ Bottle brotli (1.2.0)                                                           Downloaded  793.9KB/793.9KB
✔︎ Bottle icu4c@78 (78.2)                                                          Downloaded   32.0MB/ 32.0MB
✔︎ Bottle python@3.14 (3.14.3_1)                                                   Downloaded   19.1MB/ 19.1MB
✔︎ Bottle openssl@3 (3.6.1)                                                        Downloaded   10.9MB/ 10.9MB
✔︎ Bottle node (25.6.1)                                                            Downloaded   18.7MB/ 18.7MB
==> Pouring mas--5.2.0.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/mas/5.2.0: 9 files, 7.3MB
==> Running `brew cleanup mas`...
Disable this behaviour by setting `HOMEBREW_NO_INSTALL_CLEANUP=1`.
Hide these hints with `HOMEBREW_NO_ENV_HINTS=1` (see `man brew`).
==> Installing dependencies for git: libunistring, gettext, pcre2 and libiconv
==> Installing git dependency: libunistring
==> Pouring libunistring--1.4.1.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/libunistring/1.4.1: 59 files, 5.8MB
==> Installing git dependency: gettext
==> Pouring gettext--1.0.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/gettext/1.0: 2,499 files, 35.4MB
==> Installing git dependency: pcre2
==> Pouring pcre2--10.47_1.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/pcre2/10.47_1: 244 files, 7.3MB
==> Installing git dependency: libiconv
==> Pouring libiconv--1.18.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/libiconv/1.18: 32 files, 2.9MB
==> Installing git
==> Pouring git--2.53.0.arm64_sequoia.bottle.tar.gz
==> Caveats
The Tcl/Tk GUIs (e.g. gitk, git-gui) are now in the `git-gui` formula.
Subversion interoperability (git-svn) is now in the `git-svn` formula.
==> Summary
🍺  /opt/homebrew/Cellar/git/2.53.0: 1,741 files, 62.1MB
==> Running `brew cleanup git`...
==> Installing dependencies for node: fmt, ada-url, brotli, c-ares, hdrhistogram_c, icu4c@78, libnghttp2, libnghttp3, ca-certificates, openssl@3, libngtcp2, libuv, llhttp, simdjson, readline, sqlite, uvwasi, lz4, xz and zstd
==> Installing node dependency: fmt
==> Pouring fmt--12.1.0.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/fmt/12.1.0: 29 files, 1MB
==> Installing node dependency: ada-url
==> Pouring ada-url--3.4.2.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/ada-url/3.4.2: 55 files, 1.3MB
==> Installing node dependency: brotli
==> Pouring brotli--1.2.0.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/brotli/1.2.0: 33 files, 1.9MB
==> Installing node dependency: c-ares
==> Pouring c-ares--1.34.6.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/c-ares/1.34.6: 176 files, 1MB
==> Installing node dependency: hdrhistogram_c
==> Pouring hdrhistogram_c--0.11.9.arm64_sequoia.bottle.1.tar.gz
🍺  /opt/homebrew/Cellar/hdrhistogram_c/0.11.9: 22 files, 173KB
==> Installing node dependency: icu4c@78
==> Pouring icu4c@78--78.2.arm64_sequoia.bottle.1.tar.gz
🍺  /opt/homebrew/Cellar/icu4c@78/78.2: 279 files, 87.9MB
==> Installing node dependency: libnghttp2
==> Pouring libnghttp2--1.68.0.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/libnghttp2/1.68.0: 14 files, 788.7KB
==> Installing node dependency: libnghttp3
==> Pouring libnghttp3--1.15.0.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/libnghttp3/1.15.0: 20 files, 604.6KB
==> Installing node dependency: ca-certificates
==> Pouring ca-certificates--2025-12-02.all.bottle.1.tar.gz
==> Regenerating CA certificate bundle from keychain, this may take a while...
🍺  /opt/homebrew/Cellar/ca-certificates/2025-12-02: 4 files, 236.4KB
==> Installing node dependency: openssl@3
==> Pouring openssl@3--3.6.1.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/openssl@3/3.6.1: 7,624 files, 37.6MB
==> Installing node dependency: libngtcp2
==> Pouring libngtcp2--1.20.0.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/libngtcp2/1.20.0: 21 files, 1.3MB
==> Installing node dependency: libuv
==> Pouring libuv--1.52.0.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/libuv/1.52.0: 35 files, 1.3MB
==> Installing node dependency: llhttp
==> Pouring llhttp--9.3.1.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/llhttp/9.3.1: 13 files, 160.6KB
==> Installing node dependency: simdjson
==> Pouring simdjson--4.2.4.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/simdjson/4.2.4: 19 files, 6.6MB
==> Installing node dependency: readline
==> Pouring readline--8.3.3.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/readline/8.3.3: 56 files, 2.7MB
==> Installing node dependency: sqlite
==> Pouring sqlite--3.51.2_1.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/sqlite/3.51.2_1: 13 files, 5.3MB
==> Installing node dependency: uvwasi
==> Pouring uvwasi--0.0.23.arm64_sequoia.bottle.1.tar.gz
🍺  /opt/homebrew/Cellar/uvwasi/0.0.23: 15 files, 289.4KB
==> Installing node dependency: lz4
==> Pouring lz4--1.10.0.arm64_sequoia.bottle.1.tar.gz
🍺  /opt/homebrew/Cellar/lz4/1.10.0: 24 files, 730.7KB
==> Installing node dependency: xz
==> Pouring xz--5.8.2.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/xz/5.8.2: 96 files, 2.7MB
==> Installing node dependency: zstd
==> Pouring zstd--1.5.7_1.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/zstd/1.5.7_1: 32 files, 2.3MB
==> Installing node
==> Pouring node--25.6.1.arm64_sequoia.bottle.1.tar.gz
🍺  /opt/homebrew/Cellar/node/25.6.1: 1,931 files, 77.7MB
==> Running `brew cleanup node`...
==> Installing python@3.14 dependency: mpdecimal
==> Pouring mpdecimal--4.0.1.arm64_sequoia.bottle.tar.gz
🍺  /opt/homebrew/Cellar/mpdecimal/4.0.1: 22 files, 661.1KB
==> Pouring python@3.14--3.14.3_1.arm64_sequoia.bottle.tar.gz
==> Caveats
Python is installed as
  /opt/homebrew/bin/python3

Unversioned symlinks `python`, `python-config`, `pip` etc. pointing to
`python3`, `python3-config`, `pip3` etc., respectively, are installed into
  /opt/homebrew/opt/python@3.14/libexec/bin

`idle3.14` requires tkinter, which is available separately:
  brew install python-tk@3.14

See: https://docs.brew.sh/Homebrew-and-Python
==> Summary
🍺  /opt/homebrew/Cellar/python@3.14/3.14.3_1: 3,764 files, 75.3MB
==> Running `brew cleanup python@3.14`...
==> Caveats
zsh completions and functions have been installed to:
  /opt/homebrew/share/zsh/site-functions
zsh completions have been installed to:
  /opt/homebrew/share/zsh/site-functions
==> git
The Tcl/Tk GUIs (e.g. gitk, git-gui) are now in the `git-gui` formula.
Subversion interoperability (git-svn) is now in the `git-svn` formula.
==> python@3.14
Python is installed as
  /opt/homebrew/bin/python3

Unversioned symlinks `python`, `python-config`, `pip` etc. pointing to
`python3`, `python3-config`, `pip3` etc., respectively, are installed into
  /opt/homebrew/opt/python@3.14/libexec/bin

`idle3.14` requires tkinter, which is available separately:
  brew install python-tk@3.14

See: https://docs.brew.sh/Homebrew-and-Python
admin@robs-Mac-Studio ~ % history
   28  ls -1 "/Library/Audio/Plug-Ins/Components" | grep -i '^UAD ' | sort | head -200
   29  history
   30  nano ~/rebuild_apps.sh
   31  nano ~/rebuild_apps.sh
   32  chmod +x ~/rebuild_apps.sh
   33  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   34  sudo -V
   35  curl -I https://raw.githubusercontent.com
   36  curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh -o brew_install.sh
   37  bash brew_install.sh
   38  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile\neval "$(/opt/homebrew/bin/brew shellenv)"
   40  eval "$(/opt/homebrew/bin/brew shellenv)"\n
   41  brew --version
   42  which brew
   43  brew install mas git node python
admin@robs-Mac-Studio ~ % 
