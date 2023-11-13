{
  description = "High-performance computing projects";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=refs/heads/master";
    nixpkgs-asciidoc.url = "github:zebreus/nixpkgs?ref=f1a3be7a1160cc4810c0274ab76f0fac813eb4d6";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, nixpkgs-asciidoc }:
    flake-utils.lib.eachDefaultSystem (system:
      with nixpkgs.legacyPackages.${system};
      let
        pkgs-with-asciidoc = import nixpkgs-asciidoc { inherit system; };
      in
      rec {

        name = "high-performance-computing";
        packages.default =
          llvmPackages_16.stdenv.mkDerivation {
            name = name;
            src = ./.;

            nativeBuildInputs = [
              stdenv.cc.cc.lib
            ];

            LD_LIBRARY_PATH = lib.makeLibraryPath [ stdenv.cc.cc.lib ];
            CANVAS_DISABLE_SYSTEM_FONTS = 1;
            FONT_DIR = "${dejavu_fonts}/share/fonts";

            buildInputs = [
              llvmPackages_16.openmp
              gcc12
              clang_16

              stdenv.cc.cc.lib
              openmpi
              gnumake
              zlib
              sshfs

              clang-tools_16
              lldb
              nil


#              (deno.overrideAttrs (oldAttrs: rec {
#		pname = "deno";
#                version = "1.38.1";
#                src = fetchFromGitHub {
#                  owner = "denoland";
#                  repo = "deno";
#                  rev = "v1.38.1";
#                  hash = "sha256-s8mwAoNUsGuVeoCF9cWxY6jwJIFHlL8jnudysWi2fcA=";
#                };
#                cargoDeps = oldAttrs.cargoDeps.overrideAttrs (lib.const {
#      name = "${pname}-vendor.tar.gz";
#      inherit src;
#      outputHash = "sha256-gMRGGSSYCHE0s/NnNCHVpYZZIzwJj6OMvS37qXpQ1uc=";
#    });
#              }))
deno
              jupyter
              python3
              pkgs-with-asciidoc.asciidoctor-web-pdf
              pkgs-with-asciidoc.asciidoctor-js
              pkgs-with-asciidoc.sass
              pkgs-with-asciidoc.gnumake
              pkgs-with-asciidoc.nixpkgs-fmt
              pkgs-with-asciidoc.nil
              pkgs-with-asciidoc.jq
            ];
          };
      }
    );
}
