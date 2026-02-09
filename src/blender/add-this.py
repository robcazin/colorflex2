  import bpy
  import os
  import json

  # ============================================================================
  # HELPER FUNCTIONS
  # ============================================================================

  def slugify(text):
      """Convert text to URL-friendly slug"""
      return text.lower().replace(" ", "-").replace("'", "").replace("&", "")

  # ============================================================================
  # CONFIGURATION - EDIT THESE FOR YOUR WINDOWS PC
  # ============================================================================

  # Which collection to render (change for each batch)
  TARGET_COLLECTION = "botanicals"  # Options: botanicals, bombay, coordinates, etc.

  # WINDOWS PATHS - Update these for your PC
  COLLECTIONS_JSON = r"D:\jobs-local-pc\EC\data\collections.json"
  LAYERS_BASE_PATH = r"D:\jobs-local-pc\EC\data\collections"
  OUTPUT_ROOT = r"D:\jobs-local-pc\EC\output"

  # Garment Blender files on your PC (FULL PATHS)
  GARMENT_SCENES = {
      "dress": {
          "file": r"D:\jobs-local-pc\EC\blender\dress-fabric-ready2.blend",
          "object": "dress"
      },
      "pantsuit": {
          "file": r"D:\jobs-local-pc\EC\blender\dress-fabric-girl-base2.blend",
          "object": "winter2"
      }
  }

  # Scale settings (don't change unless needed)
  RENDER_SCALES = [1.0, 0.909, 0.833, 0.769]
  SCALE_LABELS = ["1.0", "1.1", "1.2", "1.3"]

  # Render quality
  SAMPLES = 8
  RES_X = 600
  RES_Y = 800

  # ============================================================================
  # SCRIPT CODE - DO NOT EDIT BELOW
  # ============================================================================