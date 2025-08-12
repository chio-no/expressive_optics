// Import libraries
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import rhino3dm from "rhino3dm";
import { RhinoCompute } from "rhinocompute";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

const definitionName = "filterworkdesignerforui_vray.gh";
// Set ui
const lensThickness = document.getElementById("lensThickness");
lensThickness.addEventListener("mouseup", onSliderChange, false);
lensThickness.addEventListener("touchend", onSliderChange, false);

const prismLevel = document.getElementById("prismLevel");
prismLevel.addEventListener("mouseup", onSliderChange, false);
prismLevel.addEventListener("touchend", onSliderChange, false);

const haloLevel = document.getElementById("haloLevel");
haloLevel.addEventListener("mouseup", onSliderChange, false);
haloLevel.addEventListener("touchend", onSliderChange, false);

const text = document.getElementById("text");

const textSize = document.getElementById("textSize");
textSize.addEventListener("mouseup", onSliderChange, false);
textSize.addEventListener("touchend", onSliderChange, false);

const cross = document.getElementById("cross");
const statusValue = document.getElementById("status-value");

const crossDensity = document.getElementById("crossDensity");
crossDensity.addEventListener("mouseup", onSliderChange, false);
crossDensity.addEventListener("touchend", onSliderChange, false);

const maskStart = document.getElementById("maskStart");
maskStart.addEventListener("mouseup", onSliderChange, false);
maskStart.addEventListener("touchend", onSliderChange, false);

const maskEnd = document.getElementById("maskEnd");
maskEnd.addEventListener("mouseup", onSliderChange, false);
maskEnd.addEventListener("touchend", onSliderChange, false);

const maskAngle = document.getElementById("maskAngle");
maskAngle.addEventListener("mouseup", onSliderChange, false);
maskAngle.addEventListener("touchend", onSliderChange, false);

const holeSize = document.getElementById("holeSize");
holeSize.addEventListener("mouseup", onSliderChange, false);
holeSize.addEventListener("touchend", onSliderChange, false);

const downloadButton = document.getElementById("download");
downloadButton.addEventListener("click", download, false);

//ドロップダウンロジック レンズ形状編
// DOM要素を取得
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownContent = document.getElementById("myDropdown");
const selectedValue = document.getElementById("selectedValue");
const dropdownItems = document.querySelectorAll(".dropdown-item");

// ボタンがクリックされたらメニューの表示/非表示を切り替える
dropdownBtn.addEventListener("click", function (event) {
  event.stopPropagation();
  dropdownContent.classList.toggle("show");
});

// 各項目がクリックされたときの処理
dropdownItems.forEach(function (item) {
  item.addEventListener("click", function () {
    // ボタンのテキストをクリックされた項目の数値に更新
    //値も変更
    selectedValue.textContent = this.textContent;
    dropdownBtn.dataset.value = item.dataset.value;

    // メニューを閉じる
    dropdownContent.classList.remove("show");

    //rhinoの計算をする
    onSliderChange();
  });
});

// ウィンドウの他の場所がクリックされたらメニューを閉じる
window.addEventListener("click", function (event) {
  // メニューが表示されている場合のみ処理
  if (dropdownContent.classList.contains("show")) {
    dropdownContent.classList.remove("show");
  }
});

//ドロップダウンロジック
// DOM要素を取得
const dropdownBtn_mask = document.getElementById("masktypeBtn");
const dropdownContent_mask = document.getElementById("typeDropdown");
const selectedValue_mask = document.getElementById("selectedType");
const dropdownItems_mask = document.querySelectorAll(".dropdown-item_mask");

// ボタンがクリックされたらメニューの表示/非表示を切り替える
dropdownBtn_mask.addEventListener("click", function (event) {
  event.stopPropagation();
  dropdownContent_mask.classList.toggle("show");
});

// 各項目がクリックされたときの処理
dropdownItems_mask.forEach(function (item) {
  item.addEventListener("click", function () {
    // ボタンのテキストをクリックされた項目の数値に更新
    selectedValue_mask.textContent = this.textContent;
    dropdownBtn_mask.dataset.value = item.dataset.value;

    // メニューを閉じる
    dropdownContent_mask.classList.remove("show");

    //rhinoの計算をする
    onSliderChange();
  });
});

// ウィンドウの他の場所がクリックされたらメニューを閉じる
window.addEventListener("click", function (event) {
  // メニューが表示されている場合のみ処理
  if (dropdownContent_mask.classList.contains("show")) {
    dropdownContent_mask.classList.remove("show");
  }
});

//タブ遷移ロジック
document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // ① すべてのボタンとコンテンツから active クラスを削除
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // ② クリックされたボタンに active クラスを追加
      button.classList.add("active");

      // ③ 対応するコンテンツに active クラスを追加して表示
      const targetTab = button.getAttribute("data-tab");
      document.getElementById(targetTab).classList.add("active");
    });
  });
});

//テキストボックス関係
// HTMLドキュメントが読み込まれた後に実行
document.addEventListener("DOMContentLoaded", () => {
  // id="search-box"を持つ要素を取得
  const searchBox = document.getElementById("text");

  // searchBoxでキーが押された時にイベントを実行
  searchBox.addEventListener("keydown", (event) => {
    // もし押されたキーが 'Enter' ならば
    if (event.key === "Enter") {
      // 入力された値を取得
      const searchText = searchBox.value;

      // 入力が空でなければ処理を実行
      if (searchText) {
        //rhinoで処理する
        onSliderChange();
      }
    }
  });
});

//トグル関係
// トグルの状態が変更されたら実行
cross.addEventListener("change", function () {
  // this.checkedがtrueなら1、falseなら0をvalueに代入

  // 画面上の表示を更新
  const crossStr = cross.checked ? "cross" : "no cross";
  // statusValue.textContent = crossStr;

  //rhninoを回す
  onSliderChange();
});

//ここからrhino.compute依存
let rhino, definition;
rhino3dm().then(async (m) => {
  console.log("Loaded rhino3dm.");
  rhino = m; // global

  RhinoCompute.url = getAuth("http://localhost:6500/"); // RhinoCompute server url. Use http://localhost:8081 if debugging locally.
  // RhinoCompute server api key. Leave blank if debugging locally.

  // load a grasshopper file!
  const url = definitionName;
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const arr = new Uint8Array(buffer);
  definition = arr;

  init();
  compute();
});

async function compute() {
  //gh側のパラメータを取得し、UI上での値を入れる
  const param1 = new RhinoCompute.Grasshopper.DataTree("lensThickness");
  param1.append([0], [lensThickness.valueAsNumber]);

  const param2 = new RhinoCompute.Grasshopper.DataTree("prismLevel");
  param2.append([0], [prismLevel.valueAsNumber]);

  const param3 = new RhinoCompute.Grasshopper.DataTree("haloLevel");
  param3.append([0], [haloLevel.valueAsNumber]);
  //テキストの処理注意
  const param4 = new RhinoCompute.Grasshopper.DataTree("crossString");
  param4.append([0], [text.value]);

  const param5 = new RhinoCompute.Grasshopper.DataTree("textSize");
  param5.append([0], [textSize.valueAsNumber]);

  //トグルの処理
  const param6 = new RhinoCompute.Grasshopper.DataTree("cross");
  // this.checkedがtrueなら1、falseなら0をvalueに代入
  const crossValue = cross.checked ? 1 : 0;
  // const crossStr = cross.checked ? "cross" : "no cross";
  // statusValue.textContent = crossStr;
  // console.log(crossValue);
  // console.log(param6);
  param6.append([0], [crossValue]);

  const param7 = new RhinoCompute.Grasshopper.DataTree("crossDensity");
  param7.append([0], [crossDensity.valueAsNumber]);

  const param8 = new RhinoCompute.Grasshopper.DataTree("maskStart");
  param8.append([0], [maskStart.valueAsNumber]);

  const param9 = new RhinoCompute.Grasshopper.DataTree("maskEnd");
  param9.append([0], [maskEnd.valueAsNumber]);

  const param10 = new RhinoCompute.Grasshopper.DataTree("maskAngle");
  param10.append([0], [maskAngle.valueAsNumber]);

  const param11 = new RhinoCompute.Grasshopper.DataTree("holeSize");
  param11.append([0], [holeSize.valueAsNumber]);

  const param12 = new RhinoCompute.Grasshopper.DataTree("lensSelector");
  param12.append([0], [dropdownBtn.dataset.value]);

  const param13 = new RhinoCompute.Grasshopper.DataTree("mask");
  param13.append([0], [dropdownBtn_mask.dataset.value]);

  //スピナーの表示
  document.getElementById("loader").style.display = "block";

  let mesh;

  //ngonalを何とかする
  //ngonalが選択されたら他のモデルを表示させてごまかす
  if (dropdownBtn.dataset.value == "5") {
    const modelColor = new THREE.Color("rgb(140, 205, 235)");

    // STLファイルをロードしてレンダリング
    const stlLoader = new STLLoader();
    stlLoader.load("mock.stl", (geometry) => {
      const material = new THREE.MeshStandardMaterial({
        color: modelColor,
      });
      mesh = new THREE.Mesh(geometry, material);
    });
  } else {
    // clear values
    const trees = [];
    trees.push(param1);
    trees.push(param2);
    trees.push(param3);
    trees.push(param4);
    trees.push(param5);
    trees.push(param6);
    trees.push(param7);
    trees.push(param8);
    trees.push(param9);
    trees.push(param10);
    trees.push(param11);
    trees.push(param12);
    trees.push(param13);

    const res = await RhinoCompute.Grasshopper.evaluateDefinition(
      definition,
      trees
    );

    // hide spinner
    document.getElementById("loader").style.display = "none";

    //get the b64 mesh output
    //b64がres.values[1]であることを確認すること
    const data = JSON.parse(res.values[1].InnerTree["{0}"][0].data);
    mesh = rhino.DracoCompression.decompressBase64String(data);
  }

  const modelColor = new THREE.Color("rgb(140, 205, 235)");
  const material = new THREE.MeshStandardMaterial({
    color: modelColor,
  });
  const threeMesh = meshToThreejs(mesh, material);

  // clear the scene
  scene.traverse((child) => {
    if (child.isMesh) {
      scene.remove(child);
    }
  });

  scene.add(threeMesh);
}

function onSliderChange() {
  // show spinner
  document.getElementById("loader").style.display = "block";
  compute();
}

function getAuth(key) {
  //   let value = localStorage[key];
  let value = key;
  if (value === undefined) {
    const prompt = key.includes("URL") ? "Server URL" : "Server API Key";
    value = window.prompt("RhinoCompute " + prompt);
    if (value !== null) {
      localStorage.setItem(key, value);
    }
  }

  return value;
}

// BOILERPLATE //

let scene, camera, renderer, controls;

function init() {
  // Rhino models are z-up, so set this as the default
  THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#1D1D1F");
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  // シーン全体を均一に照らす環境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 特定の方向から照らす平行光源（陰影やハイライトを生む）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5); // 光の方向を調整
  scene.add(directionalLight);

  window.addEventListener("resize", onWindowResize, false);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

function meshToThreejs(mesh, material) {
  const loader = new THREE.BufferGeometryLoader();
  const geometry = loader.parse(mesh.toThreejsJSON());
  return new THREE.Mesh(geometry, material);
}

//モデルダウンロード　現在のパラメータで一応再計算する
async function download() {
  // スピナーを表示
  document.getElementById("loader").style.display = "block";

  // compute関数と同様にインプットを作成
  //gh側のパラメータを取得し、UI上での値を入れる
  const param1 = new RhinoCompute.Grasshopper.DataTree("lensThickness");
  param1.append([0], [lensThickness.valueAsNumber]);

  const param2 = new RhinoCompute.Grasshopper.DataTree("prismLevel");
  param2.append([0], [prismLevel.valueAsNumber]);

  const param3 = new RhinoCompute.Grasshopper.DataTree("haloLevel");
  param3.append([0], [haloLevel.valueAsNumber]);
  //テキストの処理注意
  const param4 = new RhinoCompute.Grasshopper.DataTree("crossString");
  param4.append([0], [text.value]);

  const param5 = new RhinoCompute.Grasshopper.DataTree("textSize");
  param5.append([0], [textSize.valueAsNumber]);

  //トグルの処理
  const param6 = new RhinoCompute.Grasshopper.DataTree("cross");
  // this.checkedがtrueなら1、falseなら0をvalueに代入
  const crossValue = cross.checked ? 1 : 0;
  // const crossStr = cross.checked ? "cross" : "no cross";
  // statusValue.textContent = crossStr;
  // console.log(crossValue);
  // console.log(param6);
  param6.append([0], [crossValue]);

  const param7 = new RhinoCompute.Grasshopper.DataTree("crossDensity");
  param7.append([0], [crossDensity.valueAsNumber]);

  const param8 = new RhinoCompute.Grasshopper.DataTree("maskStart");
  param8.append([0], [maskStart.valueAsNumber]);

  const param9 = new RhinoCompute.Grasshopper.DataTree("maskEnd");
  param9.append([0], [maskEnd.valueAsNumber]);

  const param10 = new RhinoCompute.Grasshopper.DataTree("maskAngle");
  param10.append([0], [maskAngle.valueAsNumber]);

  const param11 = new RhinoCompute.Grasshopper.DataTree("holeSize");
  param11.append([0], [holeSize.valueAsNumber]);

  const param12 = new RhinoCompute.Grasshopper.DataTree("lensSelector");
  param12.append([0], [dropdownBtn.dataset.value]);

  const param13 = new RhinoCompute.Grasshopper.DataTree("mask");
  param13.append([0], [dropdownBtn_mask.dataset.value]);

  const trees = [
    param1,
    param2,
    param3,
    param4,
    param5,
    param6,
    param7,
    param8,
    param9,
    param10,
    param11,
    param12,
    param13,
  ];

  // Grasshopperの定義を評価
  const res = await RhinoCompute.Grasshopper.evaluateDefinition(
    definition,
    trees
  );

  // 新しい3dmファイルを作成
  const doc = new rhino.File3dm();

  // Grasshopperの出力からジオメトリを取得し、docに追加
  // 注意: 表示用のメッシュはres.values[1]でしたが、ここでは
  // 3dmファイルに保存するための生のジオメトリ(Brep等)が
  // res.values[0]に含まれていると想定しています。
  const objects = res.values[0].InnerTree["{0}"];
  for (let i = 0; i < objects.length; i++) {
    const data = JSON.parse(objects[i].data);
    const rhinoObject = rhino.CommonObject.decode(data);
    doc.objects().add(rhinoObject, null);
  }

  // スピナーを非表示
  document.getElementById("loader").style.display = "none";

  // 3dmファイルを生成してダウンロードをトリガー
  const buffer = doc.toByteArray();
  const blob = new Blob([buffer], { type: "application/octet-stream" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "model.3dm";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
