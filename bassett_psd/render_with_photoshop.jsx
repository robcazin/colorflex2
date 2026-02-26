// Photoshop ExtendScript: read bridge file from same folder (bassett_psd_bridge.txt),
// open PSD, find layers by name, replace Smart Objects with pattern, set BLANKET COLOR, export PNG.
// Called by run_bassett_photoshop.sh after writing the bridge file.
// Bridge format: PSD_PATH=... PATTERN_PATH=... OUTPUT_PATH=... BLANKET_HEX=#RRGGBB PILLOW_SCALE=1.0 SOFA_SCALE=1.0

var bridgePath = File($.fileName).parent.fsName + "/bassett_psd_bridge.txt";
var bridgeFile = new File(bridgePath);
if (!bridgeFile.exists) {
  alert("Bridge file not found: " + bridgePath);
} else {
  bridgeFile.open("r");
  var content = bridgeFile.read();
  bridgeFile.close();
  var lines = content.split("\n");
  var opts = {};
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].replace(/^\s*#.*$/, "").trim();
    if (line.indexOf("=") >= 0) {
      var idx = line.indexOf("=");
      opts[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
    }
  }
  var psdPath = opts.PSD_PATH || opts.psd_path;
  var patternPath = opts.PATTERN_PATH || opts.pattern_path;
  var outputPath = opts.OUTPUT_PATH || opts.output_path;
  var blanketHex = opts.BLANKET_HEX || opts.blanket_hex || "#336699";
  if (!psdPath || !patternPath || !outputPath) {
    alert("Bridge missing PSD_PATH, PATTERN_PATH, or OUTPUT_PATH");
  } else {
    var psdFile = new File(psdPath);
    var patternFile = new File(patternPath);
    var outFile = new File(outputPath);
    if (!psdFile.exists) alert("PSD not found: " + psdPath);
    else if (!patternFile.exists) alert("Pattern not found: " + patternPath);
    else {
      app.open(psdFile);
      var doc = app.activeDocument;
      // Find layers by name: LEFT PILLOW PATTERN, RIGHT PILLOW PATTERN, SOFA FABRIC PATTERN, BLANKET COLOR
      // Replace Smart Object contents with pattern file for first three; set fill for BLANKET COLOR
      // Then export as PNG to outputPath
      try {
        var layerNames = ["LEFT PILLOW PATTERN", "RIGHT PILLOW PATTERN", "SOFA FABRIC PATTERN", "BLANKET COLOR"];
        for (var L = 0; L < doc.layers.length; L++) {
          var layer = doc.layers[L];
          if (layer.typename === "ArtLayer") {
            for (var n = 0; n < layerNames.length; n++) {
              if (layer.name === layerNames[n]) {
                if (n < 3 && layer.kind === "LayerKind.SMARTOBJECT") {
                  layer.replaceContents(patternFile.fsName);
                } else if (layerNames[n] === "BLANKET COLOR") {
                  // Set solid fill to blanketHex (simplified: use fill with color)
                  var r = parseInt(blanketHex.substr(1, 2), 16) / 255;
                  var g = parseInt(blanketHex.substr(3, 2), 16) / 255;
                  var b = parseInt(blanketHex.substr(5, 2), 16) / 255;
                  var fillColor = new SolidColor();
                  fillColor.rgb.red = Math.round(r * 255);
                  fillColor.rgb.green = Math.round(g * 255);
                  fillColor.rgb.blue = Math.round(b * 255);
                  app.activeDocument.activeLayer = layer;
                  doc.selection.selectAll();
                  app.foregroundColor = fillColor;
                  layer.fill(fillColor.opacity, fillColor.model, fillColor.mode, fillColor.opacity, fillColor.rgb.hexValue);
                  doc.selection.deselect();
                }
                break;
              }
            }
          }
        }
        var pngOpts = new PNGSaveOptions();
        pngOpts.compression = 6;
        pngOpts.interlaced = false;
        doc.saveAs(outFile, pngOpts, true, Extension.LOWERCASE);
        doc.close(SaveOptions.DONOTSAVECHANGES);
      } catch (e) {
        alert("JSX error: " + e.toString());
      }
    }
  }
}
