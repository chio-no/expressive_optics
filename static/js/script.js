// Import libraries
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import rhino3dm from "rhino3dm";
import { RhinoCompute } from "rhinocompute";

const definitionName = "static/gh/filterworkdesignerforui_vray.gh";

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

const holeType = document.getElementById("holeType");
holeType.addEventListener("mouseup", onSliderChange, false);
holeType.addEventListener("touchend", onSliderChange, false);

const downloadButton = document.getElementById("download");
downloadButton.addEventListener("click", download, false);

const importButton = document.getElementById("import");
importButton.addEventListener("click", importParams, false);

//ドロップダウンロジック レンズ形状編
// DOM要素を取得
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownContent = document.getElementById("myDropdown");
const selectedValue = document.getElementById("selectedValue");
const dropdownItems = document.querySelectorAll(".dropdown-item");

// ボタンがクリックされたらメニューの表示/非表示を切り替える
dropdownBtn.addEventListener("click", function (event) {
  event.preventDefault();
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
  event.preventDefault();
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

      //rhinoで処理する
      onSliderChange();
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
let initialLoad=true;
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

  const param2 = new RhinoCompute.Grasshopper.DataTree("PrismLevel");
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

  const param14 = new RhinoCompute.Grasshopper.DataTree("holeType");
  param14.append([0], [holeType.valueAsNumber]);

  //スピナーの表示
  document.getElementById("loader").style.display = "block";

  // RhinoComputeでメッシュを生成する場合
  const trees = [];
  trees.push(
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
    param14
  );

  const res = await RhinoCompute.Grasshopper.evaluateDefinition(
    definition,
    trees
  );

  // b64メッシュを取得
  //crossvalueの有無でindexがどうやら違いそうなのでそれへの対応
  let data, rhinoMesh;
  if (crossValue == 1) {
    data = JSON.parse(res.values[1].InnerTree["{0;0;0;0;0}"][0].data);
    rhinoMesh = rhino.DracoCompression.decompressBase64String(data);
  } else {
    console.log(res);
    data = JSON.parse(res.values[1].InnerTree["{0;0}"][0].data);
    rhinoMesh = rhino.DracoCompression.decompressBase64String(data);
  }

  // マテリアルを作成
  const material = new THREE.MeshStandardMaterial({
    color: "rgb(140, 205, 235)",
  });

  // RhinoのメッシュをThree.jsのメッシュに変換
  const threeMesh = meshToThreejs(rhinoMesh, material);

  // --- 以下の処理はif/elseの完了後に行われるため、共通化できる ---

  // ローダーを非表示に
  document.getElementById("loader").style.display = "none";

  // シーンから既存のメッシュを削除
  scene.traverse((child) => {
    if (child.isMesh) {
      scene.remove(child);
    }
  });

  scene.add(threeMesh);
  if (initialLoad) {
    fitToObject(threeMesh, { fill: 0.8, offsetYPx: 300 });
    initialLoad = false;
  }
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
  camera.position.set(100, -550, 100);

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

//Meshのビューを調整する関数
function fitToObject(mesh, { fill = 0.9, offsetYPx = 200 } = {}) {
  // 1) サイズと中心
  mesh.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = box.getCenter(new THREE.Vector3());

  // 2) 画面に大きく収めるための距離を計算
  const maxSize = Math.max(size.x, size.y, size.z);
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const fitHeightDist = maxSize / (2 * Math.tan(vFov * 0.5));
  const fitWidthDist = fitHeightDist / camera.aspect;
  let distance = Math.max(fitHeightDist, fitWidthDist);
  distance /= fill; // fill<1 で「大きめ」に表示

  // 3) 現在の視線方向を維持したまま、中心から distance だけ離れた位置へ
  const dir = new THREE.Vector3()
    .subVectors(camera.position, controls.target)
    .normalize();
  camera.position.copy(center).addScaledVector(dir, distance);
  camera.updateProjectionMatrix();

  // 4) 注視点をスクリーンの“上”方向に対して下げる = 画面上では上に寄る
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const right = new THREE.Vector3()
    .crossVectors(forward, camera.up)
    .normalize();
  const upVec = new THREE.Vector3().crossVectors(right, forward).normalize();

  const worldPerPixel =
    (2 * distance * Math.tan(vFov * 0.5)) / renderer.domElement.clientHeight;

  controls.target
    .copy(center)
    .addScaledVector(upVec, -offsetYPx * worldPerPixel);

  controls.update();
}

//現在のパラメータをCSVファイルに書き出す
async function download(event) {
  //ページのリロードを防止
  event.preventDefault();
  // スピナーを表示
  document.getElementById("loader").style.display = "block";

  //現在のパラメータを取得し、CSV形式とする
  const crossValue = cross.checked ? 1 : 0;

  // const csvContent =
  //   "Lens Params" +
  //   "\n" +
  //   lensThickness.valueAsNumber +
  //   "\n" +
  //   0.6 +
  //   "\n" +
  //   haloLevel.valueAsNumber +
  //   "\n" +
  //   dropdownBtn.dataset.value +
  //   "\n" +
  //   prismLevel.valueAsNumber +
  //   "\n" +
  //   maskStart.valueAsNumber +
  //   "\n" +
  //   maskEnd.valueAsNumber +
  //   "\n" +
  //   maskAngle.valueAsNumber +
  //   "\n" +
  //   holeSize.valueAsNumber +
  //   "\n" +
  //   text.value +
  //   "\n" +
  //   textSize.valueAsNumber +
  //   "\n" +
  //   crossDensity.valueAsNumber +
  //   "\n" +
  //   dropdownBtn_mask.dataset.value +
  //   "\n" +
  //   crossValue +
  //   "\n" +
  //   holeType.valueAsNumber +
  //   "\n";

  const rawLensPrams = {
    header: "Lens Params",
    lens_thickness: lensThickness.valueAsNumber,
    base_height: 0.6,
    halo_level: haloLevel.valueAsNumber,
    lens_type: dropdownBtn.dataset.value,
    prism_level: prismLevel.valueAsNumber,
    mask_start: maskStart.valueAsNumber,
    mask_end: maskEnd.valueAsNumber,
    mask_angle: maskAngle.valueAsNumber,
    hole_size: holeSize.valueAsNumber,
    text: text.value,
    text_size: textSize.valueAsNumber,
    cross_density: crossDensity.valueAsNumber,
    mask_type: dropdownBtn_mask.dataset.value,
    cross_value: crossValue,
    hole_type: holeType.valueAsNumber,
  };

  fetch("/saveParams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rawLensPrams),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("export successfully");
        // スピナーを非表示
        document.getElementById("loader").style.display = "none";
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });

  // try {
  //   const CopyCSVName = returnCSVfileName();

  //   const dirHandle = await window.showDirectoryPicker();
  //   const dirHandleForCopy = await dirHandle.getDirectoryHandle("log", {
  //     create: true,
  //   });

  //   const fileHandle = await dirHandle.getFileHandle("test.csv", {
  //     create: true,
  //   });
  //   const fileHandleCopy = await dirHandleForCopy.getFileHandle(CopyCSVName, {
  //     create: true,
  //   });

  //   // 2. 書き込み用のストリームを作成する
  //   // この時点でファイルの中身は空になります（トランケート）
  //   const writableStream = await fileHandle.createWritable();
  //   const writableStreamCopy = await fileHandleCopy.createWritable();

  //   // 3. 新しい内容をストリームに書き込む
  //   await writableStream.write(csvContent);
  //   await writableStreamCopy.write(csvContent);

  //   // 4. ストリームを閉じて、ディスクへの書き込みを完了させる
  //   await writableStream.close();
  //   await writableStreamCopy.close();

  //   // スピナーを非表示
  //   document.getElementById("loader").style.display = "none";

  //   console.log("csv exported");
  //   //今の値をUI側に返す
  // } catch (error) {
  //   // スピナーを非表示
  //   document.getElementById("loader").style.display = "none";
  //   // ユーザーがファイル選択をキャンセルした場合など
  //   if (error.name === "AbortError") {
  //     console.log("ファイル選択がキャンセルされました。");
  //   } else {
  //     console.log(`❌ エラーが発生しました: ${error.message}`);
  //     console.error(error);
  //   }
  // }
}

async function importParams() {
  //ファイルピッカを表示し、その中のパラメータをHTMLへ戻す
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "CSV Files",
          accept: {
            "text/csv": [".csv"],
          },
        },
      ],
    });
    // 2. 選択されたファイルオブジェクトを取得
    const file = await fileHandle.getFile();

    // 3. ファイルの内容をカンマ区切りとして読み込む
    const csvText = await file.text();
    console.log(csvText);
    // これまでのCSV出力ではこっち
    //   const rows = csvText
    // .trim()
    // .split("\n")
    // .map((row) => row.split(","));
    const rows = csvText
      .trim()
      .split("\n")
      .map((row) => row.trim().split(","));

    console.log(rows);

    //値を返す スライダそのものとそのラベルに値を反映させる
    lensThickness.value = rows[1];
    setSliderValueLabel(lensThickness, rows[1]);

    haloLevel.value = rows[3];
    setSliderValueLabel(haloLevel, rows[3]);

    prismLevel.value = rows[5];
    setSliderValueLabel(prismLevel, rows[5]);

    maskStart.value = rows[6];
    setSliderValueLabel(maskStart, rows[6]);

    maskEnd.value = rows[7];
    setSliderValueLabel(maskEnd, rows[7]);

    maskAngle.value = rows[8];
    setSliderValueLabel(maskAngle, rows[8]);

    holeSize.value = rows[9];
    setSliderValueLabel(holeSize, rows[9]);

    textSize.value = rows[11];
    setSliderValueLabel(textSize, rows[11]);

    crossDensity.value = rows[12];
    setSliderValueLabel(crossDensity, rows[12]);

    holeType.value = rows[15];
    setSliderValueLabel(holeType, rows[15]);

    text.value = rows[10];
    dropdownBtn.dataset.value = rows[4];
    dropdownBtn_mask.dataset.value = rows[13];
    cross.checked = Boolean(parseInt(rows[14]));

    //スライダだけでなく、その右にあるラベル的な要素にも値を返す

    const filterText = returnFilterTypeTxt(rows[4]);
    const maskText = returnMaskTypeTxt(rows[13]);

    //ドロップダウンに反映させた値を表示させる
    selectedValue.textContent = filterText;
    selectedValue_mask.textContent = maskText;

    compute();
  } catch (error) {
    // ユーザーがファイル選択をキャンセルした場合など
    if (error.name === "AbortError") {
      console.log("ファイル選択がキャンセルされました。");
    } else {
      console.log(`❌ エラーが発生しました: ${error.message}`);
      console.error(error);
    }
  }
}

function returnMaskTypeTxt(maskTypeValue) {
  if (maskTypeValue == "0") {
    return "no mask";
  } else if (maskTypeValue == "1") {
    return "positive";
  } else {
    return "negative";
  }
}

function returnFilterTypeTxt(filterTypeValue) {
  if (filterTypeValue == "0") {
    return "Convex";
  } else if (filterTypeValue == "1") {
    return "Prism";
  } else if (filterTypeValue == "2") {
    return "TriPrism";
  } else if (filterTypeValue == "3") {
    return "HexaPrism";
  } else if (filterTypeValue == "4") {
    return "QuadPrism";
  } else if (filterTypeValue == "5") {
    return "Polygon";
  } else {
    return "None";
  }
}

function setSliderValueLabel(sliderElement, setValue) {
  const sliderWrapper = sliderElement.parentNode;
  const sliderValueLabel = sliderWrapper.nextElementSibling;
  sliderValueLabel.textContent = setValue;
}

function returnCSVfileName() {
  const now = new Date();

  // monthは0始まりなので1つ足す
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const formattedDateTime = `${month}${date}-${hours}${minutes}` + ".csv";

  return formattedDateTime;
}
