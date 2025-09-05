from flask import Flask
from flask import render_template
import compute_rhino3d.Util
import compute_rhino3d.Grasshopper as gh
import rhino3dm
import json

def handle_gh():
    print("hey")
    gh_file_path="static/gh/filterworkdesignerforui_vray.gh"
    compute_rhino3d.Util.url = "http://localhost:6500/"

    param1=gh.DataTree("lensThickness")
    param1.Append([0], [15])
    trees=[]
    trees.append(param1)
    output = gh.EvaluateDefinition(gh_file_path, trees)
    print(output["values"][0]["InnerTree"]['{0;0}'][0]["data"], flush=True)
    print(type(output["values"][0]["InnerTree"]['{0;0}'][0]["data"]))


handle_gh()