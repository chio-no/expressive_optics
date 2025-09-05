import os.path
from datetime import datetime
from flask import Flask, render_template, jsonify, request
import compute_rhino3d.Util
import compute_rhino3d.Grasshopper as gh
import rhino3dm
import json
import csv

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def main_page():
    # handle_gh()
    return render_template("index.html")


@app.route("/saveParams", methods=["POST"])
def save_params():
    #データの受信
    data = request.json
    print(data,flush=True)

    data["lens_type"]=int(data["lens_type"])
    data["mask_type"] = int(data["mask_type"])
    #CSV形式に合わせてデータ整理
    CSV_datas = []
    for each_data in data.values():
        CSV_datas.append(each_data)

    #log用ディレクトリの作製（なければ）
    log_dir="log"
    os.makedirs(log_dir, exist_ok=True)

    filename_main = "lensParams.csv"
    now=datetime.now()
    filename_sub=os.path.join(log_dir,now.strftime("%m%d-%H%M%S")+".csv")

    with open(filename_main, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        for item in CSV_datas:
            writer.writerow([item])

    with open(filename_sub, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        for item in CSV_datas:
            writer.writerow([item])

    return jsonify(success=True)


def handle_gh():
    print("hey")
    gh_file_path = "static/gh/filterworkdesignerforui_vray.gh"
    compute_rhino3d.Util.url = "http://localhost:6500/"

    param1 = gh.DataTree("lensThickness")
    param1.Append([0], [15])
    trees = []
    trees.append(param1)
    output = gh.EvaluateDefinition(gh_file_path, trees)
    # print(output["values"][0]["InnerTree"]['{0;0}'], flush=True)
